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

  useEffect(() => {
  if (!lottieRef.current || !introDone.current) return;

  if (inView) {
    gsap.killTweensOf('.london-below');
    gsap.set('.london-below', { opacity: 0 });
    lottieRef.current.goToAndStop(0, true);
    lottieRef.current.play();
    gsap.to('.london-below', {
      opacity: 1,
      duration: 0.5,
      delay: londonFadeDelay / 1000
    });
  } else {
    lottieRef.current.goToAndStop(0, true);
    gsap.killTweensOf('.london-below');
    gsap.set('.london-below', { opacity: 0 });
  }
}, [inView, londonFadeDelay]);

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
  introDone.current = false;

  const speed = 1.35;

  const ctx = gsap.context(() => {
    const isMobile = window.innerWidth <= 768;
    const finalHeight = isMobile ? '100svh' : '100vh';
    const intermediateWidth = isMobile ? '28vw' : '18vw';
    const fyveTextY = -1.11;
    const londonX = 1.3;
    const londonY = isMobile ? 12 : 5;
    const fyveMoveX = isMobile ? '-5px' : '-0.4vw';
    const fyveMoveXEnd = isMobile ? '5px' : '0.4vw';
    const londonMoveX = isMobile ? '-55px' : '-8.9vw';
    const londonMoveXEnd = isMobile ? '55px' : '8.9vw';
    const mobileHeaderEl = document.querySelector('.mobile-header');
    const announcementBarEl = document.querySelector('.announcement-bar');
    const announcementHeight = announcementBarEl ? announcementBarEl.offsetHeight : 0;

    if (hasAnimated.current) {
      gsap.set('.fyve-mask', { visibility: 'visible', xPercent: -50, yPercent: -50 });
      gsap.set('.fyve-image', { scale: 1, transformOrigin: 'center center' });
gsap.set('.fyve-image-clip', {
  clipPath: 'inset(0% 0% 0% 0%)',
  WebkitClipPath: 'inset(0% 0% 0% 0%)'
});
      gsap.set('.fyve-letter', { y: 0 });
      gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
      gsap.set('.fyve-text:first-child', { x: '-100vw', visibility: 'hidden' });
      gsap.set('.fyve-text:last-child', { x: '100vw', visibility: 'hidden' });
      gsap.set('.fyve-image-container', { width: '100vw', height: finalHeight });
      gsap.set('.london-mask', {
        xPercent: -50,
        yPercent: -50,
        x: `${londonX}vw`,
        y: `${londonY}vw`,
        marginTop: 0,
        visibility: 'visible'
      });
      gsap.set('.london-mask .london-text:first-child', { x: '-135vw', visibility: 'hidden' });
      gsap.set('.london-mask .london-text:last-child', { x: '135vw', visibility: 'hidden' });
      gsap.set('.lottie-container', { autoAlpha: 1 });
      gsap.set('.london-below', { opacity: 1 });
      gsap.set(document.documentElement, { '--home-announcement-offset': `${announcementHeight}px` });
      if (mobileHeaderEl) gsap.set(mobileHeaderEl, { opacity: 1 });
      if (announcementBarEl) gsap.set(announcementBarEl, { opacity: 1, y: 0 });
      gsap.set('.home-mobile-top-logo', { opacity: 1 });
      introDone.current = true;
      return;
    }

    gsap.set('.fyve-mask', { visibility: 'visible', xPercent: -50, yPercent: -50 });
    gsap.set('.fyve-image', { scale: 0.35, transformOrigin: 'center center' });
gsap.set('.fyve-image-clip', {
  clipPath: 'inset(50% 50% 50% 50%)',
  WebkitClipPath: 'inset(50% 50% 50% 50%)'
});
gsap.set('.fyve-image-container', { width: intermediateWidth, height: isMobile ? '50vw' : '14vw' });
    gsap.set('.fyve-text', { y: `${fyveTextY}vw` });
    gsap.set('.london-mask', {
      xPercent: -50,
      yPercent: -50,
      x: `${londonX}vw`,
      y: `${londonY}vw`,
      marginTop: 0,
      visibility: 'visible'
    });
    gsap.set('.london-mask .london-text:first-child', { x: '0%', transformOrigin: 'left center' });
    gsap.set('.london-mask .london-text:last-child', { x: '0%', transformOrigin: 'right center' });
    gsap.set('.lottie-container', { autoAlpha: 0 });
    gsap.set('.london-below', { opacity: 0 });
    gsap.set(document.documentElement, { '--home-announcement-offset': '0px' });

    if (mobileHeaderEl) gsap.set(mobileHeaderEl, { opacity: 0 });

    if (announcementBarEl) {
      if (isMobile) {
        gsap.set(announcementBarEl, { opacity: 1, y: -announcementHeight });
      } else {
        gsap.set(announcementBarEl, { opacity: 0, y: 0 });
      }
    }

    gsap.set('.home-mobile-top-logo', { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => {
        introDone.current = true;
      }
    });

    tl.addLabel('lettersIn')
      .fromTo('.fyve-letter', { y: '100%' }, { y: 0, duration: 1.3 * speed }, 'lettersIn')
      .fromTo('.london-letter', { y: '100%' }, { y: 0, duration: 1.3 * speed }, 'lettersIn+=0.35')

      .addLabel('splitOpen', 1 * speed)
.to('.fyve-text:first-child', { x: fyveMoveX, duration: 0.8 * speed }, 'splitOpen')
.to('.fyve-text:last-child', { x: fyveMoveXEnd, duration: 0.8 * speed }, 'splitOpen')
.to('.fyve-image-clip', {
  clipPath: 'inset(0% 0% 0% 0%)',
  WebkitClipPath: 'inset(0% 0% 0% 0%)',
  duration: 0.8 * speed,
  ease: 'expo.inOut'
}, 'splitOpen+=0.2')
.to('.fyve-image', {
  scale: 1.02,
  duration: 0.8 * speed,
  ease: 'expo.inOut'
}, 'splitOpen+=0.2')
.to('.london-mask .london-text:first-child', { x: londonMoveX, duration: 0.8 * speed }, 'splitOpen+=0.2')
.to('.london-mask .london-text:last-child', { x: londonMoveXEnd, duration: 0.8 * speed }, 'splitOpen+=0.2')

      .addLabel('expandOut', 2 * speed)
      .to('.fyve-text:first-child', {
        x: '-100vw',
        duration: 0.8 * speed,
        onComplete: () => gsap.set('.fyve-text:first-child', { visibility: 'hidden' })
      }, 'expandOut')
      .to('.fyve-text:last-child', {
        x: '100vw',
        duration: 0.8 * speed,
        onComplete: () => gsap.set('.fyve-text:last-child', { visibility: 'hidden' })
      }, 'expandOut')
      .to('.fyve-image-container', {
        width: '100vw',
        height: finalHeight,
        duration: 0.8 * speed
      }, 'expandOut')
      .to('.fyve-image', {
  scale: 1,
  duration: 0.8 * speed,
  ease: 'expo.inOut'
}, 'expandOut')

      .to('.london-mask .london-text:first-child', {
        x: '-135vw',
        duration: 0.95 * speed,
        ease: 'power2.inOut',
        onComplete: () => gsap.set('.london-mask .london-text:first-child', { visibility: 'hidden' })
      }, 'expandOut')
      .to('.london-mask .london-text:last-child', {
        x: '135vw',
        duration: 0.95 * speed,
        ease: 'power2.inOut',
        onComplete: () => gsap.set('.london-mask .london-text:last-child', { visibility: 'hidden' })
      }, 'expandOut')

      .addLabel('uiReveal', 2.35 * speed)
      .to(document.documentElement, {
        '--home-announcement-offset': `${announcementHeight}px`,
        duration: 0.9 * speed
      }, 'uiReveal')

    if (announcementBarEl) {
      if (isMobile) {
        tl.to(announcementBarEl, {
          y: 0,
          duration: 0.9 * speed
        }, 'uiReveal');
      } else {
        tl.to(announcementBarEl, {
          opacity: 1,
          duration: 0.6 * speed
        }, 'uiReveal+=0.4');
      }
    }

    if (mobileHeaderEl) {
      tl.to(mobileHeaderEl, {
        opacity: 1,
        duration: 0.7 * speed
      }, 'uiReveal+=0.75');
    }

    tl.to('.home-mobile-top-logo', {
      opacity: 1,
      duration: 0.5 * speed
    }, 'uiReveal+=0.45')

    .addLabel('lottieIn', 2.8 * speed)
    .to('.lottie-container', {
      autoAlpha: 1,
      duration: 0.8 * speed,
      onStart: () => {
        lottieRef.current?.play();
      }
    }, 'lottieIn')
    .to('.london-below', {
      opacity: 1,
      duration: 0.5 * speed
    }, `lottieIn+=${londonFadeDelay / 1000}`);
  }, heroRef);

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 250);
  });

  hasAnimated.current = true;

  return () => {
    ctx.revert();
    document.documentElement.style.removeProperty('--home-announcement-offset');
  };
}, []);

useEffect(() => {
  const ctx = gsap.context(() => {
    const isMobile = window.innerWidth <= 768;

    gsap.to('.section1-img-overlay', {
      y: '-12vh',
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: '.section-1',
        start: isMobile ? 'top 75%' : 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    let rotation = 0;
    const stamp = document.querySelector('.section1-stamp');

    if (stamp) {
      Observer.create({
        type: 'wheel,touch,scroll',
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
  });

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
  <div className="fyve-animation-stage">
      <div className="fyve-brand-layer">
        <div className="fyve-mask">
          <div className="fyve-text">
            {'FY'.split('').map((l, i) => <span key={i} className="fyve-letter">{l}</span>)}
          </div>
<div className="fyve-image-container">
  <div className="fyve-image-clip">
    <picture>
      <source media="(max-width: 768px)" srcSet="/assets/home/fyve-london-hero-mobile.webp" />
      <img src="/assets/home/fyve-london-hero.webp" alt="Reveal Image" className="fyve-image" />
    </picture>
  </div>
</div>
          <div className="fyve-text">
            {'VE'.split('').map((l, i) => <span key={i + 2} className="fyve-letter">{l}</span>)}
          </div>
        </div>

        <div className="london-mask">
          <div className="london-text">
            {'LON'.split('').map((l, i) => <span key={i} className="london-letter">{l}</span>)}
          </div>
          <div className="london-text">
            {'DON'.split('').map((l, i) => <span key={i + 3} className="london-letter">{l}</span>)}
          </div>
        </div>
      </div>
    </div>

    <div className="fyve-ui-layer">
      <div className="home-mobile-top-logo">
        <img src="/assets/FYVE-White-Logo.png" alt="FYVE Logo" />
      </div>

      <div className="lottie-container">
  <div className="lottie-animation-wrap">
    <Lottie
      lottieRef={lottieRef}
      animationData={FYVEHeroLottie}
      loop={false}
      autoplay={false}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
  <div className="london-below">LONDON</div>
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

    <a href="https://dev.fyvelondon.com/products?category=ss26" className="section1-shop-button">
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