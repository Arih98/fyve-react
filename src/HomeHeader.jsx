// HomeHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useNavigate, NavLink } from 'react-router-dom';
import './HomeHeader.css';

const HomeHeader = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const [menuState, setMenuState] = useState('pre-open');
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeMenuImage, setActiveMenuImage] = useState('ss25');
  const [isImageAnimating, setIsImageAnimating] = useState(false);
  const burgerRefs = useRef([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('none');
  const [showSecondHeader, setShowSecondHeader] = useState(false);
  const [showFirstHeader, setShowFirstHeader] = useState(true);
  const [showThirdHeader, setShowThirdHeader] = useState(false);
  const [openedFromSecond, setOpenedFromSecond] = useState(false);
  const lastScroll = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('home-page');
    return () => document.body.classList.remove('home-page');
  }, []);

  useEffect(() => {
    if (menuActive) {
      setMenuState('open');
      document.body.classList.add('locked');
    } else {
      setMenuState('closing');
      document.body.classList.remove('locked');
      const timeout = setTimeout(() => {
        setMenuState('pre-open');
      }, 750);
      return () => clearTimeout(timeout);
    }
  }, [menuActive]);

  useEffect(() => {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    setScrollTop(0);
    setScrollDirection('none');
    setShowFirstHeader(true);
    setShowSecondHeader(false);
    setShowThirdHeader(false);
    return;
  }

  const handleScroll = () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    setScrollTop(st);

    if (st > lastScroll.current + 1) {
      setScrollDirection('down');
    } else if (st < lastScroll.current - 1) {
      setScrollDirection('up');
    }

    lastScroll.current = st <= 0 ? 0 : st;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

  useEffect(() => {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    if (menuActive) {
      setShowFirstHeader(false);
      setShowSecondHeader(true);
      setShowThirdHeader(false);
    } else {
      setShowFirstHeader(true);
      setShowSecondHeader(false);
      setShowThirdHeader(false);
    }
    return;
  }

  if (menuActive) {
    setShowFirstHeader(false);
    setShowSecondHeader(openedFromSecond);
    setShowThirdHeader(!openedFromSecond);
  } else if (scrollTop === 0) {
    setShowFirstHeader(true);
    setShowSecondHeader(false);
    setShowThirdHeader(false);
  } else if (scrollDirection === 'up' && scrollTop > 0) {
    setShowFirstHeader(false);
    setShowSecondHeader(true);
    setShowThirdHeader(false);
  } else {
    setShowFirstHeader(false);
    setShowSecondHeader(false);
    setShowThirdHeader(false);
  }
}, [scrollTop, scrollDirection, menuActive, openedFromSecond]);

  useEffect(() => {
    const updateMenuHeight = () => {
      const contentHeight = window.innerHeight + 64;
      const buffer = 128;
      setMenuHeight(contentHeight + buffer);
    };
    updateMenuHeight();
    window.addEventListener('resize', updateMenuHeight);
    return () => {
      window.removeEventListener('resize', updateMenuHeight);
    };
  }, []);

  useEffect(() => {
    burgerRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const cOpen = ref.querySelector('.c-open');
      const topLine = cOpen.querySelector('.hamburger-line.top');
      const middleLine = cOpen.querySelector('.hamburger-line.middle');
      const bottomLine = cOpen.querySelector('.hamburger-line.bottom');
      const xSvg = cOpen.querySelector('.x-svg');
      const xLineLeft = xSvg.querySelector('.x-line.left');
      const xLineRight = xSvg.querySelector('.x-line.right');
      if (menuState === 'open') {
        setIsAnimating(true);
        gsap.set([topLine, middleLine, bottomLine], { scaleX: 1 });
        gsap.set([xLineLeft, xLineRight], { strokeDashoffset: 44 });
        gsap.to(topLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.2 });
        gsap.to(middleLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.5 });
        gsap.to(bottomLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.8 });
        gsap.to(xLineLeft, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.inOut', delay: 1.1 });
        gsap.to(xLineRight, {
          strokeDashoffset: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          delay: 1.3,
          onComplete: () => setIsAnimating(false)
        });
      } else if (menuState === 'closing') {
        setIsAnimating(true);
        gsap.to(xLineRight, { strokeDashoffset: 44, duration: 0.3, ease: 'power2.inOut', delay: 0.0 });
        gsap.to(xLineLeft, { strokeDashoffset: 44, duration: 0.3, ease: 'power2.inOut', delay: 0.2 });
        gsap.to(bottomLine, { scaleX: 1, duration: 0.3, ease: 'power2.inOut', delay: 0.5 });
        gsap.to(middleLine, { scaleX: 1, duration: 0.3, ease: 'power2.inOut', delay: 0.8 });
        gsap.to(topLine, {
          scaleX: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          delay: 1.1,
          onComplete: () => setIsAnimating(false)
        });
      }
    });
  }, [menuState]);

  const toggleMenu = () => {
    if (isAnimating || menuState === 'closing') return;
    if (!menuActive) {
      setOpenedFromSecond(showSecondHeader);
    }
    setMenuActive(!menuActive);
  };

const toggleSearch = () => {
  setSearchOpen(v => !v);
  if (menuActive) setMenuActive(false);
};

  const handleMenuImageChange = (newItem) => {
    if (isImageAnimating || newItem === activeMenuImage) return;
    const prevItem = activeMenuImage;
    const prevElem = document.querySelector(`.menu-image[data-menu-item="${prevItem}"]`);
    const newElem = document.querySelector(`.menu-image[data-menu-item="${newItem}"]`);
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
    setActiveMenuImage(newItem);
  };

  const menuItems = [
    { id: 'ss25', name: 'SS25', path: '/products?category=ss25', image: '/api/Uploads/LOOK-9_1437_.webp' },
    { id: 'boys', name: 'BOYS', path: '/products?category=boys', image: '/api/Uploads/LOOK_11_2043-1.webp' },
    { id: 'girls', name: 'GIRLS', path: '/products?category=girls', image: '/api/Uploads/LOOK-9_1416.webp' },
    { id: 'baby', name: 'BABY', path: '/products?category=baby', image: '/api/Uploads/LOOK-9_1650.jpg' },
    { id: 'our-story', name: 'Our Story', path: '/#our-story', image: '/api/Uploads/LOOK-2_191222.webp' },
    { id: 'lookbook', name: 'Lookbook', path: '/#lookbook', image: '/api/Uploads/LOOK-6_582.webp' },
  ];

  return (
    <>
      <div
        className={`mobile-header first-header${menuActive ? ' menu-active' : ''}${(!showFirstHeader && !menuActive) ? ' hide-header' : ''}`}
        style={{ display: showFirstHeader ? 'flex' : 'none' }}
      >
        <div className="a-burger" ref={el => burgerRefs.current[0] = el} onClick={toggleMenu}>
          <div className="c-open">
            <span className="hamburger-line top"></span>
            <span className="hamburger-line middle"></span>
            <span className="hamburger-line bottom"></span>
            <svg className="x-svg" width="40" height="18" viewBox="0 0 40 18">
              <line className="x-line left" x1="10" y1="18" x2="30" y2="0" stroke="#4A494A" strokeWidth="1.4" />
              <line className="x-line right" x1="30" y1="18" x2="10" y2="0" stroke="#4A494A" strokeWidth="1.4" />
            </svg>
          </div>
        </div>
        <div className="header-logo mobile-hide-logo">
  <img src="/assets/FYVE-Dark-Logo.png" alt="FYVE Coloured Logo" onClick={() => navigate('/')} />
</div>
        <div className="mobile-nav-icons">
  <button className="mobile-nav-icon" onClick={toggleSearch}>
    <img src="/assets/SearchIcon.svg" alt="Search" />
  </button>

  <button className="mobile-nav-icon" onClick={() => navigate('/my-account')}>
    <img src="/assets/AccountIcon.svg" alt="Account" />
  </button>

  <button className="mobile-nav-icon" onClick={() => navigate('/cart')}>
    <img src="/assets/BagIcon.svg" alt="Bag" />
  </button>
</div>
          <div className={`custom-search-container ${searchOpen ? 'active' : ''}`}>
            <div className="custom-search-inner">
              <input
                type="text"
                className="custom-search-input"
                placeholder="Little Trendsetters: Uncover Your Child's Style"
              />
              <button className="custom-search-close" onClick={toggleSearch}>
                <img
                  src="/api/Uploads/FYVEDarkCloseIcon.svg"
                  alt="Close Button"
                />
              </button>
              <div className="custom-search-results"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`mobile-header second-header ${showSecondHeader ? 'active' : ''}`}
        style={{ zIndex: 1999 }}
      >
        <div className="a-burger" ref={el => burgerRefs.current[1] = el} onClick={toggleMenu}>
          <div className="c-open">
            <span className="hamburger-line top"></span>
            <span className="hamburger-line middle"></span>
            <span className="hamburger-line bottom"></span>
            <svg className="x-svg" width="40" height="18" viewBox="0 0 40 18">
              <line className="x-line left" x1="10" y1="18" x2="30" y2="0" stroke="#4A494A" strokeWidth="1.4" />
              <line className="x-line right" x1="30" y1="18" x2="10" y2="0" stroke="#4A494A" strokeWidth="1.4" />
            </svg>
          </div>
        </div>
        <div className="header-logo mobile-hide-logo">
  <img src="/api/Uploads/FYVEDarkLogoMark.svg" alt="FYVE Coloured Logo" onClick={() => navigate('/')} />
</div>
        <div className="mobile-nav-icons">
  <button className="mobile-nav-icon" onClick={toggleSearch}>
    <img src="/assets/SearchIcon.svg" alt="Search" />
  </button>

  <button className="mobile-nav-icon" onClick={() => navigate('/my-account')}>
    <img src="/assets/AccountIcon.svg" alt="Account" />
  </button>

  <button className="mobile-nav-icon" onClick={() => navigate('/cart')}>
    <img src="/assets/BagIcon.svg" alt="Bag" />
  </button>
</div>
          <div className={`custom-search-container ${searchOpen ? 'active' : ''}`}>
            <div className="custom-search-inner">
              <input
                type="text"
                className="custom-search-input"
                placeholder="Little Trendsetters: Uncover Your Child's Style"
              />
              <button className="custom-search-close" onClick={toggleSearch}>
                <img
                  src="/api/Uploads/FYVEDarkCloseIcon.svg"
                  alt="Close Button"
                />
              </button>
              <div className="custom-search-results"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`mobile-header third-header ${showThirdHeader ? 'active' : ''}`}
        style={{ zIndex: 1998 }}
      >
        <div className="a-burger" ref={el => burgerRefs.current[2] = el} onClick={toggleMenu}>
          <div className="c-open">
            <span className="hamburger-line top"></span>
            <span className="hamburger-line middle"></span>
            <span className="hamburger-line bottom"></span>
            <svg className="x-svg" width="40" height="18" viewBox="0 0 40 18">
              <line className="x-line left" x1="10" y1="18" x2="30" y2="0" stroke="#4A494A" strokeWidth="1.4" />
              <line className="x-line right" x1="30" y1="18" x2="10" y2="0" stroke="#4A494A" strokeWidth="1.4" />
            </svg>
          </div>
        </div>
        <div className="header-logo mobile-hide-logo">
  <img src="/assets/FYVE-White-Logo.png" alt="FYVE Coloured Logo" onClick={() => navigate('/')} />
</div>
        <div className="mobile-nav-icons">
  <button className="mobile-nav-icon" onClick={toggleSearch}>
    <img src="/assets/SearchIcon.svg" alt="Search" />
  </button>

  <button className="mobile-nav-icon" onClick={() => navigate('/my-account')}>
    <img src="/assets/AccountIcon.svg" alt="Account" />
  </button>

  <button className="mobile-nav-icon" onClick={() => navigate('/cart')}>
    <img src="/assets/BagIcon.svg" alt="Bag" />
  </button>
</div>
          <div className={`custom-search-container ${searchOpen ? 'active' : ''}`}>
            <div className="custom-search-inner">
              <input
                type="text"
                className="custom-search-input"
                placeholder="Little Trendsetters: Uncover Your Child's Style"
              />
              <button className="custom-search-close" onClick={toggleSearch}>
                <img
                  src="/api/Uploads/FYVEDarkCloseIcon.svg"
                  alt="Close Button"
                />
              </button>
              <div className="custom-search-results"></div>
            </div>
          </div>
        </div>
      </div>
      <motion.div
  className={`mobile-menu ${menuState === 'open' ? 'active' : menuState === 'closing' ? 'closing' : ''}`}
  initial={{ y: '-100%' }}
  animate={{ y: menuState === 'open' ? 0 : '-100%' }}
  transition={{ duration: 0.75, ease: 'easeInOut' }}
>
        <div className="menu-background"></div>
        <div className="menu-content">
          <div className="menu-columns">
            <div className="menu-image-column">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  className={`menu-image${activeMenuImage === item.id ? ' active' : ''}`}
                  data-menu-item={item.id}
                >
                  <div className="menu-image-reveal">
                    <img src={item.image} alt={`${item.name} Image`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="menu-items-wrapper">
              <ul className="menu-items">
                {menuItems.map(item => (
                  <li
                    key={item.id}
                    data-menu-item={item.id}
                    className={activeMenuImage === item.id ? 'active' : ''}
                    onFocus={() => handleMenuImageChange(item.id)}
                    onTouchStart={() => handleMenuImageChange(item.id)}
                    onClick={() => {
                      setMenuActive(false);
                    }}
                  >
                    <NavLink to={item.path} onMouseEnter={() => handleMenuImageChange(item.id)}>{item.name}</NavLink>
                  </li>
                ))}
              </ul>
              <div className="login-section">
                <div className="fyve-login-container">
                  <a href="/my-account" className="fyve-account-link">My Account</a>
                </div>
                <div className="fyve-login-container">
                  <a href="/my-account" className="fyve-login-link">Sign in</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default HomeHeader;