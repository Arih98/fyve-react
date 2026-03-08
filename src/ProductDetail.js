// ProductDetail.js
import React, { useEffect, useState, useRef, useLayoutEffect, useContext } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { CartContext } from './CartContext';
import './ProductDetail.css';
import { useProduct } from './hooks/useProduct';

const ProductDetail = () => {
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const [searchParams] = useSearchParams();
  const [cartError, setCartError] = useState(null);
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const [allProducts, setAllProducts] = useState([]);
  const fallbackProduct = location.state?.product;
const { product: loadedProduct, loading, error } = useProduct(productId || fallbackProduct?.id);
const product = loadedProduct || fallbackProduct;
const urlColor = searchParams.get('color') || '';
const initialColorValue = (urlColor || location.state?.initialColor || '').trim().toLowerCase();
  const [scrollDirection, setScrollDirection] = useState('down');

  useEffect(() => {
    console.log('[ProductDetail] Component mounted');
    return () => console.log('[ProductDetail] Component unmounted');
  }, []);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [selectedAttributes, setSelectedAttributes] = useState({});
const [currentVariation, setCurrentVariation] = useState(null);

useEffect(() => {
  if (!product || product.product_type !== 'variable' || !product.variations?.length) {
    setSelectedAttributes({});
    setCurrentVariation(null);
    return;
  }

const initialColor = initialColorValue;

  const initialVariation = product.variations.find(v => {
    const colorAttr = v.attributes.find(a => a.attribute_name === 'Color');
    return colorAttr?.term_name?.trim().toLowerCase() === initialColor;
  }) || product.variations[0];

  const initialAttrs = {};

  initialVariation?.attributes.forEach(attr => {
    if (!attr.term_name.startsWith('Any')) {
      initialAttrs[attr.attribute_name] = attr.term_name;
    }
  });

  if (location.state?.initialColor && !initialAttrs.Color) {
    initialAttrs.Color = location.state.initialColor;
  }

  setSelectedAttributes(initialAttrs);
  setCurrentVariation(initialVariation);

  console.log('[ProductDetail] Reinitialized variation state:', {
    initialAttrs,
    variationId: initialVariation?.id,
    title: initialVariation?.title
  });
}, [product, initialColorValue]);

  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(null);

  useEffect(() => {
    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setAllProducts(localProducts);
  }, []);

  const current = product ? (product.product_type === 'variable' ? currentVariation : product) : null;

  useEffect(() => {
    if (!current) return;
    const fetchAvailableStock = async () => {
      if (current?.sku) {
        try {
          const res = await fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`);
          const data = await res.json();
          setAvailableStock(data.stock_quantity ?? 0);
        } catch (err) {
          console.error('[ProductDetail] Error fetching stock:', err);
          setAvailableStock(0);
        }
      } else {
        setAvailableStock(null);
      }
    };
    fetchAvailableStock();
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

  const attributeNames = product && product.product_type === 'variable' && product.variations.length > 0
    ? [...new Set(product.variations.flatMap(v => v.attributes.map(a => a.attribute_name)))].sort((a, b) => a === 'Color' ? 1 : -1)
    : [];

  const getAvailableOptions = (attrName) => {
    const otherSelected = { ...selectedAttributes };
    delete otherSelected[attrName];
    const optionsSet = new Set(
      product.variations
        .filter(v =>
          Object.entries(otherSelected).every(([otherAttr, term]) => {
            const vAttr = v.attributes.find(a => a.attribute_name === otherAttr);
            return vAttr?.term_name === term || vAttr?.term_name.startsWith('Any');
          })
        )
        .flatMap(v => {
          const thisAttr = v.attributes.find(a => a.attribute_name === attrName);
          if (thisAttr && !thisAttr.term_name.startsWith('Any')) {
            return [thisAttr.term_name];
          }
          return [];
        })
    );
    const options = [...optionsSet];
    if (attrName === 'Size') {
      options.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    } else {
      options.sort();
    }
    return options;
  };

  useEffect(() => {
  if (!product || product.product_type !== 'variable') return;
  if (!attributeNames.length) return;

  const hasAnySelection = attributeNames.some(attr => !!selectedAttributes[attr]);
  if (!hasAnySelection) return;

  const matchingVariation = product.variations.find(v =>
    attributeNames.every(attr => {
      const sel = selectedAttributes[attr];
      if (!sel) return true;
      const vAttr = v.attributes.find(a => a.attribute_name === attr);
      return vAttr && (vAttr.term_name === sel || vAttr.term_name === `Any ${attr}`);
    })
  );

  setCurrentVariation(matchingVariation || null);
}, [selectedAttributes, product, attributeNames]);

  useEffect(() => {
    if (!product || product.product_type !== 'variable') return;
    let updatedSelected = { ...selectedAttributes };
    let changed = false;
    attributeNames.forEach(attr => {
      const avail = getAvailableOptions(attr);
      if (selectedAttributes[attr] && !avail.includes(selectedAttributes[attr])) {
        updatedSelected[attr] = avail[0] || undefined;
        changed = true;
      }
    });
    if (changed) {
      setSelectedAttributes(updatedSelected);
    }
  }, [selectedAttributes, product, attributeNames]);

  if (loading && !product) return <div className="product-not-found">Loading product...</div>;
if (error && !product) return <div className="product-not-found">{error.message || 'Failed to load product'}</div>;
if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !currentVariation) return <div>Loading variation...</div>;

  const handleAttributeChange = (attrName, value) => {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
    setCartError(null);
  };

  const handleAddToCart = async () => {
    if (current?.sku) {
      try {
        const res = await fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`);
        const data = await res.json();
        const freshStock = data.stock_quantity ?? 0;
        console.log('[ProductDetail] Add to cart stock check:', { sku: current.sku, freshStock });
        if (freshStock < quantity) {
          setCartError(quantity > 1 ? `Only ${freshStock} available` : 'Out of stock');
        } else {
          const newItem = {
            id: current.id || product.id,
            name: current.title || product.title,
            price: parseFloat(current.price || product.price),
            quantity,
            image: current.gallery?.[0] || product.gallery?.[0] || '/api/Uploads/fallback-image.png',
            size: selectedAttributes.Size || '',
            color: selectedAttributes.Color || '',
          };
          setCartItems(prev => {
            const variationKey = `${newItem.size}-${newItem.color}`;
            const existingIndex = prev.findIndex(i => i.id === newItem.id && `${i.size}-${i.color}` === variationKey);
            if (existingIndex !== -1) {
              const newPrev = [...prev];
              newPrev[existingIndex].quantity += quantity;
              return newPrev;
            } else {
              return [...prev, newItem];
            }
          });
          setCartError(null);
        }
      } catch (err) {
        console.error('[ProductDetail] Error verifying stock:', err);
        setCartError('Failed to verify stock');
      }
    } else {
      console.warn('[ProductDetail] No SKU for current');
    }
  };

  const increaseQuantity = () => {
    if (availableStock === null || quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const currentColor = selectedAttributes.Color || 'default';
const currentDisplayId = `${product.id}-${currentColor}`;
const transitionKey = location.state?.transitionKey || `product-image-${currentDisplayId}`;

const gallery = current?.gallery || product.gallery || [];
const mainImage = gallery[0] || product.archiveImage || '/api/Uploads/fallback-image.png';
const displayTitle = product.product_type === 'variable' && currentVariation?.title ? currentVariation.title : product.title;
const displayDescription = product.product_type === 'variable' && currentVariation?.description ? currentVariation.description : product.description;
const stock = current?.stock_quantity ?? 'N/A';
console.log('[ProductDetail] CURRENT VARIATION GALLERY', currentVariation?.gallery);
console.log('[ProductDetail] CURRENT GALLERY USED', gallery);
console.log('[ProductDetail] PRODUCT FALLBACK GALLERY', product?.gallery);

console.log('[ProductDetail] Rendering with:', {
  displayTitle,
  galleryLength: gallery.length,
  mainImage,
  stock,
  currentSku: current?.sku,
  transitionKey,
});

const isAddDisabled = availableStock !== null && availableStock < quantity;

const relatedProductsRaw = product.product_type === 'variable' ? currentVariation?.related_products || [] : product.related_products || [];
const relatedProducts = relatedProductsRaw.map(rel => {
  const normalizedRel = typeof rel === 'string' ? { productId: rel } : rel;
  const p = allProducts.find(p => p.id === normalizedRel.productId);
  if (!p) return null;
  const color = normalizedRel.selectedColor;
  if (color) {
    const v = p.variations.find(v => v.attributes.some(a => a.attribute_name === 'Color' && a.term_name === color));
    return {
      ...p,
      displayId: `${p.id}-${color}`,
      selectedColor: color,
      displayTitle: v?.title || `${p.title} - ${color}`,
      displayPrice: v?.price || p.price,
      displayGallery: v?.gallery || p.gallery,
    };
  } else {
    return {
      ...p,
      displayId: p.id,
      selectedColor: null,
      displayTitle: p.title,
      displayPrice: p.price,
      displayGallery: p.gallery,
    };
  }
}).filter(Boolean);

const getDisplayImage = (relItem) => relItem.displayGallery?.[0] || '/api/Uploads/fallback-image.png';
const getDisplayPrice = (relItem) => relItem.displayPrice || 0;

const handleRelatedClick = (relItem) => {
  const originalProduct = allProducts.find(p => p.id === relItem.id);
  navigate(`/product/${relItem.id}`, { 
    state: { 
      product: originalProduct, 
      initialColor: relItem.selectedColor, 
      transitionKey: `product-image-${relItem.displayId}` // Consistent layoutId
    } 
  });
};

return (
  <>
    <motion.div className="product-detail-container">
      <div className="images-container">
        <div className="product-image-gallery">
          {gallery.length > 0 ? (
            gallery.map((img, idx) => {
              const imageKey = `${current?.sku || product.id}-${idx}`;
              const layoutIdValue = idx === 0 ? transitionKey : undefined;
              return (
                <motion.img
                  initial={false}
                  ref={el => galleryRefs.current.set(imageKey, el)}
                  key={imageKey}
                  layoutId={layoutIdValue}
                  src={img}
                  alt={`${displayTitle} ${idx + 1}`}
                  className="product-gallery-image"
                  onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
                  onLoad={e => console.log('[ProductDetail] Image loaded', { src: e.target.src })}
                  transition={{ duration: 0.5 }}
                  onAnimationStart={() => console.log('[ProductDetail] Animation start for', imageKey)}
                  onAnimationComplete={() => console.log('[ProductDetail] Animation complete for', imageKey)}
                  onLayoutAnimationStart={() => {
                    if (layoutIdValue) {
                      const el = galleryRefs.current.get(imageKey);
                      if (el) el.style.zIndex = '10000';
                    }
                  }}
                  onLayoutAnimationComplete={() => {
                    if (layoutIdValue) {
                      const el = galleryRefs.current.get(imageKey);
                      if (el) el.style.zIndex = '';
                    }
                  }}
                />
              );
            })
          ) : (
            <motion.img
              initial={false}
              ref={mainImageRef}
              layoutId={transitionKey}
              src={mainImage}
              alt={displayTitle}
              className="product-main-image"
              onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
              onLoad={e => console.log('[ProductDetail] Main image loaded', { src: e.target.src })}
              transition={{ duration: 0.5 }}
              onAnimationStart={() => console.log('[ProductDetail] Main animation start')}
              onAnimationComplete={() => console.log('[ProductDetail] Main animation complete')}
              onLayoutAnimationStart={() => {
                if (mainImageRef.current) mainImageRef.current.style.zIndex = '10000';
              }}
              onLayoutAnimationComplete={() => {
                if (mainImageRef.current) mainImageRef.current.style.zIndex = '';
              }}
            />
          )}
        </div>
      </div>
        <motion.div
          className="details-container"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`product-details ${scrollDirection === 'up' ? 'scroll-up' : ''}`}>
            <h1 className="product-title">{displayTitle}</h1>
            <p
              className="product-variation-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayDescription) }}
            />
            <p
              className="product-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
            />
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
                                onClick={() => handleAttributeChange(attrName, term)}
                                className={`color-button ${selectedAttributes[attrName] === term ? 'selected' : ''} ${term === 'Sand' ? 'sand' : term === 'Ivory' ? 'ivory' : ''}`}
                              />
                              <span className="color-label">{term}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="size-options">
                          {options.map(term => (
                            <div key={term} className="size-option">
                              <button
                                onClick={() => handleAttributeChange(attrName, term)}
                                className={`size-button ${selectedAttributes[attrName] === term ? 'selected' : ''}`}
                              >
                                {term}
                              </button>
                            </div>
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
                <button onClick={decreaseQuantity} className="qty-btn minus" disabled={quantity <= 1}>
                  <span className="qty-symbol">-</span>
                </button>
                <span className="qty-value">{quantity}</span>
                <button onClick={increaseQuantity} className="qty-btn plus" disabled={availableStock !== null && quantity >= availableStock}>
                  <span className="qty-symbol">+</span>
                </button>
              </div>
            </div>
            <button onClick={handleAddToCart} disabled={isAddDisabled} className={`add-to-cart-button ${isAddDisabled ? 'disabled' : ''}`}>
              <span className="add-to-cart-text">Add to Cart</span>
              <span className="add-to-cart-price">${(parseFloat(current?.price || 0) * quantity).toFixed(2)}</span>
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
                <motion.img
                  initial={false}
                  src={getDisplayImage(relItem)}
                  alt={relItem.displayTitle}
                  className="related-product-image"
                  onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
                />
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