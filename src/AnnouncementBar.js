import React, { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import './AnnouncementBar.css';

const TEXT = 'FREE SHIPPING SITEWIDE';
const REPEATS = 12; // more repeats = smoother

const AnnouncementBar = () => {
  const location = useLocation();
  const { isMenuOpen } = useContext(MenuContext);
  const isCartPage = location.pathname === '/cart';
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startTime = Date.now();
    const speed = 22; // seconds for one full cycle (adjust as needed)

    const animate = () => {
      if (isPausedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = (Date.now() - startTime) / 1000;
      const progress = (elapsed % speed) / speed;
      const translateX = -50 * progress; // -50% because we duplicate the content

      container.style.transform = `translateX(${translateX}%)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Handle tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Small delay + reset timing to prevent jump
        isPausedRef.current = true;
        setTimeout(() => {
          startTime = Date.now();           // Reset timing
          isPausedRef.current = false;
        }, 80);
      } else {
        isPausedRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={`announcement-bar${isCartPage ? ' cart-style' : ''}${isMenuOpen ? ' menu-open' : ''}`}>
      <div className="announcement-marquee" ref={containerRef}>
        <div className="announcement-group">
          {Array(REPEATS).fill(TEXT).map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
        <div className="announcement-group" aria-hidden="true">
          {Array(REPEATS).fill(TEXT).map((item, i) => (
            <span key={`dup-${i}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;