// ProductDetail.js
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
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const [allProducts, setAllProducts] = useState([]);
  const product = location.state?.product;
  const [scrollDirection, setScrollDirection] = useState('down');

  useEffect(() => {
    console.log('[ProductDetail] Component mounted');
    return () => console.log('[ProductDetail] Component unmounted');
  }, []);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    if (!product) return {};
    const initialColor = location.state?.initialColor?.trim().toLowerCase() || '';
    let initialAttrs = initialColor ? { Color: location.state.initialColor } : {};
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      const initialVariation = product.variations.find(v => {
        const c = v.attributes.find(a => a.attribute_name === 'Color');
        return c?.term_name?.trim().toLowerCase() === initialColor;
      }) || product.variations[0];
      initialVariation?.attributes.forEach(attr => {
        if (!attr.term_name.startsWith('Any')) {
          initialAttrs[attr.attribute_name] = attr.term_name;
        }
      });
    }
    console.log('[ProductDetail] Initialized selectedAttributes:', initialAttrs);
    return initialAttrs;
  });

  const [currentVariation, setCurrentVariation] = useState(() => {
    if (!product) return null;
    const initialColor = location.state?.initialColor?.trim().toLowerCase() || '';
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      const initialVariation = product.variations.find(v => {
        const c = v.attributes.find(a => a.attribute_name === 'Color');
        return c?.term_name?.trim().toLowerCase() === initialColor;
      }) || product.variations[0];
      console.log('[ProductDetail] Initialized currentVariation:', {
        variationId: initialVariation?.id,
        title: initialVariation?.title,
        sku: initialVariation?.sku,
        galleryLength: initialVariation?.gallery?.length || 0,
        attributes: selectedAttributes,
      });
      return initialVariation;
    }
    return null;
  });

  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(null);

  useEffect(() => {
    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setAllProducts(localProducts);
  }, []);

  const current = product
    ? product.product_type === 'variable'
      ? currentVariation
      : product
    : null;

  useEffect(() => {
    if (!current) return;
    const fetchStock = async () => {
      if (current?.sku) {
        try {
          const res = await fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`);
          const data = await res.json();
          setAvailableStock(data.stock_quantity ?? 0);
        } catch {
          setAvailableStock(0);
        }
      } else {
        setAvailableStock(null);
      }
    };
    fetchStock();
    setQuantity(1);
  }, [current?.sku]);

  useLayoutEffect(() => {
    if (mainImageRef.current) {
      const img = mainImageRef.current;
      console.log('[ProductDetail] Target image layout details:', {
        src: img.src,
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        boundingRect: img.getBoundingClientRect(),
        complete: img.complete,
      });
    } else {
      console.warn('[ProductDetail] Main image ref not available');
    }
  }, [currentVariation]);

  const attributeNames =
    product?.product_type === 'variable' && product.variations?.length > 0
      ? [...new Set(product.variations.flatMap(v => v.attributes.map(a => a.attribute_name)))].sort((a, b) =>
          a === 'Color' ? 1 : -1
        )
      : [];

  const getAvailableOptions = attrName => {
    const other = { ...selectedAttributes };
    delete other[attrName];
    const opts = new Set(
      product.variations
        .filter(v =>
          Object.entries(other).every(([k, t]) => {
            const vAttr = v.attributes.find(a => a.attribute_name === k);
            return vAttr?.term_name === t || vAttr?.term_name.startsWith('Any');
          })
        )
        .flatMap(v => {
          const a = v.attributes.find(a => a.attribute_name === attrName);
          return a && !a.term_name.startsWith('Any') ? [a.term_name] : [];
        })
    );
    const arr = [...opts];
    if (attrName === 'Size') {
      arr.sort((x, y) => x.localeCompare(y, 'en', { numeric: true }));
    } else {
      arr.sort();
    }
    return arr;
  };

  useEffect(() => {
    if (product?.product_type !== 'variable') return;
    const match = product.variations.find(v =>
      attributeNames.every(a => {
        const sel = selectedAttributes[a];
        if (!sel) return true;
        const vAttr = v.attributes.find(x => x.attribute_name === a);
        return vAttr && (vAttr.term_name === sel || vAttr.term_name === `Any ${a}`);
      })
    );
    setCurrentVariation(match || null);
  }, [selectedAttributes, product, attributeNames]);

  useEffect(() => {
    if (product?.product_type !== 'variable') return;
    let upd = { ...selectedAttributes };
    let changed = false;
    attributeNames.forEach(a => {
      const opts = getAvailableOptions(a);
      if (selectedAttributes[a] && !opts.includes(selectedAttributes[a])) {
        upd[a] = opts[0] || undefined;
        changed = true;
      }
    });
    if (changed) setSelectedAttributes(upd);
  }, [selectedAttributes, product, attributeNames]);

  if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !currentVariation) return <div>Loading variation...</div>;

  const handleAttributeChange = (a, v) => {
    setSelectedAttributes(prev => ({ ...prev, [a]: v }));
  };

  const handleAddToCart = async () => {
    if (!current?.sku) return;
    try {
      const res = await fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`);
      const data = await res.json();
      const fresh = data.stock_quantity ?? 0;
      console.log('[ProductDetail] Add to cart stock check:', { sku: current.sku, fresh });
      if (fresh < quantity) {
        console.error('Out of stock');
      } else {
        setCartItems(prev => [...prev, { id: current.id || product.id, name: current.title || product.title, price: parseFloat(current.price || product.price), quantity, image: current.gallery?.[0] || product.gallery?.[0] }]);
      }
    } catch {
      console.error('Failed to verify stock');
    }
  };

  const displayTitle = product.product_type === 'variable' && currentVariation?.title ? currentVariation.title : product.title;
  const displayDescription = product.product_type === 'variable' && currentVariation?.description ? currentVariation.description : product.description;
  const gallery = current?.gallery || product.gallery || [];
  const currentColor = selectedAttributes.Color || 'default';
  const currentDisplayId = `${product.id}-${currentColor}`;

  useEffect(() => console.log('[ProductDetail] Rendering', { displayTitle, galleryLength: gallery.length }), [displayTitle, gallery.length]);

  return (
    <>
      <motion.div className="product-detail-container">
        <div className="product-image-gallery">
          {gallery.length > 0 ? (
            gallery.map((img, idx) => {
              const key = `${current?.sku || product.id}-${idx}`;
              const id = idx === 0 ? `product-image-${currentDisplayId}` : undefined;
              return (
                <motion.img
                  initial={false}
                  layoutId={id}
                  key={key}
                  ref={el => galleryRefs.current.set(key, el)}
                  src={img}
                  alt={`${displayTitle} ${idx + 1}`}
                  onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
                  onLayoutAnimationStart={() => {
                    if (id) console.log('[Detail] layout start for', currentDisplayId);
                  }}
                  onLayoutAnimationComplete={() => {
                    if (id) console.log('[Detail] layout complete for', currentDisplayId);
                  }}
                />
              );
            })
          ) : (
            <motion.img
              initial={false}
              layoutId={`product-image-${currentDisplayId}`}
              ref={mainImageRef}
              src={gallery[0] || '/api/Uploads/fallback-image.png'}
              alt={displayTitle}
              onLayoutAnimationStart={() => console.log('[Detail] layout start for', currentDisplayId)}
              onLayoutAnimationComplete={() => console.log('[Detail] layout complete for', currentDisplayId)}
            />
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ProductDetail;
