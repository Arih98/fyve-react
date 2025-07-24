// HomePageAnimations.js
import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './HomePageAnimations.css';

const HomePageAnimations = ({ onIntroComplete }) => {
  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries.length > 0 ? navEntries[0].type : 'navigate';
    const shouldAnimate = navType !== 'back_forward';

    if (shouldAnimate) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    }

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
      gsap.set('.fyve-mask', { visibility: 'visible' });
      gsap.set('.fyve-image', { visibility: 'visible' });
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

      if (!shouldAnimate) {
        gsap.set('.mask-left', { x: '-100%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '100%', transformOrigin: 'right center' });
        gsap.set('.fyve-letter', { y: 0 });
        gsap.set('.fyve-text:first-child', { x: '-100vw' });
        gsap.set('.fyve-text:last-child', { x: '100vw' });
        gsap.set('.fyve-image-container', { width: '100vw', height: '100vh' });
        gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
        gsap.set('.london-mask', { x: `${londonX}vw`, y: `${londonY + londonHeight}vw`, marginTop: `-${londonHeight}vw` });
        gsap.set('.london-mask .london-text:first-child', { x: '-100vw', transformOrigin: 'left center' });
        gsap.set('.london-mask .london-text:last-child', { x: '100vw', transformOrigin: 'right center' });
        gsap.set('.london-letter', { y: 0 });
      } else {
        gsap.set('.mask-left', { x: '0%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '0%', transformOrigin: 'right center' });
        gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
        gsap.set('.london-mask', { x: `${londonX}vw`, y: `${londonY}vw` });
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
        gsap.fromTo(
          '.london-letter',
          { y: '100%' },
          { y: 0, duration: 1.3, ease: 'expo.inOut' }
        );
        gsap.to('.london-mask .london-text:first-child', { x: '-8.9vw', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.london-mask .london-text:last-child', { x: '8.9vw', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.london-mask .london-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.london-mask .london-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.london-mask', { marginTop: `-${londonHeight}vw`, y: `${londonY + londonHeight}vw`, duration: 0.8, ease: 'expo.inOut', delay: 2,
          onComplete: () => {
            if (onIntroComplete) onIntroComplete();
          }
        });
      }
    });

    return () => ctx.revert();
  }, [onIntroComplete]);

  return (
    <>
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
    </>
  );
};

export default HomePageAnimations;