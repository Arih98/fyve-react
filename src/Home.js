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
    console.log('Animation useEffect started');
    gsap.ticker.fps(60);
    const section = heroSectionRef.current;
    console.log('Setting initial styles for .fyve-text');
    gsap.set('.fyve-text', { yPercent: 100 });
    console.log('Setting initial styles for .hero-image');
    gsap.set('.hero-image', { clipPath: 'inset(0 50% 0 50%)', scale: 1 });
    console.log('Setting initial styles for .lottie-container');
    gsap.set('.lottie-container', { opacity: 0 });

    if (fyveTextRef.current) {
      const computedStyle = window.getComputedStyle(fyveTextRef.current);
      console.log('Initial computed font-weight for FYVE text:', computedStyle.fontWeight);
    }

    const tl = gsap.timeline({
      onStart: () => console.log('Timeline started'),
      onComplete: () => console.log('Timeline completed')
    });

    tl.to('.fyve-text', { 
      yPercent: 0, 
      duration: 0.8, 
      ease: 'power2.out',
      onStart: () => console.log('Starting FYVE slide up'),
      onComplete: () => {
        console.log('FYVE slide up completed');
        if (fyveTextRef.current) {
          const computedStyle = window.getComputedStyle(fyveTextRef.current);
          console.log('Font-weight after slide up:', computedStyle.fontWeight);
        }
      }
    });

    tl.to('.fy', { 
      x: -100, 
      duration: 0.5, 
      ease: 'power1.inOut',
      onStart: () => console.log('Starting FY slide left 100px')
    }, 'separate');

    tl.to('.ve', { 
      x: 100, 
      duration: 0.5, 
      ease: 'power1.inOut',
      onStart: () => console.log('Starting VE slide right 100px')
    }, '<');

    tl.to('.hero-image', { 
      clipPath: 'inset(0 0% 0 0%)', 
      duration: 0.8, 
      ease: 'power2.out',
      onStart: () => console.log('Starting hero image reveal from center'),
      onComplete: () => console.log('Hero image reveal completed')
    }, 'separate');

    tl.to('.hero-image', { 
      scale: 1.1, 
      duration: 1.2, 
      ease: 'expo.inOut',
      onStart: () => console.log('Starting image zoom in')
    }, 'zoom');

    tl.to('.fy', { 
      x: '-100vw', 
      duration: 1.2, 
      ease: 'expo.inOut',
      onStart: () => console.log('Starting FY slide off left')
    }, 'zoom');

    tl.to('.ve', { 
      x: '100vw', 
      duration: 1.2, 
      ease: 'expo.inOut',
      onStart: () => console.log('Starting VE slide off right')
    }, 'zoom');

    tl.to('.lottie-container', { 
      opacity: 1, 
      duration: 0.8, 
      ease: 'power2.out',
      onStart: () => console.log('Starting lottie fade in'),
      onComplete: () => console.log('Lottie fade in completed')
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