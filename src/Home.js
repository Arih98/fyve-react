import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import HomeHeader from './HomeHeader';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';

const Home = () => {
  const lottieRef = useRef();
  const hasAnimated = useRef(false);
  const introDone = useRef(false);
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.5 });

  const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000;
  const londonFadeDelay = animationDuration * 0.3;
  const scrollDisableTime = 4000;

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
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    hasAnimated.current = false;
    introDone.current = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, scrollDisableTime);
    console.log('Home component mounted');
    console.log('Lottie data:', FYVEHeroLottie);
    const image = document.querySelector('.fyve-image');
    if (image) {
      console.log('Image element found:', image);
      console.log('Image src:', image.src);
      image.onerror = () => console.error('Image failed to load:', image.src);
      image.onload = () => console.log('Image loaded successfully:', image.src);
    } else {
      console.error('Image element not found');
    }

    const ctx = gsap.context(() => {
      gsap.set('.london-mask', { visibility: 'visible' });
      const londonMask = document.querySelector('.london-mask');
      let londonHeight = 0;
      if (londonMask) {
        const londonHeightPx = londonMask.offsetHeight;
        const vwFactor = window.innerWidth / 100;
        londonHeight = londonHeightPx / vwFactor;
        console.log('London mask height in vw:', londonHeight);
      } else {
        console.error('london-mask not found');
      }

      const fyveTextY = -1.11;
      const londonX = 1.3;
      const londonY = -1.41;

      if (hasAnimated.current) {
        gsap.set('.fyve-mask', { visibility: 'visible' });
        gsap.set('.fyve-image', { visibility: 'visible' });
        gsap.set('.mask-left', { x: '-100%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '100%', transformOrigin: 'right center' });
        gsap.set('.fyve-letter', { y: 0 });
        gsap.set('.fyve-text:first-child', { x: '-100vw', visibility: 'hidden' });
        gsap.set('.fyve-text:last-child', { x: '100vw', visibility: 'hidden' });
        gsap.set('.fyve-image-container', { width: '100vw', height: '100vh' });
        gsap.set('.mobile-header', { opacity: 1 });
        gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
        gsap.set('.london-mask', { x: `${londonX}vw`, y: `${londonY + londonHeight}vw`, marginTop: `-${londonHeight}vw`, visibility: 'visible' });
        gsap.set('.london-mask .london-text:first-child', { x: '-100vw', transformOrigin: 'left center', visibility: 'hidden' });
        gsap.set('.london-mask .london-text:last-child', { x: '100vw', transformOrigin: 'right center', visibility: 'hidden' });
        gsap.set('.lottie-container', { opacity: 1 });
        gsap.set('.london-below', { opacity: 1 });
      } else {
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
        gsap.to('.fyve-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.fyve-text:first-child', { visibility: 'hidden' }) });
        gsap.to('.fyve-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.fyve-text:last-child', { visibility: 'hidden' }) });
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
        gsap.to('.london-mask .london-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.london-mask .london-text:first-child', { visibility: 'hidden' }) });
        gsap.to('.london-mask .london-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.london-mask .london-text:last-child', { visibility: 'hidden' }) });
        gsap.to('.london-mask', { marginTop: `-${londonHeight}vw`, y: `${londonY + londonHeight}vw`, duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.lottie-container', { 
          autoAlpha: 1, 
          duration: 0.8, 
          ease: 'expo.inOut', 
          delay: 2.8,
          onStart: () => {
            lottieRef.current?.play();
            console.log('Lottie internal animation played first time');
            setTimeout(() => {
              gsap.to('.london-below', { opacity: 1, duration: 0.5 });
              console.log('Fading in LONDON after initial play');
            }, londonFadeDelay);
          },
          onComplete: () => {
            introDone.current = true;
            console.log('Lottie container animation completed');
          }
        });
      }
    });

    hasAnimated.current = true;

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
        <div className="section1-image-container"></div>
        <div className="section1-overlay-text">
          Comfortably<br/>Modern,<br/>Distinctly<br/>British
        </div>
      </div>
    </div>
  );
};

export default Home;