import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import { gsap } from 'gsap';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [lottieReady, setLottieReady] = useState(!!window.customElements.get('lottie-player'));
  const [menuActive, setMenuActive] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const heroSectionRef = useRef(null);
  const lottieRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (!window.customElements.get('lottie-player') && !document.getElementById('lottie-script')) {
      const script = document.createElement('script');
      script.id = 'lottie-script';
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      script.async = true;
      script.onload = () => setLottieReady(true);
      script.onerror = () => setLottieReady(false);
      document.body.appendChild(script);
    } else if (window.customElements.get('lottie-player')) {
      setLottieReady(true);
    }
  }, []);

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
    if (!lottieReady) return;
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const hero = document.querySelector('.custom-hero-section');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const scrollingUp = window.scrollY < lastScroll;
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      const lottie = lottieRef.current;
      if (scrollingUp && inView && lottie && typeof lottie.play === 'function') {
        lottie.seek(0);
        lottie.play();
      }
      lastScroll = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lottieReady]);

  useEffect(() => {
    gsap.ticker.fps(60);
    const section = heroSectionRef.current;
    gsap.set(section, { scale: 0, xPercent: -50, yPercent: -50, left: '50%', top: '50%' });
    gsap.set(iconRef.current, { opacity: 0 });

    const tl = gsap.timeline();
    tl.to(section, {
      scale: 300 / window.innerWidth,
      duration: 1.2,
      ease: 'expo.inOut',
    })
      .to(section, {
        scale: 300 / window.innerWidth,
        duration: 1,
        ease: 'none',
      })
      .to(section, {
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        left: 0,
        top: 0,
        duration: 1,
        ease: 'expo.inOut',
        onComplete: () => {
          if (lottieReady && lottieRef.current && typeof lottieRef.current.play === 'function') {
            lottieRef.current.seek(0);
            lottieRef.current.play();
            setTimeout(() => {
              gsap.to(iconRef.current, { opacity: 1, duration: 0.5 });
            }, 1000);
          }
        }
      });
  }, [lottieReady]);

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
        <div className="lottie-stack">
          {lottieReady && (
            <lottie-player
              ref={lottieRef}
              id="lottieHero"
              className="hero-lottie"
              src="/lottie/FYVE-2.json"
              background="transparent"
              speed="1"
            ></lottie-player>
          )}
          <img
            ref={iconRef}
            src="https://fyvelondon.com/wp-content/uploads/2025/07/Asset-16Fyve-W23-Cart2-Icon.png"
            className="hero-lottie"
            alt="London"
          />
        </div>
      </section>
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