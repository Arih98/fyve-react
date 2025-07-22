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
    let initialAttrs = initialColor ? { Color: location.state.initialColor } : {};
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      const initialVariation = product.variations.find(v => {
        const colorAttr = v.attributes.find(a => a.attribute_name === 'Color');
        return colorAttr?.term_name?.trim().toLowerCase() === initialColor;
      }) || product.variations[0];
      initialVariation.attributes.forEach(attr => {
        if (!attr.term_name.startsWith('Any')) {
          initialAttrs[attr.attribute_name] = attr.term_name;
        }
      });
    }
    return initialAttrs;
  });
  const [currentVariation, setCurrentVariation] = useState(() => {
    if (!product) return null;
    const initialColor = location.state?.initialColor?.trim().toLowerCase() || '';
    if (product.product_type === 'variable' && product.variations?.length > 0) {
      return product.variations.find(v => {
        const colorAttr = v.attributes.find(a => a.attribute_name === 'Color');
        return colorAttr?.term_name?.trim().toLowerCase() === initialColor;
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
    const stored = JSON.parse(localStorage.getItem('products') || '[]');
    setAllProducts(stored);
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
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        boundingRect: img.getBoundingClientRect(),
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

  const getAvailableOptions = attrName => {
    const other = { ...selectedAttributes };
    delete other[attrName];
    const opts = new Set(
      product.variations
        .filter(v =>
          Object.entries(other).every(([k, t]) => {
            const a = v.attributes.find(x => x.attribute_name === k);
            return a?.term_name === t || a?.term_name.startsWith('Any');
          })
        )
        .flatMap(v => {
          const a = v.attributes.find(x => x.attribute_name === attrName);
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

  const current = product ? (product.product_type === 'variable' ? currentVariation : product) : null;
  const gallery = current?.gallery || product?.gallery || [];
  const mainImage = gallery[0] || '/api/Uploads/fallback-image.png';
  const displayTitle =
    product?.product_type === 'variable' && currentVariation?.title
      ? currentVariation.title
      : product?.title;
  const displayDescription =
    product?.product_type === 'variable' && currentVariation?.description
      ? currentVariation.description
      : product?.description;
  const currentColor = selectedAttributes.Color || 'default';
  const currentDisplayId = `${product?.id}-${currentColor}`;
  const isAddDisabled = availableStock !== null && availableStock < quantity;

  const relatedProductsRaw =
    product?.product_type === 'variable' ? currentVariation?.related_products || [] : product?.related_products || [];
  const relatedProducts = relatedProductsRaw
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

  const getDisplayImage = rel => rel.displayGallery?.[0] || '/api/Uploads/fallback-image.png';
  const getDisplayPrice = rel => rel.displayPrice || 0;
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
                const layoutId = idx === 0 ? `product-image-${currentDisplayId}` : undefined;
                return (
                  <motion.img
                    key={key}
                    layoutId={layoutId}
                    ref={el => galleryRefs.current.set(key, el)}
                    src={img}
                    alt={`${displayTitle} ${idx + 1}`}
                    className="product-gallery-image"
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
                src={mainImage}
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
        <motion.div className="details-container" initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
          <div className={`product-details ${scrollDirection === 'up' ? 'scroll-up' : ''}`}>
            <h1 className="product-title">{displayTitle}</h1>
            <p className="product-variation-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayDescription) }} />
            <p className="product-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
            {product.product_type === 'variable' && (
              <div className="product-attributes">
                {attributeNames.map(attrName => {
                  const options = getAvailableOptions(attrName);
                  return (
                    <div key={attrName} className="attribute-group">
                      <label className="attribute-label">{attrName}</label>
                      {attrName === 'Color' ? (
                        <div className="color-options">
                          {options.map(term => (
                            <div key={term} className="color-option">
                              <button
                                onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: term }))}
                                className={`color-button ${selectedAttributes[attrName] === term ? 'selected' : ''} ${term.toLowerCase()}`}
                              />
                              <span className="color-label">{term}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="size-options">
                          {options.map(term => (
                            <button key={term} onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrName]: term }))} className={`size-button ${selectedAttributes[attrName] === term ? 'selected' : ''}`}>
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
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn minus" disabled={quantity <= 1}>
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => availableStock === null || quantity < availableStock ? setQuantity(q => q + 1) : null} className="qty-btn plus" disabled={availableStock !== null && quantity >= availableStock}>
                  +
                </button>
              </div>
            </div>
            <button onClick={() => {
                fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`)
                  .then(r => r.json())
                  .then(d => {
                    if ((d.stock_quantity ?? 0) < quantity) setCartError('Out of stock');
                    else setCartItems(prev => [...prev, { id: current.id || product.id, name: current.title || product.title, price: parseFloat(current.price || product.price), quantity, image: current.gallery?.[0] || product.gallery?.[0] }]);
                  })
                  .catch(() => setCartError('Failed to verify stock'));
              }} disabled={isAddDisabled} className={`add-to-cart-button ${isAddDisabled ? 'disabled' : ''}`}>
              <span className="add-to-cart-text">Add to Cart</span>
              <span className="add-to-cart-price">${((parseFloat(current?.price || 0) * quantity).toFixed(2))}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
      {relatedProducts.length > 0 && (
        <div className="related-products-container">
          <h2 className="related-products-title">Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relItem => (
              <div key={relItem.displayId} className="related-product-card" onClick={() => handleRelatedClick(relItem)}>
                <motion.img layoutId={`product-image-${relItem.displayId}`} src={getDisplayImage(relItem)} alt={relItem.displayTitle} className="related-product-image" />
                <div className="related-product-info">
                  <h3 className="related-product-title">{relItem.displayTitle}</h3>
                  <p className="related-product-price">${getDisplayPrice(relItem)}</p>
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
