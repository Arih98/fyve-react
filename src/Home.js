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
const heroRef = useRef(null);
const hasAnimated = useRef(false);
const introDone = useRef(false);
const [inViewRef, inView] = useInView({ triggerOnce: false, threshold: 0.5 });
const setHeroViewportRef = (node) => {
  heroRef.current = node;
  inViewRef(node);
};
const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000;
const londonFadeDelay = animationDuration * 0.3;
const animationStageRef = useRef(null);
const fyveMaskRef = useRef(null);
const fyveTextLeftRef = useRef(null);
const fyveTextRightRef = useRef(null);
const fyveLettersRef = useRef([]);
const fyveImageContainerRef = useRef(null);
const fyveImageRef = useRef(null);
const maskLeftRef = useRef(null);
const maskRightRef = useRef(null);
const londonMaskRef = useRef(null);
const londonTextLeftRef = useRef(null);
const londonTextRightRef = useRef(null);
const londonLettersRef = useRef([]);
const mobileLogoRef = useRef(null);
const lottieContainerRef = useRef(null);
const londonBelowRef = useRef(null);
fyveLettersRef.current = [];
londonLettersRef.current = [];

const addFyveLetterRef = (el) => {
  if (el && !fyveLettersRef.current.includes(el)) fyveLettersRef.current.push(el);
};

const addLondonLetterRef = (el) => {
  if (el && !londonLettersRef.current.includes(el)) londonLettersRef.current.push(el);
};

  useEffect(() => {
    if (lottieRef.current) {
      if (inView) {
        if (introDone.current) {
          lottieRef.current.play();
          setTimeout(() => {
            if (londonBelowRef.current) gsap.to(londonBelowRef.current, { opacity: 1, duration: 0.5 });
          }, londonFadeDelay);
        }
      } else {
        lottieRef.current.goToAndStop(0, true);
        if (londonBelowRef.current) gsap.set(londonBelowRef.current, { opacity: 0 });
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
    const mobileHeaderEl = document.querySelector('.mobile-header');

    const ctx = gsap.context(() => {
const isMobile = window.innerWidth <= 768;
const fyveMaskEl = fyveMaskRef.current;
const fyveTextLeftEl = fyveTextLeftRef.current;
const fyveTextRightEl = fyveTextRightRef.current;
const fyveLettersEls = fyveLettersRef.current;
const fyveImageContainerEl = fyveImageContainerRef.current;
const fyveImageEl = fyveImageRef.current;
const maskLeftEl = maskLeftRef.current;
const maskRightEl = maskRightRef.current;
const londonMaskEl = londonMaskRef.current;
const londonTextLeftEl = londonTextLeftRef.current;
const londonTextRightEl = londonTextRightRef.current;
const londonLettersEls = londonLettersRef.current;
const mobileLogoEl = mobileLogoRef.current;
const lottieContainerEl = lottieContainerRef.current;
const londonBelowEl = londonBelowRef.current;

gsap.to(".section1-img-overlay", {
  y: "-12vh",
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

      gsap.set(londonMaskEl, { visibility: 'visible' });
const londonMask = londonMaskEl;
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
        gsap.set(fyveMaskEl, { visibility: 'visible' });
gsap.set(fyveImageEl, { visibility: 'visible' });
gsap.set(maskLeftEl, { x: '-100%', transformOrigin: 'left center' });
gsap.set(maskRightEl, { x: '100%', transformOrigin: 'right center' });
gsap.set(fyveLettersEls, { y: 0 });
gsap.set(fyveTextLeftEl, { x: '-100vw', visibility: 'hidden' });
gsap.set(fyveTextRightEl, { x: '100vw', visibility: 'hidden' });
gsap.set(fyveImageContainerEl, { width: '100vw', height: finalHeight });
if (mobileLogoEl) gsap.set(mobileLogoEl, { opacity: 1 });
gsap.set([fyveTextLeftEl, fyveTextRightEl], { y: `${fyveTextY}vw` });
gsap.set(londonMaskEl, { x: `${londonX}vw`, y: `${londonY + londonHeight}vw`, marginTop: `-${londonHeight}vw`, visibility: 'visible' });
gsap.set(londonTextLeftEl, { x: '-100vw', transformOrigin: 'left center', visibility: 'hidden' });
gsap.set(londonTextRightEl, { x: '100vw', transformOrigin: 'right center', visibility: 'hidden' });
if (lottieContainerEl) gsap.set(lottieContainerEl, { opacity: 1 });
if (londonBelowEl) gsap.set(londonBelowEl, { opacity: 1 });
      } else {
        gsap.set(fyveMaskEl, { visibility: 'visible' });
gsap.set(maskLeftEl, { x: '0%', transformOrigin: 'left center' });
gsap.set(maskRightEl, { x: '0%', transformOrigin: 'right center' });
gsap.set(fyveImageEl, { visibility: 'visible' });
gsap.set([fyveTextLeftEl, fyveTextRightEl], { y: `${fyveTextY}vw` });
gsap.set(londonMaskEl, { x: `${londonX}vw`, y: `${londonY}vw`, visibility: 'visible' });
gsap.set(londonTextLeftEl, { x: '0%', transformOrigin: 'left center' });
gsap.set(londonTextRightEl, { x: '0%', transformOrigin: 'right center' });
if (lottieContainerEl) gsap.set(lottieContainerEl, { autoAlpha: 0 });
if (londonBelowEl) gsap.set(londonBelowEl, { opacity: 0 });
        gsap.fromTo(fyveLettersEls, { y: '100%' }, { y: 0, duration: 1.3, ease: 'expo.inOut' });
gsap.to(fyveTextLeftEl, { x: fyveMoveX, duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(fyveTextRightEl, { x: fyveMoveXEnd, duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(fyveTextLeftEl, { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set(fyveTextLeftEl, { visibility: 'hidden' }) });
gsap.to(fyveTextRightEl, { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set(fyveTextRightEl, { visibility: 'hidden' }) });
gsap.to(fyveImageContainerEl, { width: intermediateWidth, duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(maskLeftEl, { x: '-100%', duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(maskRightEl, { x: '100%', duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(fyveImageContainerEl, { width: '100vw', height: finalHeight, duration: 0.8, ease: 'expo.inOut', delay: 2 });
        if (mobileHeaderEl) gsap.set(mobileHeaderEl, { opacity: 0 });

        gsap.fromTo(londonLettersEls, { y: '100%' }, { y: 0, duration: 1.3, ease: 'expo.inOut' });
gsap.to(londonTextLeftEl, { x: londonMoveX, duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(londonTextRightEl, { x: londonMoveXEnd, duration: 0.8, ease: 'expo.inOut', delay: 1 });
gsap.to(londonTextLeftEl, { x: '-150vw', duration: 0.69, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set(londonTextLeftEl, { visibility: 'hidden' }) });
gsap.to(londonTextRightEl, { x: '150vw', duration: 0.69, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set(londonTextRightEl, { visibility: 'hidden' }) });
gsap.to(londonMaskEl, { marginTop: `-${londonHeight}vw`, y: `${londonY + londonHeight}vw`, duration: 0.8, ease: 'expo.inOut', delay: 2 });
        
if (mobileLogoEl) gsap.set(mobileLogoEl, { opacity: 0 });

if (mobileLogoEl) {
  gsap.to(mobileLogoEl, {
    opacity: 1,
    duration: 0.5,
    ease: 'expo.inOut',
    delay: 2.8
  });
}

if (lottieContainerEl) {
  gsap.to(lottieContainerEl, {
    autoAlpha: 1,
    duration: 0.8,
    ease: 'expo.inOut',
    delay: 2.8,
    onStart: () => {
      lottieRef.current?.play();
      setTimeout(() => {
        if (londonBelowEl) gsap.to(londonBelowEl, { opacity: 1, duration: 0.5 });
      }, londonFadeDelay);
    },
    onComplete: () => {
      introDone.current = true;
    }
  });
}
}
}, heroRef);

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
      <div className="fyve-hero-section">
  <div ref={setHeroViewportRef} className="fyve-hero-viewport">
    <div ref={animationStageRef} className="fyve-animation-stage">
      <div className="fyve-brand-layer">
        <div ref={fyveMaskRef} className="fyve-mask">
          <div ref={fyveTextLeftRef} className="fyve-text">
            {'FY'.split('').map((l, i) => (
              <span key={i} ref={addFyveLetterRef} className="fyve-letter">{l}</span>
            ))}
          </div>

          <div ref={fyveImageContainerRef} className="fyve-image-container">
            <picture>
              <source media="(max-width: 768px)" srcSet="/assets/home/fyve-london-hero-mobile.webp" />
              <img
                ref={fyveImageRef}
                src="/assets/home/fyve-london-hero.webp"
                alt="Reveal Image"
                className="fyve-image"
              />
            </picture>
            <div ref={maskLeftRef} className="mask-left"></div>
            <div ref={maskRightRef} className="mask-right"></div>
          </div>

          <div ref={fyveTextRightRef} className="fyve-text">
            {'VE'.split('').map((l, i) => (
              <span key={i + 2} ref={addFyveLetterRef} className="fyve-letter">{l}</span>
            ))}
          </div>
        </div>

        <div ref={londonMaskRef} className="london-mask">
          <div ref={londonTextLeftRef} className="london-text">
            {'LON'.split('').map((l, i) => (
              <span key={i} ref={addLondonLetterRef} className="london-letter">{l}</span>
            ))}
          </div>
          <div ref={londonTextRightRef} className="london-text">
            {'DON'.split('').map((l, i) => (
              <span key={i + 3} ref={addLondonLetterRef} className="london-letter">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="fyve-ui-layer">
      <div ref={mobileLogoRef} className="home-mobile-top-logo">
        <img src="/assets/FYVE-White-Logo.png" alt="FYVE Logo" />
      </div>

      <div ref={lottieContainerRef} className="lottie-container">
        <div className="lottie-animation-wrap">
          <Lottie
            lottieRef={lottieRef}
            animationData={FYVEHeroLottie}
            loop={false}
            autoplay={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div ref={londonBelowRef} className="london-below">LONDON</div>
      </div>
    </div>
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