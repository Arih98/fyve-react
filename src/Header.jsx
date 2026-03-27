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

const shouldBeTransparentHomeHeader =
  isHomePage &&
  !isMenuOpen &&
  !isSearchOpen &&
  (!isScrolled || hideHeader);

const useTransparentHomeHeader =
  shouldBeTransparentHomeHeader &&
  !delayTransparentHeader;
const logoSrc = useTransparentHomeHeader ? '/assets/FYVE-White-Logo.png' : '/assets/FYVE-Dark-Logo.png';
const searchIconSrc = useTransparentHomeHeader ? '/assets/SearchIcon-White.svg' : '/assets/SearchIcon.svg';
const accountIconSrc = useTransparentHomeHeader ? '/assets/AccountIcon-White.svg' : '/assets/AccountIcon.svg';
const bagIconSrc = useTransparentHomeHeader ? '/assets/BagIcon-White.svg' : '/assets/BagIcon.svg';

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
  if (!isProductDetailPage) {
    setPdpAddToBagLabel('Add to Bag');
  }
}, [isProductDetailPage]);


useEffect(() => {
  if (isMobile) {
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

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [isMobile, isMenuOpen]);

useEffect(() => {
  const handlePdpButtonLabel = e => {
    setPdpAddToBagLabel(e.detail?.label || 'Add to Bag');
  };

  window.addEventListener('pdp:update-add-to-bag-label', handlePdpButtonLabel);

  return () => {
    window.removeEventListener('pdp:update-add-to-bag-label', handlePdpButtonLabel);
  };
}, []);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(() => {
  const wasOpen = prevMenuStateRef.current === 'open';
  const isNowClosing = menuState === 'closing';

  if (
    !isMobile &&
    isHomePage &&
    !isScrolled &&
    !isSearchOpen &&
    wasOpen &&
    isNowClosing
  ) {
    setDelayTransparentHeader(true);

    const timeout = setTimeout(() => {
      setDelayTransparentHeader(false);
    }, 200);

    prevMenuStateRef.current = menuState;
    return () => clearTimeout(timeout);
  }

  if (!shouldBeTransparentHomeHeader || isMobile) {
    setDelayTransparentHeader(false);
  }

  prevMenuStateRef.current = menuState;
}, [isMobile, isHomePage, isScrolled, isSearchOpen, menuState, shouldBeTransparentHomeHeader]);

useEffect(() => {
  if (!debugPdpHeader) return;
  if (!isMobile || !isProductDetailPage) return;

  const logMetrics = (source) => {
    const el = headerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vv = window.visualViewport;

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
  headerClassName: el.className
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

  logMetrics('mount');

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onOrientationChange);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
    window.visualViewport.addEventListener('scroll', onScroll);
  }

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onOrientationChange);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', onResize);
      window.visualViewport.removeEventListener('scroll', onScroll);
    }
  };
}, [debugPdpHeader, isMobile, isProductDetailPage]);

const handleToggleMenu = () => {
  toggleMenu();
  if (isSearchOpen) setIsSearchOpen(false);
};

  const toggleSearch = () => {
    setIsSearchOpen(v => !v);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

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
className={`a-burger${menuState === 'open' || menuState === 'closing' ? ' menu-open' : ''}${menuState === 'open' ? ' circle-open' : ''}${isMenuOpen ? ' menu-active' : ''}${hideHeader ? ' hide-header' : ''}${useTransparentHomeHeader ? ' is-white' : ''}`}    ref={burgerRef}
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
      <img src={logoSrc} alt="FYVE Logo" onClick={() => navigate('/')} />
    </div>

    <div className="mobile-nav-icons">
      <button className="mobile-nav-icon" onClick={toggleSearch}>
        <img src={searchIconSrc} alt="Search" />
      </button>

      <button className="mobile-nav-icon" onClick={() => navigate('/account')}>
        <img src={accountIconSrc} alt="Account" />
      </button>

      <button className="mobile-nav-icon" onClick={() => navigate('/cart')}>
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

      <button className="mobile-nav-icon" onClick={() => navigate('/account')}>
        <img src={accountIconSrc} alt="Account" />
      </button>

      <button className="mobile-nav-icon" onClick={() => navigate('/cart')}>
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
    <img src="/assets/FYVE-Dark-Logo.png" alt="FYVE Logo" onClick={() => navigate('/')} />
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
    onMouseEnter={() => handleMenuImageChange(item.id)}
    onClick={() => {
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