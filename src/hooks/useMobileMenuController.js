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
    if (isMenuOpen && menuState !== 'open') {
      setMenuState('open');
    }

    if (!isMenuOpen && menuState === 'open') {
      setMenuState('closing');
    }
  }, [isMenuOpen, menuState]);

  useEffect(() => {
    if (menuState !== 'closing') return;

    const closeDuration = window.innerWidth <= 768 ? 220 : 750;

    const timeout = setTimeout(() => {
      setMenuState('closed');
    }, closeDuration);

    return () => {
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

    gsap.killTweensOf([topLine, middleLine, bottomLine, xLineLeft, xLineRight]);

    if (menuState === 'open' && prevMenuStateRef.current !== 'open') {
      setIsAnimating(true);
      gsap.set([topLine, middleLine, bottomLine], { scaleX: 1 });
      gsap.set([xLineLeft, xLineRight], { strokeDashoffset: 44 });

      if (window.innerWidth <= 768) {
        gsap.to(topLine, { scaleX: 0, duration: 0.14, ease: 'power2.inOut', delay: 0.04 });
        gsap.to(middleLine, { scaleX: 0, duration: 0.14, ease: 'power2.inOut', delay: 0.11 });
        gsap.to(bottomLine, { scaleX: 0, duration: 0.14, ease: 'power2.inOut', delay: 0.18 });
        gsap.to(xLineLeft, { strokeDashoffset: 0, duration: 0.14, ease: 'power2.inOut', delay: 0.25 });
        gsap.to(xLineRight, {
          strokeDashoffset: 0,
          duration: 0.14,
          ease: 'power2.inOut',
          delay: 0.31,
          onComplete: () => setIsAnimating(false)
        });
      } else {
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
      }
    } else if (menuState === 'closing' && prevMenuStateRef.current !== 'closing') {
      setIsAnimating(true);

      if (window.innerWidth <= 768) {
        gsap.to(xLineRight, { strokeDashoffset: 44, duration: 0.12, ease: 'power2.inOut', delay: 0.0 });
        gsap.to(xLineLeft, { strokeDashoffset: 44, duration: 0.12, ease: 'power2.inOut', delay: 0.04 });
        gsap.to(bottomLine, { scaleX: 1, duration: 0.12, ease: 'power2.inOut', delay: 0.08 });
        gsap.to(middleLine, { scaleX: 1, duration: 0.12, ease: 'power2.inOut', delay: 0.12 });
        gsap.to(topLine, {
          scaleX: 1,
          duration: 0.12,
          ease: 'power2.inOut',
          delay: 0.16,
          onComplete: () => setIsAnimating(false)
        });
      } else {
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
    } else if (menuState === 'closed' && prevMenuStateRef.current !== 'closed') {
      gsap.set([xLineLeft, xLineRight], { strokeDashoffset: 44 });
      gsap.set([topLine, middleLine, bottomLine], { scaleX: 1 });
      setIsAnimating(false);
    }

    prevMenuStateRef.current = menuState;
  }, [menuState]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('locked');
    } else {
      document.body.classList.remove('locked');
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    if (window.innerWidth > 768 && (isAnimating || menuState === 'closing')) return;
    if (window.innerWidth <= 768 && menuState === 'closing') return;
    setIsMenuOpen(v => !v);
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