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
    let attrs = initialColor ? { Color: location.state.initialColor } : {};
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      const v = product.variations.find(v => {
        const c = v.attributes.find(a => a.attribute_name === 'Color');
        return c?.term_name?.trim().toLowerCase() === initialColor;
      }) || product.variations[0];
      v.attributes.forEach(a => {
        if (!a.term_name.startsWith('Any')) {
          attrs[a.attribute_name] = a.term_name;
        }
      });
    }
    return attrs;
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
      console.log('[ProductDetail] layout details:', {
        src: img.src,
        cw: img.clientWidth,
        ch: img.clientHeight,
        nw: img.naturalWidth,
        nh: img.naturalHeight,
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
    const opts = new Set(
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
    const arr = [...opts];
    if (name === 'Size') {
      arr.sort((x, y) => x.localeCompare(y, 'en', { numeric: true }));
    } else {
      arr.sort();
    }
    return arr;
  };

  useEffect(() => {
    if (!product || product.product_type !== 'variable') return;
    const m = product.variations.find(v =>
      attributeNames.every(a => {
        const sel = selectedAttributes[a];
        if (!sel) return true;
        const x = v.attributes.find(y => y.attribute_name === a);
        return x && (x.term_name === sel || x.term_name === `Any ${a}`);
      })
    );
    setCurrentVariation(m || null);
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
  const gallery = current?.gallery || product?.gallery || [];
  const displayTitle =
    product?.product_type === 'variable' && currentVariation?.title ? currentVariation.title : product?.title;
  const displayDescription =
    product?.product_type === 'variable' && currentVariation?.description
      ? currentVariation.description
      : product?.description;
  const currentColor = selectedAttributes.Color || 'default';
  const currentDisplayId = `${product?.id}-${currentColor}`;
  const isAddDisabled = availableStock !== null && availableStock < quantity;

  const relatedProducts = (product?.product_type === 'variable'
    ? currentVariation?.related_products
    : product?.related_products) || [];
  const normalizedRelated = relatedProducts
    .map(rel => {
      const norm = typeof rel === 'string' ? { productId: rel } : rel;
      const p = allProducts.find(x => x.id === norm.productId);
      if (!p) return null;
      const color = norm.selectedColor;
      if (color) {
        const v = p.variations.find(x => x.attributes.some(a => a.attribute_name === 'Color' && a.term_name === color));
        return {
          ...p,
          displayId: `${p.id}-${color}`,
          selectedColor: color,
          displayTitle: v?.title || `${p.title} - ${color}`,
          displayPrice: v?.price || p.price,
          displayGallery: v?.gallery || p.gallery,
        };
      }
      return {
        ...p,
        displayId: p.id,
        selectedColor: null,
        displayTitle: p.title,
        displayPrice: p.price,
        displayGallery: p.gallery,
      };
    })
    .filter(Boolean);

  const handleRelatedClick = rel => {
    const orig = allProducts.find(x => x.id === rel.id);
    navigate(`/product/${rel.id}`, {
      state: { product: orig, initialColor: rel.selectedColor, transitionKey: rel.displayId },
    });
  };

  if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !currentVariation) return <div>Loading variation...</div>;

  return (
    <>
      <motion.div className="product-detail-container">
        <div className="images-container">
          <div className="product-image-gallery">
            {gallery.length > 0 ? (
              gallery.map((img, idx) => {
                const key = `${current?.sku || product.id}-${idx}`;
                const lid = idx === 0 ? `product-image-${currentDisplayId}` : undefined;
                return (
                  <motion.img
                    key={key}
                    layoutId={lid}
                    ref={el => galleryRefs.current.set(key, el)}
                    src={img}
                    alt={`${displayTitle} ${idx + 1}`}
                    className="product-gallery-image"
                    onError={e => {
                      e.target.src = '/api/Uploads/fallback-image.png';
                    }}
                    onLayoutAnimationStart={() => lid && console.log('[Detail] layout start for', currentDisplayId)}
                    onLayoutAnimationComplete={() => lid && console.log('[Detail] layout complete for', currentDisplayId)}
                  />
                );
              })
            ) : (
              <motion.img
                layoutId={`product-image-${currentDisplayId}`}
                ref={mainImageRef}
                src={gallery[0] || '/api/Uploads/fallback-image.png'}
                alt={displayTitle}
                className="product-main-image"
                onError={e => {
                  e.target.src = '/api/Uploads/fallback-image.png';
                }}
                onLayoutAnimationStart={() => console.log('[Detail] layout start for', currentDisplayId)}
                onLayoutAnimationComplete={() => console.log('[Detail] layout complete for', currentDisplayId)}
              />
            )}
          </div>
        </div>
        <motion.div className="details-container" initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
          <div className={`product-details ${scrollDirection === 'up' ? 'scroll-up' : ''}`}>
            <h1 className="product-title">{displayTitle}</h1>
            <p className="product-variation-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayDescription) }} />
            <p className="product-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
            {product.product_type === 'variable' && (
              <div className="product-attributes">
                {attributeNames.map(name => {
                  const opts = getAvailableOptions(name);
                  return (
                    <div key={name} className="attribute-group">
                      <label className="attribute-label">{name}</label>
                      {name === 'Color' ? (
                        <div className="color-options">
                          {opts.map(term => (
                            <div key={term} className="color-option">
                              <button onClick={() => setSelectedAttributes(prev => ({ ...prev, [name]: term }))} className={`color-button ${selectedAttributes[name] === term ? 'selected' : ''} ${term.toLowerCase()}`} />
                              <span className="color-label">{term}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="size-options">
                          {opts.map(term => (
                            <button key={term} onClick={() => setSelectedAttributes(prev => ({ ...prev, [name]: term }))} className={`size-button ${selectedAttributes[name] === term ? 'selected' : ''}`}>
                              {term}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {cartError && <p className="cart-error">{cartError}</p>}
            <div className="quantity-selector">
              <label className="quantity-label">QTY</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn minus" disabled={quantity <= 1}>−</button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => (availableStock === null || quantity < availableStock) && setQuantity(q => q + 1)} className="qty-btn plus" disabled={availableStock !== null && quantity >= availableStock}>+</button>
              </div>
            </div>
            <button onClick={() => {
                fetch(`/api/get_inventory.php?sku=${encodeURIComponent(currentVariation.sku)}`)
                  .then(r => r.json())
                  .then(d => {
                    if ((d.stock_quantity ?? 0) < quantity) setCartError('Out of stock');
                    else setCartItems(prev => [...prev, { id: currentVariation.id || product.id, name: currentVariation.title || product.title, price: parseFloat(currentVariation.price || product.price), quantity, image: currentVariation.gallery?.[0] || product.gallery?.[0] }]);
                  })
                  .catch(() => setCartError('Failed to verify stock'));
              }} disabled={isAddDisabled} className={`add-to-cart-button ${isAddDisabled ? 'disabled' : ''}`}>
              <span className="add-to-cart-text">Add to Cart</span>
              <span className="add-to-cart-price">${(parseFloat(currentVariation?.price || product.price) * quantity).toFixed(2)}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
      {normalizedRelated.length > 0 && (
        <div className="related-products-container">
          <h2 className="related-products-title">Related Products</h2>
          <div className="related-products-grid">
            {normalizedRelated.map(item => (
              <div key={item.displayId} className="related-product-card" onClick={() => handleRelatedClick(item)}>
                <motion.img layoutId={`product-image-${item.displayId}`} src={item.displayGallery?.[0] || '/api/Uploads/fallback-image.png'} alt={item.displayTitle} className="related-product-image" />
                <div className="related-product-info">
                  <h3 className="related-product-title">{item.displayTitle}</h3>
                  <p className="related-product-price">${item.displayPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
