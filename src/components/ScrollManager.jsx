import { useContext, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { LenisContext } from '../App';

const scrollPositions = new Map();

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lenis = useContext(LenisContext);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (!lenis) return;

    const pageKey = `${location.pathname}${location.search}`;

const saveScroll = () => {
  const y = window.scrollY || lenis.scroll || 0;
  scrollPositions.set(pageKey, y);
};

    lenis.on('scroll', saveScroll);

    return () => {
      saveScroll();
      lenis.off('scroll', saveScroll);
    };
  }, [lenis, location.pathname, location.search]);

  useEffect(() => {
  if (!lenis) return;

  const pageKey = `${location.pathname}${location.search}`;

  if (location.state?.preserveScroll) {
    return;
  }

  let frameId;
  let attempts = 0;
  const maxAttempts = 120;

  const restoreScroll = () => {
    if (navigationType !== 'POP') {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    const savedY = scrollPositions.get(pageKey) ?? 0;
    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScrollableY = Math.max(0, docHeight - viewportHeight);

    if (maxScrollableY >= savedY || savedY === 0 || attempts >= maxAttempts) {
      lenis.scrollTo(Math.min(savedY, maxScrollableY), { immediate: true });
      return;
    }

    attempts += 1;
    frameId = requestAnimationFrame(restoreScroll);
  };

  frameId = requestAnimationFrame(restoreScroll);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}, [lenis, location.pathname, location.search, navigationType, location.state]);

  return null;
}