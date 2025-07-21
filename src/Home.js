import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './Home.css';

const Home = () => {
  useEffect(() => {
    gsap.set('.fyve-mask', { visibility: 'visible' });
    gsap.fromTo(
      '.fyve-letter',
      { y: '100%' },
      { y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="home-page">
      <div className="fyve-mask">
        <div className="fyve-text">
          {'FYVE'.split('').map((letter, index) => (
            <span key={index} className="fyve-letter">{letter}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;