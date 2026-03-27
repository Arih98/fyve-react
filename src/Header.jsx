import { useMobileMenuController } from './hooks/useMobileMenuController';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './Header.css';


const Header = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuImage, setActiveMenuImage] = useState('ss25');
  const [hideHeader, setHideHeader] = useState(false);
  const [isImageAnimating, setIsImageAnimating] = useState(false);
  const [pdpAddToBagLabel, setPdpAddToBagLabel] = useState('Add to Bag');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const { isMenuOpen, setIsMenuOpen, menuState, burgerRef, toggleMenu } = useMobileMenuController();
const location = useLocation();
const isHomePage = location.pathname === '/';
const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 10);
const isProductDetailPage = /^\/product\/[^/]+$/.test(location.pathname);
const debugPdpHeader = true;
const headerRef = useRef(null);
const lastHeaderMetricsRef = useRef(null);
const prevMenuStateRef = useRef(menuState);
const [delayTransparentHeader, setDelayTransparentHeader] = useState(false);
const [openSubmenuId, setOpenSubmenuId] = useState(null);
const submenuRefs = useRef(new Map());
const debugSeqRef = useRef(0);
const lastRenderSnapshotRef = useRef(null);
const lastThemeScrollSnapshotRef = useRef(null);
const lastHideScrollSnapshotRef = useRef(null);
const lastComputedHeaderSnapshotRef = useRef(null);
const lastComputedBurgerSnapshotRef = useRef(null);
const lastAnnouncementSnapshotRef = useRef(null);
const lastSearchSnapshotRef = useRef(null);
const lastMenuImageSnapshotRef = useRef(null);

const debugLog = (label, payload = {}) => {
  const seq = ++debugSeqRef.current;
  const timestamp = typeof performance !== 'undefined' ? performance.now().toFixed(2) : Date.now();
  console.log(`[HEADER DEBUG ${seq}] ${label}`, {
    timestamp,
    path: location.pathname,
    search: location.search,
    ...payload
  });
};

const readHeaderEnvironment = (source) => {
  const headerEl = headerRef.current;
  const burgerEl = burgerRef?.current || null;
  const announcementEl = document.querySelector('.announcement-bar');
  const htmlStyles = getComputedStyle(document.documentElement);
  const bodyEl = document.body;
  const vv = window.visualViewport;

  const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
  const burgerRect = burgerEl ? burgerEl.getBoundingClientRect() : null;
  const announcementRect = announcementEl ? announcementEl.getBoundingClientRect() : null;

  const headerComputed = headerEl ? getComputedStyle(headerEl) : null;
  const burgerComputed = burgerEl ? getComputedStyle(burgerEl) : null;
  const announcementComputed = announcementEl ? getComputedStyle(announcementEl) : null;

  return {
    source,
    scrollY: window.scrollY,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
    pageYOffset: window.pageYOffset,
    visualViewportWidth: vv ? vv.width : null,
    visualViewportHeight: vv ? vv.height : null,
    visualViewportOffsetTop: vv ? vv.offsetTop : null,
    visualViewportOffsetLeft: vv ? vv.offsetLeft : null,
    visualViewportPageTop: vv ? vv.pageTop : null,
    visualViewportPageLeft: vv ? vv.pageLeft : null,
    isMobile,
    isHomePage,
    isProductDetailPage,
    isMenuOpen,
    menuState,
    isScrolled,
    hideHeader,
    isSearchOpen,
    delayTransparentHeader,
    shouldBeTransparentHomeHeader,
    useTransparentHomeHeader,
    announcementHeightVar: htmlStyles.getPropertyValue('--announcement-height'),
    homeAnnouncementOffsetVar: htmlStyles.getPropertyValue('--home-announcement-offset'),
    bodyClassName: bodyEl ? bodyEl.className : '',
    bodyLocked: bodyEl ? bodyEl.classList.contains('locked') : false,
    headerExists: !!headerEl,
    headerClassName: headerEl ? headerEl.className : null,
    headerRect: headerRect ? {
      top: headerRect.top,
      bottom: headerRect.bottom,
      left: headerRect.left,
      right: headerRect.right,
      width: headerRect.width,
      height: headerRect.height
    } : null,
    headerComputed: headerComputed ? {
      position: headerComputed.position,
      top: headerComputed.top,
      bottom: headerComputed.bottom,
      left: headerComputed.left,
      right: headerComputed.right,
      display: headerComputed.display,
      transform: headerComputed.transform,
      transition: headerComputed.transition,
      opacity: headerComputed.opacity,
      zIndex: headerComputed.zIndex,
      backgroundColor: headerComputed.backgroundColor,
      pointerEvents: headerComputed.pointerEvents,
      paddingTop: headerComputed.paddingTop,
      paddingBottom: headerComputed.paddingBottom,
      paddingLeft: headerComputed.paddingLeft,
      paddingRight: headerComputed.paddingRight,
      marginTop: headerComputed.marginTop,
      willChange: headerComputed.willChange
    } : null,
    burgerExists: !!burgerEl,
    burgerClassName: burgerEl ? burgerEl.className : null,
    burgerRect: burgerRect ? {
      top: burgerRect.top,
      bottom: burgerRect.bottom,
      left: burgerRect.left,
      right: burgerRect.right,
      width: burgerRect.width,
      height: burgerRect.height
    } : null,
    burgerComputed: burgerComputed ? {
      position: burgerComputed.position,
      top: burgerComputed.top,
      bottom: burgerComputed.bottom,
      left: burgerComputed.left,
      right: burgerComputed.right,
      transform: burgerComputed.transform,
      transition: burgerComputed.transition,
      opacity: burgerComputed.opacity,
      zIndex: burgerComputed.zIndex,
      pointerEvents: burgerComputed.pointerEvents
    } : null,
    announcementExists: !!announcementEl,
    announcementClassName: announcementEl ? announcementEl.className : null,
    announcementRect: announcementRect ? {
      top: announcementRect.top,
      bottom: announcementRect.bottom,
      left: announcementRect.left,
      right: announcementRect.right,
      width: announcementRect.width,
      height: announcementRect.height
    } : null,
    announcementComputed: announcementComputed ? {
      position: announcementComputed.position,
      top: announcementComputed.top,
      bottom: announcementComputed.bottom,
      left: announcementComputed.left,
      right: announcementComputed.right,
      transform: announcementComputed.transform,
      transition: announcementComputed.transition,
      opacity: announcementComputed.opacity,
      zIndex: announcementComputed.zIndex,
      pointerEvents: announcementComputed.pointerEvents,
      height: announcementComputed.height
    } : null
  };
};

const logHeaderEnvironment = (label) => {
  debugLog(label, readHeaderEnvironment(label));
};

const shouldLogSnapshotChange = (prev, next) => {
  return JSON.stringify(prev) !== JSON.stringify(next);
};

const shouldBeTransparentHomeHeader =
  isHomePage &&
  !isMenuOpen &&
  !isSearchOpen &&
  (!isScrolled || hideHeader);

const useTransparentHomeHeader =
  shouldBeTransparentHomeHeader &&
  !delayTransparentHeader &&
  !(menuState === 'closing' && !isMobile && isHomePage && !isScrolled && !isSearchOpen);
const logoSrc = useTransparentHomeHeader ? '/assets/FYVE-White-Logo.png' : '/assets/FYVE-Dark-Logo.png';
const searchIconSrc = useTransparentHomeHeader ? '/assets/SearchIcon-White.svg' : '/assets/SearchIcon.svg';
const accountIconSrc = useTransparentHomeHeader ? '/assets/AccountIcon-White.svg' : '/assets/AccountIcon.svg';
const bagIconSrc = useTransparentHomeHeader ? '/assets/BagIcon-White.svg' : '/assets/BagIcon.svg';

useEffect(() => {
  debugLog('mounted', {
    initialState: {
      isSearchOpen,
      searchQuery,
      activeMenuImage,
      hideHeader,
      isImageAnimating,
      pdpAddToBagLabel,
      isMobile,
      isMenuOpen,
      menuState,
      isHomePage,
      isScrolled,
      isProductDetailPage,
      delayTransparentHeader,
      openSubmenuId,
      shouldBeTransparentHomeHeader,
      useTransparentHomeHeader
    }
  });
  requestAnimationFrame(() => {
    logHeaderEnvironment('mount-raf-1');
    requestAnimationFrame(() => {
      logHeaderEnvironment('mount-raf-2');
    });
  });
}, []);

useEffect(() => {
  const snapshot = {
    isSearchOpen,
    searchQuery,
    activeMenuImage,
    hideHeader,
    isImageAnimating,
    pdpAddToBagLabel,
    isMobile,
    isMenuOpen,
    menuState,
    pathname: location.pathname,
    search: location.search,
    isHomePage,
    isScrolled,
    isProductDetailPage,
    delayTransparentHeader,
    openSubmenuId,
    shouldBeTransparentHomeHeader,
    useTransparentHomeHeader
  };

  if (shouldLogSnapshotChange(lastRenderSnapshotRef.current, snapshot)) {
    debugLog('state-change', snapshot);
    requestAnimationFrame(() => {
      logHeaderEnvironment('state-change-post-render');
    });
    lastRenderSnapshotRef.current = snapshot;
  }
}, [
  isSearchOpen,
  searchQuery,
  activeMenuImage,
  hideHeader,
  isImageAnimating,
  pdpAddToBagLabel,
  isMobile,
  isMenuOpen,
  menuState,
  location.pathname,
  location.search,
  isHomePage,
  isScrolled,
  isProductDetailPage,
  delayTransparentHeader,
  openSubmenuId,
  shouldBeTransparentHomeHeader,
  useTransparentHomeHeader
]);

useEffect(() => {
  if (!isMenuOpen) {
    debugLog('menu-closed-reset-submenus', {
      submenuCount: submenuRefs.current.size,
      openSubmenuIdBeforeReset: openSubmenuId
    });
    setOpenSubmenuId(null);
    submenuRefs.current.forEach((el, id) => {
      debugLog('submenu-reset', {
        id,
        exists: !!el,
        scrollHeight: el ? el.scrollHeight : null
      });
      gsap.killTweensOf(el);
      gsap.set(el, { height: 0, opacity: 0, y: -8 });
    });
    requestAnimationFrame(() => {
      logHeaderEnvironment('menu-closed-reset-submenus-post');
    });
  }
}, [isMenuOpen]);

useEffect(() => {
  const handleHeaderThemeScroll = () => {
    const nextIsScrolled = window.scrollY > 10;
    const snapshot = {
      currentScrollY: window.scrollY,
      previousIsScrolled: isScrolled,
      nextIsScrolled,
      threshold: 10
    };

    if (shouldLogSnapshotChange(lastThemeScrollSnapshotRef.current, snapshot)) {
      debugLog('theme-scroll-listener', snapshot);
      lastThemeScrollSnapshotRef.current = snapshot;
    }

    setIsScrolled(nextIsScrolled);
  };

  debugLog('theme-scroll-listener-attached', {
    pathname: location.pathname
  });

  handleHeaderThemeScroll();
  window.addEventListener('scroll', handleHeaderThemeScroll, { passive: true });

  return () => {
    debugLog('theme-scroll-listener-detached', {
      pathname: location.pathname
    });
    window.removeEventListener('scroll', handleHeaderThemeScroll);
  };
}, [location.pathname, isScrolled]);

useEffect(() => {
  if (!isProductDetailPage) {
    debugLog('reset-pdp-button-label', {
      previousLabel: pdpAddToBagLabel
    });
    setPdpAddToBagLabel('Add to Bag');
  }
}, [isProductDetailPage]);

useEffect(() => {
  if (isMobile) {
    debugLog('desktop-hide-scroll-disabled-on-mobile', {
      reason: 'isMobile true',
      previousHideHeader: hideHeader
    });
    setHideHeader(false);
    requestAnimationFrame(() => {
      logHeaderEnvironment('desktop-hide-scroll-disabled-on-mobile-post');
    });
    return;
  }

  let lastScrollY = window.scrollY;

  debugLog('desktop-hide-scroll-listener-attached', {
    lastScrollYInitial: lastScrollY,
    isMenuOpen
  });

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (isMenuOpen) {
      debugLog('desktop-hide-scroll-skipped-because-menu-open', {
        currentScrollY,
        lastScrollY
      });
      return;
    }

    let nextHideHeader = hideHeader;
    let reason = 'unchanged';

    if (currentScrollY <= 0) {
      nextHideHeader = false;
      reason = 'at-top';
      setHideHeader(false);
    } else if (currentScrollY > lastScrollY) {
      nextHideHeader = true;
      reason = 'scrolling-down';
      setHideHeader(true);
    } else if (currentScrollY < lastScrollY) {
      nextHideHeader = false;
      reason = 'scrolling-up';
      setHideHeader(false);
    }

    const snapshot = {
      currentScrollY,
      lastScrollYBeforeUpdate: lastScrollY,
      nextHideHeader,
      reason
    };

    if (shouldLogSnapshotChange(lastHideScrollSnapshotRef.current, snapshot)) {
      debugLog('desktop-hide-scroll-listener', snapshot);
      requestAnimationFrame(() => {
        logHeaderEnvironment('desktop-hide-scroll-post-frame');
      });
      lastHideScrollSnapshotRef.current = snapshot;
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll);
  return () => {
    debugLog('desktop-hide-scroll-listener-detached', {
      isMenuOpen
    });
    window.removeEventListener('scroll', handleScroll);
  };
}, [isMobile, isMenuOpen, hideHeader]);

useEffect(() => {
  const handlePdpButtonLabel = e => {
    debugLog('pdp-button-label-event', {
      incomingDetail: e.detail,
      previousLabel: pdpAddToBagLabel,
      nextLabel: e.detail?.label || 'Add to Bag'
    });
    setPdpAddToBagLabel(e.detail?.label || 'Add to Bag');
  };

  debugLog('pdp-button-label-listener-attached');
  window.addEventListener('pdp:update-add-to-bag-label', handlePdpButtonLabel);

  return () => {
    debugLog('pdp-button-label-listener-detached');
    window.removeEventListener('pdp:update-add-to-bag-label', handlePdpButtonLabel);
  };
}, [pdpAddToBagLabel]);

useEffect(() => {
  const handleResize = () => {
    const nextIsMobile = window.innerWidth <= 768;
    debugLog('resize-listener', {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      previousIsMobile: isMobile,
      nextIsMobile
    });
    setIsMobile(nextIsMobile);
    requestAnimationFrame(() => {
      logHeaderEnvironment('resize-post-frame');
    });
  };

  debugLog('resize-listener-attached');
  window.addEventListener('resize', handleResize);
  return () => {
    debugLog('resize-listener-detached');
    window.removeEventListener('resize', handleResize);
  };
}, [isMobile]);

useEffect(() => {
  const wasOpen = prevMenuStateRef.current === 'open';
  const isNowClosing = menuState === 'closing';

  debugLog('transparent-delay-evaluation', {
    prevMenuState: prevMenuStateRef.current,
    menuState,
    wasOpen,
    isNowClosing,
    isMobile,
    isHomePage,
    isScrolled,
    isSearchOpen,
    shouldBeTransparentHomeHeader,
    delayTransparentHeaderBefore: delayTransparentHeader
  });

  if (
    !isMobile &&
    isHomePage &&
    !isScrolled &&
    !isSearchOpen &&
    wasOpen &&
    isNowClosing
  ) {
    debugLog('transparent-delay-start', {
      timeoutMs: 500
    });

    setDelayTransparentHeader(true);

    const timeout = setTimeout(() => {
      debugLog('transparent-delay-end-timeout-fired', {
        timeoutMs: 500
      });
      setDelayTransparentHeader(false);
      requestAnimationFrame(() => {
        logHeaderEnvironment('transparent-delay-end-post-frame');
      });
    }, 500);

    prevMenuStateRef.current = menuState;
    return () => {
      debugLog('transparent-delay-cleanup', {
        timeoutMs: 500
      });
      clearTimeout(timeout);
    };
  }

  if (!shouldBeTransparentHomeHeader || isMobile) {
    if (delayTransparentHeader) {
      debugLog('transparent-delay-force-reset', {
        shouldBeTransparentHomeHeader,
        isMobile
      });
    }
    setDelayTransparentHeader(false);
  }

  prevMenuStateRef.current = menuState;
}, [isMobile, isHomePage, isScrolled, isSearchOpen, menuState, shouldBeTransparentHomeHeader, delayTransparentHeader]);

useEffect(() => {
  if (!debugPdpHeader) return;
  if (!isMobile || !isProductDetailPage) return;

  const logMetrics = (source) => {
    const el = headerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vv = window.visualViewport;
    const announcementEl = document.querySelector('.announcement-bar');
    const announcementRect = announcementEl ? announcementEl.getBoundingClientRect() : null;
    const headerStyles = getComputedStyle(el);
    const announcementStyles = announcementEl ? getComputedStyle(announcementEl) : null;

const metrics = {
  source,
  time: Date.now(),
  scrollY: window.scrollY,
  innerHeight: window.innerHeight,
  clientHeight: document.documentElement.clientHeight,
  visualViewportHeight: vv ? vv.height : null,
  visualViewportOffsetTop: vv ? vv.offsetTop : null,
  visualViewportOffsetLeft: vv ? vv.offsetLeft : null,
  headerTop: rect.top,
  headerBottom: rect.bottom,
  headerHeight: rect.height,
  gapBelowViewport: window.innerHeight - rect.bottom,
  headerClassName: el.className,
  headerTransform: headerStyles.transform,
  headerOpacity: headerStyles.opacity,
  headerTopStyle: headerStyles.top,
  headerBottomStyle: headerStyles.bottom,
  headerPosition: headerStyles.position,
  headerZIndex: headerStyles.zIndex,
  announcementTop: announcementRect ? announcementRect.top : null,
  announcementBottom: announcementRect ? announcementRect.bottom : null,
  announcementHeight: announcementRect ? announcementRect.height : null,
  announcementTransform: announcementStyles ? announcementStyles.transform : null,
  announcementOpacity: announcementStyles ? announcementStyles.opacity : null,
  announcementZIndex: announcementStyles ? announcementStyles.zIndex : null
};

    const prev = lastHeaderMetricsRef.current;

    if (
      !prev ||
      prev.headerTop !== metrics.headerTop ||
      prev.headerBottom !== metrics.headerBottom ||
      prev.innerHeight !== metrics.innerHeight ||
      prev.visualViewportHeight !== metrics.visualViewportHeight ||
      prev.scrollY !== metrics.scrollY
    ) {
      console.log('[PDP HEADER DEBUG]', metrics);
      lastHeaderMetricsRef.current = metrics;
    }
  };

  const onScroll = () => logMetrics('scroll');
  const onResize = () => logMetrics('resize');
  const onOrientationChange = () => logMetrics('orientationchange');

  debugLog('pdp-debug-listener-attached');
  logMetrics('mount');

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onOrientationChange);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
    window.visualViewport.addEventListener('scroll', onScroll);
  }

  return () => {
    debugLog('pdp-debug-listener-detached');
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onOrientationChange);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onResize);
      window.visualViewport.removeEventListener('scroll', onScroll);
    }
  };
}, [debugPdpHeader, isMobile, isProductDetailPage]);

useEffect(() => {
  const headerEl = headerRef.current;
  if (!headerEl) return;

  const styles = getComputedStyle(headerEl);
  const rect = headerEl.getBoundingClientRect();

  const snapshot = {
    className: headerEl.className,
    transform: styles.transform,
    opacity: styles.opacity,
    top: styles.top,
    bottom: styles.bottom,
    position: styles.position,
    zIndex: styles.zIndex,
    backgroundColor: styles.backgroundColor,
    pointerEvents: styles.pointerEvents,
    rectTop: rect.top,
    rectBottom: rect.bottom,
    rectHeight: rect.height,
    scrollY: window.scrollY,
    hideHeader,
    isScrolled,
    useTransparentHomeHeader,
    isMenuOpen,
    menuState
  };

  if (shouldLogSnapshotChange(lastComputedHeaderSnapshotRef.current, snapshot)) {
    debugLog('computed-header-snapshot', snapshot);
    lastComputedHeaderSnapshotRef.current = snapshot;
  }
}, [hideHeader, isScrolled, useTransparentHomeHeader, isMenuOpen, menuState, isMobile, isProductDetailPage, delayTransparentHeader]);

useEffect(() => {
  const burgerEl = burgerRef?.current;
  if (!burgerEl) return;

  const styles = getComputedStyle(burgerEl);
  const rect = burgerEl.getBoundingClientRect();

  const snapshot = {
    className: burgerEl.className,
    transform: styles.transform,
    opacity: styles.opacity,
    top: styles.top,
    bottom: styles.bottom,
    position: styles.position,
    zIndex: styles.zIndex,
    pointerEvents: styles.pointerEvents,
    rectTop: rect.top,
    rectBottom: rect.bottom,
    rectHeight: rect.height,
    rectLeft: rect.left,
    rectRight: rect.right,
    scrollY: window.scrollY,
    hideHeader,
    isScrolled,
    useTransparentHomeHeader,
    isMenuOpen,
    menuState
  };

  if (shouldLogSnapshotChange(lastComputedBurgerSnapshotRef.current, snapshot)) {
    debugLog('computed-burger-snapshot', snapshot);
    lastComputedBurgerSnapshotRef.current = snapshot;
  }
}, [hideHeader, isScrolled, useTransparentHomeHeader, isMenuOpen, menuState, burgerRef, isMobile, isProductDetailPage, delayTransparentHeader]);

useEffect(() => {
  const announcementEl = document.querySelector('.announcement-bar');
  if (!announcementEl) return;

  const styles = getComputedStyle(announcementEl);
  const rect = announcementEl.getBoundingClientRect();

  const snapshot = {
    className: announcementEl.className,
    transform: styles.transform,
    opacity: styles.opacity,
    top: styles.top,
    bottom: styles.bottom,
    position: styles.position,
    zIndex: styles.zIndex,
    pointerEvents: styles.pointerEvents,
    rectTop: rect.top,
    rectBottom: rect.bottom,
    rectHeight: rect.height,
    scrollY: window.scrollY
  };

  if (shouldLogSnapshotChange(lastAnnouncementSnapshotRef.current, snapshot)) {
    debugLog('computed-announcement-snapshot', snapshot);
    lastAnnouncementSnapshotRef.current = snapshot;
  }
}, [hideHeader, isScrolled, useTransparentHomeHeader, isMenuOpen, menuState, isMobile, isProductDetailPage, delayTransparentHeader, location.pathname]);

useEffect(() => {
  const snapshot = {
    isSearchOpen,
    searchQuery,
    isMenuOpen
  };

  if (shouldLogSnapshotChange(lastSearchSnapshotRef.current, snapshot)) {
    debugLog('search-state-snapshot', snapshot);
    lastSearchSnapshotRef.current = snapshot;
  }
}, [isSearchOpen, searchQuery, isMenuOpen]);

useEffect(() => {
  const snapshot = {
    activeMenuImage,
    isImageAnimating,
    openSubmenuId,
    submenuCount: submenuRefs.current.size
  };

  if (shouldLogSnapshotChange(lastMenuImageSnapshotRef.current, snapshot)) {
    debugLog('menu-image-state-snapshot', snapshot);
    lastMenuImageSnapshotRef.current = snapshot;
  }
}, [activeMenuImage, isImageAnimating, openSubmenuId]);

const handleToggleMenu = () => {
  debugLog('handle-toggle-menu-before', {
    isMenuOpen,
    menuState,
    isSearchOpen
  });
  toggleMenu();
  if (isSearchOpen) setIsSearchOpen(false);
  requestAnimationFrame(() => {
    logHeaderEnvironment('handle-toggle-menu-post-frame');
  });
};

  const toggleSearch = () => {
    debugLog('toggle-search-before', {
      isSearchOpen,
      isMenuOpen,
      menuState,
      searchQuery
    });
    setIsSearchOpen(v => !v);
    if (isMenuOpen) setIsMenuOpen(false);
    requestAnimationFrame(() => {
      logHeaderEnvironment('toggle-search-post-frame');
    });
  };

  const handleSearch = (e) => {
    debugLog('handle-search-change', {
      previousQuery: searchQuery,
      nextQuery: e.target.value
    });
    setSearchQuery(e.target.value);
  };

  const handleMenuImageChange = (newId) => {
    debugLog('handle-menu-image-change-called', {
      newId,
      activeMenuImage,
      isImageAnimating
    });

    if (isImageAnimating || newId === activeMenuImage) {
      debugLog('handle-menu-image-change-skipped', {
        newId,
        activeMenuImage,
        isImageAnimating,
        reason: isImageAnimating ? 'animation-in-progress' : 'same-id'
      });
      return;
    }

    const prevId = activeMenuImage;
    const prevElem = document.querySelector(`.menu-image[data-menu-item="${prevId}"]`);
    const newElem = document.querySelector(`.menu-image[data-menu-item="${newId}"]`);

    debugLog('handle-menu-image-change-elements', {
      prevId,
      newId,
      hasPrevElem: !!prevElem,
      hasNewElem: !!newElem
    });

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
    gsap.to(newImg, {
      yPercent: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onStart: () => {
        debugLog('menu-image-new-animation-start', {
          newId
        });
      },
      onComplete: () => {
        debugLog('menu-image-new-animation-complete', {
          newId
        });
      }
    });
    const prevImg = prevElem ? prevElem.querySelector('img') : null;
    if (prevImg) {
      gsap.to(prevImg, {
        yPercent: 100,
        duration: 0.6,
        ease: 'power2.inOut',
        onStart: () => {
          debugLog('menu-image-prev-animation-start', {
            prevId
          });
        },
        onComplete: () => {
          if (prevElem) {
            prevElem.style.opacity = '0';
            prevElem.style.zIndex = '1';
          }
          setIsImageAnimating(false);
          debugLog('menu-image-prev-animation-complete', {
            prevId,
            newId
          });
        }
      });
    } else {
      setIsImageAnimating(false);
      debugLog('menu-image-no-prev-image', {
        newId
      });
    }
    setActiveMenuImage(newId);
    requestAnimationFrame(() => {
      logHeaderEnvironment('handle-menu-image-change-post-frame');
    });
  };

  const setSubmenuRef = (id, el) => {
  debugLog('set-submenu-ref', {
    id,
    action: el ? 'set' : 'delete',
    scrollHeight: el ? el.scrollHeight : null
  });
  if (el) {
    submenuRefs.current.set(id, el);
  } else {
    submenuRefs.current.delete(id);
  }
};

const closeSubmenu = (id) => {
  const el = submenuRefs.current.get(id);
  debugLog('close-submenu-called', {
    id,
    exists: !!el,
    openSubmenuId
  });
  if (!el) return;

  gsap.killTweensOf(el);
  gsap.to(el, {
    height: 0,
    opacity: 0,
    y: -8,
    duration: 0.35,
    ease: 'power2.out',
    onStart: () => {
      debugLog('close-submenu-animation-start', {
        id,
        currentHeight: el.scrollHeight
      });
    },
    onComplete: () => {
      debugLog('close-submenu-animation-complete', {
        id
      });
    }
  });
};

const openSubmenu = (id) => {
  const currentId = openSubmenuId;
  const currentEl = currentId ? submenuRefs.current.get(currentId) : null;
  const nextEl = submenuRefs.current.get(id);

  debugLog('open-submenu-called', {
    id,
    currentId,
    hasCurrentEl: !!currentEl,
    hasNextEl: !!nextEl
  });

  if (currentEl && currentId !== id) {
    gsap.killTweensOf(currentEl);
    gsap.to(currentEl, {
      height: 0,
      opacity: 0,
      y: -8,
      duration: 0.35,
      ease: 'power2.out',
      onStart: () => {
        debugLog('open-submenu-close-current-start', {
          currentId
        });
      },
      onComplete: () => {
        debugLog('open-submenu-close-current-complete', {
          currentId
        });
      }
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

    debugLog('open-submenu-measured', {
      id,
      targetHeight
    });

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
      onStart: () => {
        debugLog('open-submenu-animation-start', {
          id,
          targetHeight
        });
      },
      onComplete: () => {
        gsap.set(nextEl, { height: 'auto' });
        debugLog('open-submenu-animation-complete', {
          id,
          finalHeight: nextEl.scrollHeight
        });
      }
    });
  });
};

const toggleSubmenu = (id) => {
  debugLog('toggle-submenu-called', {
    id,
    openSubmenuId
  });
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
    image: '/api/Uploads/LOOK_11_2043-1.webp',
    children: [
      { id: 'regents', name: 'The Regents Collection', path: '/products?category=the-regents-collection' },
      { id: 'grosvenor', name: 'The Grosvenor Collection', path: '/products?category=the-grosvenor-collection' },
      { id: 'langham', name: 'The Langham Collection', path: '/products?category=the-langham-collection' },
      { id: 'bloomsbury', name: 'The Bloomsbury Collection', path: '/products?category=the-bloomsbury-collection' }
    ]
  },
  { id: 'boy', name: 'BOY', path: '/products?category=boy', image: '/api/Uploads/LOOK_11_2043-1.webp' },
  { id: 'girl', name: 'GIRL', path: '/products?category=girl', image: '/api/Uploads/LOOK-9_1416.webp' },
  { id: 'baby', name: 'BABY', path: '/products?category=baby', image: '/api/Uploads/LOOK-9_1650.jpg' },
  { id: 'our-story', name: 'Our Story', path: '/#our-story', image: '/api/Uploads/LOOK-2_191222.webp' },
  { id: 'lookbook', name: 'Lookbook', path: '/#lookbook', image: '/api/Uploads/LOOK-6_582.webp' },
];

  const BurgerIcon = (
  <button
    type="button"
    className={`a-burger${menuState === 'open' || menuState === 'closing' ? ' menu-open' : ''}${menuState === 'open' ? ' circle-open' : ''}${isMenuOpen ? ' menu-active' : ''}${useTransparentHomeHeader ? ' is-white' : ''}`}
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
  </button>
);

  return (
  <>
    
    <div
  ref={headerRef}
  className={`mobile-header first-header${isProductDetailPage && isMobile ? ' pdp-mobile-header' : ''}${hideHeader ? ' hide-header' : ''}${isMenuOpen ? ' menu-active' : ''}${isMenuOpen ? ' menu-open' : ''}${useTransparentHomeHeader ? ' home-transparent' : ''}`}
>
  {BurgerIcon}

  {(!isProductDetailPage || !isMobile) && (
  <>
    <div className="header-logo mobile-hide-logo">
      <img
        src={logoSrc}
        alt="FYVE Logo"
        onClick={() => {
          debugLog('logo-click', {
            targetPath: '/'
          });
          navigate('/');
        }}
      />
    </div>

    <div className="mobile-nav-icons">
      <button className="mobile-nav-icon" onClick={toggleSearch}>
        <img src={searchIconSrc} alt="Search" />
      </button>

      <button
        className="mobile-nav-icon"
        onClick={() => {
          debugLog('account-click', {
            targetPath: '/account'
          });
          navigate('/account');
        }}
      >
        <img src={accountIconSrc} alt="Account" />
      </button>

      <button
        className="mobile-nav-icon"
        onClick={() => {
          debugLog('cart-click', {
            targetPath: '/cart'
          });
          navigate('/cart');
        }}
      >
        <img src={bagIconSrc} alt="Bag" />
      </button>
    </div>
  </>
)}

{isMobile && isProductDetailPage && !isMenuOpen && (
  <button
    type="button"
    className="pdp-mobile-add-to-bag"
    onClick={() => {
      debugLog('pdp-mobile-add-to-bag-click', {
        label: pdpAddToBagLabel
      });
      window.dispatchEvent(new CustomEvent('pdp:add-to-cart'));
    }}
  >
    {pdpAddToBagLabel}
  </button>
)}


  {isMobile && isProductDetailPage && isMenuOpen && (
    <div className="mobile-nav-icons pdp-open-icons">
      <button className="mobile-nav-icon" onClick={toggleSearch}>
        <img src={searchIconSrc} alt="Search" />
      </button>

      <button
        className="mobile-nav-icon"
        onClick={() => {
          debugLog('pdp-open-account-click', {
            targetPath: '/account'
          });
          navigate('/account');
        }}
      >
        <img src={accountIconSrc} alt="Account" />
      </button>

      <button
        className="mobile-nav-icon"
        onClick={() => {
          debugLog('pdp-open-cart-click', {
            targetPath: '/cart'
          });
          navigate('/cart');
        }}
      >
        <img src={bagIconSrc} alt="Bag" />
      </button>
    </div>
  )}

  <div className={`custom-search-container${isSearchOpen ? ' active' : ''}`}>
    <div className="custom-search-inner">
      <input
        type="text"
        className="custom-search-input"
        placeholder="Little Trendsetters: Uncover Your Child's Style"
        value={searchQuery}
        onChange={handleSearch}
      />
      <button className="custom-search-close" onClick={toggleSearch}>
        <img src="/api/Uploads/FYVEDarkCloseIcon.svg" alt="Close Button" />
      </button>
      <div className="custom-search-results"></div>
    </div>
  </div>
</div>


      <div className={`mobile-menu${menuState === 'open' ? ' active' : ''}${menuState === 'closing' ? ' closing' : ''}${hideHeader ? ' hide-header' : ''}`}>
        <div className="menu-background"></div>
        <div className="menu-content">

  <div className="mobile-menu-logo">
    <img
      src="/assets/FYVE-Dark-Logo.png"
      alt="FYVE Logo"
      onClick={() => {
        debugLog('mobile-menu-logo-click', {
          targetPath: '/'
        });
        navigate('/');
      }}
    />
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
  onFocus={() => {
    debugLog('menu-item-focus', {
      itemId: item.id,
      hasChildren
    });
    handleMenuImageChange(item.id);
  }}
  onTouchStart={() => {
    debugLog('menu-item-touchstart', {
      itemId: item.id,
      hasChildren
    });
    handleMenuImageChange(item.id);
  }}
  onMouseEnter={() => {
  debugLog('menu-item-mouseenter', {
    itemId: item.id,
    hasChildren,
    isMobile
  });
  if (!isMobile && hasChildren) {
    openSubmenu(item.id);
  }
  handleMenuImageChange(item.id);
}}
onMouseLeave={() => {
  debugLog('menu-item-mouseleave', {
    itemId: item.id,
    hasChildren,
    isMobile
  });
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
      onMouseEnter={() => {
        debugLog('menu-parent-button-mouseenter', {
          itemId: item.id
        });
        handleMenuImageChange(item.id);
      }}
      onClick={() => {
        debugLog('menu-parent-button-click', {
          itemId: item.id,
          isMobile
        });
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
                debugLog('submenu-link-click', {
                  parentId: item.id,
                  childId: child.id,
                  targetPath: child.path
                });
                setOpenSubmenuId(null);
                setIsMenuOpen(false);
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
    onMouseEnter={() => {
      debugLog('menu-link-mouseenter', {
        itemId: item.id,
        targetPath: item.path
      });
      handleMenuImageChange(item.id);
    }}
    onClick={() => {
      debugLog('menu-link-click', {
        itemId: item.id,
        targetPath: item.path
      });
      setOpenSubmenuId(null);
      setIsMenuOpen(false);
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