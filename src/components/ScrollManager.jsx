import { useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { LenisContext } from '../App';

const scrollPositions = new Map();

const ScrollManager = () => {
  const lenis = useContext(LenisContext);
  const location = useLocation();
  const navigationType = useNavigationType();
  const pageKey = useMemo(() => `${location.pathname}${location.search}`, [location.pathname, location.search]);

  const isRestoringRef = useRef(false);
  const restoreTargetRef = useRef(null);
  const restoreFrameRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
      console.log('[SM] history.scrollRestoration set to manual');
    }
  }, []);

  useEffect(() => {
    if (!lenis) {
      console.log('[SM] save effect skipped because lenis is not ready');
      return;
    }

    console.log('[SM] save effect mount', {
      pageKey,
      pathname: location.pathname,
      search: location.search,
      navigationType,
      locationState: location.state,
      windowScrollY: window.scrollY
    });

    const saveScroll = source => {
  if (isRestoringRef.current) {
    console.log('[SM] save skipped during restore', {
      source,
      pageKey,
      restoreTarget: restoreTargetRef.current,
      lenisScroll: lenis.scroll,
      windowScrollY: window.scrollY
    });
    return;
  }

  const y = Math.max(
    lenis.scroll ?? 0,
    window.scrollY ?? 0,
    document.documentElement.scrollTop ?? 0,
    document.body.scrollTop ?? 0
  );

  const prev = scrollPositions.get(pageKey);

  if (
    navigationType === 'POP' &&
    source === 'mount' &&
    prev != null &&
    y < 5 &&
    prev > 5
  ) {
    console.log('[SM] prevented POP mount overwrite', {
      pageKey,
      attemptedY: y,
      previousY: prev
    });
    return;
  }

  scrollPositions.set(pageKey, y);

  console.log('[SM] saveScroll', {
    source,
    pageKey,
    savedY: y,
    lenisScroll: lenis.scroll,
    windowScrollY: window.scrollY
  });
};

    const onLenisScroll = () => saveScroll('lenis-scroll');
    const onWindowScroll = () => saveScroll('window-scroll');

    lenis.on('scroll', onLenisScroll);
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    const existingSavedY = scrollPositions.get(pageKey);

if (!(navigationType === 'POP' && existingSavedY != null)) {
  saveScroll('mount');
} else {
  console.log('[SM] mount save skipped on POP because existing value exists', {
    pageKey,
    existingSavedY
  });
}

    return () => {
      saveScroll('cleanup');
      console.log('[SM] save effect cleanup', {
        pageKey,
        finalSavedY: scrollPositions.get(pageKey)
      });
      lenis.off('scroll', onLenisScroll);
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, [lenis, pageKey, location.pathname, location.search, location.state, navigationType]);

  useEffect(() => {
    if (!lenis) {
      console.log('[SM] restore effect skipped because lenis is not ready');
      return;
    }

    console.log('[SM] restore effect mount', {
      pageKey,
      pathname: location.pathname,
      search: location.search,
      navigationType,
      locationState: location.state,
      windowScrollY: window.scrollY
    });

    const savedY = scrollPositions.get(pageKey) ?? 0;
    restoreTargetRef.current = savedY;

    const tryRestore = attempt => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      console.log('[SM] restore attempt', {
        attempts: attempt,
        pageKey,
        navigationType,
        savedY,
        maxScroll,
        lenisScrollBefore: lenis.scroll,
        windowScrollYBefore: window.scrollY,
        docHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight
      });

      if (navigationType !== 'POP') {
        isRestoringRef.current = true;
        lenis.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);
        requestAnimationFrame(() => {
          isRestoringRef.current = false;
          restoreTargetRef.current = null;
        });

        console.log('[SM] restore non-POP -> scrollTo(0)', {
          pageKey,
          lenisScrollAfterCall: lenis.scroll,
          windowScrollYAfterCall: window.scrollY
        });
        return;
      }

      if (maxScroll < savedY - 4 && attempt < 60) {
        restoreFrameRef.current = requestAnimationFrame(() => tryRestore(attempt + 1));
        return;
      }

      isRestoringRef.current = true;

      lenis.scrollTo(savedY, { immediate: true, force: true });
      window.scrollTo(0, savedY);

      requestAnimationFrame(() => {
        const finalY = Math.max(
          lenis.scroll ?? 0,
          window.scrollY ?? 0,
          document.documentElement.scrollTop ?? 0,
          document.body.scrollTop ?? 0
        );

        const closeEnough = Math.abs(finalY - savedY) <= 4;

        console.log('[SM] restore applied', {
          pageKey,
          savedY,
          targetY: savedY,
          finalY,
          lenisScrollAfter: lenis.scroll,
          windowScrollYAfter: window.scrollY,
          closeEnough
        });

        if (!closeEnough && attempt < 60) {
          isRestoringRef.current = false;
          restoreFrameRef.current = requestAnimationFrame(() => tryRestore(attempt + 1));
          return;
        }

        isRestoringRef.current = false;
        restoreTargetRef.current = null;
      });
    };

    restoreFrameRef.current = requestAnimationFrame(() => tryRestore(0));

    return () => {
      if (restoreFrameRef.current) {
        cancelAnimationFrame(restoreFrameRef.current);
      }
      isRestoringRef.current = false;
      restoreTargetRef.current = null;
      console.log('[SM] restore effect cleanup', { pageKey });
    };
  }, [lenis, pageKey, navigationType, location.pathname, location.search, location.state]);

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

  return null;
};

export default ScrollManager;