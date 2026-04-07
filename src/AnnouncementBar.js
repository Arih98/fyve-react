import React from 'react';
import { useLocation } from 'react-router-dom';
import './AnnouncementBar.css';
import { useContext } from 'react';
import { MenuContext } from './MenuContext';

const items = Array(10).fill('FREE SHIPPING SITEWIDE');

const AnnouncementBar = () => {
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';
const { isMenuOpen } = useContext(MenuContext);

  return (
   <div className={`announcement-bar 
  ${isCartPage ? 'cart-style' : ''} 
  ${isMenuOpen ? 'menu-open' : ''}
`}>
      <div className="announcement-marquee">
        <div className="announcement-group">
          {items.map((item, index) => (
            <span key={`group1-${index}`}>{item}</span>
          ))}
        </div>
        <div className="announcement-group" aria-hidden="true">
          {items.map((item, index) => (
            <span key={`group2-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;