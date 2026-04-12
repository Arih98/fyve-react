import React, { useEffect, useLayoutEffect, useState, useRef, useContext, useMemo, useCallback } from 'react';
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
  const { cartItems, setCartItems } = useContext(CartContext);
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
const availableStockRaw = current?.stockQuantity ?? current?.stock_quantity ?? null;
const availableStock = availableStockRaw === null ? null : Number(availableStockRaw);
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
const [showDetails, setShowDetails] = useState(!location.state?.fromProductGrid);

useEffect(() => {
  if (!location.state?.fromProductGrid) {
    setShowDetails(true);
    return;
  }

  setShowDetails(false);

const timeout = setTimeout(() => {
  setShowDetails(true);
}, isMobile ? 260 : 180);

  return () => clearTimeout(timeout);
}, [location.state?.fromProductGrid, isMobile]);

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
useLayoutEffect(() => {
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

const sizeValue = selectedAttributes[Object.keys(selectedAttributes).find(isSizeAttribute)] || '';
const colorValue = selectedAttributes[Object.keys(selectedAttributes).find(isColorAttribute)] || '';
const currentItemId = current?.id || product?.id;
const currentVariationKey = `${sizeValue}-${colorValue}`;

const existingCartItem = cartItems.find(
  item => item.id === currentItemId && `${item.size || ''}-${item.color || ''}` === currentVariationKey
);

const existingQuantityInCart = existingCartItem?.quantity || 0;
const remainingStockForSelection =
  availableStock === null
    ? null
    : Math.max(0, Number(availableStock) - existingQuantityInCart);

const isAddDisabled =
  remainingStockForSelection !== null && remainingStockForSelection < quantity;

  const handleAddToCart = useCallback(() => {
  const freshStock = Number(current?.stockQuantity ?? current?.stock_quantity ?? 0);

  const sizeValue = selectedAttributes[Object.keys(selectedAttributes).find(isSizeAttribute)] || '';
  const colorValue = selectedAttributes[Object.keys(selectedAttributes).find(isColorAttribute)] || '';
  const variationKey = `${sizeValue}-${colorValue}`;
  const itemId = current?.id || product?.id;

  const existingCartItem = cartItems.find(
    item => item.id === itemId && `${item.size || ''}-${item.color || ''}` === variationKey
  );

  const existingQuantityInCart = existingCartItem?.quantity || 0;
  const remainingStock = Math.max(0, freshStock - existingQuantityInCart);

  if (remainingStock <= 0) {
    setCartError('No more stock available for this selection');
    return;
  }

  if (quantity > remainingStock) {
    setCartError(
      remainingStock === 1
        ? 'Only 1 more available'
        : `Only ${remainingStock} more available`
    );
    return;
  }

  const newItem = {
    id: itemId,
    name: product?.title || product?.name || '',
    price: Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0),
    quantity,
    image: displayImages[0] || '/api/Uploads/fallback-image.png',
    size: sizeValue,
    color: colorValue,
    stockQuantity: freshStock
  };

  setCartItems(prev => {
    const existingIndex = prev.findIndex(
      i => i.id === newItem.id && `${i.size || ''}-${i.color || ''}` === variationKey
    );

    if (existingIndex !== -1) {
      const newPrev = [...prev];
      const nextQuantity = Math.min(
        freshStock,
        newPrev[existingIndex].quantity + quantity
      );
      newPrev[existingIndex] = {
        ...newPrev[existingIndex],
        quantity: nextQuantity,
        stockQuantity: freshStock
      };
      return newPrev;
    }

    return [...prev, newItem];
  });

  const sourceImageEl = document.querySelector('[data-pdp-primary-image="true"]');
  const sourceRect = sourceImageEl?.getBoundingClientRect();

  window.dispatchEvent(
    new CustomEvent('cart:item-added', {
      detail: {
        sourceSelector: '[data-pdp-primary-image="true"]',
        startRect: sourceRect
          ? {
              top: sourceRect.top,
              left: sourceRect.left,
              width: sourceRect.width,
              height: sourceRect.height
            }
          : null
      }
    })
  );

  setCartError(null);
}, [
  current,
  product,
  quantity,
  displayImages,
  selectedAttributes,
  isSizeAttribute,
  isColorAttribute,
  cartItems,
  setCartItems
]);

const currentTotalPrice = (Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0) * quantity).toFixed(2);
const pdpMobileButtonLabel = `Add to Bag • $${currentTotalPrice}`;

useEffect(() => {
  window.dispatchEvent(
    new CustomEvent('pdp:update-add-to-bag-label', {
      detail: {
        label: pdpMobileButtonLabel
      }
    })
  );
}, [pdpMobileButtonLabel]);

useEffect(() => {
  const handleExternalAddToCart = () => {
    handleAddToCart();
  };

  window.addEventListener('pdp:add-to-cart', handleExternalAddToCart);

  return () => {
    window.removeEventListener('pdp:add-to-cart', handleExternalAddToCart);
  };
}, [handleAddToCart]);

useEffect(() => {
  if (!product) return;
  if (product.product_type === 'variable' && !effectiveVariation) return;

  const selectedColor =
    selectedAttributes[Object.keys(selectedAttributes).find(isColorAttribute)] || '';

  if (product.product_type === 'variable' && !selectedColor) return;

  const storageKey = `${product.id}__${String(selectedColor || '').toLowerCase()}`;

  const recentlyViewedItem = {
    storageKey,
    id: current?.id || product.id,
    parentId: product.id,
    title: displayTitle,
    price: Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0),
    image: displayImages[0] || product?.thumbnail || '/api/Uploads/fallback-image.png',
    selectedColor,
    gallery: displayImages,
    product,
    path: `/product/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`
  };

  const existing = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]');
  const filtered = existing.filter(item => item.storageKey !== storageKey);
  const next = [recentlyViewedItem, ...filtered].slice(0, 8);

  localStorage.setItem('recentlyViewedProducts', JSON.stringify(next));
}, [
  product,
  current,
  effectiveVariation,
  displayImages,
  displayTitle,
  selectedAttributes,
  isColorAttribute
]);

  if (loading && !product) return <div className="product-not-found">Loading product...</div>;
  if (error && !product) return <div className="product-not-found">{error.message || 'Failed to load product'}</div>;
  if (!product) return <div className="product-not-found">Product not found</div>;
  if (product.product_type === 'variable' && !effectiveVariation) return <div>Loading variation...</div>;

return (
  <>
    <div>
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
            }}
            key={imageKey}
            className={`product-gallery-image-wrapper ${idx === 0 ? 'product-gallery-image-wrapper-main' : ''}`}
          >
            <div className="product-gallery-image-box">
  <img
    data-pdp-primary-image={idx === 0 ? 'true' : undefined}
                ref={el => {
                  if (idx === 0) {
                    mainImageRef.current = el;
                  } else if (mainImageRef.current === el) {
                    mainImageRef.current = null;
                  }
                }}
                src={img}
                alt={`${displayTitle} ${idx + 1}`}
                className="product-gallery-image"
                onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
              />
            </div>
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

{showDetails && (
  <motion.div
    className="details-container"
    initial={
      shouldAnimateDetailsIn
        ? isMobile
          ? { y: 30, opacity: 0 }
          : { x: 80, opacity: 0 }
        : false
    }
    animate={{ x: 0, y: 0, opacity: 1 }}
    transition={{
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }}
  >
    <div className={`product-details ${scrollDirection === 'up' ? 'scroll-up' : ''}`}>
      <h1 className="product-title">{displayTitle}</h1>

            {displayDescription && (
        <p
          className={
            effectiveVariation?.description ||
            effectiveVariation?.shortDescription ||
            effectiveVariation?.short_description
              ? 'product-variation-description'
              : 'product-description'
          }
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayDescription) }}
        />
      )}

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
          <button
  onClick={() => increaseQuantity(remainingStockForSelection)}
  className="qty-btn plus"
  disabled={remainingStockForSelection !== null && quantity >= remainingStockForSelection}
>
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
)}
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
    </div>
  </>
);
};

export default ProductDetail;