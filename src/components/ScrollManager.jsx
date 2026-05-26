import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollPositions = new Map();

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousLocationRef = useRef({
    pathname: null,
    search: null
  });

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
    const previousLocation = previousLocationRef.current;
    const previousPathname = previousLocation.pathname;
    const previousSearch = previousLocation.search;
    const pageKey = `${location.pathname}${location.search}`;
    const isFirstRun = previousPathname === null;
    const pathnameChanged = previousPathname !== location.pathname;
    const searchChanged = previousSearch !== location.search;
    const isProductDetailPage = location.pathname.startsWith('/product/');
    const isSameProductSearchChange = !isFirstRun && !pathnameChanged && searchChanged && isProductDetailPage;

    previousLocationRef.current = {
      pathname: location.pathname,
      search: location.search
    };

    if (isSameProductSearchChange) {
      return;
    }

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

    if (pathnameChanged || isFirstRun) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, navigationType, location.state?.fromProductGrid]);

  return null;
}