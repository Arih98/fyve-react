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
      scrollPositions.set(pageKey, lenis.scroll || window.scrollY || 0);
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

  const restoreScroll = () => {
    if (navigationType !== 'POP') {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    const savedY = scrollPositions.get(pageKey) ?? 0;
    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScrollableY = Math.max(0, docHeight - viewportHeight);

    if (maxScrollableY >= savedY || savedY === 0) {
      lenis.scrollTo(savedY, { immediate: true });
      return;
    }

    frameId = requestAnimationFrame(restoreScroll);
  };

  frameId = requestAnimationFrame(restoreScroll);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}, [lenis, location.pathname, location.search, navigationType, location.state]);

  return null;
}