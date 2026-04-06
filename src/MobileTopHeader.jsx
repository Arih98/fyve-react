import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileTopHeader.css';

const MobileTopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';

  if (isCartPage) {
    return null;
  }

  return (
    <div className="mobile-top-header">
      <img
        src="/assets/FYVE-Dark-Logo.png"
        alt="FYVE Logo"
        className="mobile-top-header-logo"
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default MobileTopHeader;