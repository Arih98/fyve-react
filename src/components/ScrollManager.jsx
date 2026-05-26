import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollPositions = new Map();

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const previousLocationRef = useRef({
  pathname: location.pathname,
  search: location.search
});

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
  const pageKey = `${location.pathname}${location.search}`;
  const previousLocation = previousLocationRef.current;

  const previousParams = new URLSearchParams(previousLocation.search);
  const currentParams = new URLSearchParams(location.search);
  const allSearchKeys = Array.from(new Set([
    ...previousParams.keys(),
    ...currentParams.keys()
  ]));

  const isSameProductPath =
    previousLocation.pathname === location.pathname &&
    location.pathname.startsWith('/product/');

  const isColorOnlyChange =
    isSameProductPath &&
    allSearchKeys.length <= 1 &&
    allSearchKeys.every(key => key === 'color') &&
    previousParams.get('color') !== currentParams.get('color');

  previousLocationRef.current = {
    pathname: location.pathname,
    search: location.search
  };

  if (isColorOnlyChange) {
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

  window.scrollTo(0, 0);
}, [location.pathname, location.search, navigationType, location.state?.fromProductGrid]);

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