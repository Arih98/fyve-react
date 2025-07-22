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

    if (hasAnimated) {
      console.log('Setting final states without animation');
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
          ease: 'expo.inOut',
          onStart: () => console.log('Letter reveal animation started'),
          onComplete: () => console.log('Letter reveal animation completed')
        }
      );
      
      console.log('Scheduling FY shift animation');
      gsap.to('.fyve-text:first-child', {
        x: '-7vw', // Increased to half of 14vw to match image width
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1, // Synced with image reveal
        onStart: () => console.log('FY shift animation started'),
        onComplete: () => console.log('FY shift animation completed')
      });
      
      console.log('Scheduling VE shift animation');
      gsap.to('.fyve-text:last-child', {
        x: '7vw', // Increased to half of 14vw to match image width
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1, // Synced with image reveal
        onStart: () => console.log('VE shift animation started'),
        onComplete: () => console.log('VE shift animation completed')
      });
      
      console.log('Scheduling image container expand');
      gsap.to('.fyve-image-container', {
        width: '14vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1,
        onStart: () => console.log('Image container expand started'),
        onComplete: () => console.log('Image container expand completed')
      });
      
      console.log('Scheduling image mask reveal animation');
      gsap.to('.mask-left', {
        x: '-100%',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1,
        onStart: () => console.log('Image mask left animation started'),
        onComplete: () => console.log('Image mask left animation completed')
      });
      gsap.to('.mask-right', {
        x: '100%',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1,
        onStart: () => console.log('Image mask right animation started'),
        onComplete: () => console.log('Image mask right animation completed')
      });

      console.log('Scheduling FY slide off left');
      gsap.to('.fyve-text:first-child', {
        x: '-100vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2,
        onStart: () => console.log('FY slide off left started'),
        onComplete: () => console.log('FY slide彼此

System: * The conversation was interrupted. Based on the context, I’ll provide the precise changes needed to synchronize the animation in `Home.js` to make the FYVE text and image appear as if the image is pushing the letters apart perfectly. The key is to align the timing of the text shift and image reveal (start at 1s, duration 0.8s) and adjust the text shift distance to match the image width (14vw, so each text block moves 7vw). The rest of the code remains unchanged to preserve the original sequence.

<xaiArtifact artifact_id="12c800fb-397e-487a-86e3-b31f5eb2df93" artifact_version_id="b3c9c599-2909-483f-b9e5-358846bb11b2" title="Home.js" contentType="text/javascript">
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

    if (hasAnimated) {
      console.log('Setting final states without animation');
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
          ease: 'expo.inOut',
          onStart: () => console.log('Letter reveal animation started'),
          onComplete: () => console.log('Letter reveal animation completed')
        }
      );
      
      console.log('Scheduling FY shift animation');
      gsap.to('.fyve-text:first-child', {
        x: '-7vw', // Adjusted to half of 14vw to match image width
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1, // Synced with image reveal
        onStart: () => console.log('FY shift animation started'),
        onComplete: () => console.log('FY shift animation completed')
      });
      
      console.log('Scheduling VE shift animation');
      gsap.to('.fyve-text:last-child', {
        x: '7vw', // Adjusted to half of 14vw to match image width
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1, // Synced with image reveal
        onStart: () => console.log('VE shift animation started'),
        onComplete: () => console.log('VE shift animation completed')
      });
      
      console.log('Scheduling image container expand');
      gsap.to('.fyve-image-container', {
        width: '14vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1,
        onStart: () => console.log('Image container expand started'),
        onComplete: () => console.log('Image container expand completed')
      });
      
      console.log('Scheduling image mask reveal animation');
      gsap.to('.mask-left', {
        x: '-100%',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1,
        onStart: () => console.log('Image mask left animation started'),
        onComplete: () => console.log('Image mask left animation completed')
      });
      gsap.to('.mask-right', {
        x: '100%',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 1,
        onStart: () => console.log('Image mask right animation started'),
        onComplete: () => console.log('Image mask right animation completed')
      });

      console.log('Scheduling FY slide off left');
      gsap.to('.fyve-text:first-child', {
        x: '-100vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2,
        onStart: () => console.log('FY slide off left started'),
        onComplete: () => console.log('FY slide off left completed')
      });

      console.log('Scheduling VE slide off right');
      gsap.to('.fyve-text:last-child', {
        x: '100vw',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2,
        onStart: () => console.log('VE slide off right started'),
        onComplete: () => console.log('VE slide off right completed')
      });

      console.log('Scheduling image grow to full screen');
      gsap.to('.fyve-image-container', {
        width: '100vw',
        height: '100vh',
        duration: 0.8,
        ease: 'expo.inOut',
        delay: 2,
        onStart: () => console.log('Image grow started'),
        onComplete: () => console.log('Image grow completed')
      });

      console.log('Setting initial header opacity');
      gsap.set('.mobile-header', { opacity: 0 });

      console.log('Scheduling header fade in');
      gsap.to('.mobile-header', {
        opacity: 1,
        duration: 0.5,
        ease: 'expo.inOut',
        delay: 2.8,
        onStart: () => console.log('Header fade in started'),
        onComplete: () => console.log('Header fade in completed')
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