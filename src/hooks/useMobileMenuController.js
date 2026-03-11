import { useContext, useEffect, useRef, useState } from 'react';
import { MenuContext } from '../MenuContext';
import gsap from 'gsap';

export function useMobileMenuController() {
  const { isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [menuState, setMenuState] = useState('closed');
  const [isAnimating, setIsAnimating] = useState(false);
  const burgerRef = useRef(null);
  const prevMenuStateRef = useRef('closed');

useEffect(() => {
  console.log('[MMC] sync effect start', {
    isMenuOpen,
    menuState,
    bodyLocked: document.body.classList.contains('locked')
  });

  if (isMenuOpen && menuState !== 'open') {
    console.log('[MMC] setting menuState -> open');
    setMenuState('open');
  }

  if (!isMenuOpen && menuState === 'open') {
    console.log('[MMC] setting menuState -> closing');
    setMenuState('closing');
  }
}, [isMenuOpen, menuState]);

useEffect(() => {
  if (menuState !== 'closing') return;

  console.log('[MMC] closing timer started');

  const timeout = setTimeout(() => {
    console.log('[MMC] timeout finished, setting menuState -> closed');
    setMenuState('closed');
  }, 750);

  return () => {
    console.log('[MMC] clearing closing timeout');
    clearTimeout(timeout);
  };
}, [menuState]);


  useEffect(() => {
    if (!burgerRef.current) return;
    const xSvg = burgerRef.current.querySelector('.x-svg');
    if (!xSvg) return;
    const xLineLeft = xSvg.querySelector('.x-line.left');
    const xLineRight = xSvg.querySelector('.x-line.right');
    if (!xLineLeft || !xLineRight) return;
    gsap.set([xLineLeft, xLineRight], { strokeDashoffset: 44 });
  }, []);

  useEffect(() => {
    if (!burgerRef.current) return;

    const topLine = burgerRef.current.querySelector('.hamburger-line.top');
    const middleLine = burgerRef.current.querySelector('.hamburger-line.middle');
    const bottomLine = burgerRef.current.querySelector('.hamburger-line.bottom');
    const xSvg = burgerRef.current.querySelector('.x-svg');

    if (!topLine || !middleLine || !bottomLine || !xSvg) return;

    const xLineLeft = xSvg.querySelector('.x-line.left');
    const xLineRight = xSvg.querySelector('.x-line.right');

    if (!xLineLeft || !xLineRight) return;

    if (menuState === 'open' && prevMenuStateRef.current !== 'open') {
      setIsAnimating(true);
      gsap.set([topLine, middleLine, bottomLine], { scaleX: 1 });
      gsap.set([xLineLeft, xLineRight], { strokeDashoffset: 44 });
      gsap.to(topLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.2 });
      gsap.to(middleLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.5 });
      gsap.to(bottomLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut', delay: 0.8 });
      gsap.to(xLineLeft, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.inOut', delay: 1.1 });
      gsap.to(xLineRight, {
        strokeDashoffset: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        delay: 1.3,
        onComplete: () => setIsAnimating(false)
      });
    } else if (menuState === 'closing' && prevMenuStateRef.current !== 'closing') {
      setIsAnimating(true);
      gsap.to(xLineRight, { strokeDashoffset: 44, duration: 0.3, ease: 'power2.inOut', delay: 0.0 });
      gsap.to(xLineLeft, { strokeDashoffset: 44, duration: 0.3, ease: 'power2.inOut', delay: 0.2 });
      gsap.to(bottomLine, { scaleX: 1, duration: 0.3, ease: 'power2.inOut', delay: 0.5 });
      gsap.to(middleLine, { scaleX: 1, duration: 0.3, ease: 'power2.inOut', delay: 0.8 });
      gsap.to(topLine, {
        scaleX: 1,
        duration: 0.3,
        ease: 'power2.inOut',
        delay: 1.1,
        onComplete: () => setIsAnimating(false)
      });
    }

    prevMenuStateRef.current = menuState;
  }, [menuState]);

useEffect(() => {
  if (isMenuOpen) {
    document.body.classList.add('locked');
  } else {
    document.body.classList.remove('locked');
  }

  console.log('[MMC] body lock effect', {
    isMenuOpen,
    menuState,
    bodyClass: document.body.className,
    bodyLocked: document.body.classList.contains('locked')
  });
}, [isMenuOpen, menuState]);

const toggleMenu = () => {
  console.log('[MMC] toggleMenu called', {
    isAnimating,
    menuState,
    isMenuOpenBefore: isMenuOpen,
    bodyLocked: document.body.classList.contains('locked')
  });

  if (isAnimating || menuState === 'closing') {
    console.log('[MMC] toggleMenu blocked', {
      isAnimating,
      menuState
    });
    return;
  }

  setIsMenuOpen(v => {
    const next = !v;
    console.log('[MMC] setIsMenuOpen updater', {
      previous: v,
      next
    });
    return next;
  });
};

  return {
    isMenuOpen,
    setIsMenuOpen,
    menuState,
    isAnimating,
    burgerRef,
    toggleMenu
  };
}
