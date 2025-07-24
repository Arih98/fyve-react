import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import HomeHeader from './HomeHeader';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import { setupFYVEAndLondonAnimations } from './IntroAnimations';

const Home = () => {
  const lottieRef = useRef();
  const introDone = useRef(false);
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.5 });

  const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000;
  const londonFadeDelay = animationDuration * 0.3;

  useEffect(() => {
    if (lottieRef.current) {
      if (inView) {
        if (introDone.current) {
          lottieRef.current.play();
          setTimeout(() => {
            gsap.to('.london-below', { opacity: 1, duration: 0.5 });
          }, londonFadeDelay);
        }
      } else {
        lottieRef.current.goToAndStop(0, true);
        gsap.set('.london-below', { opacity: 0 });
      }
    }
  }, [inView]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    const image = document.querySelector('.fyve-image');
    if (image) {
      image.onerror = () => console.error('Image failed to load:', image.src);
      image.onload = () => console.log('Image loaded successfully:', image.src);
    }

    const ctx = gsap.context(() => {
      gsap.set('.london-mask', { visibility: 'visible' });
      const londonMask = document.querySelector('.london-mask');
      let londonHeight = 0;
      if (londonMask) {
        const londonHeightPx = londonMask.offsetHeight;
        const vwFactor = window.innerWidth / 100;
        londonHeight = londonHeightPx / vwFactor;
      }

      const fyveTextY = -1.11;
      const londonX = 1.3;
      const londonY = -1.41;

      setupFYVEAndLondonAnimations(londonHeight, fyveTextY, londonX, londonY);

      gsap.set('.lottie-container', { autoAlpha: 0 });
      gsap.set('.london-below', { opacity: 0 });
      gsap.to('.lottie-container', { 
        autoAlpha: 1, 
        duration: 0.8, 
        ease: 'expo.inOut', 
        delay: 2.8,
        onStart: () => {
          lottieRef.current?.play();
          setTimeout(() => {
            gsap.to('.london-below', { opacity: 1, duration: 0.5 });
          }, londonFadeDelay);
          setTimeout(() => {
            document.body.style.overflow = 'auto';
          }, animationDuration + 500);
        },
        onComplete: () => {
          introDone.current = true;
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">
      <HomeHeader />
      <div className="fyve-wrapper">
        <div className="fyve-mask">
          <div className="fyve-text">
            {'FY'.split('').map((l, i) => <span key={i} className="fyve-letter">{l}</span>)}
          </div>
          <div className="fyve-image-container">
            <img
              src="/api/Uploads/LOOK-2_137-e1743957431674.webp"
              alt="Reveal Image"
              className="fyve-image"
            />
            <div className="mask-left"></div>
            <div className="mask-right"></div>
          </div>
          <div className="fyve-text">
            {'VE'.split('').map((l, i) => <span key={i+2} className="fyve-letter">{l}</span>)}
          </div>
        </div>
        <div className="london-mask">
          <div className="london-text">
            {'LON'.split('').map((l, i) => <span key={i} className="london-letter">{l}</span>)}
          </div>
          <div className="london-text">
            {'DON'.split('').map((l, i) => <span key={i+3} className="london-letter">{l}</span>)}
          </div>
        </div>
        <div ref={ref} className="lottie-container">
          <Lottie 
            lottieRef={lottieRef}
            animationData={FYVEHeroLottie} 
            loop={false} 
            autoplay={false} 
            style={{ width: '100%', height: '100%' }} 
          />
          <div className="london-below">LONDON</div>
        </div>
      </div>
      <div className="section-1">
        <h2>section 1</h2>
      </div>
    </div>
  );
};

export default Home;