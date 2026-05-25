import React, { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import './AnnouncementBar.css';

const items = Array(10).fill('FREE SHIPPING SITEWIDE');

const AnnouncementBar = () => {
  const location = useLocation();
  const { isMenuOpen } = useContext(MenuContext);
  const isCartPage = location.pathname === '/cart';
  const marqueeRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;

    if (!marquee) return;

    const syncPausedState = () => {
      if (document.hidden) {
        marquee.classList.add('is-tab-hidden-paused');
      } else {
        marquee.classList.remove('is-tab-hidden-paused');
      }
    };

    syncPausedState();

    document.addEventListener('visibilitychange', syncPausedState);

    return () => {
      document.removeEventListener('visibilitychange', syncPausedState);
    };
  }, []);

  return (
    <div className={`announcement-bar${isCartPage ? ' cart-style' : ''}${isMenuOpen ? ' menu-open' : ''}`}>
      <div ref={marqueeRef} className="announcement-marquee">
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