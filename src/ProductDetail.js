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
  const shouldAnimateDetailsIn = !searchParams.get('color') || !!location.state?.transitionKey;
  const [scrollDirection, setScrollDirection] = useState('down');
  const [isTransitionImageReady, setIsTransitionImageReady] = useState(false);

  const isColorAttribute = (name) => String(name || '').trim().toLowerCase() === 'color';
  const isSizeAttribute = (name) => String(name || '').trim().toLowerCase() === 'size';

  useEffect(() => {
    return () => {};
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
  const [quantity, setQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(null);

  useEffect(() => {
    if (!product || product.product_type !== 'variable' || !product.variations?.length) {
      setSelectedAttributes({});
      setCurrentVariation(null);
      return;
    }

    const initialColor = initialColorValue;

    const initialVariation = product.variations.find(v => {
      const colorAttr = v.attributes.find(a => isColorAttribute(a.attribute_name));
      return colorAttr?.term_name?.trim().toLowerCase() === initialColor;
    }) || product.variations[0];

    const initialAttrs = {};

    initialVariation?.attributes.forEach(attr => {
      const termName = String(attr.term_name || '').trim();
      if (termName && !termName.startsWith('Any')) {
        initialAttrs[attr.attribute_name] = termName;
      }
    });

    const colorKey =
      Object.keys(initialAttrs).find(isColorAttribute) ||
      initialVariation?.attributes?.find(attr => isColorAttribute(attr.attribute_name))?.attribute_name ||
      'Color';

    if (location.state?.initialColor && !initialAttrs[colorKey]) {
      initialAttrs[colorKey] = location.state.initialColor;
    }

    setSelectedAttributes(initialAttrs);
    setCurrentVariation(initialVariation);
  }, [product, initialColorValue]);

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
        } catch {
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
    if (!mainImageRef.current) return;
  }, [currentVariation]);

  const attributeNames =
    product && product.product_type === 'variable' && product.variations.length > 0
      ? [...new Set(product.variations.flatMap(v => v.attributes.map(a => a.attribute_name)))].sort((a, b) =>
          isColorAttribute(a) ? 1 : isColorAttribute(b) ? -1 : 0
        )
      : [];

  const getAvailableOptions = (attrName) => {
    if (!product?.variations?.length) return [];

    const otherSelected = { ...selectedAttributes };
    delete otherSelected[attrName];

    const optionsSet = new Set(
      product.variations
        .filter(v =>
          Object.entries(otherSelected).every(([otherAttr, term]) => {
            const vAttr = v.attributes.find(a => a.attribute_name === otherAttr);
            const vTermName = String(vAttr?.term_name || '');
            return vTermName === term || vTermName.startsWith('Any');
          })
        )
        .flatMap(v => {
          const thisAttr = v.attributes.find(a => a.attribute_name === attrName);
          const thisTermName = String(thisAttr?.term_name || '').trim();

          if (!thisTermName || thisTermName.startsWith('Any')) {
            return [];
          }

          return [thisTermName];
        })
    );

    const options = [...optionsSet];

    if (isSizeAttribute(attrName)) {
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
        const vTermName = String(vAttr?.term_name || '');

        return vTermName === sel || vTermName === `Any ${attr}`;
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

  useEffect(() => {
  setIsTransitionImageReady(!hasSharedImageTransition);
}, [hasSharedImageTransition, current?.sku, product?.id]);

  if (loading && !product) return <div className="product-not-found">Loading product...</div>;
  if (error && !product) return <div className="product-not-found">{error.message || 'Failed to load product'}</div>;
  if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !currentVariation) return <div>Loading variation...</div>;

  const selectedColorKey = Object.keys(selectedAttributes).find(isColorAttribute);
  const currentColor = (selectedColorKey ? selectedAttributes[selectedColorKey] : null) || 'default';
  const currentDisplayId = `${product?.id || productId}-${currentColor}`;
  const transitionKey = location.state?.transitionKey || null;
  const hasSharedImageTransition = !!transitionKey;

  const gallery = current?.gallery || product.gallery || [];
  const mainImage = gallery[0] || product.archiveImage || '/api/Uploads/fallback-image.png';

  const displayTitle = product.product_type === 'variable' && currentVariation?.title ? currentVariation.title : product.title;
  const displayDescription =
    product.product_type === 'variable' && currentVariation?.description ? currentVariation.description : product.description;
  const stock = current?.stock_quantity ?? 'N/A';
  const isAddDisabled = availableStock !== null && availableStock < quantity;

  const handleAttributeChange = (attrName, value) => {
    setSelectedAttributes(prev => {
      const next = { ...prev, [attrName]: value };

      if (isColorAttribute(attrName)) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('color', value);
        navigate(`/product/${product.id}?${nextParams.toString()}`, {
          replace: true,
          state: {
            ...location.state,
            product,
            initialColor: value,
            transitionKey: null
          }
        });
      }

      return next;
    });

    setCartError(null);
  };

  const handleAddToCart = async () => {
    if (current?.sku) {
      try {
        const res = await fetch(`/api/get_inventory.php?sku=${encodeURIComponent(current.sku)}`);
        const data = await res.json();
        const freshStock = data.stock_quantity ?? 0;

        if (freshStock < quantity) {
          setCartError(quantity > 1 ? `Only ${freshStock} available` : 'Out of stock');
        } else {
          const newItem = {
            id: current.id || product.id,
            name: current.title || product.title,
            price: parseFloat(current.price || product.price),
            quantity,
            image: current.gallery?.[0] || product.gallery?.[0] || '/api/Uploads/fallback-image.png',
            size: selectedAttributes[Object.keys(selectedAttributes).find(isSizeAttribute)] || '',
            color: selectedAttributes[Object.keys(selectedAttributes).find(isColorAttribute)] || ''
          };

          setCartItems(prev => {
            const variationKey = `${newItem.size}-${newItem.color}`;
            const existingIndex = prev.findIndex(i => i.id === newItem.id && `${i.size}-${i.color}` === variationKey);

            if (existingIndex !== -1) {
              const newPrev = [...prev];
              newPrev[existingIndex].quantity += quantity;
              return newPrev;
            }

            return [...prev, newItem];
          });

          setCartError(null);
        }
      } catch {
        setCartError('Failed to verify stock');
      }
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

  const relatedProductsRaw =
    product.product_type === 'variable' ? currentVariation?.related_products || [] : product.related_products || [];

  const relatedProducts = relatedProductsRaw
    .map(rel => {
      const normalizedRel = typeof rel === 'string' ? { productId: rel } : rel;
      const p = allProducts.find(p => p.id === normalizedRel.productId);
      if (!p) return null;

      const color = normalizedRel.selectedColor;

      if (color) {
        const v = p.variations.find(v => v.attributes.some(a => isColorAttribute(a.attribute_name) && a.term_name === color));
        return {
          ...p,
          displayId: `${p.id}-${color}`,
          selectedColor: color,
          displayTitle: v?.title || `${p.title} - ${color}`,
          displayPrice: v?.price || p.price,
          displayGallery: v?.gallery || p.gallery
        };
      }

      return {
        ...p,
        displayId: p.id,
        selectedColor: null,
        displayTitle: p.title,
        displayPrice: p.price,
        displayGallery: p.gallery
      };
    })
    .filter(Boolean);

  const getDisplayImage = (relItem) => relItem.displayGallery?.[0] || '/api/Uploads/fallback-image.png';
  const getDisplayPrice = (relItem) => relItem.displayPrice || 0;

  const handleRelatedClick = (relItem) => {
    const originalProduct = allProducts.find(p => p.id === relItem.id);
    navigate(`/product/${relItem.id}`, {
      state: {
        product: originalProduct,
        initialColor: relItem.selectedColor,
        transitionKey: `product-image-${relItem.displayId}`
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
                    style={idx === 0 && hasSharedImageTransition ? { opacity: isTransitionImageReady ? 1 : 0 } : undefined}
                    onError={e => {
                      e.target.src = '/api/Uploads/fallback-image.png';
                    }}
                    transition={{ duration: 0.5 }}
                    onLayoutAnimationStart={() => {
                      if (layoutIdValue) {
                        setIsTransitionImageReady(true);
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
                style={hasSharedImageTransition ? { opacity: isTransitionImageReady ? 1 : 0 } : undefined}
                onError={e => {
                  e.target.src = '/api/Uploads/fallback-image.png';
                }}
                transition={{ duration: 0.5 }}
                onLayoutAnimationStart={() => {
                  setIsTransitionImageReady(true);
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
          initial={shouldAnimateDetailsIn ? { x: '100%' } : false}
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

                      {isColorAttribute(attrName) ? (
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
                <button
                  onClick={increaseQuantity}
                  className="qty-btn plus"
                  disabled={availableStock !== null && quantity >= availableStock}
                >
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
                  onError={e => {
                    e.target.src = '/api/Uploads/fallback-image.png';
                  }}
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