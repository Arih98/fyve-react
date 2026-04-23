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
import gsap from 'gsap';
import FullscreenGallery from './FullscreenGallery';


const ProductDetail = () => {
  const { cartItems, addItem } = useContext(CartContext);
  const location = useLocation();
  const { id: productId } = useParams();
  const [searchParams] = useSearchParams();
  const [cartError, setCartError] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const mobileGalleryRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const descriptionPanelRef = useRef(null);
  const descriptionIconRef = useRef(null);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const deliveryPanelRef = useRef(null);
  const deliveryIconRef = useRef(null);
  const allProducts = useStoredProducts();
  const scrollDirection = useScrollDirection();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [isSizePanelOpen, setIsSizePanelOpen] = useState(false);
  const galleryTouchStartRef = useRef({ x: 0, y: 0 });
  const galleryWasDraggingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fallbackProduct = location.state?.product;
  const resolvedProductId = productId ?? fallbackProduct?.id ?? null;
  const { product: loadedProduct, loading, error } = useProduct(resolvedProductId);
  const product = loadedProduct ?? fallbackProduct ?? null;
  const productForOptions = loadedProduct ?? null;
  const urlColor = searchParams.get('color') || '';
  const initialColorValue = (urlColor || location.state?.initialColor || '').trim().toLowerCase();
  const selectedVariationIdFromApi = productForOptions?.selected_variation_id ? String(productForOptions.selected_variation_id) : '';
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
  product: productForOptions,
  location,
  searchParams,
  initialColorValue,
  selectedVariationIdFromApi
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
const sizeValue = selectedAttributes[Object.keys(selectedAttributes).find(isSizeAttribute)] || '';
const hasSelectedSize = Boolean(sizeValue);

const current = product
  ? isVariableProduct
    ? hasSelectedSize
      ? effectiveVariation
      : product
    : product
  : null;
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

  useLayoutEffect(() => {
  const animateAccordion = (isOpen, panel, icon) => {
    if (!panel || !icon) return;

    gsap.killTweensOf(panel);
    gsap.killTweensOf(icon);

    if (isOpen) {
      gsap.set(panel, { height: 'auto' });
      const targetHeight = panel.offsetHeight;

      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        {
          height: targetHeight,
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
          onComplete: () => gsap.set(panel, { height: 'auto' })
        }
      );

gsap.to(icon, {
  rotate: 45,
  duration: 0.22,
  ease: 'power3.out'
});
    } else {
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out'
      });

gsap.to(icon, {
  rotate: 0,
  duration: 0.22,
  ease: 'power3.out'
});
    }
  };

  animateAccordion(isDescriptionOpen, descriptionPanelRef.current, descriptionIconRef.current);
  animateAccordion(isDeliveryOpen, deliveryPanelRef.current, deliveryIconRef.current);

}, [isDescriptionOpen, isDeliveryOpen, displayDescription]);

const getOrderedOptions = useCallback((attrName) => {
  const rawOptions = getAvailableOptions(attrName) || [];

  if (isSizeAttribute(attrName)) {
    const variationOrder = (productForOptions?.variations || [])
      .map(variation => {
        const match = (variation.attributes || []).find(
          attr => attr.attribute_name === attrName
        );
        return match?.term_name || null;
      })
      .filter(Boolean);

    const uniqueVariationOrder = [...new Set(variationOrder)];

    if (uniqueVariationOrder.length) {
      return uniqueVariationOrder.filter(option => rawOptions.includes(option));
    }
  }

  const attributeMeta = productForOptions?.attributes?.find(
    attr => attr.attribute_name === attrName
  );

  if (!attributeMeta?.options?.length) {
    return rawOptions;
  }

  const orderMap = new Map(
    attributeMeta.options.map((option, index) => [option.term_name, index])
  );

  return [...rawOptions].sort((a, b) => {
    const aIndex = orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}, [getAvailableOptions, isSizeAttribute, productForOptions?.variations, productForOptions?.attributes]);

useEffect(() => {
  setIsDescriptionOpen(false);
  setIsDeliveryOpen(false);
}, [current?.sku, product?.id]);

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

  const firstSlide = el.children[0];
  if (!firstSlide) return;

  const slideWidth = firstSlide.getBoundingClientRect().width;
  if (!slideWidth) return;

  const nextIndex = Math.min(
    displayImages.length - 1,
    Math.max(0, Math.round(el.scrollLeft / slideWidth))
  );

  setActiveImageIndex(nextIndex);
};

useEffect(() => {
  const el = mobileGalleryRef.current;
  if (!el || !isMobile) return;

  let scrollTimeout;

  const snapToNearestSlide = () => {
    const firstSlide = el.children[0];
    if (!firstSlide) return;

    const slideWidth = firstSlide.getBoundingClientRect().width;
    if (!slideWidth) return;

    const nextIndex = Math.round(el.scrollLeft / slideWidth);
    const clampedIndex = Math.max(0, Math.min(displayImages.length - 1, nextIndex));

    el.scrollTo({
      left: clampedIndex * slideWidth,
      behavior: 'smooth'
    });

    setActiveImageIndex(clampedIndex);
  };

  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(snapToNearestSlide, 80);
  };

  el.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    clearTimeout(scrollTimeout);
    el.removeEventListener('scroll', handleScroll);
  };
}, [isMobile, displayImages.length, current?.sku, product?.id]);

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

const isOutOfStock =
  remainingStockForSelection !== null && remainingStockForSelection <= 0;

const isAddDisabled = isOutOfStock;

  const handleAddToCart = useCallback(async () => {
  if (!product || !current) return;

  try {
    const freshStock = Number(current?.stockQuantity ?? current?.stock_quantity ?? 0);

    const sizeValue = selectedAttributes[Object.keys(selectedAttributes).find(isSizeAttribute)] || '';
    const colorValue = selectedAttributes[Object.keys(selectedAttributes).find(isColorAttribute)] || '';

    const currentItemId = current?.id || product?.id;

    const existingCartItem = cartItems.find((item) => item.id === currentItemId);
    const existingQuantityInCart = existingCartItem?.quantity || 0;
    const remainingStock = Math.max(0, freshStock - existingQuantityInCart);

    if (freshStock > 0 && remainingStock <= 0) {
      setCartError('No more stock available for this selection');
      return;
    }

    if (freshStock > 0 && quantity > remainingStock) {
      setCartError(
        remainingStock === 1
          ? 'Only 1 more available'
          : `Only ${remainingStock} more available`
      );
      return;
    }

    const variationPayload =
      Array.isArray(current?.attributes) && current.attributes.length
        ? current.attributes.map((attr) => ({
            attribute: attr.attribute_name,
            value: attr.term_slug
          }))
        : [];

    await addItem({
      id: Number(currentItemId),
      quantity,
      variation: variationPayload
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
  } catch (err) {
    console.error(err);
    setCartError('Failed to add to cart');
  }
}, [
  product,
  current,
  quantity,
  selectedAttributes,
  isSizeAttribute,
  isColorAttribute,
  cartItems,
  addItem
]);

const currentTotalPrice = (Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0) * quantity).toFixed(2);
const addToCartLabel = isOutOfStock ? 'Out of Stock' : 'Add to Cart';
const pdpMobileButtonLabel = isOutOfStock ? 'Out of Stock' : `Add to Bag • $${currentTotalPrice}`;

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
  setIsSizePanelOpen(false);
}, [product?.id, current?.sku, selectedAttributes]);

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

const openImageViewer = (index) => {
  setViewerImageIndex(index);
  setIsImageViewerOpen(true);
};

const closeImageViewer = () => {
  setIsImageViewerOpen(false);
};

const handleGalleryTouchStart = (e) => {
  const touch = e.touches[0];
  galleryTouchStartRef.current = {
    x: touch.clientX,
    y: touch.clientY
  };
  galleryWasDraggingRef.current = false;
};

const handleGalleryTouchMove = (e) => {
  const touch = e.touches[0];
  const deltaX = Math.abs(touch.clientX - galleryTouchStartRef.current.x);
  const deltaY = Math.abs(touch.clientY - galleryTouchStartRef.current.y);

  if (deltaX > 8 || deltaY > 8) {
    galleryWasDraggingRef.current = true;
  }
};

const handleGalleryImageClick = (idx) => {
  if (galleryWasDraggingRef.current) {
    galleryWasDraggingRef.current = false;
    return;
  }

  openImageViewer(idx);
};

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
  onTouchStart={handleGalleryTouchStart}
  onTouchMove={handleGalleryTouchMove}
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
  onClick={() => handleGalleryImageClick(idx)}
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

      {product.product_type === 'variable' && (
  <div className="product-attributes">
    {attributeNames.map(attrName => {
      const options = getOrderedOptions(attrName);

      return (
        <div key={attrName} className="attribute-group">
          {!isSizeAttribute(attrName) && (
  <label className="attribute-label">{attrName}</label>
)}

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
            <div className="size-picker">
<button
  type="button"
  className="size-picker-trigger"
  onClick={() => {
    if (productForOptions) {
      setIsSizePanelOpen(true);
    }
  }}
  disabled={!productForOptions}
>
<span className="size-picker-trigger-label">
  Select a size
</span>
    <span className="size-picker-trigger-icon">+</span>
  </button>

  {isSizePanelOpen && (
    <div
      className="size-panel-backdrop"
      onClick={() => setIsSizePanelOpen(false)}
    >
      <div
        className="size-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Select a size"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="size-panel-header">
          <h3 className="size-panel-title">Size</h3>
          <button
            type="button"
            className="size-panel-close"
            onClick={() => setIsSizePanelOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="size-panel-options" role="listbox" aria-label="Select a size">
  {productForOptions && options.map(term => (
    <button
      key={term}
      type="button"
      role="option"
      aria-selected={selectedAttributes[attrName] === term}
      className={`size-panel-option ${selectedAttributes[attrName] === term ? 'selected' : ''}`}
      onClick={() => {
        handleAttributeChange(attrName, term);
        setCartError(null);
        setIsSizePanelOpen(false);
      }}
    >
      <span className="size-panel-option-value">{term}</span>
    </button>
  ))}
</div>

<div className="size-panel-footer">
  <button
    type="button"
    className="size-panel-add-button"
    disabled={!selectedAttributes[attrName] || isOutOfStock}
    onClick={() => {
      handleAddToCart();
      setIsSizePanelOpen(false);
    }}
  >
    {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
  </button>
</div>
      </div>
    </div>
  )}
</div>
          )}
        </div>
      );
    })}
  </div>
)}

      {cartError && <p className="cart-error">{cartError}</p>}

      <div className="quantity-selector">
  <label className="quantity-label">Quantity</label>
  <div className="quantity-controls pdp-quantity-controls">
    <button
      onClick={decreaseQuantity}
      className="quantity-minus"
      disabled={quantity <= 1}
      type="button"
    >
      <span className="minus-line"></span>
    </button>

    <input
      type="number"
      className="quantity-input"
      value={quantity}
      min="1"
      readOnly
    />

    <button
      onClick={() => increaseQuantity(remainingStockForSelection)}
      className="quantity-plus"
      disabled={remainingStockForSelection !== null && quantity >= remainingStockForSelection}
      type="button"
    >
      <span className="plus-horizontal"></span>
      <span className="plus-vertical"></span>
    </button>
  </div>
</div>

<button
  onClick={handleAddToCart}
  disabled={isAddDisabled}
  className={`add-to-cart-button ${isAddDisabled ? 'disabled' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
>
  <span className="add-to-cart-text">{addToCartLabel}</span>
  {!isOutOfStock && (
    <span className="add-to-cart-price">${currentTotalPrice}</span>
  )}
</button>
            <div className="product-description-accordion">
  <button
    type="button"
    className="product-description-accordion-toggle"
    onClick={() => {
  setIsDescriptionOpen(prev => !prev);
  setIsDeliveryOpen(false);
}}
    aria-expanded={isDescriptionOpen}
  >
    <span className="product-description-accordion-title">Materials</span>
    <span
      ref={descriptionIconRef}
      className="product-description-accordion-icon"
      aria-hidden="true"
    >
      <span />
      <span />
    </span>
  </button>

  <div
    ref={descriptionPanelRef}
    className="product-description-accordion-panel"
  >
    <div className="product-description-accordion-inner">
      <div
        className={
          effectiveVariation?.description ||
          effectiveVariation?.shortDescription ||
          effectiveVariation?.short_description
            ? 'product-variation-description accordion-description-content'
            : 'product-description accordion-description-content'
        }
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayDescription || '') }}
      />
    </div>
  </div>
</div>
<div className="product-description-accordion">
  <button
    type="button"
    className="product-description-accordion-toggle"
    onClick={() => {
  setIsDeliveryOpen(prev => !prev);
  setIsDescriptionOpen(false);
}}
    aria-expanded={isDeliveryOpen}
  >
    <span className="product-description-accordion-title">Delivery and Returns</span>
    <span
      ref={deliveryIconRef}
      className="product-description-accordion-icon"
      aria-hidden="true"
    >
      <span />
      <span />
    </span>
  </button>

  <div
    ref={deliveryPanelRef}
    className="product-description-accordion-panel"
  >
    <div className="product-description-accordion-inner">
      <div className="accordion-description-content">
        <p>
          You can return your item(s) within 7 days of delivery. There will be an $8 charge to process your return, and we'll provide you with a prepaid shipping label to make the process as smooth as possible.
        </p>
        <p>
          Please note, your return must be marked as posted within 7 calendar days from being delivered. Any returns received which do not meet our returns criteria will not be eligible for a refund.
        </p>
      </div>
    </div>
  </div>
</div>
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

<FullscreenGallery
  images={displayImages}
  initialIndex={viewerImageIndex}
  isOpen={isImageViewerOpen}
  title={displayTitle}
  onClose={closeImageViewer}
/>

  </>
);
};

export default ProductDetail;