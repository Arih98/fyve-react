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

const ProductDetail = () => {
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const { id: productId } = useParams();
  const [searchParams] = useSearchParams();
  const [cartError, setCartError] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const mobileGalleryRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const allProducts = useStoredProducts();
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fallbackProduct = location.state?.product;
  const resolvedProductId = productId ?? fallbackProduct?.id ?? null;
  const { product: loadedProduct, loading, error } = useProduct(resolvedProductId);
  const product = loadedProduct ?? fallbackProduct ?? null;
  const urlColor = searchParams.get('color') || '';
  const initialColorValue = (urlColor || location.state?.initialColor || '').trim().toLowerCase();
  const shouldAnimateDetailsIn = !!location.state?.fromProductGrid;
const [showGalleryProgress, setShowGalleryProgress] = useState(!location.state?.fromProductGrid);
const hideGalleryProgress = !showGalleryProgress;

const detailsInitialAnimation = shouldAnimateDetailsIn
  ? isMobile
    ? { y: 30, opacity: 0 }
    : { x: '100%' }
  : false;

const detailsAnimateAnimation = isMobile
  ? { y: 0, opacity: 1 }
  : { x: 0 };

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
  const getColorClassName = (term) => {
  const value = String(term || '').trim().toLowerCase();

  if (value === 'sand') return 'sand';
  if (value === 'ivory') return 'ivory';
  if (value === 'mauve') return 'mauve';
  if (value === 'olive') return 'olive';
  if (value === 'lavender') return 'lavender';
  if (value === 'blue') return 'blue';
  if (value === 'oat') return 'oat';

  return '';
};

  const selectedColorKey = Object.keys(selectedAttributes).find(isColorAttribute);
  const currentColor = (selectedColorKey ? selectedAttributes[selectedColorKey] : null) || 'default';
  const currentDisplayId = `${product?.id || 'unknown'}-${currentColor}`;

const gallery = Array.isArray(current?.gallery)
  ? current.gallery
  : Array.isArray(product?.gallery)
    ? product.gallery
    : [];

const mainImage = gallery[0] || product?.thumbnail || '/api/Uploads/fallback-image.png';
const displayImages = gallery.length > 0 ? gallery : [mainImage];

  const displayTitle = product?.product_type === 'variable' && (effectiveVariation?.title || effectiveVariation?.name)
    ? (effectiveVariation?.title || effectiveVariation?.name)
    : (product?.title || product?.name || '');

  const displayDescription = product?.product_type === 'variable'
  ? (effectiveVariation?.description || effectiveVariation?.shortDescription || effectiveVariation?.short_description || product?.description || product?.shortDescription || '')
  : (product?.description || product?.shortDescription || '');

  useEffect(() => {
  if (!location.state?.fromProductGrid) {
    setShowGalleryProgress(true);
    return;
  }

  setShowGalleryProgress(false);

  const timeout = setTimeout(() => {
    setShowGalleryProgress(true);
  }, isMobile ? 520 : 620);

  return () => clearTimeout(timeout);
}, [location.state?.fromProductGrid, isMobile]);
useEffect(() => {
  setActiveImageIndex(0);
  if (mobileGalleryRef.current) {
    mobileGalleryRef.current.scrollLeft = 0;
  }
}, [current?.sku, product?.id, gallery.length]);

const handleMobileGalleryScroll = () => {
  const el = mobileGalleryRef.current;
  if (!el) return;

  const slideWidth = el.clientWidth;
  if (!slideWidth) return;

const nextIndex = Math.min(
  displayImages.length - 1,
  Math.max(0, Math.round(el.scrollLeft / slideWidth))
);
setActiveImageIndex(nextIndex);
};
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
    shouldAnimateDetailsIn,
    gallery.length,
    mainImage,
    currentVariation?.id
  ]);

  if (loading && !product) return <div className="product-not-found">Loading product...</div>;
  if (error && !product) return <div className="product-not-found">{error.message || 'Failed to load product'}</div>;
  if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !effectiveVariation) return <div>Loading variation...</div>;

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
      image: displayImages[0] || '/api/Uploads/fallback-image.png',
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
    <div
      ref={mobileGalleryRef}
      className="product-image-gallery-track"
      onScroll={handleMobileGalleryScroll}
    >
      {displayImages.map((img, idx) => {
        const imageKey = `${current?.sku || product.id}-${idx}`;

        return (
          <div
            ref={el => {
              galleryRefs.current.set(imageKey, el);
              if (displayImages.length === 1) {
                mainImageRef.current = el;
              }
            }}
            key={imageKey}
            data-pdp-primary-image={idx === 0 ? 'true' : undefined}
            className={`product-gallery-image-wrapper ${idx === 0 ? 'product-gallery-image-wrapper-main' : ''}`}
          >
            <img
              src={img}
              alt={`${displayTitle} ${idx + 1}`}
              className="product-gallery-image"
              onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
              onLoad={e => console.log('[PDP] gallery image loaded', {
                imageKey,
                src: e.target.currentSrc || e.target.src,
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight,
                rect: e.target.getBoundingClientRect(),
                complete: e.target.complete
              })}
            />
          </div>
        );
      })}
    </div>

{displayImages.length > 1 && (
  <div className={`product-gallery-progress ${hideGalleryProgress ? 'is-hidden-during-transition' : ''}`}>
    <div
      className="product-gallery-progress-bar"
      style={{ width: `${((activeImageIndex + 1) / displayImages.length) * 100}%` }}
    />
  </div>
)}
  </div>
</div>

<motion.div
  className="details-container"
  initial={detailsInitialAnimation}
  animate={detailsAnimateAnimation}
  transition={{
    duration: isMobile ? 0.5 : 0.5,
    delay: isMobile ? 0.18 : 0,
    ease: [0.16, 1, 0.3, 1]
  }}
>
          <div className={`product-details ${scrollDirection === 'up' ? 'scroll-up' : ''}`}>
            <h1 className="product-title">{displayTitle}</h1>

            <p
              className="product-variation-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayDescription) }}
            />

            <p
              className="product-description"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || product.shortDescription || '') }}
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
                                className={`color-button ${selectedAttributes[attrName] === term ? 'selected' : ''} ${getColorClassName(term)}`}
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