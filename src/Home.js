// Home.js
import React, { useEffect, useRef, useContext } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie from 'lottie-react';
import { useInView } from 'react-intersection-observer';
import HomeHeader from './HomeHeader';
import './Home.css';
import FYVEHeroLottie from './assets/FYVEHeroLottie.json';
import { Observer } from "gsap/Observer";
import { LenisContext } from './App';

gsap.registerPlugin(Observer, SplitText, ScrollTrigger);

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
        gsap.to('.fyve-text:first-child', { x: '-0.4vw', duration: 0.8, ease: 'expo.inOut', delay: 1.2 });
        gsap.to('.fyve-text:last-child', { x: '0.4vw', duration: 0.8, ease: 'expo.inOut', delay: 1.2 });
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
    const scrollContainer = document.querySelector('.horizontal-scroll-content');
    if (scrollContainer) {
      const images = scrollContainer.querySelectorAll('img');
      const totalImages = images.length;
      let loadedImages = 0;
  
      const checkImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          const totalScrollWidth = scrollContainer.scrollWidth - window.innerWidth;
          gsap.to(scrollContainer, {
            x: -totalScrollWidth,
            ease: 'none',
            scrollTrigger: {
              trigger: '.horizontal-scroll-section',
              start: 'top top',
              end: () => "+=" + totalScrollWidth,
              scrub: true,
              pin: true,
              anticipatePin: 1
            }
          });
          console.log('All horizontal scroll images loaded, animation set up');
        }
      };
  
      images.forEach((img) => {
        if (img.complete) {
          checkImagesLoaded();
        } else {
          img.addEventListener('load', checkImagesLoaded);
          img.addEventListener('error', checkImagesLoaded); // Handle image load errors
        }
      });
    }
  }, []);

  useEffect(() => {
    let ctx;
    document.fonts.ready.then(() => {
      console.log('Fonts ready, splitting text for section 4');
      ctx = gsap.context(() => {
        const textParts = document.querySelectorAll('.text-part');
        let splits = [];
        textParts.forEach((part) => {
          const p = part.querySelector('p');
          const split = new SplitText(p, { type: 'words', wordsClass: 'word' });
          splits.push(split);
          gsap.set(split.words, { opacity: 0 });
          gsap.set(part, { opacity: 0 });
        });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section4Ref.current,
            start: 'top top',
            end: '+=900%',
            pin: true,
            scrub: true,
          },
        });
        let time = 0;
        textParts.forEach((part, index) => {
          const split = splits[index];
          // Set all parts to opacity 0 before animating the current one
          if (index > 0) {
            tl.set(textParts, { opacity: 0 }, time);
          }
          tl.set(part, { opacity: 1 }, time);
          tl.to(split.words, { opacity: 1, duration: 0.5, stagger: 0.05 }, time);
          time += 1;
          tl.to({}, { duration: 0.5 }, time); // Hold time
          time += 0.5;
          // Fade out the current part
          tl.to(part, { opacity: 0, duration: 0.5 }, time);
          time += 1;
        });
      }, section4Ref);
    });
    return () => {
      if (ctx) ctx.revert();
    };
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
            <picture>
              <source media="(max-width: 768px)" srcSet="/api/Uploads/FYVE-Hero-Mobile.webp" />
              <img src="/api/Uploads/LOOK-2_137-e1743957431674.webp" alt="Reveal Image" className="fyve-image" />
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
          <div className="lottie-player">
            <Lottie 
              lottieRef={lottieRef}
              animationData={FYVEHeroLottie} 
              loop={false} 
              autoplay={false} 
              style={{ width: '100%', height: '100%' }} 
            />
          </div>
          <img src="/api/Uploads/FYVE-Hero-Mobile.webp" className="mobile-lottie-replacement" alt="Mobile Hero" />
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
          <img src="/api/Uploads/LOOK-8_1094_result.webp" alt="" className="top-left" />
          <img src="/api/Uploads/LOOK-6_626.webp" alt="" className="bottom-left" />
        </div>
        <div className="middle-text">
          <div className="text-container">
            <div className="text-wrapper">
              <div className="text-part"><p>Hi!</p></div>
              <div className="text-part"><p>I'm Hannah</p></div>
              <div className="text-part"><p>founder of FYVE London.</p></div>
              <div className="text-part"><p>Ever since I can remember, I’ve been passionate about design - especially children’s fashion.</p></div>
              <div className="text-part"><p>There’s something truly magical about watching a sketch transform into a piece that brings joy<br/>to little ones and their families.</p></div>
              <div className="text-part"><p>But my greatest inspiration, and my most important role, is being a mom to my five incredible children.</p></div>
              <div className="text-part"><p>That’s where FYVE began, born from the love, chaos, and wonder of raising my own little crew.</p></div>
              <div className="text-part"><p>Like so many of you, I know the daily juggle of balancing work and motherhood is no small feat – it’s a dance I’m still perfecting every day!</p></div>
              <div className="text-part"><p>That’s why I’ve built FYVE. Not just as a fashion brand, but as a celebration of motherhood - the highs, the challenges, and everything in between.</p></div>
              <div className="text-part"><p>Our clothes are crafted with quality and comfort in mind, using soft, durable fabrics that kids can move in freely, designed to keep up with their energy and spark their joy...</p></div>
              <div className="text-part"><p>...all while embracing a British, timeless classical style that never goes out of fashion.</p></div>
              <div className="text-part"><p>I’ve also chosen to partner with other mom-led businesses because I believe we’re stronger together...</p></div>
              <div className="text-part"><p>Supporting each other is at the core of what we do.</p></div>
              <div className="text-part"><p>We’re so excited for you to join the FYVE family!</p></div>
              <div className="text-part"><p>We’d love to hear your feedback and see pictures of your little ones wearing our designs - your stories and moments mean the world to us.</p></div>
              <div className="text-part"><p>With love,</p></div>
              <div className="text-part"><p>Hannah x</p></div>
            </div>
          </div>
        </div>
        <div className="right-images">
          <img src="/api/Uploads/LOOK-12_2218.webp" alt="" className="top-right" />
          <img src="/api/Uploads/EMBROIDERED-COLLAR-ROMPER3.webp" alt="" className="bottom-right" />
        </div>
      </div>
      <div className="horizontal-scroll-section">
  <div className="horizontal-scroll-content">
    <img className="custom-img img1" src="/api/Uploads/LOOK-2_191.webp" alt="LOOK-2_191" />
    <img className="custom-img img2" src="/api/Uploads/LOOK-5_531_result.webp" alt="LOOK-5_531_result" />
    <img className="custom-img img3" src="/api/Uploads/LOOK-3_329.jpg" alt="LOOK-3_329" />
    <img className="custom-img img4" src="/api/Uploads/LOOK-1_011_result.webp" alt="LOOK-1_011_result" />
    <img className="custom-img img5" src="/api/Uploads/LOOK-2_289.webp" alt="LOOK-4_365" />
    <img className="custom-img img6" src="/api/Uploads/LOOK-8_1177-1.webp" alt="LOOK-2_289" />
    <img className="custom-img img7" src="/api/Uploads/look_12_2435.webp" alt="look_12_2435" />
    <img className="custom-img img8" src="/api/Uploads/LOOK-6_582_result2.webp" alt="look_12_2435" />
    <img className="custom-img img9" src="/api/Uploads/LOOK-7_920.webp" alt="LOOK-6_582_result" />
    <img className="custom-img img10" src="/api/Uploads/LOOK-8_985.webp" alt="LOOK-7_920" />
    <img className="custom-img img11" src="/api/Uploads/LOOK-9_1665-1.webp" alt="LOOK-8_985" />
    <img className="custom-img img12" src="/api/Uploads/LOOK-9_1452.webp" alt="LOOK-9_1665-1" />
    <img className="custom-img img13" src="/api/Uploads/LOOK-9_1531.webp" alt="LOOK-9_1452" />
    <img className="custom-img img14" src="/api/Uploads/LOOK-9_1459.webp" alt="LOOK-9_1531" />
    <img className="custom-img img15" src="/api/Uploads/LOOK-9_1361.webp" alt="LOOK-9_1459" />
    <img className="custom-img img16" src="/api/Uploads/LOOK-12_2160.webp" alt="LOOK-9_1361" />
    <img className="custom-img img17" src="/api/Uploads/LOOK_11_1743-1.webp" alt="LOOK-12_2160" />
    <img className="custom-img img18" src="/api/Uploads/LOOK_11_2043.webp" alt="LOOK_11_1743-1" />
    <img className="custom-img img19" src="/api/Uploads/LOOK-4_365.webp" alt="LOOK_11_2043-1" />
    <img className="custom-img img20" src="/api/Uploads/LOOK-2_191.webp" alt="LOOK_11_2060-1" />
    <img className="custom-img img21" src="/api/Uploads/LOOK_11_2082.webp" alt="LOOK_11_2082" />
  </div>
</div>
    </div>
  );
};

export default Home;