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
      console.log('[SM] history.scrollRestoration set to manual');
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      console.log('[SM] popstate event', {
        pathname: window.location.pathname,
        search: window.location.search,
        windowScrollY: window.scrollY,
        documentScrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!lenis) {
      console.log('[SM] save effect skipped because lenis is not ready');
      return;
    }

    const pageKey = `${location.pathname}${location.search}`;

    console.log('[SM] save effect mount', {
      pageKey,
      pathname: location.pathname,
      search: location.search,
      navigationType,
      locationState: location.state,
      lenisScroll: lenis.scroll,
      windowScrollY: window.scrollY
    });

    const saveScroll = (source = 'lenis-scroll') => {
      const y = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0,
        lenis.scroll || 0
      );

      scrollPositions.set(pageKey, y);

      console.log('[SM] saveScroll', {
        source,
        pageKey,
        savedY: y,
        lenisScroll: lenis.scroll,
        windowScrollY: window.scrollY,
        documentScrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop,
        docHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight
      });
    };

    const onWindowScroll = () => saveScroll('window-scroll');
    const onLenisScroll = () => saveScroll('lenis-scroll');

    lenis.on('scroll', onLenisScroll);
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    return () => {
      saveScroll('cleanup');
      lenis.off('scroll', onLenisScroll);
      window.removeEventListener('scroll', onWindowScroll);
      console.log('[SM] save effect cleanup', {
        pageKey,
        finalSavedY: scrollPositions.get(pageKey)
      });
    };
  }, [lenis, location.pathname, location.search, navigationType, location.state]);

  useEffect(() => {
    if (!lenis) {
      console.log('[SM] restore effect skipped because lenis is not ready');
      return;
    }

    const pageKey = `${location.pathname}${location.search}`;

    if (location.state?.preserveScroll) {
      console.log('[SM] restore skipped because preserveScroll is true', {
        pageKey,
        locationState: location.state
      });
      return;
    }

    let frameId = null;
    let attempts = 0;
    const maxAttempts = 180;

    console.log('[SM] restore effect mount', {
      pageKey,
      pathname: location.pathname,
      search: location.search,
      navigationType,
      locationState: location.state,
      savedYAtMount: scrollPositions.get(pageKey),
      lenisScrollAtMount: lenis.scroll,
      windowScrollYAtMount: window.scrollY,
      docHeightAtMount: document.documentElement.scrollHeight,
      viewportHeightAtMount: window.innerHeight
    });

    const restoreScroll = () => {
      const savedY = scrollPositions.get(pageKey) ?? 0;
      const docHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScrollableY = Math.max(0, docHeight - viewportHeight);

      console.log('[SM] restore attempt', {
        attempts,
        pageKey,
        navigationType,
        savedY,
        lenisScrollBefore: lenis.scroll,
        windowScrollYBefore: window.scrollY,
        docHeight,
        viewportHeight,
        maxScrollableY
      });

      if (navigationType !== 'POP') {
        lenis.scrollTo(0, { immediate: true });
        console.log('[SM] restore non-POP -> scrollTo(0)', {
          pageKey,
          lenisScrollAfterCall: lenis.scroll,
          windowScrollYAfterCall: window.scrollY
        });
        return;
      }

      if (maxScrollableY >= savedY || savedY === 0 || attempts >= maxAttempts) {
        const targetY = Math.min(savedY, maxScrollableY);
        lenis.scrollTo(targetY, { immediate: true });

        requestAnimationFrame(() => {
          console.log('[SM] restore applied', {
            pageKey,
            savedY,
            targetY,
            lenisScrollAfter: lenis.scroll,
            windowScrollYAfter: window.scrollY,
            docHeightAfter: document.documentElement.scrollHeight,
            maxScrollableYAfter: Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
          });
        });

        return;
      }

      attempts += 1;
      frameId = requestAnimationFrame(restoreScroll);
    };

    frameId = requestAnimationFrame(restoreScroll);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      console.log('[SM] restore effect cleanup', {
        pageKey
      });
    };
  }, [lenis, location.pathname, location.search, navigationType, location.state]);

  return null;
}