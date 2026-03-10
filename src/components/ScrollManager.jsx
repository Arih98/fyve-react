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

    const key = location.key || `${location.pathname}${location.search}`;

    const saveScroll = () => {
      scrollPositions.set(key, lenis.scroll);
    };

    lenis.on('scroll', saveScroll);

    return () => {
      saveScroll();
      lenis.off('scroll', saveScroll);
    };
  }, [lenis, location.key, location.pathname, location.search]);

  useEffect(() => {
    if (!lenis) return;

    const key = location.key || `${location.pathname}${location.search}`;

    if (navigationType === 'POP') {
      const savedY = scrollPositions.get(key) ?? 0;
      lenis.scrollTo(savedY, { immediate: true });
      return;
    }

    const timeout = setTimeout(() => {
      lenis.scrollTo(0, { immediate: true });
    }, 450);

    return () => clearTimeout(timeout);
  }, [lenis, location.key, location.pathname, location.search, navigationType]);

  return null;
}