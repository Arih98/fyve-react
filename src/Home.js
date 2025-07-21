import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import { gsap } from 'gsap';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    const updateMenuHeight = () => {
      const contentHeight = window.innerHeight + 64;
      const buffer = 128;
      setMenuHeight(contentHeight + buffer);
    };
    updateMenuHeight();
    window.addEventListener('resize', updateMenuHeight);
    return () => window.removeEventListener('resize', updateMenuHeight);
  }, []);

  useEffect(() => {
    gsap.ticker.fps(60);
    const section = heroSectionRef.current;
    gsap.set(section, { scale: 0, xPercent: -50, yPercent: -50, left: '50%', top: '50%' });
    gsap.set('.fyve-text', { yPercent: 100 });
    gsap.set('.hero-image', { clipPath: 'inset(0 50% 0 50%)' });
    gsap.set('.final-fyve', { opacity: 0 });
    gsap.set('.final-fyve span', { clipPath: 'inset(100% 0 0 0)' });

    const tl = gsap.timeline();
    tl.to('.fyve-text', { yPercent: 0, duration: 0.8, ease: 'power2.out' });
    tl.to('.fy', { x: -100, duration: 0.5, ease: 'power1.inOut' }, '+=0.2');
    tl.to('.ve', { x: 100, duration: 0.5, ease: 'power1.inOut' }, '<');
    tl.to('.hero-image', { clipPath: 'inset(0 0% 0 0%)', duration: 0.8, ease: 'power2.out' }, '+=0.2');
    tl.to(section, { scale: 300 / window.innerWidth, duration: 1.2, ease: 'expo.inOut' }, 'zoom');
    tl.to('.fy', { x: '-100vw', duration: 1.2, ease: 'expo.inOut' }, 'zoom');
    tl.to('.ve', { x: '100vw', duration: 1.2, ease: 'expo.inOut' }, 'zoom');
    tl.to(section, { scale: 300 / window.innerWidth, duration: 1, ease: 'none' });
    tl.to(section, { scale: 1, xPercent: 0, yPercent: 0, left: 0, top: 0, duration: 1, ease: 'expo.inOut' });
    tl.set('.final-fyve', { opacity: 1 });
    tl.to('.final-fyve span', { clipPath: 'inset(0 0 0 0)', duration: 0.8, ease: 'power2.out' });
  }, []);

  return (
    <motion.div
      id="page"
      className="home-page"
      animate={{
        y: menuActive ? menuHeight : 0,
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <HomeHeader setMenuActive={setMenuActive} />
      <section ref={heroSectionRef} className="custom-hero-section">
        <img src="/api/Uploads/LOOK-2_137-e1743957431674.webp" alt="Hero" className="hero-image" />
      </section>
      <div className="hero-overlay">
        <div className="fyve-mask">
          <div className="fyve-text">
            <span className="fy">FY</span><span className="ve">VE</span>
          </div>
        </div>
        <div className="final-fyve">
          <span>F</span><span>Y</span><span>V</span><span>E</span>
        </div>
      </div>
      <section className="look9-bg-section">
        <div className="look9-bg-image">
          <div className="look9-bg-text">
            Comfortably<br />
            Modern,<br />
            Distinctly<br />
            British.
          </div>
          <div className="look9-bg-tagline">
            We combine iconic British design with modern comfort<br />
            and ease, creating a wardrobe that<br />
            blends timeless elegance with<br />
            everyday<br />
            practicality.
          </div>
        </div>
      </section>
      <div className="shop-now-container">
        <button onClick={() => navigate('/products')}>
          Shop Now
        </button>
      </div>
    </motion.div>
  );
};

export default Home;