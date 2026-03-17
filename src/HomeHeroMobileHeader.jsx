import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeHeroMobileHeader.css';

const HomeHeroMobileHeader = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const current = window.scrollY;

      if (current > 10 && current > lastScroll) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScroll = current;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`home-hero-mobile-header ${visible ? 'show' : 'hide'}`}>
      <button onClick={() => navigate('/search')}>
        <img src="/assets/SearchIcon.svg" alt="" />
      </button>

      <button onClick={() => navigate('/account')}>
        <img src="/assets/AccountIcon.svg" alt="" />
      </button>

      <button onClick={() => navigate('/cart')}>
        <img src="/assets/BagIcon.svg" alt="" />
      </button>
    </div>
  );
};

export default HomeHeroMobileHeader;