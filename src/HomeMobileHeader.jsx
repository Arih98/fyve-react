import { useMobileMenuController } from './hooks/useMobileMenuController';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import gsap from 'gsap';
import './Header.css';
import './HomeMobileHeader.css';

const HomeMobileHeader = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuImage, setActiveMenuImage] = useState('ss25');
  const [isImageAnimating, setIsImageAnimating] = useState(false);
  const [fadeProgress, setFadeProgress] = useState(() => Math.max(0, Math.min(window.scrollY / 70, 1)));
  const { isMenuOpen, setIsMenuOpen, menuState, burgerRef, toggleMenu } = useMobileMenuController();
  const prevMenuStateRef = useRef(menuState);

  useEffect(() => {
  const handleScroll = () => {
    setFadeProgress(Math.max(0, Math.min(window.scrollY / 70, 1)));
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  useEffect(() => {
    prevMenuStateRef.current = menuState;
  }, [menuState]);

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
    const prevElem = document.querySelector(`.home-mobile-menu .menu-image[data-menu-item="${prevId}"]`);
    const newElem = document.querySelector(`.home-mobile-menu .menu-image[data-menu-item="${newId}"]`);
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

  const menuItems = [
    { id: 'boy', name: 'BOY', path: '/products?category=boys', image: '/api/Uploads/LOOK_11_2043-1.webp' },
    { id: 'girl', name: 'GIRL', path: '/products?category=girls', image: '/api/Uploads/LOOK-9_1416.webp' },
    { id: 'baby', name: 'BABY', path: '/products?category=baby', image: '/api/Uploads/LOOK-9_1650.jpg' },
    { id: 'our-story', name: 'Our Story', path: '/#our-story', image: '/api/Uploads/LOOK-2_191222.webp' },
    { id: 'lookbook', name: 'Lookbook', path: '/#lookbook', image: '/api/Uploads/LOOK-6_582.webp' },
  ];

  const BurgerIcon = (
    <button
      type="button"
      className={`a-burger${menuState === 'open' || menuState === 'closing' ? ' menu-open' : ''}${menuState === 'open' ? ' circle-open' : ''}${isMenuOpen ? ' menu-active' : ''}`}
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
  className={`home-inline-mobile-header${isMenuOpen ? ' menu-active' : ''}${isMenuOpen ? ' menu-open' : ''}`}
  style={{
    opacity: 1 - fadeProgress,
    transform: `translateY(${fadeProgress * 10}px)`,
    pointerEvents: fadeProgress > 0.95 ? 'none' : 'auto'
  }}
>
        {BurgerIcon}

        <div className="header-logo mobile-hide-logo">
          <img src="/assets/FYVE-Dark-Logo.png" alt="FYVE Logo" onClick={() => navigate('/')} />
        </div>

        <div className="mobile-nav-icons">
          <button className="mobile-nav-icon" onClick={toggleSearch}>
            <img src="/assets/SearchIcon.svg" alt="Search" />
          </button>

          <button className="mobile-nav-icon" onClick={() => navigate('/account')}>
            <img src="/assets/AccountIcon.svg" alt="Account" />
          </button>

          <button className="mobile-nav-icon" onClick={() => navigate('/cart')}>
            <img src="/assets/BagIcon.svg" alt="Bag" />
          </button>
        </div>

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

      <div className={`mobile-menu home-mobile-menu${menuState === 'open' ? ' active' : ''}${menuState === 'closing' ? ' closing' : ''}`}>
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
                {menuItems.map(item => (
                  <li
                    key={item.id}
                    data-menu-item={item.id}
                    className={activeMenuImage === item.id ? 'active' : ''}
                    onFocus={() => handleMenuImageChange(item.id)}
                    onTouchStart={() => handleMenuImageChange(item.id)}
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                  >
                    <NavLink to={item.path} onMouseEnter={() => handleMenuImageChange(item.id)}>
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMobileHeader;