import React, { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { CartContext } from './CartContext';
import './ProductDetail.css';
import { useProduct } from './hooks/useProduct';
import { useProductSelection } from './hooks/useProductSelection';
import { useStoredProducts } from './hooks/useStoredProducts';
import { useQuantity } from './hooks/useQuantity';
import { useScrollDirection } from './hooks/useScrollDirection';
import { useRelatedProducts } from './hooks/useRelatedProducts';
import { useRelatedProductNavigation } from './hooks/useRelatedProductNavigation';

const getRectData = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: Number(r.x.toFixed(2)),
    y: Number(r.y.toFixed(2)),
    width: Number(r.width.toFixed(2)),
    height: Number(r.height.toFixed(2)),
    top: Number(r.top.toFixed(2)),
    left: Number(r.left.toFixed(2)),
    bottom: Number(r.bottom.toFixed(2)),
    right: Number(r.right.toFixed(2))
  };
};

const logElementState = (label, wrapperEl, imageEl) => {
  console.log(label, {
    wrapper: getRectData(wrapperEl),
    image: getRectData(imageEl)
  });
};

const trackFrames = (label, wrapperEl, imageEl, frameCount = 20) => {
  let frame = 0;
  const tick = () => {
    if (!wrapperEl) return;
    console.log(`${label} frame ${frame}`, {
      wrapper: getRectData(wrapperEl),
      image: getRectData(imageEl)
    });
    frame += 1;
    if (frame < frameCount) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const ProductDetail = () => {
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const { id: productId } = useParams();
  const [searchParams] = useSearchParams();
  const [cartError, setCartError] = useState(null);
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const allProducts = useStoredProducts();
  const scrollDirection = useScrollDirection();

  const fallbackProduct = location.state?.product;
  const resolvedProductId = productId ?? fallbackProduct?.id ?? null;
  const { product: loadedProduct, loading, error } = useProduct(resolvedProductId);
  const product = loadedProduct ?? fallbackProduct ?? null;
  const urlColor = searchParams.get('color') || '';
  const initialColorValue = (urlColor || location.state?.initialColor || '').trim().toLowerCase();
  const shouldAnimateDetailsIn = !searchParams.get('color') || !!location.state?.transitionKey;

  const {
    selectedAttributes,
    currentVariation,
    attributeNames,
    handleAttributeChange,
    getAvailableOptions,
    isColorAttribute,
    isSizeAttribute
  } = useProductSelection({
    product,
    location,
    searchParams,
    initialColorValue
  });

  const isVariableProduct = product?.product_type === 'variable';

  const fallbackVariation = useMemo(() => {
    if (!isVariableProduct || !Array.isArray(product?.variations) || !product.variations.length) {
      return null;
    }

    const normalizedInitialColor = String(initialColorValue || '').trim().toLowerCase();

    if (!normalizedInitialColor) {
      return product.variations[0] || null;
    }

    return product.variations.find((variation) =>
      Array.isArray(variation.attributes) &&
      variation.attributes.some((attr) =>
        String(attr.attribute_name || '').trim().toLowerCase() === 'color' &&
        String(attr.term_name || '').trim().toLowerCase() === normalizedInitialColor
      )
    ) || product.variations[0] || null;
  }, [isVariableProduct, product, initialColorValue]);

  const effectiveVariation = currentVariation || fallbackVariation;
  const current = product ? (isVariableProduct ? effectiveVariation : product) : null;
  const availableStock = current?.stockQuantity ?? current?.stock_quantity ?? null;
  const { quantity, increaseQuantity, decreaseQuantity } = useQuantity(current?.sku);

  const relatedProducts = useRelatedProducts(product, effectiveVariation, allProducts, isColorAttribute);
  const handleRelatedClick = useRelatedProductNavigation(allProducts);

  const getDisplayImage = (relItem) => relItem.displayGallery?.[0] || '/api/Uploads/fallback-image.png';
  const getDisplayPrice = (relItem) => relItem.displayPrice?.current ?? relItem.displayPrice ?? 0;

  const selectedColorKey = Object.keys(selectedAttributes).find(isColorAttribute);
  const selectedColorValue = selectedColorKey ? selectedAttributes[selectedColorKey] : null;
  const currentColor = selectedColorValue || initialColorValue || 'default';
  const normalizedCurrentColor = String(currentColor).trim();
  const currentDisplayId = `${product?.id || fallbackProduct?.id || 'unknown'}-${normalizedCurrentColor}`;
  const transitionKey = location.state?.transitionKey ?? `product-image-${currentDisplayId}`;

  const gallery = Array.isArray(current?.gallery)
    ? current.gallery
    : Array.isArray(product?.gallery)
      ? product.gallery
      : [];

  const mainImage = gallery[0] || product?.thumbnail || '/api/Uploads/fallback-image.png';
  const displayTitle = product?.product_type === 'variable' && (effectiveVariation?.title || effectiveVariation?.name)
    ? (effectiveVariation?.title || effectiveVariation?.name)
    : (product?.title || product?.name || '');

  const displayDescription = product?.product_type === 'variable'
    ? (effectiveVariation?.description || effectiveVariation?.shortDescription || effectiveVariation?.short_description || product?.description || product?.shortDescription || '')
    : (product?.description || product?.shortDescription || '');

  const hasStableSharedImage =
    !!product &&
    !!transitionKey &&
    !!mainImage &&
    (
      !isVariableProduct ||
      !!effectiveVariation ||
      !!initialColorValue
    );

  useEffect(() => {
    console.log('[PDP] route state', {
      productId,
      locationState: location.state,
      search: location.search
    });
  }, [productId, location.state, location.search]);

  useEffect(() => {
    console.log('[PDP] render state', {
      productId: product?.id,
      productTitle: product?.title,
      currentSku: current?.sku,
      currentDisplayId,
      transitionKey,
      shouldAnimateDetailsIn,
      galleryLength: gallery.length,
      mainImage,
      currentVariationId: currentVariation?.id
    });
  }, [
    product?.id,
    product?.title,
    current?.sku,
    currentDisplayId,
    transitionKey,
    shouldAnimateDetailsIn,
    gallery.length,
    mainImage,
    currentVariation?.id
  ]);

  useEffect(() => {
    const firstKey = `${current?.sku || product?.id}-0`;
    const wrapperEl = galleryRefs.current.get(firstKey) || mainImageRef.current || null;
    const imageEl =
      wrapperEl?.querySelector('.product-gallery-image, .product-main-image') || null;

    logElementState('[PDP] mounted first shared element', wrapperEl, imageEl);

    requestAnimationFrame(() => {
      logElementState('[PDP] mounted first shared element rAF 1', wrapperEl, imageEl);
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        logElementState('[PDP] mounted first shared element rAF 2', wrapperEl, imageEl);
      });
    });
  }, [product?.id, current?.sku, transitionKey]);

  console.log('[PDP] shared identity check', {
    productId: product?.id,
    initialColorValue,
    currentColor,
    currentDisplayId,
    transitionKey,
    effectiveVariationId: effectiveVariation?.id,
    mainImage,
    hasStableSharedImage
  });

  if (loading && !product && !fallbackProduct) {
    return <div className="product-not-found">Loading product...</div>;
  }

  if (error && !product && !fallbackProduct) {
    return <div className="product-not-found">{error.message || 'Failed to load product'}</div>;
  }

  if (!product && !fallbackProduct) {
    return <div className="product-not-found">Product not found</div>;
  }

  if ((product || fallbackProduct)?.product_type === 'variable' && !effectiveVariation && !initialColorValue) {
    return <div>Loading variation...</div>;
  }

  const handleAddToCart = () => {
    const freshStock = current?.stockQuantity ?? current?.stock_quantity ?? 0;

    if (freshStock < quantity) {
      setCartError(quantity > 1 ? `Only ${freshStock} available` : 'Out of stock');
      return;
    }

    const newItem = {
      id: current.id || product.id,
      name: current.title || product.title,
      price: Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0),
      quantity,
      image: current.gallery?.[0] || product.gallery?.[0] || '/api/Uploads/fallback-image.png',
      size: selectedAttributes[Object.keys(selectedAttributes).find(isSizeAttribute)] || '',
      color: selectedAttributes[Object.keys(selectedAttributes).find(isColorAttribute)] || '',
    };

    setCartItems(prev => {
      const variationKey = `${newItem.size}-${newItem.color}`;
      const existingIndex = prev.findIndex(
        i => i.id === newItem.id && `${i.size}-${i.color}` === variationKey
      );

      if (existingIndex !== -1) {
        const newPrev = [...prev];
        newPrev[existingIndex].quantity += quantity;
        return newPrev;
      }

      return [...prev, newItem];
    });

    setCartError(null);
  };

  const isAddDisabled = availableStock !== null && availableStock < quantity;

  return (
    <>
      <motion.div className="product-detail-container">
        <div className="images-container">
          <div className="product-image-gallery">
            {gallery.length > 0 ? (
              gallery.map((img, idx) => {
                const imageKey = `${current?.sku || product.id}-${idx}`;
                const layoutIdValue = idx === 0 && hasStableSharedImage ? transitionKey : undefined;

                return (
                  <motion.div
                    initial={false}
                    ref={el => {
                      galleryRefs.current.set(imageKey, el);
                      if (el) {
                        const imageEl = el.querySelector('.product-gallery-image');
                        logElementState('[PDP] gallery wrapper ref set', el, imageEl);
                      }
                    }}
                    key={imageKey}
                    layoutId={layoutIdValue}
                    className={`product-gallery-image-wrapper ${idx === 0 ? 'product-gallery-image-wrapper-main' : ''}`}
                    transition={{ duration: 0.5 }}
                    onLayoutAnimationStart={() => {
                      const wrapperEl = galleryRefs.current.get(imageKey);
                      const imageEl = wrapperEl?.querySelector('.product-gallery-image') || null;

                      logElementState('[PDP] gallery layout animation start', wrapperEl, imageEl);
                      trackFrames('[PDP] gallery animating', wrapperEl, imageEl, 20);

                      if (layoutIdValue && wrapperEl) {
                        wrapperEl.style.zIndex = '10000';
                      }
                    }}
                    onLayoutAnimationComplete={() => {
                      const wrapperEl = galleryRefs.current.get(imageKey);
                      const imageEl = wrapperEl?.querySelector('.product-gallery-image') || null;

                      logElementState('[PDP] gallery layout animation complete', wrapperEl, imageEl);

                      if (layoutIdValue && wrapperEl) {
                        wrapperEl.style.zIndex = '';
                      }
                    }}
                  >
                    <img
                      src={img}
                      alt={`${displayTitle} ${idx + 1}`}
                      className="product-gallery-image"
                      onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
                      onLoad={e => {
                        const wrapperEl = galleryRefs.current.get(imageKey);
                        logElementState('[PDP] gallery image loaded', wrapperEl, e.target);
                      }}
                    />
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={false}
                ref={el => {
                  mainImageRef.current = el;
                  if (el) {
                    const imageEl = el.querySelector('.product-main-image');
                    logElementState('[PDP] main wrapper ref set', el, imageEl);
                  }
                }}
                layoutId={hasStableSharedImage ? transitionKey : undefined}
                className="product-main-image-wrapper"
                transition={{ duration: 0.5 }}
                onLayoutAnimationStart={() => {
                  const wrapperEl = mainImageRef.current;
                  const imageEl = wrapperEl?.querySelector('.product-main-image') || null;

                  logElementState('[PDP] main layout animation start', wrapperEl, imageEl);
                  trackFrames('[PDP] main animating', wrapperEl, imageEl, 20);

                  if (wrapperEl) {
                    wrapperEl.style.zIndex = '10000';
                  }
                }}
                onLayoutAnimationComplete={() => {
                  const wrapperEl = mainImageRef.current;
                  const imageEl = wrapperEl?.querySelector('.product-main-image') || null;

                  logElementState('[PDP] main layout animation complete', wrapperEl, imageEl);

                  if (wrapperEl) {
                    wrapperEl.style.zIndex = '';
                  }
                }}
              >
                <img
                  src={mainImage}
                  alt={displayTitle}
                  className="product-main-image"
                  onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
                  onLoad={e => {
                    const wrapperEl = mainImageRef.current;
                    logElementState('[PDP] main image loaded', wrapperEl, e.target);
                  }}
                />
              </motion.div>
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
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || product.shortDescription || "") }}
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
                                onClick={() => {
                                  handleAttributeChange(attrName, term);
                                  setCartError(null);
                                }}
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
                                onClick={() => {
                                  handleAttributeChange(attrName, term);
                                  setCartError(null);
                                }}
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
                <button onClick={() => increaseQuantity(availableStock)} className="qty-btn plus" disabled={availableStock !== null && quantity >= availableStock}>
                  <span className="qty-symbol">+</span>
                </button>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={isAddDisabled} className={`add-to-cart-button ${isAddDisabled ? 'disabled' : ''}`}>
              <span className="add-to-cart-text">Add to Cart</span>
              <span className="add-to-cart-price">${(Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0) * quantity).toFixed(2)}</span>
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
                  <p className="related-product-price">${Number(getDisplayPrice(relItem) || 0).toFixed(2)}</p>
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