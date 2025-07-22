import React, { useEffect, useState, useRef, useLayoutEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { CartContext } from './CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [cartError, setCartError] = useState(null);
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const [allProducts, setAllProducts] = useState([]);
  const [scrollDirection, setScrollDirection] = useState('down');
  const product = location.state?.product;
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    if (!product) return {};
    const initialColor = location.state?.initialColor?.trim().toLowerCase() || '';
    let initial = initialColor ? { Color: location.state.initialColor } : {};
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      const match = product.variations.find(v => {
        const c = v.attributes.find(a => a.attribute_name === 'Color');
        return c?.term_name?.trim().toLowerCase() === initialColor;
      }) || product.variations[0];
      match.attributes.forEach(a => {
        if (!a.term_name.startsWith('Any')) initial[a.attribute_name] = a.term_name;
      });
    }
    return initial;
  });
  const [currentVariation, setCurrentVariation] = useState(() => {
    if (!product) return null;
    const initialColor = location.state?.initialColor?.trim().toLowerCase() || '';
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      return product.variations.find(v => {
        const c = v.attributes.find(a => a.attribute_name === 'Color');
        return c?.term_name?.trim().toLowerCase() === initialColor;
      }) || product.variations[0];
    }
    return null;
  });
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(null);

  useEffect(() => {
    console.log('[ProductDetail] Component mounted');
    return () => console.log('[ProductDetail] Component unmounted');
  }, []);

  useEffect(() => {
    let lastY = window.pageYOffset;
    const onScroll = () => {
      const y = window.pageYOffset;
      setScrollDirection(y > lastY ? 'down' : 'up');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setAllProducts(JSON.parse(localStorage.getItem('products') || '[]'));
  }, []);

  useEffect(() => {
    if (!currentVariation) return;
    if (currentVariation.sku) {
      fetch(`/api/get_inventory.php?sku=${encodeURIComponent(currentVariation.sku)}`)
        .then(r => r.json())
        .then(d => setAvailableStock(d.stock_quantity ?? 0))
        .catch(() => setAvailableStock(0));
    } else {
      setAvailableStock(null);
    }
    setQuantity(1);
  }, [currentVariation]);

  useLayoutEffect(() => {
    if (mainImageRef.current) {
      const img = mainImageRef.current;
      console.log('[ProductDetail] Target image layout details:', {
        src: img.src,
        w: img.clientWidth,
        h: img.clientHeight,
        nW: img.naturalWidth,
        nH: img.naturalHeight,
        rect: img.getBoundingClientRect(),
        complete: img.complete,
      });
    }
  }, [currentVariation]);

  const attributeNames =
    product?.product_type === 'variable' && product.variations?.length > 0
      ? [...new Set(product.variations.flatMap(v => v.attributes.map(a => a.attribute_name)))].sort((a, b) =>
          a === 'Color' ? 1 : -1
        )
      : [];

  const getAvailableOptions = name => {
    const other = { ...selectedAttributes };
    delete other[name];
    const setOpts = new Set(
      product.variations
        .filter(v =>
          Object.entries(other).every(([k, t]) => {
            const a = v.attributes.find(x => x.attribute_name === k);
            return a?.term_name === t || a?.term_name.startsWith('Any');
          })
        )
        .flatMap(v => {
          const a = v.attributes.find(x => x.attribute_name === name);
          return a && !a.term_name.startsWith('Any') ? [a.term_name] : [];
        })
    );
    const arr = [...setOpts];
    if (name === 'Size') {
      arr.sort((x, y) => x.localeCompare(y, 'en', { numeric: true }));
    } else {
      arr.sort();
    }
    return arr;
  };

  useEffect(() => {
    if (!product || product.product_type !== 'variable') return;
    const match = product.variations.find(v =>
      attributeNames.every(a => {
        const sel = selectedAttributes[a];
        if (!sel) return true;
        const x = v.attributes.find(y => y.attribute_name === a);
        return x && (x.term_name === sel || x.term_name === `Any ${a}`);
      })
    );
    setCurrentVariation(match || null);
  }, [selectedAttributes, product]);

  useEffect(() => {
    if (!product || product.product_type !== 'variable') return;
    let upd = { ...selectedAttributes };
    let changed = false;
    attributeNames.forEach(a => {
      const opts = getAvailableOptions(a);
      if (selectedAttributes[a] && !opts.includes(selectedAttributes[a])) {
        upd[a] = opts[0] || '';
        changed = true;
      }
    });
    if (changed) setSelectedAttributes(upd);
  }, [selectedAttributes, product]);

  const current = product?.product_type === 'variable' ? currentVariation : product;
  const displayTitle = product?.product_type === 'variable' && currentVariation?.title ? currentVariation.title : product?.title;
  const displayDescription =
    product?.product_type === 'variable' && currentVariation?.description ? currentVariation.description : product?.description;
  const gallery = current?.gallery || product?.gallery || [];
  const currentColor = selectedAttributes.Color || 'default';
  const currentDisplayId = `${product?.id}-${currentColor}`;

  useEffect(() => {
    console.log('[ProductDetail] Rendering with:', {
      displayTitle,
      galleryLength: gallery.length,
      mainImage: gallery[0] || '',
      stock: availableStock,
      currentSku: current?.sku,
    });
  }, [displayTitle, gallery.length, availableStock, current?.sku]);

  if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !currentVariation) return <div>Loading variation...</div>;

  const handleAttributeChange = (name, value) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = () => {
    if (!current?.sku) return;
    fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`)
      .then(r => r.json())
      .then(d => {
        if ((d.stock_quantity ?? 0) < quantity) {
          setCartError('Out of stock');
        } else {
          setCartItems(prev => [
            ...prev,
            {
              id: current.id || product.id,
              name: current.title || product.title,
              price: parseFloat(current.price || product.price),
              quantity,
              image: current.gallery?.[0] || product.gallery?.[0] || '/api/Uploads/fallback-image.png',
            },
          ]);
        }
      })
      .catch(() => setCartError('Failed to verify stock'));
  };

  return (
    <>
      <motion.div className="product-detail-container">
        <div className="images-container">
          <div className="product-image-gallery">
            {gallery.length > 0 ? (
              gallery.map((img, idx) => {
                const key = `${current?.sku || product.id}-${idx}`;
                const layoutId = idx === 0 ? `product-image-${currentDisplayId}` : undefined;
                return (
                  <motion.img
                    key={key}
                    layoutId={layoutId}
                    src={img}
                    alt={`${displayTitle} ${idx + 1}`}
                    onError={e => {
                      e.target.src = '/api/Uploads/fallback-image.png';
                    }}
                    onLayoutAnimationStart={() => layoutId && console.log('[Detail] layout start for', currentDisplayId)}
                    onLayoutAnimationComplete={() => layoutId && console.log('[Detail] layout complete for', currentDisplayId)}
                  />
                );
              })
            ) : (
              <motion.img
                layoutId={`product-image-${currentDisplayId}`}
                ref={mainImageRef}
                src={gallery[0] || '/api/Uploads/fallback-image.png'}
                alt={displayTitle}
                onLayoutAnimationStart={() => console.log('[Detail] layout start for', currentDisplayId)}
                onLayoutAnimationComplete={() => console.log('[Detail] layout complete for', currentDisplayId)}
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductDetail;
