// Home.js
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(Observer, ScrollTrigger);

const Home = () => {
  const lottieRef = useRef();
  const hasAnimated = useRef(false);
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
    const refreshScroll = () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        setTimeout(() => ScrollTrigger.refresh(), 250);
      });
    };

    window.addEventListener('load', refreshScroll);

    const images = Array.from(document.querySelectorAll('img'));
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', refreshScroll);
      }
    });

    return () => {
      window.removeEventListener('load', refreshScroll);
      images.forEach((img) => {
        img.removeEventListener('load', refreshScroll);
      });
    };
  }, []);

  useEffect(() => {
    hasAnimated.current = false;
    introDone.current = false;

    const isMobile = window.innerWidth <= 768;
    const finalHeight = isMobile ? '94vh' : '100vh';
    const intermediateWidth = isMobile ? '30vw' : '18vw';

    const ctx = gsap.context(() => {
const isMobile = window.innerWidth <= 768;

gsap.to(".section1-img-overlay", {
  y: -150,
  ease: "none",
  immediateRender: false,
  scrollTrigger: {
    trigger: ".section-1",
    start: isMobile ? "top 75%" : "top bottom",
    end: "bottom top",
    scrub: true,
    invalidateOnRefresh: true
  }
});

      gsap.set('.london-mask', { visibility: 'visible' });
      const londonMask = document.querySelector('.london-mask');
      let londonHeight = 0;

      if (londonMask) {
        const londonHeightPx = londonMask.offsetHeight;
        const vwFactor = window.innerWidth / 100;
        londonHeight = londonHeightPx / vwFactor;
      }

      let rotation = 0;
      const stamp = document.querySelector('.section1-stamp');

      if (stamp) {
        Observer.create({
          type: "wheel,touch,scroll",
          onDown: () => {
            rotation -= 5;
            gsap.to(stamp, { rotation, duration: 0.1, overwrite: true });
          },
          onUp: () => {
            rotation += 5;
            gsap.to(stamp, { rotation, duration: 0.1, overwrite: true });
          },
          tolerance: 10,
          preventDefault: false
        });
      }

      const fyveTextY = -1.11;
      const londonX = 1.3;
      const londonY = isMobile ? -14.41 : -1.41;
      const fyveMoveX = isMobile ? '-5px' : '-0.4vw';
      const fyveMoveXEnd = isMobile ? '5px' : '0.4vw';
      const londonMoveX = isMobile ? '-70px' : '-8.9vw';
      const londonMoveXEnd = isMobile ? '70px' : '8.9vw';

      if (hasAnimated.current) {
        gsap.set('.fyve-mask', { visibility: 'visible' });
        gsap.set('.fyve-image', { visibility: 'visible' });
        gsap.set('.mask-left', { x: '-100%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '100%', transformOrigin: 'right center' });
        gsap.set('.fyve-letter', { y: 0 });
        gsap.set('.fyve-text:first-child', { x: '-100vw', visibility: 'hidden' });
        gsap.set('.fyve-text:last-child', { x: '100vw', visibility: 'hidden' });
        gsap.set('.fyve-image-container', { width: '100vw', height: finalHeight });
        gsap.set('.mobile-header, .home-mobile-top-logo', { opacity: 1 });
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
        gsap.set('.london-mask .london-text:first-child', { x: '0%', transformOrigin: 'left center' });
        gsap.set('.london-mask .london-text:last-child', { x: '0%', transformOrigin: 'right center' });
        gsap.set('.lottie-container', { autoAlpha: 0 });
        gsap.set('.london-below', { opacity: 0 });
        gsap.fromTo('.fyve-letter', { y: '100%' }, { y: 0, duration: 1.3, ease: 'expo.inOut' });
        gsap.to('.fyve-text:first-child', { x: fyveMoveX, duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.fyve-text:last-child', { x: fyveMoveXEnd, duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.fyve-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.fyve-text:first-child', { visibility: 'hidden' }) });
        gsap.to('.fyve-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.fyve-text:last-child', { visibility: 'hidden' }) });
        gsap.to('.fyve-image-container', { width: intermediateWidth, duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.mask-left', { x: '-100%', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.mask-right', { x: '100%', duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.fyve-image-container', { width: '100vw', height: finalHeight, duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.set('.mobile-header, .home-mobile-top-logo', { opacity: 0 });
        gsap.to('.mobile-header, .home-mobile-top-logo', {
          opacity: 1,
          duration: 0.5,
          ease: 'expo.inOut',
          delay: 2.8
        });
        gsap.fromTo('.london-letter', { y: '100%' }, { y: 0, duration: 1.3, ease: 'expo.inOut' });
        gsap.to('.london-mask .london-text:first-child', { x: londonMoveX, duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.london-mask .london-text:last-child', { x: londonMoveXEnd, duration: 0.8, ease: 'expo.inOut', delay: 1 });
        gsap.to('.london-mask .london-text:first-child', { x: '-150vw', duration: 0.69, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.london-mask .london-text:first-child', { visibility: 'hidden' }) });
        gsap.to('.london-mask .london-text:last-child', { x: '150vw', duration: 0.69, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.london-mask .london-text:last-child', { visibility: 'hidden' }) });
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
          },
          onComplete: () => {
            introDone.current = true;
          }
        });
      }
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      setTimeout(() => ScrollTrigger.refresh(), 250);
    });

    hasAnimated.current = true;

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Fyve London",
            url: "https://fyvelondon.com",
            logo: "https://fyvelondon.com/api/Uploads/your-logo-file.png",
            sameAs: [
              "https://www.instagram.com/fyvelondon"
            ]
          })
        }}
      />
      <div className="fyve-wrapper">
        <div className="home-mobile-top-logo">
          <img src="/assets/FYVE-White-Logo.png" alt="FYVE Logo" />
        </div>

        <div className="fyve-mask">
          <div className="fyve-text">
            {'FY'.split('').map((l, i) => <span key={i} className="fyve-letter">{l}</span>)}
          </div>
          <div className="fyve-image-container">
            <picture>
              <source media="(max-width: 768px)" srcSet="/assets/home/fyve-london-hero-mobile.webp" />
              <img src="/assets/home/fyve-london-hero.webp" alt="Reveal Image" className="fyve-image" />
            </picture>

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
        <div className="section1-content">
          <div className="section1-left">
<div className="section1-overlay-text">
  Comfortably Modern, Distinctly British.
</div>

  <div className="section1-bottom-content">
    <p className="section1-body-text">
      Discover our exquisite luxury children’s clothing, comfortably modern and distinctly British, blending timeless elegance with everyday comfort for little ones.
    </p>

    <a href="https://dev.fyvelondon.com/products?category=ss25" className="section1-shop-button">
      Shop Collection
      <img src="/assets/FYVE-button-Arrow-Icon-white.svg" alt="" />
    </a>
  </div>
</div>

          <div className="section1-right">
            <div className="section1-image-stack">
              <img
                src="/assets/home/fyve-girls-british-dress.webp"
                alt="Modern British children's fashion by Fyve London"
                className="section1-img-main"
              />

              <div className="section1-img-overlay-wrap">
                <img
                  src="/assets/home/fyve-detail-british-childrens-fashion.webp"
                  alt="Detail of premium children's clothing by Fyve London"
                  className="section1-img-overlay"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
<div className="section-2">
  <picture className="section2-bg-picture">
  <source media="(max-width: 768px)" srcSet="/assets/home/FYVE-SS26-WF767233.webp" />
  <img
    src="/assets/home/FYVE-SS26-WF7672.webp"
    alt=""
    className="section2-bg-image"
  />
</picture>

  <div className="section2-inner">
    <div className="section2-title">SS26</div>

    <div className="section2-mobile-content">
      <div className="section2-text">
        Timeless Elegance,<br />
        Playfully Refined.
      </div>

      <a href="https://dev.fyvelondon.com/products?category=ss26" className="section1-shop-button section2-shop-button">
        Shop Collection
        <img src="/assets/FYVE-button-Arrow-Icon-white.svg" alt="" />
      </a>
    </div>
  </div>
</div>
      </div>
  );
};

export default Home;