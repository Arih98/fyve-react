import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ReactLenis } from 'lenis/react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import {
  resetFyveLenisStops,
  resizeFyveLenis,
  setFyveLenis,
  startFyveLenis,
  stopFyveLenis
} from './utils/lenisControls';

gsap.registerPlugin(ScrollTrigger);

const shouldUseLenis = () => {
  if (typeof window === 'undefined') return false;

  const isDesktop = window.matchMedia('(min-width: 769px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return isDesktop && !reduceMotion;
};

const LenisRoot = () => {
  const lenisRef = useRef(null);
  const location = useLocation();
  const [enabled, setEnabled] = useState(shouldUseLenis);

  const options = useMemo(() => ({
    lerp: 0.08,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
    autoRaf: true,
    prevent: (node) => {
      return Boolean(
        node.closest('[data-lenis-prevent]') ||
        node.closest('.custom-search-container') ||
        node.closest('.custom-search-content') ||
        node.closest('.desktop-cart-dropdown') ||
        node.closest('.mobile-menu') ||
        node.closest('.size-panel') ||
        node.closest('.size-panel-backdrop') ||
        node.closest('.fullscreen-gallery') ||
        node.closest('.cart-added-popup')
      );
    }
  }), []);

  useEffect(() => {
    const handleResize = () => {
      setEnabled(shouldUseLenis());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setFyveLenis(null);
      return;
    }

    let frame = null;

    const syncInstance = () => {
      const instance = lenisRef.current?.lenis || null;
      setFyveLenis(instance);

      if (instance) {
        instance.on?.('scroll', ScrollTrigger.update);
        resizeFyveLenis();
      }
    };

    frame = requestAnimationFrame(syncInstance);

    return () => {
      cancelAnimationFrame(frame);
      const instance = lenisRef.current?.lenis || null;
      instance?.off?.('scroll', ScrollTrigger.update);
      setFyveLenis(null);
    };
  }, [enabled]);

  useEffect(() => {
    const handleStop = (event) => {
      stopFyveLenis(event.detail?.reason || 'event');
    };

    const handleStart = (event) => {
      startFyveLenis(event.detail?.reason || 'event');
    };

    const handleReset = () => {
      resetFyveLenisStops();
    };

    window.addEventListener('fyve:lenis-stop', handleStop);
    window.addEventListener('fyve:lenis-start', handleStart);
    window.addEventListener('fyve:lenis-reset', handleReset);

    return () => {
      window.removeEventListener('fyve:lenis-stop', handleStop);
      window.removeEventListener('fyve:lenis-start', handleStart);
      window.removeEventListener('fyve:lenis-reset', handleReset);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const frame = requestAnimationFrame(() => {
      resizeFyveLenis();
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, location.pathname, location.search]);

  if (!enabled) {
    return null;
  }

  return <ReactLenis root ref={lenisRef} options={options} />;
};

export default LenisRoot;