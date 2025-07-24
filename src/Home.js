// Home.js
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import HomeHeader from './HomeHeader';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import HomePageAnimations from './HomePageAnimations';

export const loadId = Math.random().toString();

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
          console.log('Lottie played on re-enter');
          setTimeout(() => {
            gsap.to('.london-below', { opacity: 1, duration: 0.5 });
            console.log('Fading in LONDON after re-enter');
          }, londonFadeDelay);
        }
      } else {
        lottieRef.current.goToAndStop(0, true);
        gsap.set('.london-below', { opacity: 0 });
        console.log('Lottie reset to frame 0');
      }
    } else {
      console.error('Lottie ref not available');
    }
  }, [inView]);

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Lottie data:', FYVEHeroLottie);

    const playedId = sessionStorage.getItem('introPlayedId') || '';
    const shouldAnimate = playedId !== loadId;

    const ctx = gsap.context(() => {
      if (!shouldAnimate) {
        gsap.set('.mobile-header', { opacity: 1 });
        gsap.set('.lottie-container', { autoAlpha: 1 });
        gsap.set('.london-below', { opacity: 1 });
        introDone.current = true;
      }
    });

    return () => ctx.revert();
  }, []);

  const handleIntroComplete = () => {
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
        <HomePageAnimations onIntroComplete={handleIntroComplete} />
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