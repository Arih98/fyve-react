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
import * as THREE from 'three';
$easeOutExpo: cubic-bezier(0.190, 1.000, 0.220, 1.000);

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
    const gl = new Gl();
    const slider = new Slider(document.querySelector('.js-slider'));
    gsap.ticker.add(() => {
      gl.render();
      slider.render();
    });
    return () => gsap.ticker.remove(() => { gl.render(); slider.render(); });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
  <div className="slider js-drag-area">
    <div className="slider__inner js-slider">
      {[
        "/api/Uploads/LOOK-2_191.webp",
        "/api/Uploads/LOOK-5_531_result.webp",
        "/api/Uploads/LOOK-3_329.jpg",
        "/api/Uploads/LOOK-1_011_result.webp",
        "/api/Uploads/LOOK-2_289.webp",
        "/api/Uploads/LOOK-8_1177-1.webp",
        "/api/Uploads/look_12_2435.webp",
        "/api/Uploads/LOOK-6_582_result2.webp",
        "/api/Uploads/LOOK-7_920.webp",
        "/api/Uploads/LOOK-8_985.webp",
        "/api/Uploads/LOOK-9_1665-1.webp",
        "/api/Uploads/LOOK-9_1452.webp",
        "/api/Uploads/LOOK-9_1531.webp",
        "/api/Uploads/LOOK-9_1459.webp",
        "/api/Uploads/LOOK-9_1361.webp",
        "/api/Uploads/LOOK-12_2160.webp",
        "/api/Uploads/LOOK_11_1743-1.webp",
        "/api/Uploads/LOOK_11_2043.webp",
        "/api/Uploads/LOOK-4_365.webp",
        "/api/Uploads/LOOK-2_191.webp",
        "/api/Uploads/LOOK_11_2082.webp"
      ].map((src, index) => (
        <div key={index} className="slide js-slide" style={{ left: `${index * 120}%` }}>
          <div className="slide__inner js-slide__inner">
            <img
              className="js-slide__img"
              src={src}
              alt={`Slide ${index + 1}`}
              crossOrigin="anonymous"
              draggable="false"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

const store = {
  ww: window.innerWidth,
  wh: window.innerHeight,
  isDevice: navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)
}

class Slider {
  constructor(el, opts = {}) {
    this.bindAll()
    this.el = el
    this.opts = Object.assign({
      speed: 2,
      threshold: 50,
      ease: 0.075
    }, opts)
    this.ui = {
      items: this.el.querySelectorAll('.js-slide'),
      titles: document.querySelectorAll('.js-title'),
      lines: document.querySelectorAll('.js-progress-line')
    }
    this.state = {
      target: 0,
      current: 0,
      currentRounded: 0,
      y: 0,
      on: { x: 0, y: 0 },
      off: 0,
      progress: 0,
      diff: 0,
      max: 0,
      min: 0,
      snap: { points: [] },
      flags: { dragging: false }
    }
    this.items = []
    this.events = {
      move: store.isDevice ? 'touchmove' : 'mousemove',
      up: store.isDevice ? 'touchend' : 'mouseup',
      down: store.isDevice ? 'touchstart' : 'mousedown'
    }
    this.init()
  }
  bindAll() { ['onDown', 'onMove', 'onUp'].forEach(fn => this[fn] = this[fn].bind(this)) }
  init() { return gsap.utils.pipe(this.setup(), this.on()) }
  destroy() { this.off(); this.state = null; this.items = null; this.opts = null; this.ui = null }
  on() { const { move, up, down } = this.events; window.addEventListener(down, this.onDown); window.addEventListener(move, this.onMove); window.addEventListener(up, this.onUp) }
  off() { const { move, up, down } = this.events; window.removeEventListener(down, this.onDown); window.removeEventListener(move, this.onMove); window.removeEventListener(up, this.onUp) }
  setup() {
    const { ww } = store;
    const state = this.state;
    const { items, titles } = this.ui;
    const { width: wrapWidth, left: wrapDiff } = this.el.getBoundingClientRect();
    state.max = -(items[items.length - 1].getBoundingClientRect().right - wrapWidth - wrapDiff);
    state.min = 0;
    this.tl = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'linear' } })
      .fromTo('.js-progress-line-2', { scaleX: 1 }, { scaleX: 0, duration: 0.5, ease: 'power3' }, 0)
      .fromTo('.js-titles', { yPercent: 0 }, { yPercent: -(100 - (100 / titles.length)) }, 0)
      .fromTo('.js-progress-line', { scaleX: 0 }, { scaleX: 1 }, 0);
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      const { left, right, width } = el.getBoundingClientRect();
      const plane = new Plane();
      plane.init(el);
      const tl = gsap.timeline({ paused: true })
        .fromTo(plane.mat.uniforms.uScale, { value: 0.65 }, { value: 1, duration: 1, ease: 'linear' });
      this.items.push({ el, plane, left, right, width, min: left < ww ? (ww * 0.775) : -(ww * 0.225 - wrapWidth * 0.2), max: left > ww ? state.max - (ww * 0.775) : state.max + (ww * 0.225 - wrapWidth * 0.2), tl, out: false });
    }
  }
  calc() {
    const state = this.state;
    state.current += (state.target - state.current) * this.opts.ease;
    state.currentRounded = Math.round(state.current * 100) / 100;
    state.diff = (state.target - state.current) * 0.0005;
    state.progress = gsap.utils.wrap(0, 1, state.currentRounded / state.max);
    this.tl && this.tl.progress(state.progress);
  }
  render() { this.calc(); this.transformItems() }
  transformItems() {
    const { flags } = this.state;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const { translate, isVisible, progress } = this.isVisible(item);
      item.plane.updateX(translate);
      item.plane.mat.uniforms.uVelo.value = this.state.diff;
      if (!item.out && item.tl) item.tl.progress(progress);
      if (isVisible || flags.resize) item.out = false; else if (!item.out) item.out = true;
    }
  }
  isVisible({ left, right, width, min, max }) {
    const { ww } = store;
    const { currentRounded } = this.state;
    const translate = gsap.utils.wrap(min, max, currentRounded);
    const threshold = this.opts.threshold;
    const start = left + translate;
    const end = right + translate;
    const isVisible = start < (threshold + ww) && end > -threshold;
    const progress = gsap.utils.clamp(0, 1, 1 - (translate + left + width) / (ww + width));
    return { translate, isVisible, progress };
  }
  clampTarget() { this.state.target = gsap.utils.clamp(this.state.max, 0, this.state.target) }
  getPos({ changedTouches, clientX, clientY, target }) {
    const x = changedTouches ? changedTouches[0].clientX : clientX;
    const y = changedTouches ? changedTouches[0].clientY : clientY;
    return { x, y, target };
  }
  onDown(e) { const { x, y } = this.getPos(e); const { flags, on } = this.state; flags.dragging = true; on.x = x; on.y = y }
  onUp() { this.state.flags.dragging = false; this.state.off = this.state.target }
  onMove(e) {
    const { x, y } = this.getPos(e);
    const state = this.state;
    if (!state.flags.dragging) return;
    const { off, on } = state;
    const moveX = x - on.x;
    const moveY = y - on.y;
    if ((Math.abs(moveX) > Math.abs(moveY)) && e.cancelable) { e.preventDefault(); e.stopPropagation() }
    state.target = off + (moveX * this.opts.speed);
  }
}

const backgroundCoverUv = `
vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
  float screenRatio = screenSize.x / screenSize.y;
  float imageRatio = imageSize.x / imageSize.y;
  vec2 newSize = screenRatio < imageRatio ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y) : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
  vec2 newOffset = (screenRatio < imageRatio ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
  return uv * screenSize / newSize + newOffset;
}
`

const vertexShader = `
precision mediump float;
uniform float uVelo;
varying vec2 vUv;
#define M_PI 3.1415926535897932384626433832795
void main() {
  vec3 pos = position;
  pos.x = pos.x + ((sin(uv.y * M_PI) * uVelo) * 0.125);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
}
`

const fragmentShader = `
precision mediump float;
${backgroundCoverUv}
uniform sampler2D uTexture;
uniform vec2 uMeshSize;
uniform vec2 uImageSize;
uniform float uVelo;
uniform float uScale;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec2 texCenter = vec2(0.5);
  vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
  vec2 texScale = (texUv - texCenter) * uScale + texCenter;
  vec4 texture = texture2D(uTexture, texScale);
  texScale.x += 0.15 * uVelo;
  if(uv.x < 1.) texture.g = texture2D(uTexture, texScale).g;
  texScale.x += 0.10 * uVelo;
  if(uv.x < 1.) texture.b = texture2D(uTexture, texScale).b;
  gl_FragColor = texture;
}
`

const loader = new THREE.TextureLoader()
loader.crossOrigin = 'anonymous'

class Gl {
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(store.ww / -2, store.ww / 2, store.wh / 2, store.wh / -2, 1, 10)
    this.camera.lookAt(this.scene.position)
    this.camera.position.z = 1
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    this.renderer.setPixelRatio(1.5)
    this.renderer.setSize(store.ww, store.wh)
    this.renderer.setClearColor(0xffffff, 0)
    this.init()
  }
  render() { this.renderer.render(this.scene, this.camera) }
  init() {
    const domEl = this.renderer.domElement
    domEl.classList.add('dom-gl')
    document.body.appendChild(domEl)
  }
}

class GlObject extends THREE.Object3D {
  init(el) { this.el = el; this.resize() }
  resize() {
    this.rect = this.el.getBoundingClientRect()
    const { left, top, width, height } = this.rect
    this.pos = { x: (left + (width / 2)) - (store.ww / 2), y: (top + (height / 2)) - (store.wh / 2) }
    this.position.y = this.pos.y
    this.position.x = this.pos.x
    this.updateX()
  }
  updateX(current) { current && (this.position.x = current + this.pos.x) }
}

const planeGeo = new THREE.PlaneBufferGeometry(1, 1, 32, 32)
const planeMat = new THREE.ShaderMaterial({ transparent: true, fragmentShader, vertexShader })

class Plane extends GlObject {
  init(el) {
    super.init(el)
    this.geo = planeGeo
    this.mat = planeMat.clone()
    this.mat.uniforms = {
      uTime: { value: 0 },
      uTexture: { value: 0 },
      uMeshSize: { value: new THREE.Vector2(this.rect.width, this.rect.height) },
      uImageSize: { value: new THREE.Vector2(0, 0) },
      uScale: { value: 0.75 },
      uVelo: { value: 0 }
    }
    this.img = this.el.querySelector('img')
    this.texture = loader.load(this.img.src, (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.generateMipmaps = false
      this.mat.uniforms.uTexture.value = texture
      this.mat.uniforms.uImageSize.value = [this.img.naturalWidth, this.img.naturalHeight]
    })
    this.mesh = new THREE.Mesh(this.geo, this.mat)
    this.mesh.scale.set(this.rect.width, this.rect.height, 1)
    this.add(this.mesh)
    gl.scene.add(this)
  }
}

export default Home;