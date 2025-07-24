import React from 'react';
import HomeHeader from './HomeHeader';
import IntroAnimations from './IntroAnimations';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <HomeHeader />
      <IntroAnimations />
      <div className="section-1">
        <h2>section 1</h2>
      </div>
    </div>
  );
};

export default Home;