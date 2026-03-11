import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductDetailMobileHeader = ({
  isMenuOpen,
  menuState,
  burgerRef,
  onToggleMenu,
  onAddToBag,
  addToBagDisabled,
  addToBagLabel
}) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(v => !v);
  };

  return (
    <>
      <div className={`mobile-header first-header pdp-mobile-header${isMenuOpen ? ' menu-open' : ''}`}>
        <button
          type="button"
          className={`a-burger${menuState === 'open' || menuState === 'closing' ? ' menu-open' : ''}${menuState === 'open' ? ' circle-open' : ''}${isMenuOpen ? ' menu-active' : ''}`}
          ref={burgerRef}
          onClick={onToggleMenu}
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

        {!isMenuOpen ? (
          <button
            type="button"
            className={`pdp-mobile-add-to-bag${addToBagDisabled ? ' disabled' : ''}`}
            onClick={onAddToBag}
            disabled={addToBagDisabled}
          >
            {addToBagLabel}
          </button>
        ) : (
          <div className="mobile-nav-icons pdp-open-icons">
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
        )}
      </div>

      <div className={`custom-search-container pdp-search-container${isSearchOpen ? ' active' : ''}`}>
        <div className="custom-search-inner">
          <input
            type="text"
            className="custom-search-input"
            placeholder="Little Trendsetters: Uncover Your Child's Style"
          />
          <button className="custom-search-close" onClick={toggleSearch}>
            <img src="/api/Uploads/FYVEDarkCloseIcon.svg" alt="Close Button" />
          </button>
          <div className="custom-search-results"></div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailMobileHeader;
