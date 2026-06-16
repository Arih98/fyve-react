import React, { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const location = useLocation();
  const { isMenuOpen } = useContext(MenuContext);

  const [message, setMessage] = React.useState('FREE SHIPPING SITEWIDE');

  useEffect(() => {
    fetch('https://yourdomain.com/wp-json/fyve/v1/discount')
      .then(res => res.json())
      .then(data => {
        if (data.enabled && data.percent > 0) {
          setMessage(`${data.percent}% OFF SITEWIDE`);
        } else {
          setMessage('FREE SHIPPING SITEWIDE');
        }
      })
      .catch(() => {
        setMessage('FREE SHIPPING SITEWIDE');
      });
  }, []);

  const items = Array(10).fill(message);

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