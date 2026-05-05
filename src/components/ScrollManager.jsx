import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { fyveScrollTo, resizeFyveLenis } from '../utils/lenisControls';

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

    const scrollTopNow = () => {
      fyveScrollTo(0, { immediate: true, force: true });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      requestAnimationFrame(() => {
        resizeFyveLenis();
      });
    };

    if (location.pathname === '/') {
      scrollTopNow();

      requestAnimationFrame(() => {
        scrollTopNow();

        requestAnimationFrame(() => {
          scrollTopNow();

          setTimeout(() => {
            scrollTopNow();
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
      fyveScrollTo(savedY, { immediate: true, force: true });
      requestAnimationFrame(resizeFyveLenis);
      return;
    }

    if (location.state?.fromProductGrid) {
      let cancelled = false;

      const forceProductRouteTop = () => {
        if (cancelled) return;

        scrollTopNow();

        requestAnimationFrame(() => {
          if (cancelled) return;
          scrollTopNow();
        });
      };

      const handleLenisStart = (event) => {
        if (event.detail?.reason !== 'product-image-transition') return;

        requestAnimationFrame(forceProductRouteTop);
        setTimeout(forceProductRouteTop, 50);
        setTimeout(forceProductRouteTop, 150);
      };

      window.addEventListener('fyve:lenis-start', handleLenisStart);

      forceProductRouteTop();

      const timers = [
        setTimeout(forceProductRouteTop, 80),
        setTimeout(forceProductRouteTop, 220),
        setTimeout(forceProductRouteTop, 520),
        setTimeout(forceProductRouteTop, 900),
        setTimeout(forceProductRouteTop, 1250)
      ];

      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
        window.removeEventListener('fyve:lenis-start', handleLenisStart);
      };
    }

    scrollTopNow();
  }, [location.pathname, location.search, navigationType, location.state?.fromProductGrid]);

  return null;
}