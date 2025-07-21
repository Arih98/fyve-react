import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './Home.css';

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
  
    console.log('Setting fyve-mask visibility');
    gsap.set('.fyve-mask', { visibility: 'visible' });
    
    console.log('Setting initial mask positions');
    gsap.set('.mask-left', { x: '0%', transformOrigin: 'left center' });
    gsap.set('.mask-right', { x: '0%', transformOrigin: 'right center' });
    gsap.set('.fyve-image', { visibility: 'visible' });
    
    console.log('Starting letter reveal animation');
    gsap.fromTo(
      '.fyve-letter',
      { y: '100%' },
      { 
        y: 0, 
        duration: 0.8, 
        ease: 'expo.out',
        onStart: () => console.log('Letter reveal animation started'),
        onComplete: () => console.log('Letter reveal animation completed')
      }
    );
    
    console.log('Scheduling FY shift animation');
    gsap.to('.fyve-text:first-child', {
      x: '-0.3vw',
      duration: 0.8,
      ease: 'expo.out',
      delay: 1,
      onStart: () => console.log('FY shift animation started'),
      onComplete: () => console.log('FY shift animation completed')
    });
    
    console.log('Scheduling VE shift animation');
    gsap.to('.fyve-text:last-child', {
      x: '0.3vw',
      duration: 0.8,
      ease: 'expo.out',
      delay: 1,
      onStart: () => console.log('VE shift animation started'),
      onComplete: () => console.log('VE shift animation completed')
    });
    
    console.log('Scheduling image container expand');
    gsap.to('.fyve-image-container', {
      width: '14vw',
      duration: 0.8,
      ease: 'expo.out',
      delay: 1,
      onStart: () => console.log('Image container expand started'),
      onComplete: () => console.log('Image container expand completed')
    });
    
    console.log('Scheduling image mask reveal animation');
    gsap.to('.mask-left', {
      x: '-100%',
      duration: 0.8,
      ease: 'expo.out',
      delay: 1,
      onStart: () => console.log('Image mask left animation started'),
      onComplete: () => console.log('Image mask left animation completed')
    });
    gsap.to('.mask-right', {
      x: '100%',
      duration: 0.8,
      ease: 'expo.out',
      delay: 1,
      onStart: () => console.log('Image mask right animation started'),
      onComplete: () => console.log('Image mask right animation completed')
    });
  }, []);

  return (
    <div className="home-page">
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