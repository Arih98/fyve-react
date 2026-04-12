import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader">
      <img src="/assets/FYVE-Dark-Logo.svg" alt="FYVE logo" className="loader-logo" />
      <div className="loader-text">
        <span className="fyve">FYVE</span>
        <span className="london">LONDON</span>
      </div>
    </div>
  );
};

export default Loader;