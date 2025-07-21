import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import { gsap } from 'gsap';
import Player from 'lottie-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const heroSectionRef = useRef(null);
  const fyveTextRef = useRef(null);

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
    gsap.set('.fyve-text', { yPercent: 100, visibility: 'hidden' });
    gsap.set('.hero-image', { clipPath: 'inset(0 50% 0 50%)', scale: 1, transformOrigin: 'center center' });
    gsap.set('.lottie-container', { opacity: 0 });

    document.fonts.ready.then(() => {
      const section = heroSectionRef.current;
      const textHeight = fyveTextRef.current.getBoundingClientRect().height;
      const imageHeight = section.getBoundingClientRect().height;
      const initialScale = textHeight / imageHeight;
      gsap.set('.hero-image', { scale: initialScale });
      gsap.set('.fyve-text', { visibility: 'visible' });

      const tl = gsap.timeline();

      tl.to('.fyve-text', { yPercent: 0, duration: 0.8, ease: 'power2.out' })
        .addLabel('separate')
        .to('.hero-image', { scale: 1, duration: 0.8, ease: 'power2.out' }, 'separate')
        .to('.fy', { x: '-50%', duration: 0.5, ease: 'power1.inOut' }, 'separate')
        .to('.ve', { x: '50%', duration: 0.5, ease: 'power1.inOut' }, 'separate')
        .addLabel('slideOff', '+=0.2')
        .to('.fy', { x: '-100vw', duration: 1.2, ease: 'expo.inOut' }, 'slideOff')
        .to('.ve', { x: '100vw', duration: 1.2, ease: 'expo.inOut' }, 'slideOff')
        .addLabel('coverGrow')
        .to('.hero-image', { scale: 1.2, duration: 1.2, ease: 'expo.inOut' }, 'coverGrow')
        .to('.lottie-container', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 'coverGrow+=1.2');
    });
  }, []);

  return (
    <motion.div
      id="page"
      className="home-page"
      animate={{ y: menuActive ? menuHeight : 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <HomeHeader setMenuActive={setMenuActive} />
      <section ref={heroSectionRef} className="custom-hero-section">
        <img src="/api/Uploads/LOOK-2_137-e1743957431674.webp" alt="Hero" className="hero-image" />
      </section>
      <div className="hero-overlay">
        <div className="fyve-mask">
          <div className="fyve-text" ref={fyveTextRef}>
            <span className="fy">FY</span><span className="ve">VE</span>
          </div>
        </div>
        <div className="lottie-container">
          <Player autoplay loop={false} src="FYVEHeroLottie.json" />
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
