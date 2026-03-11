import { useMobileMenuController } from './hooks/useMobileMenuController';
import React, { useState, useEffect } from 'react';
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
  const { isMenuOpen, setIsMenuOpen, menuState, burgerRef, toggleMenu } = useMobileMenuController();
const location = useLocation();
const isProductDetailPage = /^\/product\/[^/]+$/.test(location.pathname);


  useEffect(() => {
  const isMobile = window.innerWidth <= 768;

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
}, [isMenuOpen]);

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

  const menuItems = [
    { id: 'ss25', name: 'SS25', path: '/products?category=ss25', image: '/api/Uploads/LOOK-9_1437_.webp' },
    { id: 'boys', name: 'BOYS', path: '/products?category=boys', image: '/api/Uploads/LOOK_11_2043-1.webp' },
    { id: 'girls', name: 'GIRLS', path: '/products?category=girls', image: '/api/Uploads/LOOK-9_1416.webp' },
    { id: 'baby', name: 'BABY', path: '/products?category=baby', image: '/api/Uploads/LOOK-9_1650.jpg' },
    { id: 'our-story', name: 'Our Story', path: '/#our-story', image: '/api/Uploads/LOOK-2_191222.webp' },
    { id: 'lookbook', name: 'Lookbook', path: '/#lookbook', image: '/api/Uploads/LOOK-6_582.webp' },
  ];

  const BurgerIcon = (
  <button
    type="button"
    className={`a-burger${menuState === 'open' || menuState === 'closing' ? ' menu-open' : ''}${menuState === 'open' ? ' circle-open' : ''}${isMenuOpen ? ' menu-active' : ''}${hideHeader ? ' hide-header' : ''}`}
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
        <line className="x-line left" x1="1.5" y1="17.5" x2="17.5" y2="1.5" stroke="#4A494A" strokeWidth="2.2" />
<line className="x-line right" x1="17.5" y1="17.5" x2="1.5" y2="1.5" stroke="#4A494A" strokeWidth="2.2" />
      </svg>
    </span>
  </button>
);

  return (
  <>
    
    <div className={`mobile-header first-header${isProductDetailPage ? ' pdp-mobile-header' : ''}${hideHeader ? ' hide-header' : ''}${isMenuOpen ? ' menu-active' : ''}${isMenuOpen ? ' menu-open' : ''}`}>
  {BurgerIcon}

  {!isProductDetailPage && (
    <>
      <div className="header-logo mobile-hide-logo">
        <img src="/assets/FYVE-Dark-Logo.png" alt="FYVE White Logo" onClick={() => navigate('/')} />
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
    </>
  )}

  {isProductDetailPage && !isMenuOpen && (
    <button
      type="button"
      className="pdp-mobile-add-to-bag"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('pdp:add-to-cart'));
      }}
    >
      Add to Bag
    </button>
  )}

  {isProductDetailPage && isMenuOpen && (
    <div className="mobile-nav-icons pdp-open-icons">
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
                    <NavLink to={item.path} onMouseEnter={() => handleMenuImageChange(item.id)}>{item.name}</NavLink>
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

export default Header;