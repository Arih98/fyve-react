import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import HomeHeader from './HomeHeader';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import HomePageAnimations from './HomePageAnimations';

const Home = () => {
  const lottieRef = useRef();
  const introDone = useRef(false);
  const hasPlayedScrollSegment = useRef(false);
  const prevScrollY = useRef(0);
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.5 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [londonHeight, setLondonHeight] = useState(0);

  const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000;
  const londonFadeDelay = animationDuration * 0.3;

  const fyveTextY = -1.11;
  const londonX = 1.3;
  const londonY = -1.41;

  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0];
    const navType = navEntry ? navEntry.type : 'navigate';
    console.log('[INIT] Navigation type:', navType);
    const shouldAnimate = navType !== 'back_forward';
    setIsAnimating(shouldAnimate);

    if (shouldAnimate) {
      console.log('[INIT] Running full intro animation');
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      gsap.set('.lottie-container', { autoAlpha: 0 });
      gsap.set('.london-below', { opacity: 0 });
      gsap.set('.mobile-header', { opacity: 0 });
    } else {
      console.log('[INIT] Skipping intro animation (back_forward), showing final state');
      document.body.style.overflow = 'auto';
      gsap.set('.lottie-container', { autoAlpha: 1 });
      gsap.set('.london-below', { opacity: 1 });
      gsap.set('.mobile-header', { opacity: 1 });
      lottieRef.current?.goToAndStop(FYVEHeroLottie.op, true);
      introDone.current = true;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const direction = currentY < prevScrollY.current ? 'up' : 'down';
      prevScrollY.current = currentY;

      console.log(`[SCROLL] Direction: ${direction}, In View: ${inView}, IntroDone: ${introDone.current}, HasPlayedSegment: ${hasPlayedScrollSegment.current}`);

      if (inView && introDone.current && direction === 'up' && !hasPlayedScrollSegment.current) {
        console.log('[SCROLL] Playing scroll-triggered Lottie segment');
        const current = lottieRef.current?.currentFrame || 0;
        const total = lottieRef.current?.totalFrames || FYVEHeroLottie.op;
        lottieRef.current?.playSegments([current, total], true);

        const london = document.querySelector('.london-below');
        const currentOpacity = gsap.getProperty(london, 'opacity');
        if (currentOpacity === 0) {
          const fadeFrame = FYVEHeroLottie.ip + 0.3 * (FYVEHeroLottie.op - FYVEHeroLottie.ip);
          if (current < fadeFrame) {
            const delay = (fadeFrame - current) / FYVEHeroLottie.fr * 1000;
            console.log(`[SCROLL] Delayed LONDON fade-in by ${delay.toFixed(0)}ms`);
            setTimeout(() => {
              gsap.to('.london-below', { opacity: 1, duration: 0.5 });
            }, delay);
          } else {
            console.log('[SCROLL] Immediate LONDON fade-in');
            gsap.to('.london-below', { opacity: 1, duration: 0.5 });
          }
        }

        hasPlayedScrollSegment.current = true;
      }

      if (!inView) {
        hasPlayedScrollSegment.current = false;
        lottieRef.current?.pause();
        console.log('[SCROLL] Paused Lottie and reset scroll segment flag');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [inView]);

  const handleMasksComplete = () => {
    console.log('[ANIMATION] handleMasksComplete fired');
    gsap.to('.lottie-container', {
      autoAlpha: 1,
      duration: 0.8,
      ease: 'expo.inOut',
      onStart: () => {
        console.log('[ANIMATION] Playing Lottie (intro)');
        lottieRef.current?.play();
        setTimeout(() => {
          gsap.to('.london-below', { opacity: 1, duration: 0.5 });
          console.log('[ANIMATION] Fading in LONDON after intro');
        }, londonFadeDelay);
        setTimeout(() => {
          document.body.style.overflow = 'auto';
        }, animationDuration + 500);
      },
      onComplete: () => {
        console.log('[ANIMATION] Intro complete');
        introDone.current = true;
      }
    });
    gsap.to('.mobile-header', { opacity: 1, duration: 0.5, ease: 'expo.inOut' });
  };

  return (
    <div className="home-page">
      <HomeHeader />
      <div className="fyve-wrapper">
        <HomePageAnimations
          isAnimating={isAnimating}
          onMasksComplete={handleMasksComplete}
          fyveTextY={fyveTextY}
          londonX={londonX}
          londonY={londonY}
          londonHeight={londonHeight}
          londonFadeDelay={londonFadeDelay}
        />
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
