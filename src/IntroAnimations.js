import { gsap } from 'gsap';

export const setupFYVEAndLondonAnimations = (londonHeight, fyveTextY, londonX, londonY) => {
  gsap.set('.fyve-mask', { visibility: 'visible' });
  gsap.set('.mask-left', { x: '0%', transformOrigin: 'left center' });
  gsap.set('.mask-right', { x: '0%', transformOrigin: 'right center' });
  gsap.set('.fyve-image', { visibility: 'visible' });
  gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
  gsap.set('.london-mask', { x: `${londonX}vw`, y: `${londonY}vw`, visibility: 'visible' });
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
};