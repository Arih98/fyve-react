import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import HomeHeader from './HomeHeader';
import './Home.css';

let hasAnimated = false;

const Home = () => {
  useEffect(() => {
    console.log('Home component mounted');
    
    const image = document.querySelector('.fyve-image');
    if (image) {
      console.log('Image element found:', image);
      console.log('Image src:', image.src);
      image.onerror = () => console.error('Image failed to load:', image.src);
      image.onload = () => console.log('Image loaded successfully:', image.src);
    } else {
      console.error('Image element not found');
    }

    const homePage = document.querySelector('.home-page');
    const mask = document.querySelector('.fyve-mask');
    const container = document.querySelector('.fyve-image-container');
    const imageEl = document.querySelector('.fyve-image');
    console.log('Viewport innerWidth:', window.innerWidth, 'document.clientWidth:', document.documentElement.clientWidth);
    if (homePage) console.log('home-page rect', homePage.getBoundingClientRect());
    if (mask) console.log('mask rect', mask.getBoundingClientRect());
    if (container) console.log('container rect', container.getBoundingClientRect());
    if (imageEl) console.log('image rect', imageEl.getBoundingClientRect());

    if (hasAnimated) {
      gsap.set('.fyve-mask', { visibility: 'visible' });
      gsap.set('.fyve-image', { visibility: 'visible' });
      gsap.set('.mask-left', { x: '-100%', transformOrigin: 'left center' });
      gsap.set('.mask-right', { x: '100%', transformOrigin: 'right center' });
      gsap.set('.fyve-letter', { y: 0 });
      gsap.set('.fyve-text:first-child', { x: '-100vw' });
      gsap.set('.fyve-text:last-child', { x: '100vw' });
      gsap.set('.fyve-image-container', { width: '100vw', height: '100vh' });
      gsap.set('.mobile-header', { opacity: 1 });
    } else {
      gsap.set('.fyve-mask', { visibility: 'visible' });
      gsap.set('.mask-left', { x: '0%', transformOrigin: 'left center' });
      gsap.set('.mask-right', { x: '0%', transformOrigin: 'right center' });
      gsap.set('.fyve-image', { visibility: 'visible' });
      
      gsap.fromTo(
        '.fyve-letter',
        { y: '100%' },
        { y: 0, duration: 0.8, ease: 'expo.inOut' }
      );
      
      gsap.to('.fyve-text:first-child', {
        x: '-0.3vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1.2
      });
      
      gsap.to('.fyve-text:last-child', {
        x: '0.3vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1.2
      });
      
      gsap.to('.fyve-image-container', {
        width: '14vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1
      });
      
      gsap.to('.mask-left', {
        x: '-100%',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1
      });
      gsap.to('.mask-right', {
        x: '100%',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1
      });

      gsap.to('.fyve-text:first-child', {
        x: '-100vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2
      });

      gsap.to('.fyve-text:last-child', {
        x: '100vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2
      });

      gsap.to('.fyve-image-container', {
        width: '100vw',
        height: '100vh',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2,
        onStart: () => gsap.set('.fyve-image-container', { transformOrigin: 'top left' }),
        onComplete: () => {
          gsap.set('.fyve-mask', {
            transform: 'none',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            display: 'block'
          });
          gsap.set('.fyve-text', { display: 'none' });
          gsap.set('.fyve-image-container', {
            clearProps: 'transform,transformOrigin',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            x: 0,
            y: 0
          });
        }
      });

      gsap.set('.mobile-header', { opacity: 0 });

      gsap.to('.mobile-header', {
        opacity: 1,
        duration: 0.5,
        ease: 'expo.inOut',
        delay: 2.8
      });
    }

    hasAnimated = true;
  }, []);

  return (
    <div className="home-page">
      <HomeHeader />
      <div className="fyve-mask">
        <div className="fyve-text">
          {'FY'.split('').map((letter, index) => (
            <span key={index} className="fyve-letter">{letter}</span>
          ))}
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
          {'VE'.split('').map((letter, index) => (
            <span key={index + 2} className="fyve-letter">{letter}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
