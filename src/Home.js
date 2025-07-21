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
    console.log('useEffect: updateMenuHeight listener binding');
    const updateMenuHeight = () => {
      const contentHeight = window.innerHeight + 64;
      const buffer = 128;
      setMenuHeight(contentHeight + buffer);
      console.log('Menu height set to', contentHeight + buffer);
    };
    updateMenuHeight();
    window.addEventListener('resize', updateMenuHeight);
    return () => window.removeEventListener('resize', updateMenuHeight);
  }, []);

  useEffect(() => {
    console.log('useEffect: starting GSAP setup');
    gsap.ticker.fps(60);
    console.log('gsap.ticker.fps set to 60');

    gsap.set('.fyve-text', { yPercent: 100, visibility: 'hidden' });
    console.log('Initial .fyve-text set to yPercent 100, visibility hidden');

    gsap.set('.hero-image', { clipPath: 'inset(0 50% 0 50%)', scale: 1, transformOrigin: 'center center' });
    console.log('Initial .hero-image clipPath and scale set');

    gsap.set('.lottie-container', { opacity: 0 });
    console.log('Initial .lottie-container opacity set to 0');

    document.fonts.ready.then(() => {
      console.log('Fonts ready event fired');
      const section = heroSectionRef.current;
      const textHeight = fyveTextRef.current.getBoundingClientRect().height;
      const imageHeight = section.getBoundingClientRect().height;
      const initialScale = textHeight / imageHeight;
      console.log('Computed initialScale for hero-image:', initialScale);

      gsap.set('.hero-image', { scale: initialScale });
      console.log('Applied initialScale to .hero-image');

      gsap.set('.fyve-text', { visibility: 'visible' });
      console.log('.fyve-text visibility set to visible');

      const tl = gsap.timeline({
        onStart: () => console.log('Timeline: onStart'),
        onComplete: () => console.log('Timeline: onComplete')
      });

      tl.addLabel('start')
        .to('.fyve-text', {
          yPercent: 0,
          duration: 0.8,
          ease: 'power2.out',
          onStart: () => console.log('[FYVE] slide up start'),
          onUpdate: () => {
            const rect = fyveTextRef.current.getBoundingClientRect();
            console.log('[FYVE] slide up yPercent:', rect.y, 'height:', rect.height);
          },
          onComplete: () => console.log('[FYVE] slide up complete')
        })
        .addLabel('revealImage')
        .to('.hero-image', {
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          onStart: () => console.log('[Image] reveal start'),
          onComplete: () => console.log('[Image] reveal complete')
        }, 'revealImage')
        .to('.fy', {
          x: '-50%',
          duration: 0.5,
          ease: 'power1.inOut',
          onStart: () => console.log('[FY] separate start'),
          onComplete: () => console.log('[FY] separate complete')
        }, 'revealImage')
        .to('.ve', {
          x: '50%',
          duration: 0.5,
          ease: 'power1.inOut',
          onStart: () => console.log('[VE] separate start'),
          onComplete: () => console.log('[VE] separate complete')
        }, 'revealImage')
        .addLabel('slideOff', '+=0.2')
        .to('.fy', {
          x: '-100vw',
          duration: 1.2,
          ease: 'expo.inOut',
          onStart: () => console.log('[FY] slide off start'),
          onComplete: () => console.log('[FY] slide off complete')
        }, 'slideOff')
        .to('.ve', {
          x: '100vw',
          duration: 1.2,
          ease: 'expo.inOut',
          onStart: () => console.log('[VE] slide off start'),
          onComplete: () => console.log('[VE] slide off complete')
        }, 'slideOff')
        .addLabel('coverGrow')
        .to('.hero-image', {
          scale: 1.2,
          duration: 1.2,
          ease: 'expo.inOut',
          onStart: () => console.log('[Image] cover grow start'),
          onComplete: () => console.log('[Image] cover grow complete')
        }, 'coverGrow')
        .to('.lottie-container', {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          onStart: () => console.log('[Lottie] fade in start'),
          onComplete: () => console.log('[Lottie] fade in complete')
        }, 'coverGrow+=1.2');
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
