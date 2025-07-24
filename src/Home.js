import React from 'react';
import HomeHeader from './HomeHeader';
import './Home.css';
import HomePageAnimations from './HomePageAnimations';

const Home = () => {
  return (
    <div className="home-page">
      <HomeHeader />
      <HomePageAnimations />
      <div className="section-1">
        <h2>section 1</h2>
      </div>
    </div>
  );
};

export default Home;