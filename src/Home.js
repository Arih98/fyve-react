import React, { useEffect, useRef, useContext } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import HomeHeader from './HomeHeader';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import { Observer } from "gsap/Observer";
import { LenisContext } from './App';

gsap.registerPlugin(Observer, ScrollTrigger);

const Home = () => {
  const lottieRef = useRef();
  const hasAnimated = useRef(false);
  const introDone = useRef(false);
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.5 });
  const lenis = useContext(LenisContext);
  const animationDuration = (FYVEHeroLottie.op - FYVEHeroLottie.ip) / FYVEHeroLottie.fr * 1000;
  const londonFadeDelay = animationDuration * 0.3;
  const scrollDisableTime = 4000;
  const section4Ref = useRef();
  const textMiddleRef = useRef();
  const textInnerRef = useRef();

  useEffect(() => {
    if (lottieRef.current) {
      if (inView) {
        if (introDone.current) {
          lottieRef.current.play();
          console.log('Lottie played on re-enter');
          setTimeout(() => {
            gsap.to('.london-below', { opacity: 1, duration: 0.5 });
            console.log('Fading in LONDON after re-enter');
          }, londonFadeDelay);
        }
      } else {
        lottieRef.current.goToAndStop(0, true);
        gsap.set('.london-below', { opacity: 0 });
        console.log('Lottie reset to frame 0');
      }
    } else {
      console.error('Lottie ref not available');
    }
  }, [inView]);

  useEffect(() => {
    if (lenis) {
      lenis.stop();
      console.log('Lenis scroll stopped');
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      setTimeout(() => {
        lenis.start();
        console.log('Lenis scroll started');
      }, scrollDisableTime);
    } else {
      console.error('Lenis context not available');
    }
    hasAnimated.current = false;
    introDone.current = false;
    console.log('Home component mounted');
    console.log('Lottie data:', FYVEHeroLottie);
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

      let rotation = 0;
      const stamp = document.querySelector('.section1-stamp');
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

      const fyveTextY = -1.11;
      const londonX = 1.3;
      const londonY = -1.41;

      if (hasAnimated.current) {
        gsap.set('.fyve-mask', { visibility: 'visible' });
        gsap.set('.fyve-image', { visibility: 'visible' });
        gsap.set('.mask-left', { x: '-100%', transformOrigin: 'left center' });
        gsap.set('.mask-right', { x: '100%', transformOrigin: 'right center' });
        gsap.set('.fyve-letter', { y: 0 });
        gsap.set('.fyve-text:first-child', { x: '-100vw', visibility: 'hidden' });
        gsap.set('.fyve-text:last-child', { x: '100vw', visibility: 'hidden' });
        gsap.set('.fyve-image-container', { width: '100vw', height: '100vh' });
        gsap.set('.mobile-header', { opacity: 1 });
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
        gsap.to('.fyve-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.fyve-text:first-child', { visibility: 'hidden' }) });
        gsap.to('.fyve-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.fyve-text:last-child', { visibility: 'hidden' }) });
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
        gsap.to('.london-mask .london-text:first-child', { x: '-100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.london-mask .london-text:first-child', { visibility: 'hidden' }) });
        gsap.to('.london-mask .london-text:last-child', { x: '100vw', duration: 0.8, ease: 'expo.inOut', delay: 2, onComplete: () => gsap.set('.london-mask .london-text:last-child', { visibility: 'hidden' }) });
        gsap.to('.london-mask', { marginTop: `-${londonHeight}vw`, y: `${londonY + londonHeight}vw`, duration: 0.8, ease: 'expo.inOut', delay: 2 });
        gsap.to('.lottie-container', { 
          autoAlpha: 1, 
          duration: 0.8, 
          ease: 'expo.inOut', 
          delay: 2.8,
          onStart: () => {
            lottieRef.current?.play();
            console.log('Lottie internal animation played first time');
            setTimeout(() => {
              gsap.to('.london-below', { opacity: 1, duration: 0.5 });
              console.log('Fading in LONDON after initial play');
            }, londonFadeDelay);
          },
          onComplete: () => {
            introDone.current = true;
            console.log('Lottie container animation completed');
          }
        });
      }
    });

    hasAnimated.current = true;

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (textInnerRef.current && textMiddleRef.current) {
        const textHeight = textInnerRef.current.offsetHeight;
        const containerHeight = textMiddleRef.current.offsetHeight;
        const scrollDistance = textHeight - containerHeight;
        if (scrollDistance > 0) {
          ScrollTrigger.create({
            trigger: section4Ref.current,
            start: "top top",
            end: `+=${scrollDistance}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          });
          gsap.to(textInnerRef.current, {
            y: -scrollDistance,
            ease: "none",
            scrollTrigger: {
              trigger: section4Ref.current,
              start: "top top",
              end: `+=${scrollDistance}`,
              scrub: true,
            }
          });
        }
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">
      <HomeHeader />
      <div className="fyve-wrapper">
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
        <div className="image-wrapper">
          <div className="section1-image-container"></div>
        </div>
        <div className="section1-overlay-text">
          Comfortably<br/>Modern,<br/>Distinctly<br/>British.
        </div>
        <a href="https://dev.fyvelondon.com/products?category=ss25" className="section1-shop-button">
          SHOP NOW
          <img src="/api/Uploads/FYVE-Arrow-Icon.svg" alt="" />
        </a>
        <div className="section1-new-text">
          We combine iconic British design with modern comfort<br/>and ease, creating a wardrobe that<br/>blends timeless elegance with<br/>everyday<br/>practicality.
        </div>
        <img src="/api/Uploads/FYVE-collection-stamp.svg" alt="Stamp" className="section1-stamp" />
      </div>
      <div className="section-2">
        <div className="section2-overlay-text">SS25</div>
        <div className="section2-subtext">
          Soft hues,<br/>effortless<br/>silhouettes,<br/>and timeless<br/>charm.
        </div>
        <a href="https://dev.fyvelondon.com/products?category=ss25" className="section2-shop-button">
          SHOP NOW
          <img src="/api/Uploads/FYVE-Arrow-Icon-White.svg" alt="" />
        </a>
      </div>
      <div className="section-3">
        <div className="section3-image-wrapper">
          <a href="https://dev.fyvelondon.com/products?category=boys" className="section3-link">
            <div className="section3-image-container">
              <div className="section3-image" style={{backgroundImage: `url('/api/Uploads/LOOK-8_1135_result.webp')`}}></div>
              <div className="section3-text">BOY</div>
            </div>
          </a>
          <a href="https://dev.fyvelondon.com/products?category=girls" className="section3-link">
            <div className="section3-image-container">
              <div className="section3-image" style={{backgroundImage: `url('/api/Uploads/LOOK-4_365.webp')`}}></div>
              <div className="section3-text">GIRL</div>
            </div>
          </a>
          <a href="https://dev.fyvelondon.com/products?category=baby" className="section3-link">
            <div className="section3-image-container">
              <div className="section3-image" style={{backgroundImage: `url('/api/Uploads/LOOK-9_1536_result.webp')`}}></div>
              <div className="section3-text">BABY</div>
            </div>
          </a>
        </div>
      </div>
      <div className="section-4" ref={section4Ref}>
        <div className="left-images">
          <div className="image top-left" style={{backgroundImage: `url('/api/Uploads/LOOK-8_1094_result.webp')`}}></div>
          <div className="image bottom-left" style={{backgroundImage: `url('/api/Uploads/LOOK-6_626.webp')`}}></div>
        </div>
        <div className="right-images">
          <div className="image top-right" style={{backgroundImage: `url('/api/Uploads/LOOK-12_2218.webp')`}}></div>
          <div className="image bottom-right" style={{backgroundImage: `url('/api/Uploads/EMBROIDERED-COLLAR-ROMPER3.webp')`}}></div>
        </div>
        <div className="text-middle" ref={textMiddleRef}>
          <div className="text-inner" ref={textInnerRef}>
            Hi! I'm Hannah founder of FYVE London.<br/><br/>
            Ever since I can remember, I’ve been passionate<br/>
            about design — especially children’s fashion.<br/>
            There’s something truly magical about watching<br/>
            a sketch transform into a piece that brings joy<br/>
            to little ones and their families.<br/><br/>
            But my greatest inspiration, and my most important role, is being a mom to my five incredible children. That’s where FYVE began, born from the love, chaos, and wonder of raising my own little crew.<br/><br/>
            Like so many of you, I know the daily juggle of balancing work and motherhood is no small feat – it’s a dance I’m still perfecting every day! That’s why I’ve built FYVE not just as a fashion brand, but as a celebration of motherhood—the highs, the challenges, and everything in between.<br/><br/>
            Our clothes are crafted with quality and comfort in mind, using soft, durable fabrics that kids can move in freely, designed to keep up with their energy and spark their joy—all while embracing a British, timeless classical style that never goes out of fashion. I’ve also chosen to partner with other mom-led businesses because I believe we’re stronger together. Supporting each other is at the core of what we do.<br/><br/>
            We’re so excited for you to join the FYVE family! We’d love to hear your feedback and see pictures of your little ones wearing our designs—your stories and moments mean the world to us.<br/><br/>
            With love,<br/>
            Hannah x
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;