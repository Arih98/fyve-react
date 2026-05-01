import { useMobileMenuController } from './hooks/useMobileMenuController';
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { CartContext } from './CartContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './Header.css';
import Cart from './Cart';
import { useAuth } from './context/AuthContext';
import { faqItems } from './data/faqItems';
import { startProductImageTransition } from './utils/productImageTransition';

const normalizeSearchText = (value) => {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s@.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getFaqSearchResults = (items, query) => {
  const q = normalizeSearchText(query);

  if (q.length < 2) {
    return [];
  }

  return items
    .filter((item) => {
      const text = normalizeSearchText([
        item.question,
        item.answer,
        ...(item.keywords || [])
      ].join(' '));

      return text.includes(q);
    })
    .slice(0, 4);
};

const stripSearchHtml = (value) => {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
};

const getSearchColorClassName = (term) => {
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

const isSearchColorAttribute = (name) => {
  const value = String(name || '').trim().toLowerCase();

  return (
    value === 'color' ||
    value === 'colour' ||
    value.includes('color') ||
    value.includes('colour') ||
    value.includes('stitching') ||
    value.includes('stiching')
  );
};

const getSearchProductColorOptions = (product) => {
  const attribute = (product?.attributes || []).find(attr =>
    isSearchColorAttribute(attr.attribute_name || attr.name)
  );

  if (attribute?.options?.length) {
    return [...new Set(attribute.options.map(option =>
      option.term_name || option.name || option.term_slug || option.value
    ).filter(Boolean))];
  }

  const fromVariations = (product?.variations || [])
    .flatMap(variation => variation.attributes || [])
    .filter(attr => isSearchColorAttribute(attr.attribute_name || attr.name))
    .map(attr => attr.term_name || attr.term_slug || attr.value)
    .filter(Boolean);

  return [...new Set(fromVariations)];
};

const getSearchProductVariationForColor = (product, color) => {
  const normalizedColor = String(color || '').trim().toLowerCase();

  if (!normalizedColor || !Array.isArray(product?.variations)) {
    return null;
  }

  return product.variations.find(variation =>
    Array.isArray(variation.attributes) &&
    variation.attributes.some(attr => {
      const attrName = String(attr.attribute_name || attr.name || '').trim().toLowerCase();
      const attrValue = String(attr.term_name || attr.term_slug || attr.value || '').trim().toLowerCase();

      return isSearchColorAttribute(attrName) && attrValue === normalizedColor;
    })
  ) || null;
};

const getSearchMoneyValue = (value) => {
  if (value && typeof value === 'object') {
    return Number(value.current ?? value.amount ?? 0);
  }

  return Number(String(value || '').replace(/[^0-9.]/g, ''));
};

const getSearchProductDisplay = (product, selectedColor) => {
  const variation = getSearchProductVariationForColor(product, selectedColor);
  const displayItem = variation || product;

  const gallery = Array.isArray(displayItem?.gallery) && displayItem.gallery.length > 0
    ? displayItem.gallery
    : Array.isArray(product?.gallery) && product.gallery.length > 0
      ? product.gallery
      : [];

  const image = gallery[0] || 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';

  const price = getSearchMoneyValue(displayItem?.price ?? product?.price);

  return {
    title: displayItem?.title || displayItem?.name || product?.title || product?.name || '',
    image,
    gallery,
    price: Number.isFinite(price) ? price : 0,
    description: stripSearchHtml(product?.description || product?.short_description || product?.shortDescription || displayItem?.description || '')
  };
};

const isSs26Product = (product) => {
  const categories = Array.isArray(product?.categories) ? product.categories : [];

  return categories.some(category => {
    const slug = String(category.slug || '').trim().toLowerCase();
    const name = String(category.name || '').trim().toLowerCase();

    return slug === 'ss26' || name === 'ss26';
  });
};

const getSs26ProductSearchText = (product) => {
  const categories = Array.isArray(product?.categories)
    ? product.categories.map(category => `${category.name || ''} ${category.slug || ''}`)
    : [];

  const attributes = Array.isArray(product?.attributes)
    ? product.attributes.flatMap(attribute => [
        attribute.attribute_name,
        attribute.name,
        ...(attribute.options || []).map(option =>
          `${option.term_name || ''} ${option.name || ''} ${option.term_slug || ''} ${option.value || ''}`
        )
      ])
    : [];

  const variations = Array.isArray(product?.variations)
    ? product.variations.flatMap(variation => [
        variation.title,
        variation.custom_variation_title,
        variation.sku,
        ...(variation.attributes || []).map(attribute =>
          `${attribute.attribute_name || ''} ${attribute.name || ''} ${attribute.term_name || ''} ${attribute.term_slug || ''} ${attribute.value || ''}`
        )
      ])
    : [];

  return normalizeSearchText([
    product?.title,
    product?.name,
    product?.sku,
    product?.description,
    product?.short_description,
    product?.shortDescription,
    ...categories,
    ...attributes,
    ...variations
  ].join(' '));
};

const getSs26SearchResults = (products, query, limit = 8) => {
  const q = normalizeSearchText(query);

  if (q.length < 2) {
    return [];
  }

  return products
    .filter(product => getSs26ProductSearchText(product).includes(q))
    .slice(0, limit)
    .map(product => {
      const colorOptions = getSearchProductColorOptions(product);
      const display = getSearchProductDisplay(product, colorOptions[0] || '');

return {
  ...product,
  title: display.title,
  image: display.image || 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png',
  gallery: display.gallery,
  selectedColor: colorOptions[0] || '',
  price: display.price > 0 ? `$${display.price.toFixed(2)}` : ''
};
    });
};

const Header = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
const searchAbortRef = useRef(null);
const searchDebounceRef = useRef(null);
const searchImageRefs = useRef(new Map());
const searchClickLockRef = useRef(false);
const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const [searchError, setSearchError] = useState('');
  const [activeMenuImage, setActiveMenuImage] = useState('ss25');
  const [hideHeader, setHideHeader] = useState(false);
  const [isImageAnimating, setIsImageAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const { isMenuOpen, setIsMenuOpen, menuState, burgerRef, toggleMenu } = useMobileMenuController();
const location = useLocation();
const { cartItems } = useContext(CartContext);
const isCartPage = location.pathname === '/cart';
const isCheckoutPage = location.pathname.startsWith('/checkout');
const isProductDetailPage = /^\/product\/[^/]+$/.test(location.pathname);
const isHomePage = location.pathname === '/';
const normalDesktopHeaderPages = [
  /^\/account(\/.*)?$/,
  /^\/checkout(\/.*)?$/,
  /^\/faq(\/.*)?$/,
  /^\/login$/,
  /^\/register$/
];

const normalDesktopHeader =
  !isMobile && normalDesktopHeaderPages.some(pattern => pattern.test(location.pathname));
const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 10);
const headerRef = useRef(null);
const prevMenuStateRef = useRef(menuState);
const [delayTransparentHeader, setDelayTransparentHeader] = useState(false);
const [openSubmenuId, setOpenSubmenuId] = useState(null);
const submenuRefs = useRef(new Map());
const [menuVisualActive, setMenuVisualActive] = useState(false);
const bagIconButtonRef = useRef(null);
const bagCountRef = useRef(null);
const cartAddedPopupRef = useRef(null);
const cartAddedPopupImageTargetRef = useRef(null);
const cartAddedPopupImageRef = useRef(null);
const cartAddedPopupTimeoutRef = useRef(null);
const cartAddedFlyingImageRef = useRef(null);
const cartAddedPopupAnimationRef = useRef(null);
const [isCartAddedPopupOpen, setIsCartAddedPopupOpen] = useState(false);
const [cartAddedPopupItem, setCartAddedPopupItem] = useState(null);
const [isCartAddedPopupImageVisible, setIsCartAddedPopupImageVisible] = useState(false);
const [cartAddedPopupStatus, setCartAddedPopupStatus] = useState('adding');
const { user, authLoading } = useAuth();
const [searchProductVisibleCount, setSearchProductVisibleCount] = useState(6);
const [searchProductColors, setSearchProductColors] = useState({});
const [allProducts, setAllProducts] = useState([]);
const [allProductsLoading, setAllProductsLoading] = useState(false);
const [isSearchClosing, setIsSearchClosing] = useState(false);
const searchCloseTimeoutRef = useRef(null);
const useCartHeaderVariant = isMobile && isCartPage && !isMenuOpen && !isSearchOpen && !isSearchClosing && cartItems.length > 0;
const usePdpBottomAddVariant = isMobile && isProductDetailPage && !isMenuOpen && !isSearchOpen && !isSearchClosing;

const totalBagQuantity = useMemo(
  () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
  [cartItems]
);

const [displayedBagQuantity, setDisplayedBagQuantity] = useState(totalBagQuantity);

const showBurgerCartBadge =
  isMobile &&
  !isMenuOpen &&
  !isSearchOpen &&
  displayedBagQuantity > 0 &&
  (isCartPage || isProductDetailPage);

const totalBagQuantityRef = useRef(totalBagQuantity);
const isCartAddAnimatingRef = useRef(false);
const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(false);
const desktopCartRef = useRef(null);
const [pdpMobileAddLabel, setPdpMobileAddLabel] = useState('Add to Bag');
const [pdpMobileAddDisabled, setPdpMobileAddDisabled] = useState(false);

const shouldBeTransparentHomeHeader =
  isHomePage &&
  !menuVisualActive &&
  !isSearchOpen &&
  (!isScrolled || hideHeader);

const useTransparentHomeHeader =
  shouldBeTransparentHomeHeader &&
  !delayTransparentHeader;
const logoSrc = useTransparentHomeHeader ? '/assets/FYVE-White-Logo.svg' : '/assets/FYVE-Dark-Logo.svg';
const searchIconSrc = useTransparentHomeHeader ? '/assets/SearchIcon-White.svg' : '/assets/SearchIcon.svg';
const accountIconSrc = useTransparentHomeHeader ? '/assets/AccountIcon-White.svg' : '/assets/AccountIcon.svg';
const bagIconSrc = useTransparentHomeHeader ? '/assets/BagIcon-White.svg' : '/assets/BagIcon.svg';

const faqResults = useMemo(() => {
  return getFaqSearchResults(faqItems, searchQuery);
}, [searchQuery]);

const faqPreviewItems = useMemo(() => {
  return faqItems.slice(0, 6);
}, []);

const searchPanelProducts = useMemo(() => {
  return Array.isArray(allProducts)
    ? allProducts.filter(Boolean).filter(isSs26Product)
    : [];
}, [allProducts]);

const visibleSearchPanelProducts = useMemo(() => {
  return searchPanelProducts.slice(0, searchProductVisibleCount);
}, [searchPanelProducts, searchProductVisibleCount]);

const hasMoreSearchPanelProducts = searchProductVisibleCount < searchPanelProducts.length;

const getSearchTransitionKey = (product, color = '') => {
  return `${product?.id || ''}:${color || 'default'}`;
};

const handleSearchProductColor = (productId, color) => {
  setSearchProductColors(prev => ({
    ...prev,
    [String(productId)]: color
  }));
};

const handleSearchProductClick = (product, selectedColorOverride = '', displayOverride = null) => {
  if (searchClickLockRef.current) return;

  document.activeElement?.blur?.();

  searchClickLockRef.current = true;

  setTimeout(() => {
    searchClickLockRef.current = false;
  }, 900);

  const colorOptions = getSearchProductColorOptions(product);
  const selectedColor = selectedColorOverride || searchProductColors[String(product.id)] || colorOptions[0] || '';
  const display = displayOverride || getSearchProductDisplay(product, selectedColor);
  const transitionKey = getSearchTransitionKey(product, selectedColor);
  const sourceEl = searchImageRefs.current.get(transitionKey);
  const sourceSrc = display.gallery?.[0] || display.image || 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';

  const destination = `/product/${product.id}${selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : ''}`;

  const navigationState = {
    product,
    initialColor: selectedColor || null,
    transitionSourceDisplayId: product.id,
    transitionSourceSrc: sourceSrc,
    fromProductGrid: true,
    fromSearch: true
  };

  if (sourceEl) {
    const isMobileViewport = window.innerWidth <= 768;

    startProductImageTransition({
      src: sourceSrc,
      fromElement: sourceEl,
      toElementGetter: () => document.querySelector('[data-pdp-primary-image="true"]'),
      duration: isMobileViewport ? 520 : 620,
      minTargetTop: isMobileViewport ? 80 : 0,
      zIndex: isMobileViewport ? 1 : 999999
    });

    navigate(destination, {
      state: navigationState
    });

    return;
  }

  closeSearch();

  navigate(destination, {
    state: navigationState
  });
};


const handleShowMoreSearchProducts = () => {
  setSearchProductVisibleCount(prev => Math.min(prev + 6, searchPanelProducts.length));
};

const closeCartAddedPopup = () => {
  clearTimeout(cartAddedPopupTimeoutRef.current);
  setIsCartAddedPopupOpen(false);
  setIsCartAddedPopupImageVisible(false);
};

const hideCartAddedPopupLater = () => {
  clearTimeout(cartAddedPopupTimeoutRef.current);

  cartAddedPopupTimeoutRef.current = setTimeout(() => {
    setIsCartAddedPopupOpen(false);
    setIsCartAddedPopupImageVisible(false);
  }, 2600);
};

const handleCartItemAdded = (e) => {
  const startRect = e.detail?.startRect;
  const sourceSelector = e.detail?.sourceSelector;
  const sourceImageEl = sourceSelector ? document.querySelector(sourceSelector) : null;
  const item = e.detail?.item || {};

  if (cartAddedPopupAnimationRef.current) {
    cartAddedPopupAnimationRef.current.kill();
    cartAddedPopupAnimationRef.current = null;
  }

  if (cartAddedFlyingImageRef.current) {
    cartAddedFlyingImageRef.current.remove();
    cartAddedFlyingImageRef.current = null;
  }

setCartAddedPopupStatus('adding');

setCartAddedPopupItem({
  title: item.title || '',
  image: item.image || sourceImageEl?.src || '/api/Uploads/fallback-image.png'
});

if (cartAddedPopupImageRef.current) {
  cartAddedPopupImageRef.current.style.opacity = '0';
}

setIsCartAddedPopupImageVisible(false);
setIsCartAddedPopupOpen(true);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetEl = cartAddedPopupImageTargetRef.current;

if (!targetEl || !sourceImageEl || !startRect) {
  setIsCartAddedPopupImageVisible(true);
  return;
}

      const targetRect = targetEl.getBoundingClientRect();

      const flyingImage = sourceImageEl.cloneNode(true);
      flyingImage.classList.add('flying-cart-image');
      flyingImage.style.position = 'fixed';
      flyingImage.style.top = `${startRect.top}px`;
      flyingImage.style.left = `${startRect.left}px`;
      flyingImage.style.width = `${startRect.width}px`;
      flyingImage.style.height = `${startRect.height}px`;
      flyingImage.style.margin = '0';
      flyingImage.style.pointerEvents = 'none';
      flyingImage.style.zIndex = '100000';
      flyingImage.style.transformOrigin = 'center center';
      flyingImage.style.willChange = 'transform, top, left, width, height, opacity';
      flyingImage.style.background = 'transparent';
      flyingImage.style.boxShadow = 'none';
      flyingImage.style.border = 'none';
      flyingImage.style.outline = 'none';
      flyingImage.style.opacity = '1';

      document.body.appendChild(flyingImage);
      cartAddedFlyingImageRef.current = flyingImage;

      const tween = gsap.to(flyingImage, {
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        opacity: 1,
        duration: 0.72,
        ease: 'power3.inOut',
        onComplete: () => {
  const popupImageEl = cartAddedPopupImageRef.current;

  if (popupImageEl) {
    popupImageEl.style.opacity = '1';
  }

  setIsCartAddedPopupImageVisible(true);

  requestAnimationFrame(() => {
  flyingImage.remove();

  if (cartAddedFlyingImageRef.current === flyingImage) {
    cartAddedFlyingImageRef.current = null;
  }

  if (cartAddedPopupAnimationRef.current === tween) {
    cartAddedPopupAnimationRef.current = null;
  }
});
}
      });

      cartAddedPopupAnimationRef.current = tween;
    });
  });
};

useEffect(() => {
  return () => {
    clearTimeout(cartAddedPopupTimeoutRef.current);
    clearTimeout(searchCloseTimeoutRef.current);

    if (cartAddedPopupAnimationRef.current) {
      cartAddedPopupAnimationRef.current.kill();
    }

    if (cartAddedFlyingImageRef.current) {
      cartAddedFlyingImageRef.current.remove();
    }
  };
}, []);

useEffect(() => {
  if (isSearchOpen) {
    setSearchProductVisibleCount(6);
  } else {
    searchImageRefs.current.clear();
  }
}, [isSearchOpen]);

useEffect(() => {
  const handleCartAddConfirmed = () => {
    setCartAddedPopupStatus('added');
    hideCartAddedPopupLater();
  };

  const handleCartAddFailed = () => {
    setCartAddedPopupStatus('error');
    hideCartAddedPopupLater();
  };

  window.addEventListener('cart:item-add-confirmed', handleCartAddConfirmed);
  window.addEventListener('cart:item-add-failed', handleCartAddFailed);

  return () => {
    window.removeEventListener('cart:item-add-confirmed', handleCartAddConfirmed);
    window.removeEventListener('cart:item-add-failed', handleCartAddFailed);
  };
}, []);

useEffect(() => {
  const handlePdpLabelUpdate = (e) => {
    setPdpMobileAddLabel(e.detail?.label || 'Add to Bag');
    setPdpMobileAddDisabled(Boolean(e.detail?.disabled));
  };

  window.addEventListener('pdp:update-add-to-bag-label', handlePdpLabelUpdate);

  return () => {
    window.removeEventListener('pdp:update-add-to-bag-label', handlePdpLabelUpdate);
  };
}, []);

useEffect(() => {
  totalBagQuantityRef.current = totalBagQuantity;
}, [totalBagQuantity]);

useEffect(() => {
  if (!isCartAddAnimatingRef.current || totalBagQuantity < displayedBagQuantity) {
    setDisplayedBagQuantity(totalBagQuantity);
  }
}, [totalBagQuantity, displayedBagQuantity]);

useEffect(() => {
  window.addEventListener('cart:item-added', handleCartItemAdded);

  return () => {
    window.removeEventListener('cart:item-added', handleCartItemAdded);
  };
}, []);

useEffect(() => {
  let timeout;

  if (menuState === 'open') {
    timeout = setTimeout(() => {
      setMenuVisualActive(true);
    }, 80);
  } else if (menuState === 'closing') {
    if (isMobile) {
      setMenuVisualActive(false);
    } else {
      timeout = setTimeout(() => {
        setMenuVisualActive(false);
      }, 350);
    }
  } else if (!isMenuOpen) {
    setMenuVisualActive(false);
  }

  return () => clearTimeout(timeout);
}, [menuState, isMenuOpen, isMobile]);

useEffect(() => {
  if (!isMenuOpen) {
    setOpenSubmenuId(null);
    submenuRefs.current.forEach((el) => {
      gsap.killTweensOf(el);
      gsap.set(el, { height: 0, opacity: 0, y: -8 });
    });
  }
}, [isMenuOpen]);

useEffect(() => {
  const handleHeaderThemeScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  handleHeaderThemeScroll();
  window.addEventListener('scroll', handleHeaderThemeScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleHeaderThemeScroll);
}, [location.pathname]);

useEffect(() => {
  if (!isSearchOpen || allProducts.length > 0) return;

  let cancelled = false;

  const loadProducts = async () => {
    try {
      setAllProductsLoading(true);

const response = await fetch('https://fyvelondon.com/wp-json/fyve/v1/products?category=ss26&per_page=60&page=1', {
  credentials: 'include'
});

      if (!response.ok) {
        throw new Error(`Products request failed: ${response.status}`);
      }

      const data = await response.json();

      if (cancelled) return;

      const products = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.products)
            ? data.products
            : [];

      setAllProducts(products);
    } catch (error) {
      if (!cancelled) {
        console.error('Failed to load search panel products:', error);
        setAllProducts([]);
      }
    } finally {
      if (!cancelled) {
        setAllProductsLoading(false);
      }
    }
  };

  loadProducts();

  return () => {
    cancelled = true;
  };
}, [isSearchOpen, allProducts.length]);

useEffect(() => {
  if (isMobile || normalDesktopHeader) {
    setHideHeader(false);
    return;
  }

  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (isMenuOpen) return;

    if (currentScrollY <= 0) {
      setHideHeader(false);
    } else if (currentScrollY > lastScrollY) {
      setHideHeader(true);
    } else if (currentScrollY < lastScrollY) {
      setHideHeader(false);
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, [isMobile, isMenuOpen, normalDesktopHeader, location.pathname]);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(() => {
  setDelayTransparentHeader(false);
  prevMenuStateRef.current = menuState;
}, [menuState, isMobile, isHomePage, isScrolled, isSearchOpen]);

useEffect(() => {
  if (isMobile) {
    setIsDesktopCartOpen(false);
  }
}, [isMobile]);

useEffect(() => {
  setIsDesktopCartOpen(false);
}, [location.pathname]);

useEffect(() => {
  const handlePointerDown = (e) => {
    if (!desktopCartRef.current) return;
    if (!desktopCartRef.current.contains(e.target)) {
      setIsDesktopCartOpen(false);
    }
  };

  document.addEventListener('mousedown', handlePointerDown);
  return () => document.removeEventListener('mousedown', handlePointerDown);
}, []);

const handleLogoClick = () => {
  navigate('/');

  if (isMenuOpen) {
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 80);
  }
};

const handleAccountClick = () => {
  if (authLoading) return;

  navigate(user ? '/account' : '/login');

  if (isMobile && isMenuOpen) {
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 80);
  }
};

const handleBagClick = () => {
  if (isMobile) {
    navigate('/cart');

    if (isMenuOpen) {
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 80);
    }

    return;
  }

  setIsDesktopCartOpen(v => !v);
};

const openSearch = () => {
  clearTimeout(searchCloseTimeoutRef.current);
  setIsSearchClosing(false);
  setHideHeader(false);
  setIsSearchOpen(true);

  if (isMenuOpen) {
    requestAnimationFrame(() => {
      setIsMenuOpen(false);
    });
  }
};

const closeSearch = () => {
  if (document.activeElement?.closest?.('.custom-search-container')) {
    document.activeElement.blur();
  }

  clearTimeout(searchCloseTimeoutRef.current);

  setIsSearchClosing(true);
  setIsSearchOpen(false);
  setSearchQuery('');
  setSearchResults([]);
  setSearchError('');
  setSearchLoading(false);

  searchCloseTimeoutRef.current = setTimeout(() => {
    setIsSearchClosing(false);
  }, 50);

  if (searchAbortRef.current) {
    searchAbortRef.current.abort();
  }
};

const handleFaqResultClick = (item) => {
  closeSearch();
  navigate(`/faq?open=${encodeURIComponent(item.slug)}`);
};

const toggleSearch = () => {
  if (isSearchOpen) {
    closeSearch();
  } else {
    openSearch();
  }
};

const handleSearch = (e) => {
  setSearchQuery(e.target.value);
};

const handleSearchSubmit = (e) => {
  e.preventDefault();
};

const handleSearchViewAll = () => {
  const q = searchQuery.trim();

  if (!q) return;

  setIsSearchOpen(false);
navigate(`/products?category=ss26&search=${encodeURIComponent(q)}`);
};

const handleSuggestedSearch = (value) => {
  setSearchQuery(value);

  requestAnimationFrame(() => {
    searchInputRef.current?.focus();
  });
};

const clearSearchQuery = () => {
  setSearchQuery('');
  setSearchResults([]);
  setSearchError('');

  requestAnimationFrame(() => {
    searchInputRef.current?.focus();
  });
};

useEffect(() => {
  if (!isSearchOpen) return;

  const frame = requestAnimationFrame(() => {
    searchInputRef.current?.focus();
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [isSearchOpen]);

useEffect(() => {
  document.body.classList.toggle('search-open', isSearchOpen);

  return () => {
    document.body.classList.remove('search-open');
  };
}, [isSearchOpen]);

useEffect(() => {
  if (!isSearchOpen) return;

  const q = searchQuery.trim();

  clearTimeout(searchDebounceRef.current);

  if (searchAbortRef.current) {
    searchAbortRef.current.abort();
  }

  setSearchError('');

  if (q.length < 2) {
    setSearchResults([]);
    setSearchLoading(false);
    return;
  }

  if (allProductsLoading) {
    setSearchLoading(true);
    return;
  }

  searchDebounceRef.current = setTimeout(() => {
    setSearchLoading(true);
    setSearchResults(getSs26SearchResults(searchPanelProducts, q, 8));
    setSearchLoading(false);
  }, 120);

  return () => {
    clearTimeout(searchDebounceRef.current);
  };
}, [isSearchOpen, searchQuery, searchPanelProducts, allProductsLoading]);

useEffect(() => {
  setIsSearchOpen(false);
  setSearchQuery('');
  setSearchResults([]);
  setSearchError('');
  setSearchLoading(false);
}, [location.pathname]);

  const handleMenuImageChange = (newId) => {
    if (isImageAnimating || newId === activeMenuImage) return;
    const prevId = activeMenuImage;
    const prevElem = document.querySelector(`.menu-image[data-menu-item="${prevId}"]`);
    const newElem = document.querySelector(`.menu-image[data-menu-item="${newId}"]`);
    if (!newElem) return;
    setIsImageAnimating(true);
    if (prevElem) {
      prevElem.style.opacity = '1';
      prevElem.style.zIndex = '1';
    }
    newElem.style.opacity = '1';
    newElem.style.zIndex = '2';
    const newImg = newElem.querySelector('img');
    gsap.set(newImg, { yPercent: -100 });
    gsap.to(newImg, { yPercent: 0, duration: 0.6, ease: 'power2.inOut' });
    const prevImg = prevElem ? prevElem.querySelector('img') : null;
    if (prevImg) {
      gsap.to(prevImg, {
        yPercent: 100,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          if (prevElem) {
            prevElem.style.opacity = '0';
            prevElem.style.zIndex = '1';
          }
          setIsImageAnimating(false);
        }
      });
    } else {
      setIsImageAnimating(false);
    }
    setActiveMenuImage(newId);
  };

  const setSubmenuRef = (id, el) => {
  if (el) {
    submenuRefs.current.set(id, el);
  } else {
    submenuRefs.current.delete(id);
  }
};

const closeSubmenu = (id) => {
  const el = submenuRefs.current.get(id);
  if (!el) return;

  gsap.killTweensOf(el);
  gsap.to(el, {
    height: 0,
    opacity: 0,
    y: -8,
    duration: 0.35,
    ease: 'power2.out'
  });
};

const openSubmenu = (id) => {
  const currentId = openSubmenuId;
  const currentEl = currentId ? submenuRefs.current.get(currentId) : null;
  const nextEl = submenuRefs.current.get(id);

  if (currentEl && currentId !== id) {
    gsap.killTweensOf(currentEl);
    gsap.to(currentEl, {
      height: 0,
      opacity: 0,
      y: -8,
      duration: 0.35,
      ease: 'power2.out'
    });
  }

  setOpenSubmenuId(id);

  if (!nextEl) return;

  gsap.killTweensOf(nextEl);

  requestAnimationFrame(() => {
    gsap.set(nextEl, {
      height: 'auto',
      opacity: 1,
      y: 0
    });

    const targetHeight = nextEl.scrollHeight;

    gsap.set(nextEl, {
      height: 0,
      opacity: 0,
      y: -8
    });

    gsap.to(nextEl, {
      height: targetHeight,
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(nextEl, { height: 'auto' });
      }
    });
  });
};

const toggleSubmenu = (id) => {
  if (openSubmenuId === id) {
    closeSubmenu(id);
    setOpenSubmenuId(null);
  } else {
    openSubmenu(id);
  }
};

const menuItems = [
  {
    id: 'ss26',
    name: 'SS26',
    path: '/products?category=ss26',
    image: '/assets/DSC00542copy-2-web.webp',
    children: [
      { id: 'regents', name: 'The Regents Collection', path: '/products?category=the-regents-collection' },
      { id: 'grosvenor', name: 'The Grosvenor Collection', path: '/products?category=the-grosvenor-collection' },
      { id: 'langham', name: 'The Langham Collection', path: '/products?category=the-langham-collection' },
      { id: 'bloomsbury', name: 'The Bloomsbury Collection', path: '/products?category=the-bloomsbury-collection' }
    ]
  },
  { id: 'boy', name: 'BOY', path: '/products?category=boy', image: '/assets/DSC07151copy-web.webp' },
  { id: 'girl', name: 'GIRL', path: '/products?category=girl', image: '/assets/DSC07292copy-1-web.webp' },
  { id: 'baby', name: 'BABY', path: '/products?category=baby', image: '/assets/DSC08194copy-2-web.webp' },
  { id: 'our-story', name: 'Our Story', path: '/#our-story', image: '/assets/DSC09497copy-1-web.webp' },
  { id: 'lookbook', name: 'Lookbook', path: '/#lookbook', image: '/assets/DSC08584copy-3-web.webp' },
];

const handleToggleMenu = () => {
  setHideHeader(false);
  toggleMenu();
  if (isSearchOpen) setIsSearchOpen(false);
};

  const BurgerIcon = (
  <button
    type="button"
    className={`a-burger${menuState === 'open' || menuState === 'closing' ? ' menu-open' : ''}${menuState === 'open' ? ' circle-open' : ''}${isMenuOpen ? ' menu-active' : ''}${useTransparentHomeHeader && !useCartHeaderVariant && !usePdpBottomAddVariant ? ' is-white' : ''}${showBurgerCartBadge ? ' has-cart-badge' : ''}`}
    ref={burgerRef}
    onClick={handleToggleMenu}
    aria-expanded={isMenuOpen}
    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
  >
    <span className="burger-glyph">
      <span className="hamburger-line top"></span>
      <span className="hamburger-line middle"></span>
      <span className="hamburger-line bottom"></span>
      <svg className="x-svg" width="19" height="19" viewBox="0 0 19 19">
        <line className="x-line left" x1="1.5" y1="17.5" x2="17.5" y2="1.5" stroke="currentColor" strokeWidth="2.2" />
        <line className="x-line right" x1="17.5" y1="17.5" x2="1.5" y2="1.5" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    </span>

    {showBurgerCartBadge && (
      <span className="header-bag-count burger-cart-count">
        {displayedBagQuantity}
      </span>
    )}
  </button>
);

  return (
  <>
    
    <div
  ref={headerRef}
  className={`mobile-header first-header${normalDesktopHeader ? ' desktop-normal-scroll' : ''}${useCartHeaderVariant ? ' cart-page-header' : ''}${usePdpBottomAddVariant ? ' pdp-page-header' : ''}${hideHeader ? ' hide-header' : ''}${isMenuOpen ? ' menu-active' : ''}${isMenuOpen ? ' menu-open' : ''}${useTransparentHomeHeader && !useCartHeaderVariant && !usePdpBottomAddVariant ? ' home-transparent' : ''}`}
>
  {BurgerIcon}

  {useCartHeaderVariant ? (
    <div className="cart-header-mobile-layout">
      {cartItems.length > 0 && (
        <div className="cart-header-checkout-container">
          <button
            className="cart-header-checkout-button cart-header-checkout-button-mobile"
            onClick={() => navigate('/checkout')}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  ) : usePdpBottomAddVariant ? (
    <div className="cart-header-mobile-layout pdp-header-mobile-layout">
      <div className="cart-header-checkout-container">
        <button
          className="cart-header-checkout-button cart-header-checkout-button-mobile pdp-header-add-button"
          disabled={pdpMobileAddDisabled}
          onClick={() => window.dispatchEvent(new CustomEvent('pdp:add-to-cart'))}
        >
          {pdpMobileAddLabel}
        </button>
      </div>
    </div>
  ) : (
    <>
      <div className="header-logo mobile-hide-logo">
        <img src={logoSrc} alt="FYVE Logo" onClick={() => navigate('/')} />
      </div>

      <div className="mobile-nav-icons">
        <button
          type="button"
          className="mobile-nav-icon"
          onClick={toggleSearch}
          aria-label="Search"
          aria-expanded={isSearchOpen}
        >
          <img src={searchIconSrc} alt="" />
        </button>

        <button className="mobile-nav-icon" onClick={handleAccountClick}>
          <img src={accountIconSrc} alt="Account" />
        </button>

        <div className="header-bag-dropdown-wrap" ref={desktopCartRef}>
          <button
            className="mobile-nav-icon header-bag-button"
            onClick={handleBagClick}
            ref={bagIconButtonRef}
          >
            <img src={bagIconSrc} alt="Bag" />
            {displayedBagQuantity > 0 && (
              <span className="header-bag-count" ref={bagCountRef}>
                {displayedBagQuantity}
              </span>
            )}
          </button>

          {!isMobile && (
            <div className={`desktop-cart-dropdown${isDesktopCartOpen ? ' open' : ''}`}>
              <Cart variant="panel" onClose={() => setIsDesktopCartOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>

{!usePdpBottomAddVariant && (
  <div
    className={`custom-search-container${isSearchOpen ? ' active' : ''}${isSearchClosing ? ' closing' : ''}`}
    aria-hidden={!isSearchOpen}
    role="dialog"
    aria-modal={isSearchOpen ? 'true' : undefined}
    aria-label="Search"
  >
    <form className="custom-search-inner" onSubmit={handleSearchSubmit}>
      <div className="custom-search-main-row">
        <div className="custom-search-field">
          <span className="custom-search-field-icon">
            <img src="/assets/SearchFeatureIcon.svg" alt="" />
          </span>

          <input
            ref={searchInputRef}
            id="site-search-box"
            type="text"
            className="custom-search-input"
            placeholder="Search for products"
            value={searchQuery}
            onChange={handleSearch}
            autoComplete="off"
          />

          {searchQuery && (
            <button
              type="button"
              className="custom-search-clear"
              onClick={clearSearchQuery}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          className="custom-search-close"
          onClick={closeSearch}
          aria-label="Close search"
        >
          <img src="/assets/CloseWhite.svg" alt="" />
        </button>
      </div>

<div className="custom-search-content">
  {!searchQuery.trim() && (
    <div className="custom-search-suggestions">
      <p className="custom-search-section-title">Suggested searches</p>

      <div className="custom-search-chips">
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            type="button"
            className="custom-search-chip"
            onClick={() => handleSuggestedSearch(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>

      {allProductsLoading && (
        <p className="custom-search-message">Loading products...</p>
      )}

      {searchPanelProducts.length > 0 && (
        <div className="custom-search-all-products">
          <div className="custom-search-all-products-grid">
            {visibleSearchPanelProducts.map(product => {
              const colorOptions = getSearchProductColorOptions(product);
              const selectedColor = searchProductColors[String(product.id)] || colorOptions[0] || '';
              const display = getSearchProductDisplay(product, selectedColor);
              const transitionKey = getSearchTransitionKey(product, selectedColor);

              return (
                <div
  key={product.id}
  className="custom-search-product-list-card"
  role="button"
  tabIndex={0}
  onClick={() => handleSearchProductClick(product, selectedColor, display)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSearchProductClick(product, selectedColor, display);
    }
  }}
>
<div className="custom-search-product-list-image">
<img
  ref={(el) => {
    if (el) {
      searchImageRefs.current.set(transitionKey, el);
    } else {
      searchImageRefs.current.delete(transitionKey);
    }
  }}
  src={display.image}
  alt={display.title}
  onError={e => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';
  }}
/>
</div>

                  <div className="custom-search-product-list-info">
                    <h3 className="custom-search-product-list-title">{display.title}</h3>

                    {display.price > 0 && (
                      <p className="custom-search-product-list-price">
                        ${display.price.toFixed(2)}
                      </p>
                    )}

                    {colorOptions.length > 0 && (
                      <div className="custom-search-product-colors">
                        {colorOptions.map(term => (
                          <button
                            key={term}
                            type="button"
                            className={`custom-search-product-color ${selectedColor === term ? 'selected' : ''} ${getSearchColorClassName(term)}`}
                            aria-label={`View ${term}`}
onPointerDown={(e) => {
  e.stopPropagation();
}}
onClick={(e) => {
  e.stopPropagation();
  handleSearchProductColor(product.id, term);
}}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasMoreSearchPanelProducts && (
            <button
              type="button"
              className="custom-search-show-more"
              onClick={handleShowMoreSearchProducts}
            >
              Show more
            </button>
          )}
          {faqPreviewItems.length > 0 && (
  <div className="custom-search-faq-preview">
    <div className="custom-search-faq-preview-header">
      <p className="custom-search-section-title">FAQs</p>

      <button
        type="button"
        className="custom-search-faq-preview-view-all"
        onClick={() => {
          closeSearch();
          navigate('/faq');
        }}
      >
        View all
      </button>
    </div>

    <div className="custom-search-faq-preview-slider" aria-label="FAQ preview">
      {faqPreviewItems.map(item => (
        <button
          key={item.slug}
          type="button"
          className="custom-search-faq-preview-card"
          onClick={() => handleFaqResultClick(item)}
        >
          <span className="custom-search-faq-preview-question">
            {item.question}
          </span>

          <span className="custom-search-faq-preview-answer">
            {item.answer}
          </span>
        </button>
      ))}
    </div>
  </div>
)}
        </div>
      )}
    </div>
  )}

  {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
    <p className="custom-search-message">Keep typing to search.</p>
  )}

  {searchLoading && (
    <div className="custom-search-loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
  )}

  {!searchLoading && searchError && (
    <p className="custom-search-message">{searchError}</p>
  )}

  {!searchLoading && !searchError && searchQuery.trim().length >= 2 && searchResults.length === 0 && faqResults.length === 0 && (
    <p className="custom-search-message">No results found for “{searchQuery.trim()}”.</p>
  )}

  {!searchLoading && searchResults.length > 0 && (
    <div className="custom-search-results">
      <div className="custom-search-results-header">
        <p className="custom-search-section-title">Products</p>

        <button
          type="button"
          className="custom-search-view-all"
          onClick={handleSearchViewAll}
        >
          View all
        </button>
      </div>

      <div className="custom-search-results-grid">
{searchResults.map(product => {
  const display = {
    title: product.title,
    image: product.image,
    gallery: product.gallery || [],
    price: getSearchMoneyValue(product.price)
  };

  return (
    <button
  key={product.id}
  type="button"
  className="custom-search-result-card"
  onClick={() => handleSearchProductClick(product, product.selectedColor || '', display)}
>
            <span className="custom-search-result-image">
<img
  ref={(el) => {
    const transitionKey = getSearchTransitionKey(product, product.selectedColor || '');
    if (el) {
      searchImageRefs.current.set(transitionKey, el);
    } else {
      searchImageRefs.current.delete(transitionKey);
    }
  }}
  src={product.image}
  alt={product.title}
  onError={e => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';
  }}
/>
            </span>

            <span className="custom-search-result-info">
              <span className="custom-search-result-title">{product.title}</span>

              {product.price && (
                <span className="custom-search-result-price">{product.price}</span>
              )}
            </span>
    </button>
  );
})}
      </div>
    </div>
  )}

  {!searchError && searchQuery.trim().length >= 2 && faqResults.length > 0 && (
    <div className="custom-search-faq-results">
      <p className="custom-search-section-title">FAQs</p>

      <div className="custom-search-faq-list">
        {faqResults.map(item => (
          <button
            key={item.slug}
            type="button"
            className="custom-search-faq-card"
            onClick={() => handleFaqResultClick(item)}
          >
            <span className="custom-search-faq-question">{item.question}</span>
            <span className="custom-search-faq-answer">{item.answer}</span>
          </button>
        ))}
      </div>
    </div>
  )}
</div>
    </form>

    <button
      type="button"
      className="custom-search-mobile-floating-close"
      onClick={closeSearch}
      aria-label="Close search"
    >
      <img src="/assets/CloseWhite.svg" alt="" />
    </button>
  </div>
)}

{isCartAddedPopupOpen && (
  <div className="cart-added-popup" ref={cartAddedPopupRef}>
    <div className="cart-added-popup-image-target" ref={cartAddedPopupImageTargetRef}>
      {cartAddedPopupItem?.image && (
<img
  ref={cartAddedPopupImageRef}
  src={cartAddedPopupItem.image}
  alt=""
  className={`cart-added-popup-image ${isCartAddedPopupImageVisible ? 'is-visible' : ''}`}
/>
      )}
    </div>

    <div className="cart-added-popup-content">
      <p className={`cart-added-popup-kicker cart-added-popup-kicker-${cartAddedPopupStatus}`}>
  {cartAddedPopupStatus === 'adding' && 'Adding to bag...'}
  {cartAddedPopupStatus === 'added' && 'Added to bag'}
  {cartAddedPopupStatus === 'error' && 'Could not add item'}
</p>

      {cartAddedPopupItem?.title && (
        <p className="cart-added-popup-title">{cartAddedPopupItem.title}</p>
      )}

      <div className="cart-added-popup-actions">
        <button
          type="button"
          className="cart-added-popup-link"
          onClick={() => {
            closeCartAddedPopup();
            navigate('/cart');
          }}
        >
          View bag
        </button>

        <button
          type="button"
          className="cart-added-popup-checkout"
          onClick={() => {
            closeCartAddedPopup();
            navigate('/checkout');
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  </div>
)}

      <div
  className={`mobile-menu${(menuState === 'open' || (!isMobile && menuState === 'closing')) ? ' active' : ''}${(!isMobile && menuState === 'closing') ? ' closing' : ''}${hideHeader ? ' hide-header' : ''}`}>
        <div className="menu-background"></div>
        <div className="menu-content">

  <div className="mobile-menu-logo">
    <img src="/assets/FYVE-Dark-Logo.svg" alt="FYVE Logo" onClick={handleLogoClick} />
  </div>

  <div className="menu-columns">
            <div className="menu-image-column">
              {menuItems.map(item => (
                <div key={item.id} className={`menu-image${activeMenuImage === item.id ? ' active' : ''}`} data-menu-item={item.id}>
                  <div className="menu-image-reveal">
                    <img src={item.image} alt={`${item.name} Image`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="menu-items-wrapper">
              <ul className="menu-items">
                {menuItems.map(item => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isSubmenuOpen = openSubmenuId === item.id;

  return (
<li
  key={item.id}
  data-menu-item={item.id}
  className={`${activeMenuImage === item.id ? 'active' : ''}${hasChildren ? ' has-submenu' : ''}${isSubmenuOpen ? ' submenu-open' : ''}`}
  onFocus={() => handleMenuImageChange(item.id)}
  onTouchStart={() => handleMenuImageChange(item.id)}
  onMouseEnter={() => {
  if (!isMobile && hasChildren) {
    openSubmenu(item.id);
  }
  handleMenuImageChange(item.id);
}}
onMouseLeave={() => {
  if (!isMobile && hasChildren) {
    closeSubmenu(item.id);
    setOpenSubmenuId(null);
  }
}}
>
      {hasChildren ? (
  <>
    <button
      type="button"
      className="menu-parent-button"
      onMouseEnter={() => handleMenuImageChange(item.id)}
      onClick={() => {
        if (isMobile) {
          toggleSubmenu(item.id);
        }
      }}
    >
      {item.name}
    </button>

    <div
      ref={(el) => setSubmenuRef(item.id, el)}
      className="submenu-items"
    >
      <ul className="submenu-inner">
        {item.children.map(child => (
          <li key={child.id} className="submenu-item">
<NavLink
  to={child.path}
  onClick={() => {
    setOpenSubmenuId(null);
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 80);
  }}
>
  {child.name}
</NavLink>
          </li>
        ))}
      </ul>
    </div>
  </>
) : (
<NavLink
  to={item.path}
  onClick={() => {
    setOpenSubmenuId(null);
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 80);
  }}
>
  {item.name}
</NavLink>
)}
    </li>
  );
})}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;