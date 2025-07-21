// Home.js
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
  const fyveTextRef = useRef(null);
  const imageRef = useRef(null);

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
    gsap.set('.lottie-container', { opacity: 0 });

    const fontReady = document.fonts.ready;
    const imageLoad = new Promise(resolve => {
      if (imageRef.current?.complete) resolve();
      else if (imageRef.current) imageRef.current.onload = resolve;
    });

    Promise.all([fontReady, imageLoad]).then(() => {
      gsap.set('.fyve-mask', { visibility: 'visible' });
      const textHeight = fyveTextRef.current.getBoundingClientRect().height;
      const aspect = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      const initialWidth = textHeight * aspect;
      gsap.set('.hero-image-container', { width: initialWidth, height: textHeight, scale: 0, transformOrigin: 'center center' });

      const tl = gsap.timeline();

      tl.to('.fyve-text', { 
        y: 0, 
        duration: 0.8, 
        ease: 'power2.out'
      });

      tl.to({}, { duration: 0.5 });

      tl.to('.hero-image-container', { 
        scale: 1, 
        duration: 0.5, 
        ease: 'power1.inOut'
      });

      tl.set('.fyve-mask', { overflow: 'visible' });

      tl.to('.fy', { 
        x: '-100vw', 
        duration: 1.2, 
        ease: 'expo.inOut'
      });

      tl.to('.ve', { 
        x: '100vw', 
        duration: 1.2, 
        ease: 'expo.inOut'
      }, '<');

      tl.set('.hero-image-container', { position: 'absolute', left: '50%', top: '50%', x: '-50%', y: '-50%' });

      tl.to('.hero-image-container', { 
        width: '100vw', 
        height: '100vh', 
        duration: 1.2, 
        ease: 'expo.inOut'
      });

      tl.to('.lottie-container', { 
        opacity: 1, 
        duration: 0.8, 
        ease: 'power2.out'
      });
    });
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
      <section className="custom-hero-section"></section>
      <div className="hero-overlay">
        <div className="fyve-mask">
          <div className="fyve-text" ref={fyveTextRef}>
            <span className="fy">FY</span>
            <div className="hero-image-container">
              <img ref={imageRef} src="/api/Uploads/LOOK-2_137-e1743957431674.webp" alt="Hero" className="hero-image" />
            </div>
            <span className="ve">VE</span>
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