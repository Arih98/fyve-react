import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollPositions = new Map();

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const pageKey = `${location.pathname}${location.search}`;

    const saveScroll = () => {
      scrollPositions.set(pageKey, window.scrollY || 0);
    };

    window.addEventListener('scroll', saveScroll, { passive: true });

    return () => {
      saveScroll();
      window.removeEventListener('scroll', saveScroll);
    };
  }, [location.pathname, location.search]);

    useEffect(() => {
    const pageKey = `${location.pathname}${location.search}`;

    if (location.pathname === '/') {
      window.scrollTo(0, 0);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);

        requestAnimationFrame(() => {
          window.scrollTo(0, 0);

          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 300);
        });
      });

      return;
    }

    if (navigationType === 'POP') {
      const isMobileProductsPage =
        location.pathname === '/products' && window.innerWidth <= 768;

      if (isMobileProductsPage) {
        return;
      }

      const savedY = scrollPositions.get(pageKey) ?? 0;
      window.scrollTo(0, savedY);
      return;
    }

        if (location.state?.fromProductGrid) {
      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo(0, 0);
  }, [location.pathname, location.search, navigationType, location.state?.fromProductGrid]);

  return null;
}