import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import './MobileSplitTransition.css';

const MobileSplitTransitionContext = createContext(null);

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

const MobileSplitTransitionOverlay = ({ active, image, mode }) => {
  return (
    <AnimatePresence>
      {active && image && (
        <div className="mobile-split-transition" data-html2canvas-ignore="true">
          <motion.div
            className="mobile-split-transition-half left"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ x: mode === 'open' ? '0%' : '-102%' }}
            animate={{ x: mode === 'open' ? '-102%' : '0%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="mobile-split-transition-half right"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ x: mode === 'open' ? '0%' : '102%' }}
            animate={{ x: mode === 'open' ? '102%' : '0%' }}
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
  const [overlay, setOverlay] = useState({
    active: false,
    image: '',
    mode: 'open'
  });
  const clearRef = useRef(null);

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

  const playOverlay = useCallback((image, mode) => {
    if (clearRef.current) {
      clearTimeout(clearRef.current);
    }

    setOverlay({
      active: true,
      image,
      mode
    });

    clearRef.current = setTimeout(() => {
      setOverlay({
        active: false,
        image: '',
        mode: 'open'
      });
    }, 850);
  }, []);

  const openMenuReveal = useCallback(async () => {
    if (!isMobileViewport()) return false;

    const image = await captureViewport();
    playOverlay(image, 'open');
    return true;
  }, [captureViewport, isMobileViewport, playOverlay]);

  const closeMenuReveal = useCallback(async () => {
    if (!isMobileViewport()) return false;

    const image = await captureViewport();
    playOverlay(image, 'close');
    return true;
  }, [captureViewport, isMobileViewport, playOverlay]);

  const navigateFromMenuReveal = useCallback(
    async (path, closeMenuFn) => {
      if (!isMobileViewport()) {
        closeMenuFn();
        navigate(path);
        return;
      }

      navigate(path);
      await waitFrames(2);

      const image = await captureViewport();
      playOverlay(image, 'close');
      closeMenuFn();
    },
    [captureViewport, isMobileViewport, navigate, playOverlay]
  );

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
      <MobileSplitTransitionOverlay active={overlay.active} image={overlay.image} mode={overlay.mode} />
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