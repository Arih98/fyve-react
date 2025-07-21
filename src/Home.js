import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './Home.css';

const Home = () => {
  useEffect(() => {
    gsap.set('.fyve-mask', { visibility: 'visible' });
    gsap.to('.fyve-letter:nth-child(1), .fyve-letter:nth-child(2)', {
      x: -100,
      duration: 0.5,
      ease: 'power2.out',
      delay: 1
    });
    gsap.to('.fyve-letter:nth-child(3), .fyve-letter:nth-child(4)', {
      x: 100,
      duration: 0.5,
      ease: 'power2.out',
      delay: 1
    });
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