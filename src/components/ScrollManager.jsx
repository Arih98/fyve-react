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
console.log("SCROLL MANAGER triggered");
console.log("pathname:", location.pathname);
console.log("navigationType:", navigationType);
console.log("scroll before manager:", window.scrollY);
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
  console.log("Homepage detected, forcing scroll to top");
  console.log("scroll before homepage top force:", window.scrollY);

  window.scrollTo(0, 0);

  requestAnimationFrame(() => {
    console.log("Homepage rAF 1 before force:", window.scrollY);
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      console.log("Homepage rAF 2 before force:", window.scrollY);
      window.scrollTo(0, 0);

      setTimeout(() => {
        console.log("Homepage timeout 300ms before force:", window.scrollY);
        window.scrollTo(0, 0);
        console.log("Homepage timeout 300ms after force:", window.scrollY);
      }, 300);
    });
  });

  console.log("scroll after homepage top force:", window.scrollY);
  return;
}

    if (navigationType === 'POP') {
      const isMobileProductsPage =
        location.pathname === '/products' && window.innerWidth <= 768;
console.log("POP navigation detected");
console.log("saved scroll:", scrollPositions.get(pageKey));
      if (isMobileProductsPage) {
        return;
      }

      const savedY = scrollPositions.get(pageKey) ?? 0;
      console.log("Restoring scroll to:", savedY);
      window.scrollTo(0, savedY);
      return;
    }

    if (location.state?.fromProductGrid) {
      return;
    }
console.log("Scrolling to top because new navigation");
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, navigationType, location.state?.fromProductGrid]);

  return null;
}