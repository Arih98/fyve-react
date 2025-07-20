import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './HomeHeader';
import { gsap } from 'gsap';

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
            }, 1000); // Adjust delay (in ms) as needed
          }
        }
      });
  }, [lottieReady]);

  return (
<motion.div
  id="page"
  className="home-page"
  style={{ opacity: 1 }} // Ensure Home is always visible
  animate={{
    y: menuActive ? menuHeight : 0,
  }}
  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
>
  <HomeHeader setMenuActive={setMenuActive} />
      <style>
        {`
          @media (max-width: 900px) {
            .look9-bg-image { width: 88vw; }
            .look9-bg-text { font-size: 3vw; top: 6%; left: 6%; }
          }
          @media (max-width: 600px) {
            .look9-bg-image { width: 99vw; }
            .look9-bg-text { font-size: 5vw; top: 7%; left: 7%; padding: 0.4em 0.7em; }
          }
        `}
      </style>
      <section
        ref={heroSectionRef}
        className="custom-hero-section"
        style={{
          position: 'fixed',
          top: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          background: "url('https://fyvelondon.com/wp-content/uploads/2025/04/LOOK-2_137-e1743957431674.webp') center center/cover no-repeat",
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 0,
          margin: 0,
          zIndex: 1,
          willChange: 'transform',
        }}
      >
        <div
          className="lottie-stack"
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 0,
            margin: 0,
          }}
        >
          {lottieReady && (
            <lottie-player
              ref={lottieRef}
              id="lottieHero"
              className="hero-lottie"
              src="/lottie/FYVE-2.json"
              background="transparent"
              speed="1"
              style={{
                width: '100vw',
                height: '130vh',
                maxWidth: '100vw',
                maxHeight: '130vh',
                display: 'block',
                margin: 0,
                padding: 0,
              }}
            ></lottie-player>
          )}
          <img
            ref={iconRef}
            src="https://fyvelondon.com/wp-content/uploads/2025/07/Asset-16Fyve-W23-Cart2-Icon.png"
            className="hero-london"
            alt="London"
            style={{
              width: '42em',
              maxWidth: '95vw',
              display: 'block',
              margin: '0 auto 3vh auto',
            }}
          />
        </div>
      </section>
      <section
        className="look9-bg-section"
        style={{
          width: '100vw',
          minHeight: '70vh',
          paddingTop: '70px',
          paddingBottom: '70px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          marginTop: '100vh',
        }}
      >
        <div
          className="look9-bg-image"
          style={{
            width: '66vw',
            height: 'auto',
            aspectRatio: '1/1',
            background: "url('https://fyvelondon.com/wp-content/uploads/2024/12/LOOK-9_1426_result.webp') center center no-repeat",
            backgroundSize: 'contain',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          <div
            className="look9-bg-text"
            style={{
              position: 'absolute',
              top: '2.5%',
              left: '-9.9%',
              fontFamily: 'quasimoda, sans-serif',
              fontWeight: 700,
              fontSize: '3.8vw',
              lineHeight: '0.9em',
              letterSpacing: '-0.4px',
              color: '#222',
              pointerEvents: 'none',
              zIndex: 2,
              textAlign: 'left',
            }}
          >
            Comfortably<br />
            Modern,<br />
            Distinctly<br />
            British.
          </div>
          <div
            className="look9-bg-tagline"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#f7f7f7',
              color: '#222',
              padding: '15px',
              fontSize: '9.85vw',
              fontFamily: 'quasimoda, sans-serif',
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: '-0.3px',
              zIndex: 3,
              textAlign: 'right',
              pointerEvents: 'none',
              borderRadius: '0 0 0 25px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}
          >
            We combine iconic British design with modern comfort<br />
            and ease, creating a wardrobe that<br />
            blends timeless elegance with<br />
            everyday<br />
            practicality.
          </div>
        </div>
      </section>
      <div style={{ textAlign: 'center', padding: '20px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Shop Now
        </button>
      </div>
    </motion.div>
  );
};

export default Home;