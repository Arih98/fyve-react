// Modified Home.js
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
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.5 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [londonHeight, setLondonHeight] = useState(0);

  const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000;
  const londonFadeDelay = animationDuration * 0.3;

  const fyveTextY = -1.11;
  const londonX = 1.3;
  const londonY = -1.41;

  useEffect(() => {
    console.log('Lottie data:', FYVEHeroLottie);

    const navEntry = performance.getEntriesByType('navigation')[0];
    const navType = navEntry ? navEntry.type : 'navigate';
    const shouldAnimate = navType !== 'back_forward';
    setIsAnimating(shouldAnimate);

    if (shouldAnimate) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      gsap.set('.lottie-container', { autoAlpha: 0 });
      gsap.set('.london-below', { opacity: 0 });
      gsap.set('.mobile-header', { opacity: 0 });
    } else {
      document.body.style.overflow = 'auto';
      gsap.set('.lottie-container', { autoAlpha: 1 });
      gsap.set('.london-below', { opacity: 1 });
      gsap.set('.mobile-header', { opacity: 1 });
      lottieRef.current?.goToAndStop(FYVEHeroLottie.op, true);
      introDone.current = true;
    }
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      if (inView) {
        if (introDone.current) {
          const current = lottieRef.current.currentFrame;
          const total = lottieRef.current.totalFrames;
          lottieRef.current.playSegments([current, total], true);

          const london = document.querySelector('.london-below');
          const currentOpacity = gsap.getProperty(london, 'opacity');
          if (currentOpacity === 0) {
            const fadeFrame = FYVEHeroLottie.ip + 0.3 * (FYVEHeroLottie.op - FYVEHeroLottie.ip);
            if (current < fadeFrame) {
              const delay = (fadeFrame - current) / FYVEHeroLottie.fr * 1000;
              setTimeout(() => {
                gsap.to('.london-below', { opacity: 1, duration: 0.5 });
              }, delay);
            } else {
              gsap.to('.london-below', { opacity: 1, duration: 0.5 });
            }
          }
        }
      } else {
        lottieRef.current.pause();
      }
    }
  }, [inView]);

  const handleMasksComplete = () => {
    gsap.to('.lottie-container', {
      autoAlpha: 1,
      duration: 0.8,
      ease: 'expo.inOut',
      onStart: () => {
        lottieRef.current?.play();
        console.log('Lottie internal animation played first time');
        setTimeout(() => {
          gsap.to('.london-below', { opacity: 1, duration: 0.5 });
          console.log('Fading in LONDON after initial play');
        }, londonFadeDelay);
        setTimeout(() => {
          document.body.style.overflow = 'auto';
        }, animationDuration + 500);
      },
      onComplete: () => {
        introDone.current = true;
        console.log('Lottie container animation completed');
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