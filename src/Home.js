import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './Home.css';

const Home = () => {
  useEffect(() => {
    gsap.set('.fyve-mask', { visibility: 'visible' });
    const tl = gsap.timeline();
    tl.fromTo(
      '.fyve-text',
      { y: '100%' },
      { y: 0, duration: 0.8, ease: 'power2.out' }
    );
    tl.to('.fy', { x: -100, duration: 0.5, ease: 'power1.inOut' });
    tl.to('.ve', { x: 100, duration: 0.5, ease: 'power1.inOut' }, '<');
  }, []);

  return (
    <div className="home-page">
      <div className="fyve-mask">
        <div className="fyve-text">
          <span className="fy">FY</span>
          <span className="ve">VE</span>
        </div>
      </div>
    </div>
  );
};

export default Home;