import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileTopHeader.css';

const MobileTopHeader = () => {
  const navigate = useNavigate();

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
