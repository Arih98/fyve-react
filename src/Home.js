import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import HomeHeader from './HomeHeader';
import './Home.css';

let hasAnimated = false;

const Home = () => {
  useEffect(() => {
    console.log('Home component mounted');
    
    const image = new Image();
    image.src = '/api/Uploads/LOOK-2_137-e1743957431674.webp';
    
    image.onload = () => {
      console.log('Image loaded successfully:', image.src);
      
      const imgElement = document.querySelector('.fyve-image');
      if (imgElement) {
        console.log('Image element found:', imgElement);
        console.log('Image src:', imgElement.src);
      } else {
        console.error('Image element not found');
      }

      if (hasAnimated) {
        console.log('Setting final states without animation');
        gsap.set('.fyve-mask', { visibility: 'visible', delay: 0.1 });
        gsap.set('.fyve-image', { visibility: 'hidden' }); // Hide image initially
        gsap.set('.mask-left', { x: '-100%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '100%', transformOrigin: 'right center' });
        gsap.set('.fyve-letter', { y: 0 });
        gsap.set('.fyve-text:first-child', { x: '-100vw' });
        gsap.set('.fyve-text:last-child', { x: '100vw' });
        gsap.set('.fyve-image-container', { width: '100vw', height: '100vh' });
        gsap.set('.mobile-header', { opacity: 1 });
      } else {
        console.log('Setting fyve-mask visibility');
        gsap.set('.fyve-mask', { visibility: 'visible', delay: 0.1 });
        gsap.set('.fyve-image', { visibility: 'hidden' }); // Hide image initially
        gsap.set('.mobile-header', { opacity: 0 }); // Hide header initially
        
        console.log('Setting initial mask positions');
        gsap.set('.mask-left', { x: '0%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '0%', transformOrigin: 'right center' });
        
        const tl = gsap.timeline();
        console.log('Starting letter reveal animation');
        tl.fromTo(
          '.fyve-letter',
          { y: '100%' },
          { 
            y: 0, 
            duration: 2.8, 
            ease: 'expo.inOut',
            onStart: () => console.log('Letter reveal animation started'),
            onComplete: () => console.log('Letter reveal animation completed')
          }
        )
        .to('.fyve-text:first-child', {
          x: '-0.3vw',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('FY shift animation started'),
          onComplete: () => console.log('FY shift animation completed')
        }, '-=1.6')
        .to('.fyve-text:last-child', {
          x: '0.3vw',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('VE shift animation started'),
          onComplete: () => console.log('VE shift animation completed')
        }, '<')
        .to('.fyve-image-container', {
          width: '14vw',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => {
            console.log('Image container expand started');
            gsap.set('.fyve-image', { visibility: 'visible' }); // Show image when container expands
          },
          onComplete: () => console.log('Image container expand completed')
        }, '<')
        .to('.mask-left', {
          x: '-100%',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('Image mask left animation started'),
          onComplete: () => console.log('Image mask left animation completed')
        }, '<')
        .to('.mask-right', {
          x: '100%',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('Image mask right animation started'),
          onComplete: () => console.log('Image mask right animation completed')
        }, '<')
        .to('.fyve-text:first-child', {
          x: '-100vw',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('FY slide off left started'),
          onComplete: () => console.log('FY slide off left completed')
        })
        .to('.fyve-text:last-child', {
          x: '100vw',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('VE slide off right started'),
          onComplete: () => console.log('VE slide off right completed')
        }, '<')
        .to('.fyve-image-container', {
          width: '100vw',
          height: '100vh',
          duration: 2.8,
          ease: 'expo.inOut',
          onStart: () => console.log('Image grow started'),
          onComplete: () => console.log('Image grow completed')
        }, '<')
        .to('.mobile-header', {
          opacity: 1,
          duration: 0.5,
          ease: 'expo.inOut',
          onStart: () => console.log('Header fade in started'),
          onComplete: () => console.log('Header fade in completed')
        });
      }

      hasAnimated = true;
    };
    
    image.onerror = () => console.error('Image failed to load:', image.src);
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