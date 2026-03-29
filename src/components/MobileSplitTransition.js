import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import './MobileSplitTransition.css';

const MobileSplitTransitionContext = createContext(null);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFrames = (count = 2) =>
  new Promise((resolve) => {
    let remaining = count;

    const step = () => {
      remaining -= 1;

      if (remaining <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });

const MobileSplitTransitionOverlay = ({ active, image, mode, phase }) => {
  return (
    <AnimatePresence>
      {active && image && (
        <div className="mobile-split-transition" data-html2canvas-ignore="true">
          <motion.div
            className="mobile-split-transition-half left"
            style={{ backgroundImage: `url(${image})` }}
            initial={
              mode === 'open'
                ? { x: '0%' }
                : { x: phase === 'ready' ? '-102%' : '0%' }
            }
            animate={
              mode === 'open'
                ? { x: phase === 'animate' ? '-102%' : '0%' }
                : { x: phase === 'animate' ? '0%' : '-102%' }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="mobile-split-transition-half right"
            style={{ backgroundImage: `url(${image})` }}
            initial={
              mode === 'open'
                ? { x: '0%' }
                : { x: phase === 'ready' ? '102%' : '0%' }
            }
            animate={
              mode === 'open'
                ? { x: phase === 'animate' ? '102%' : '0%' }
                : { x: phase === 'animate' ? '0%' : '102%' }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export const MobileSplitTransitionProvider = ({ children }) => {
  const navigate = useNavigate();
  const clearRef = useRef(null);
  const [overlay, setOverlay] = useState({
    active: false,
    image: '',
    mode: 'open',
    phase: 'ready'
  });

  const isMobileViewport = useCallback(() => window.innerWidth <= 768, []);

  const captureViewport = useCallback(async () => {
    const canvas = await html2canvas(document.body, {
      backgroundColor: null,
      useCORS: true,
      scale: Math.min(window.devicePixelRatio, 2),
      x: 0,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      ignoreElements: (element) => element.hasAttribute('data-html2canvas-ignore')
    });

    return canvas.toDataURL('image/png');
  }, []);

  const clearOverlayLater = useCallback((delay = 900) => {
    if (clearRef.current) {
      clearTimeout(clearRef.current);
    }

    clearRef.current = setTimeout(() => {
      setOverlay({
        active: false,
        image: '',
        mode: 'open',
        phase: 'ready'
      });
    }, delay);
  }, []);

  const openMenuReveal = useCallback(async () => {
    if (!isMobileViewport()) return false;

    const image = await captureViewport();

    setOverlay({
      active: true,
      image,
      mode: 'open',
      phase: 'ready'
    });

    await waitFrames(2);

    setOverlay({
      active: true,
      image,
      mode: 'open',
      phase: 'animate'
    });

    clearOverlayLater(900);
    return true;
  }, [captureViewport, clearOverlayLater, isMobileViewport]);

  const closeMenuReveal = useCallback(async (closeMenuFn) => {
    if (!isMobileViewport()) {
      closeMenuFn();
      return false;
    }

    closeMenuFn();
    await waitFrames(2);
    await wait(30);

    const image = await captureViewport();

    setOverlay({
      active: true,
      image,
      mode: 'close',
      phase: 'ready'
    });

    await waitFrames(2);

    setOverlay({
      active: true,
      image,
      mode: 'close',
      phase: 'animate'
    });

    clearOverlayLater(900);
    return true;
  }, [captureViewport, clearOverlayLater, isMobileViewport]);

  const navigateFromMenuReveal = useCallback(async (path, closeMenuFn) => {
    if (!isMobileViewport()) {
      closeMenuFn();
      navigate(path);
      return;
    }

    closeMenuFn();
    navigate(path);

    await waitFrames(4);
    await wait(80);

    const image = await captureViewport();

    setOverlay({
      active: true,
      image,
      mode: 'close',
      phase: 'ready'
    });

    await waitFrames(2);

    setOverlay({
      active: true,
      image,
      mode: 'close',
      phase: 'animate'
    });

    clearOverlayLater(900);
  }, [captureViewport, clearOverlayLater, isMobileViewport, navigate]);

  useEffect(() => {
    return () => {
      if (clearRef.current) {
        clearTimeout(clearRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      openMenuReveal,
      closeMenuReveal,
      navigateFromMenuReveal
    }),
    [openMenuReveal, closeMenuReveal, navigateFromMenuReveal]
  );

  return (
    <MobileSplitTransitionContext.Provider value={value}>
      {children}
      <MobileSplitTransitionOverlay
        active={overlay.active}
        image={overlay.image}
        mode={overlay.mode}
        phase={overlay.phase}
      />
    </MobileSplitTransitionContext.Provider>
  );
};

export const useMobileSplitTransition = () => {
  const context = useContext(MobileSplitTransitionContext);

  if (!context) {
    throw new Error('useMobileSplitTransition must be used inside MobileSplitTransitionProvider');
  }

  return context;
};