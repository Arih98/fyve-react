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
    
    console.log('Setting initial image scale and visibility');
    gsap.set('.fyve-image', { scaleX: 0, transformOrigin: 'center', visibility: 'visible' });
    
    console.log('Starting letter reveal animation');
    gsap.fromTo(
      '.fyve-letter',
      { y: '100%' },
      { 
        y: 0, 
        duration: 0.8, 
        ease: 'power2.out',
        onStart: () => console.log('Letter reveal animation started'),
        onComplete: () => console.log('Letter reveal animation completed')
      }
    );
    
    console.log('Scheduling FY shift animation');
    gsap.to('.fyve-letter:nth-child(1), .fyve-letter:nth-child(2)', {
      x: -100,
      duration: 0.8,
      ease: 'power2.out',
      delay: 1,
      onStart: () => console.log('FY shift animation started'),
      onComplete: () => console.log('FY shift animation completed')
    });
    
    console.log('Scheduling VE shift animation');
    gsap.to('.fyve-letter:nth-child(3), .fyve-letter:nth-child(4)', {
      x: 100,
      duration: 0.8,
      ease: 'power2.out',
      delay: 1,
      onStart: () => console.log('VE shift animation started'),
      onComplete: () => console.log('VE shift animation completed')
    });
    
    console.log('Scheduling image reveal animation');
    gsap.to('.fyve-image', {
      scaleX: 1,
      duration: 0.8,
      ease: 'power2.out',
      delay: 1,
      onStart: () => console.log('Image reveal animation started'),
      onComplete: () => console.log('Image reveal animation completed')
    });
  }, []);

  return (
    <div className="home-page">
      <div className="fyve-mask">
        <div className="fyve-text">
          {'FYVE'.split('').map((letter, index) => (
            <span key={index} className="fyve-letter">{letter}</span>
          ))}
        </div>
        <img
          src="/api/Uploads/LOOK-2_137-e1743957431674.webp"
          alt="Reveal Image"
          className="fyve-image"
        />
      </div>
    </div>
  );
};

export default Home;