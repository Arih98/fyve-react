import React, { useEffect, useLayoutEffect, useState, useRef, useContext, useMemo, useCallback } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { CartContext } from './CartContext';
import './ProductDetail.css';
import { useProduct } from './hooks/useProduct';
import { useProductSelection } from './hooks/useProductSelection';
import { useStoredProducts } from './hooks/useStoredProducts';
import { useScrollDirection } from './hooks/useScrollDirection';
import { useRelatedProducts } from './hooks/useRelatedProducts';
import { useRelatedProductNavigation } from './hooks/useRelatedProductNavigation';
import gsap from 'gsap';
import FullscreenGallery from './FullscreenGallery';


const ProductDetail = () => {
  const { cartItems, addItem, loading: cartLoading } = useContext(CartContext);
  const location = useLocation();
  const { id: productId } = useParams();
  const [searchParams] = useSearchParams();
  const [cartError, setCartError] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const mainImageRef = useRef(null);
  const galleryRefs = useRef(new Map());
  const mobileGalleryRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDesktopSecondaryImages, setShowDesktopSecondaryImages] = useState(!location.state?.fromProductGrid);
const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
const descriptionPanelRef = useRef(null);
const descriptionIconRef = useRef(null);
const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
const sizeGuidePanelRef = useRef(null);
const sizeGuideIconRef = useRef(null);
const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
const deliveryPanelRef = useRef(null);
const deliveryIconRef = useRef(null);
  const allProducts = useStoredProducts();
  const scrollDirection = useScrollDirection();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [isSizePanelOpen, setIsSizePanelOpen] = useState(false);
  const sizePanelHistoryRef = useRef(false);
  const pendingHeaderAddAfterSizeRef = useRef(false);
  const sizePanelScrollYRef = useRef(0);
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
const productForOptions = loadedProduct ?? fallbackProduct ?? null;
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
  product,
  location,
  searchParams,
  initialColorValue,
  selectedVariationIdFromApi
});

  const isVariableProduct = product?.product_type === 'variable';

  const isColorLikeAttributeName = useCallback((name) => {
  const value = String(name || '').trim().toLowerCase();

  return (
    value === 'color' ||
    value === 'colour' ||
    value.includes('color') ||
    value.includes('colour') ||
    value.includes('stitching') ||
    value.includes('stiching')
  );
}, []);

  const fallbackVariation = useMemo(() => {
  if (!isVariableProduct || !Array.isArray(product?.variations) || !product.variations.length) {
    return null;
  }

  const normalizedInitialColor = String(initialColorValue || '').trim().toLowerCase();

  if (normalizedInitialColor) {
    const matchByColor = product.variations.find((variation) =>
      Array.isArray(variation.attributes) &&
      variation.attributes.some((attr) => {
        const attrName = String(attr.attribute_name || attr.name || '').trim().toLowerCase();
        const attrValue = String(attr.term_name || attr.term_slug || attr.value || '').trim().toLowerCase();

        return isColorLikeAttributeName(attrName) && attrValue === normalizedInitialColor;
      })
    );

    if (matchByColor) {
      return matchByColor;
    }
  }

  return product.variations[0] || null;
}, [isVariableProduct, product, initialColorValue, isColorLikeAttributeName]);

const effectiveVariation = currentVariation || fallbackVariation;
const sizeAttrName = attributeNames.find(isSizeAttribute);
const sizeValue = sizeAttrName ? selectedAttributes[sizeAttrName] || '' : '';
const hasSelectedSize = Boolean(sizeValue);
const needsSizeSelection = product?.product_type === 'variable' && sizeAttrName && !hasSelectedSize;
const current = product ? (isVariableProduct ? effectiveVariation : product) : null;

  const availableStockRaw = current?.stockQuantity ?? current?.stock_quantity ?? null;
  const availableStock = availableStockRaw === null ? null : Number(availableStockRaw);

  const relatedProducts = useRelatedProducts(product, effectiveVariation, allProducts, isColorLikeAttributeName);
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

  const selectedColorKey = Object.keys(selectedAttributes).find(isColorLikeAttributeName);
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

const displayMainDescription = loadedProduct?.description || fallbackProduct?.description || '';

const displayMaterialsDescription =
  effectiveVariation?.description ||
  loadedProduct?.short_description ||
  loadedProduct?.shortDescription ||
  fallbackProduct?.short_description ||
  fallbackProduct?.shortDescription ||
  '';

  const sizeChart =
  loadedProduct?.size_chart ||
  product?.size_chart ||
  fallbackProduct?.size_chart ||
  null;

const sizeChartRows = Array.isArray(sizeChart?.sizes) ? sizeChart.sizes : [];
const hasSizeChart = sizeChartRows.length > 0;

const sizeChartMeasurement1Title = String(sizeChart?.measurement_1_title || '').trim();
const sizeChartMeasurement2Title = String(sizeChart?.measurement_2_title || '').trim();

const showSizeChartMeasurement1 =
  sizeChartMeasurement1Title !== '' ||
  sizeChartRows.some(row => String(row?.measurement_1 || '').trim() !== '');

const showSizeChartMeasurement2 =
  sizeChartMeasurement2Title !== '' ||
  sizeChartRows.some(row => String(row?.measurement_2 || '').trim() !== '');

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

animateAccordion(isSizeGuideOpen, sizeGuidePanelRef.current, sizeGuideIconRef.current);
animateAccordion(isDescriptionOpen, descriptionPanelRef.current, descriptionIconRef.current);
animateAccordion(isDeliveryOpen, deliveryPanelRef.current, deliveryIconRef.current);

}, [isSizeGuideOpen, isDescriptionOpen, isDeliveryOpen, displayMaterialsDescription, sizeChartRows.length, isMobile]);

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
  setIsSizeGuideOpen(false);
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

useEffect(() => {
  if (isMobile || !location.state?.fromProductGrid) {
    setShowDesktopSecondaryImages(true);
    return;
  }

  setShowDesktopSecondaryImages(false);

  const timeout = setTimeout(() => {
    setShowDesktopSecondaryImages(true);
  }, 450);

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

  const children = Array.from(el.children);
  if (!children.length) return;

  const nextIndex = children.reduce((closestIndex, child, index) => {
    const currentDistance = Math.abs(child.offsetLeft - el.scrollLeft);
    const closestDistance = Math.abs(children[closestIndex].offsetLeft - el.scrollLeft);

    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);

  setActiveImageIndex(Math.max(0, Math.min(displayImages.length - 1, nextIndex)));
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

const colorValueKey = Object.keys(selectedAttributes).find(isColorLikeAttributeName);
const colorValue = colorValueKey ? selectedAttributes[colorValueKey] || '' : '';
const currentItemId = current?.id || product?.id;

const existingCartItem = cartItems.find((item) => Number(item.id) === Number(currentItemId));

const existingQuantityInCart = existingCartItem?.quantity || 0;
const remainingStockForSelection =
  availableStock === null
    ? null
    : Math.max(0, Number(availableStock) - existingQuantityInCart);

const hasResolvedSelection = product?.product_type !== 'variable' || hasSelectedSize;

const hasCurrentSelectionInCart = hasResolvedSelection && Boolean(existingCartItem);

const hasReachedCartStockLimit =
  hasCurrentSelectionInCart &&
  remainingStockForSelection !== null &&
  remainingStockForSelection <= 0;

const isOutOfStock =
  hasResolvedSelection &&
  !hasCurrentSelectionInCart &&
  remainingStockForSelection !== null &&
  remainingStockForSelection <= 0;

const isAddDisabled = cartLoading || isOutOfStock || hasReachedCartStockLimit;

const getVariationForSizeOption = useCallback((sizeAttrName, sizeTerm) => {
  if (!Array.isArray(productForOptions?.variations)) return null;

  return productForOptions.variations.find((variation) => {
    const attrs = Array.isArray(variation.attributes) ? variation.attributes : [];

    return attributeNames.every((attrName) => {
      const expectedValue = isSizeAttribute(attrName)
        ? sizeTerm
        : selectedAttributes[attrName];

      if (!expectedValue) return true;

      return attrs.some((attr) =>
        String(attr.attribute_name || '').trim().toLowerCase() === String(attrName || '').trim().toLowerCase() &&
        String(attr.term_name || attr.term_slug || '').trim().toLowerCase() === String(expectedValue || '').trim().toLowerCase()
      );
    });
  }) || null;
}, [
  productForOptions?.variations,
  attributeNames,
  isSizeAttribute,
  selectedAttributes
]);

const getSizeOptionStockState = useCallback((sizeAttrName, sizeTerm) => {
  const variation = getVariationForSizeOption(sizeAttrName, sizeTerm);

  if (!variation) {
    return {
      variation: null,
      isOutOfStock: true,
      remainingStock: 0
    };
  }

  const stockStatus = String(variation.stock_status || variation.stockStatus || '').toLowerCase();

  if (stockStatus === 'outofstock' || stockStatus === 'out_of_stock') {
    return {
      variation,
      isOutOfStock: true,
      remainingStock: 0
    };
  }

  const rawStock = variation.stockQuantity ?? variation.stock_quantity ?? null;
  const stockNumber = Number(rawStock);
  const hasKnownStock = rawStock !== null && rawStock !== undefined && rawStock !== '' && Number.isFinite(stockNumber);

  if (!hasKnownStock) {
    return {
      variation,
      isOutOfStock: true,
      remainingStock: 0
    };
  }

  const existingItem = cartItems.find((item) => Number(item.id) === Number(variation.id));
  const existingQuantity = existingItem?.quantity || 0;
  const remainingStock = Math.max(0, stockNumber - existingQuantity);

  return {
    variation,
    isOutOfStock: remainingStock <= 0,
    remainingStock
  };
}, [getVariationForSizeOption, cartItems]);

const openSizePanel = useCallback(() => {
  if (!productForOptions) return;

  if (!isSizePanelOpen) {
    window.history.pushState({ sizePanel: true }, '');
    sizePanelHistoryRef.current = true;
  }

  setIsSizePanelOpen(true);
}, [productForOptions, isSizePanelOpen]);

const closeSizePanel = useCallback(() => {
  pendingHeaderAddAfterSizeRef.current = false;
  setIsSizePanelOpen(false);

  if (sizePanelHistoryRef.current) {
    sizePanelHistoryRef.current = false;
    window.history.back();
  }
}, []);

  const handleAddToCart = useCallback(async () => {
  if (!product || !current) return false;
const sizeAttrName = attributeNames.find(isSizeAttribute);
const sizeValue = sizeAttrName ? selectedAttributes[sizeAttrName] || '' : '';

if (product.product_type === 'variable' && sizeAttrName && !sizeValue) {
  openSizePanel();
  return false;
}

try {
  const stockStatus = String(current?.stock_status || current?.stockStatus || '').toLowerCase();

if (stockStatus === 'outofstock' || stockStatus === 'out_of_stock') {
  setCartError('This item is out of stock');
  return false;
}

const rawFreshStock = current?.stockQuantity ?? current?.stock_quantity ?? null;
const freshStock = Number(rawFreshStock);
const hasKnownFreshStock = rawFreshStock !== null && rawFreshStock !== undefined && rawFreshStock !== '' && Number.isFinite(freshStock);

const currentItemId = current?.id || product?.id;

const existingCartItem = cartItems.find((item) => Number(item.id) === Number(currentItemId));
const existingQuantityInCart = existingCartItem?.quantity || 0;

if (!hasKnownFreshStock || freshStock <= 0) {
  setCartError('This item is out of stock');
  return false;
}

const remainingStock = Math.max(0, freshStock - existingQuantityInCart);

if (remainingStock <= 0) {
  setCartError('You already have the available stock for this item in your bag');
  return false;
}

    const variationPayload =
      Array.isArray(current?.attributes) && current.attributes.length
        ? current.attributes.map((attr) => ({
            attribute: attr.attribute_name,
            value: attr.term_slug
          }))
        : [];

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
        : null,
      item: {
        title: displayTitle,
        image: displayImages[0] || product?.thumbnail || '/api/Uploads/fallback-image.png'
      }
    }
  })
);

const selectedColorKey = Object.keys(selectedAttributes).find(isColorLikeAttributeName);
const selectedColor = selectedColorKey ? selectedAttributes[selectedColorKey] || '' : '';

await addItem({
  id: Number(currentItemId),
  quantity: 1,
  variation: variationPayload
});

try {
  const storedCartLinks = JSON.parse(localStorage.getItem('fyveCartProductLinks') || '{}');

  storedCartLinks[String(currentItemId)] = {
    parentId: product.id,
    variationId: currentItemId,
    selectedColor,
    path: `/product/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`
  };

  localStorage.setItem('fyveCartProductLinks', JSON.stringify(storedCartLinks));
} catch {}

window.dispatchEvent(new CustomEvent('cart:item-add-confirmed'));

setCartError(null);
return true;
} catch (err) {
  console.error('Add to cart failed:', err);
  window.dispatchEvent(new CustomEvent('cart:item-add-failed'));
  setCartError(err.message || 'Failed to add to cart');
  return false;
}
}, [
  product,
  current,
  selectedAttributes,
  isSizeAttribute,
  isColorLikeAttributeName,
  attributeNames,
  cartItems,
  addItem,
  displayTitle,
  displayImages,
  openSizePanel
]);

const currentTotalPrice = Number(current?.price?.current ?? product?.price?.current ?? current?.price ?? product?.price ?? 0).toFixed(2)

const addToCartLabel = hasReachedCartStockLimit
  ? 'In your bag'
  : isOutOfStock
    ? 'Out of Stock'
    : 'Add to bag';

const pdpMobileButtonLabel = addToCartLabel;

const productBreadcrumbs = useMemo(() => {
  const categories = Array.isArray(product?.categories) ? product.categories : [];
  const seen = new Set();

  return categories
    .filter(category => category?.slug && category?.name)
    .filter(category => category.slug !== 'uncategorized')
    .filter(category => {
      const rootSlug = String(category.root_slug || '').toLowerCase();
      const parentSlug = String(category.parent_slug || '').toLowerCase();
      const pathSlugs = Array.isArray(category.path_slugs) ? category.path_slugs : [];

      if (rootSlug === 'product-type' && parentSlug !== 'product-type') {
        return false;
      }

      if (rootSlug === 'product-type' && pathSlugs.length > 2) {
        return false;
      }

      return true;
    })
    .filter(category => {
      if (seen.has(category.slug)) return false;
      seen.add(category.slug);
      return true;
    })
    .map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      url: `/products?category=${category.slug}`
    }));
}, [product?.categories]);

useEffect(() => {
  window.dispatchEvent(
    new CustomEvent('pdp:update-add-to-bag-label', {
      detail: {
        label: pdpMobileButtonLabel,
        disabled: isAddDisabled
      }
    })
  );
}, [pdpMobileButtonLabel, isAddDisabled]);

useEffect(() => {
  const handlePopState = () => {
    pendingHeaderAddAfterSizeRef.current = false;
    sizePanelHistoryRef.current = false;
    setIsSizePanelOpen(false);
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, []);

useEffect(() => {
  const handleExternalAddToCart = async () => {
    const sizeAttrName = attributeNames.find(isSizeAttribute);
    const needsSizeSelection = product?.product_type === 'variable' && sizeAttrName && !hasSelectedSize;

if (needsSizeSelection) {
  pendingHeaderAddAfterSizeRef.current = true;
  openSizePanel();
  return;
}

    const added = await handleAddToCart();

    if (added && isSizePanelOpen) {
      closeSizePanel();
    }
  };

  window.addEventListener('pdp:add-to-cart', handleExternalAddToCart);

  return () => {
    window.removeEventListener('pdp:add-to-cart', handleExternalAddToCart);
  };
}, [
  handleAddToCart,
  isSizePanelOpen,
  closeSizePanel,
  openSizePanel,
  attributeNames,
  isSizeAttribute,
  product?.product_type,
  hasSelectedSize
]);

useEffect(() => {
  if (!pendingHeaderAddAfterSizeRef.current) return;
  if (!hasSelectedSize) return;
  if (!current) return;

  let cancelled = false;

  const addAfterSizeSelection = async () => {
    pendingHeaderAddAfterSizeRef.current = false;

    const added = await handleAddToCart();

    if (cancelled) return;

    if (added && isSizePanelOpen) {
      closeSizePanel();
    }
  };

  addAfterSizeSelection();

  return () => {
    cancelled = true;
  };
}, [
  hasSelectedSize,
  sizeValue,
  current?.id,
  handleAddToCart,
  isSizePanelOpen,
  closeSizePanel
]);

useEffect(() => {
  pendingHeaderAddAfterSizeRef.current = false;
  setIsSizePanelOpen(false);
}, [product?.id, colorValue]);

useEffect(() => {
  if (!isMobile || !isSizePanelOpen) {
    return;
  }

  const scrollY = window.scrollY;
  sizePanelScrollYRef.current = scrollY;

  const originalPosition = document.body.style.position;
  const originalTop = document.body.style.top;
  const originalLeft = document.body.style.left;
  const originalRight = document.body.style.right;
  const originalWidth = document.body.style.width;
  const originalOverflow = document.body.style.overflow;

  document.body.classList.add('size-panel-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.classList.remove('size-panel-open');
    document.body.style.position = originalPosition;
    document.body.style.top = originalTop;
    document.body.style.left = originalLeft;
    document.body.style.right = originalRight;
    document.body.style.width = originalWidth;
    document.body.style.overflow = originalOverflow;

    window.scrollTo(0, sizePanelScrollYRef.current);
  };
}, [isMobile, isSizePanelOpen]);

useEffect(() => {
  if (!product) return;
  if (product.product_type === 'variable' && !effectiveVariation) return;

const selectedColorKey = Object.keys(selectedAttributes).find(isColorLikeAttributeName);
const selectedColor = selectedColorKey ? selectedAttributes[selectedColorKey] || '' : '';

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
  isColorLikeAttributeName
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

const productAccordions = (
  <>
    <div className="product-description-accordion">
      <button
        type="button"
        className="product-description-accordion-toggle"
        onClick={() => {
          setIsSizeGuideOpen(prev => !prev);
          setIsDescriptionOpen(false);
          setIsDeliveryOpen(false);
        }}
        aria-expanded={isSizeGuideOpen}
      >
        <span className="product-description-accordion-title">Size Guide</span>
        <span
          ref={sizeGuideIconRef}
          className="product-description-accordion-icon"
          aria-hidden="true"
        >
          <span />
          <span />
        </span>
      </button>

      <div
        ref={sizeGuidePanelRef}
        className="product-description-accordion-panel"
      >
        <div className="product-description-accordion-inner">
          <div className="accordion-description-content size-guide-content">
            {hasSizeChart ? (
              <>
                {sizeChart?.title && (
                  <h3 className="size-guide-title">{sizeChart.title}</h3>
                )}

                <div className="size-guide-table-wrap">
                  <table className="size-guide-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        {showSizeChartMeasurement1 && (
                          <th>{sizeChartMeasurement1Title || 'Measurement 1'}</th>
                        )}
                        {showSizeChartMeasurement2 && (
                          <th>{sizeChartMeasurement2Title || 'Measurement 2'}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartRows.map((row, index) => (
                        <tr key={`${row.size}-${index}`}>
                          <td>{row.size}</td>
                          {showSizeChartMeasurement1 && (
                            <td>{row.measurement_1 || ''}</td>
                          )}
                          {showSizeChartMeasurement2 && (
                            <td>{row.measurement_2 || ''}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sizeChart?.custom_text && (
                  <p className="size-guide-custom-text">{sizeChart.custom_text}</p>
                )}
              </>
            ) : (
              <p className="size-guide-empty-text">
                A size guide is not available for this product yet. Please contact us if you need help choosing a size.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="product-description-accordion">
      <button
        type="button"
        className="product-description-accordion-toggle"
        onClick={() => {
          setIsDescriptionOpen(prev => !prev);
          setIsSizeGuideOpen(false);
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
            className="product-description accordion-description-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayMaterialsDescription || '') }}
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
          setIsSizeGuideOpen(false);
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
  </>
);

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
                    className={`product-gallery-image-wrapper ${idx === 0 ? 'product-gallery-image-wrapper-main' : ''} ${!isMobile && idx > 0 && !showDesktopSecondaryImages ? 'desktop-gallery-image-hidden' : ''}`}
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

          {!isMobile && (
            <div className="product-accordions-desktop">
              {productAccordions}
            </div>
          )}
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
  delay: isMobile ? 0 : 0.60,
  ease: [0.16, 1, 0.3, 1]
}}
  >
    <div className={`product-details ${scrollDirection === 'up' ? 'scroll-up' : ''}`}>
{productBreadcrumbs.length > 0 && (
  <nav className="product-breadcrumbs" aria-label="Product breadcrumbs">
    {productBreadcrumbs.map((item, index) => (
      <React.Fragment key={item.slug}>
        <Link to={item.url} className="product-breadcrumb-link">
          {item.name}
        </Link>

{index < productBreadcrumbs.length - 1 && (
  <span className="product-breadcrumb-separator" aria-hidden="true">
    <img
      src="/assets/breadcrumbSeparator.svg"
      alt=""
      className="product-breadcrumb-separator-icon"
    />
  </span>
)}
      </React.Fragment>
    ))}
  </nav>
)}

<h1 className="product-title">{displayTitle}</h1>

<div className="product-price">
  ${currentTotalPrice}
</div>

{displayMainDescription && (
  <div
    className="product-main-description"
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayMainDescription) }}
  />
)}

      {product.product_type === 'variable' && (
  <div className="product-attributes">
    {attributeNames
  .filter(attrName => !isSizeAttribute(attrName))
  .map(attrName => {
    const options = getOrderedOptions(attrName);
    const isSwatchAttribute =
      isColorAttribute(attrName) ||
      String(attrName || '').toLowerCase().includes('stiching') ||
      String(attrName || '').toLowerCase().includes('stitching') ||
      String(attrName || '').toLowerCase().includes('colour') ||
      String(attrName || '').toLowerCase().includes('color');

    return (
      <div key={attrName} className="attribute-group">
        <label className="attribute-label">{attrName}</label>

        {isSwatchAttribute ? (
          <div className="color-options">
            {options.map(term => (
              <div key={term} className="color-option">
                <button
                  type="button"
                  onClick={() => {
                    handleAttributeChange(attrName, term);
                    setCartError(null);
                  }}
                  className={`color-button ${selectedAttributes[attrName] === term ? 'selected' : ''} ${getColorClassName(term)}`}
                  aria-label={`${attrName} ${term}`}
                />
                <span className="color-label">{term}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="attribute-pill-options">
            {options.map(term => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  handleAttributeChange(attrName, term);
                  setCartError(null);
                }}
                className={`attribute-pill-button ${selectedAttributes[attrName] === term ? 'selected' : ''}`}
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  })}

    {(() => {
      const sizeAttrName = attributeNames.find(isSizeAttribute);
      if (!sizeAttrName) return null;

      const options = getOrderedOptions(sizeAttrName);

      return (
        <div className="attribute-group">
          <div className="size-picker">
            <button
              type="button"
              className="size-picker-trigger"
onClick={openSizePanel}
              disabled={!productForOptions}
            >
              <span className="size-picker-trigger-label">
                {selectedAttributes[sizeAttrName] || 'Select a size'}
              </span>

<span className="size-picker-trigger-icon">
  <img src="/assets/Chevron.svg" alt="" className="size-picker-chevron" />
</span>
            </button>

            {isSizePanelOpen && (
<div
  className="size-panel-backdrop"
onClick={closeSizePanel}
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
onClick={closeSizePanel}
>
  <img src="/assets/CloseDark.svg" alt="" className="size-panel-close-icon" />
</button>
                  </div>

                  <div className="size-panel-options" role="listbox" aria-label="Select a size">
  {options.map(term => {
    const stockState = getSizeOptionStockState(sizeAttrName, term);
    const optionOutOfStock = stockState.isOutOfStock;
    const optionSelected = selectedAttributes[sizeAttrName] === term;

    return (
      <button
        key={term}
        type="button"
        role="option"
        aria-selected={optionSelected}
        disabled={optionOutOfStock}
        className={`size-panel-option ${optionSelected ? 'selected' : ''} ${optionOutOfStock ? 'out-of-stock' : ''}`}
        onClick={() => {
          if (optionOutOfStock) return;

          handleAttributeChange(sizeAttrName, term);
          setCartError(null);
        }}
      >
        <span className="size-panel-option-value">{term}</span>

        <span className="size-panel-option-meta">
          {(() => {
            const stockLabel = optionOutOfStock
              ? 'Out of stock'
              : stockState.remainingStock !== null &&
                  stockState.remainingStock > 0 &&
                  stockState.remainingStock <= 3
                ? stockState.remainingStock === 1
                  ? '1 left'
                  : `${stockState.remainingStock} left`
                : '';

            return stockLabel ? (
              <span className="size-panel-option-stock">{stockLabel}</span>
            ) : null;
          })()}

          {optionSelected && !optionOutOfStock && (
            <img src="/assets/Tick.svg" alt="" className="size-panel-option-tick" />
          )}
        </span>
      </button>
    );
  })}
</div>

<div className="size-panel-footer">
  <button
    type="button"
    className={`size-panel-add-button ${hasReachedCartStockLimit ? 'in-bag' : ''}`}
    disabled={!hasSelectedSize || isAddDisabled}
    onClick={async () => {
      const added = await handleAddToCart();

      if (added) {
        closeSizePanel();
      }
    }}
  >
    {addToCartLabel}
  </button>
</div>
                  </div>
                </div>
            )}
          </div>
        </div>
      );
    })()}
  </div>
)}

      {cartError && <p className="cart-error">{cartError}</p>}


<button
  onClick={() => {
    if (needsSizeSelection) {
      pendingHeaderAddAfterSizeRef.current = true;
      openSizePanel();
      return;
    }

    handleAddToCart();
  }}
  disabled={isAddDisabled}
  className={`add-to-cart-button ${isAddDisabled ? 'disabled' : ''} ${isOutOfStock ? 'out-of-stock' : ''} ${hasReachedCartStockLimit ? 'in-bag' : ''}`}
>
  <span className="add-to-cart-text">{addToCartLabel}</span>
</button>
{isMobile && (
  <div className="product-accordions-mobile">
    {productAccordions}
  </div>
)}
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