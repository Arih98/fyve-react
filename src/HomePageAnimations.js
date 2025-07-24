import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import './HomepageAnimations.css';

const HomePageAnimations = () => {
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
    const handlePageShow = (event) => {
      const isPersisted = event?.persisted || false;
      if (isPersisted) return;

      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';

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

        gsap.set('.fyve-mask', { visibility: 'visible' });
        gsap.set('.mask-left', { x: '0%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '0%', transformOrigin: 'right center' });
        gsap.set('.fyve-image', { visibility: 'visible' });
        gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
        gsap.set('.london-mask', { x: `${londonX}vw`, y: `${londonY}vw`, visibility: 'visible' });
        gsap.set('.lottie-container', { autoAlpha: 0 });
        gsap.set('.london-below', { opacity: 0 });
        gsap.fromTo(
          '.fyve-letter',
          { y: '100%' },
          { y: 0, duration: 1.3, ease: 'expo.inOut' }
        );
        gsap.to('.fyve-text:first-child', { x: '-0.3vw', duration: 0.8, ease: 'expo.inOut', delay: 1.2 });
        gsap.to('.fyve-text:last-child', { x: '0.3vw', duration: 0.8, ease: 'expo.inOut', delay: 1.2 });
        gsap.to('.fyve-image-container', { width: '18vw', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.mask-left', { x: '-100%', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.mask-right', { x: '100%', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.fyve-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.fyve-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.fyve-image-container', { width: '100vw', height: '100vh', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.set('.mobile-header', { opacity: 0 });
        gsap.to('.mobile-header', { opacity: 1, duration: 0.5, ease: 'expo.inOut', delay: 2.8 });
        gsap.set('.london-mask .london-text:first-child', { x: '0%', transformOrigin: 'left center' });
        gsap.set('.london-mask .london-text:last-child', { x: '0%', transformOrigin: 'right center' });
        gsap.fromTo(
          '.london-letter',
          { y: '100%' },
          { y: 0, duration: 1.3, ease: 'expo.inOut' }
        );
        gsap.to('.london-mask .london-text:first-child', { x: '-8.9vw', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.london-mask .london-text:last-child', { x: '8.9vw', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.london-mask .london-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.london-mask .london-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.london-mask', { marginTop: `-${londonHeight}vw`, y: `${londonY + londonHeight}vw`, duration: 0.8, ease: 'expo.inOut', delay: 2 });
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
    };

    window.addEventListener('pageshow', handlePageShow);
    handlePageShow({ persisted: false });

    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
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
  );
};

export default HomePageAnimations;