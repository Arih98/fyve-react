import { useContext, useEffect, useRef, useState } from 'react';
import { MenuContext } from '../MenuContext';
import gsap from 'gsap';

export function useMobileMenuController() {
  const { isMenuOpen, setIsMenuOpen } = useContext(MenuContext);
  const [menuState, setMenuState] = useState('closed');
  const [isAnimating, setIsAnimating] = useState(false);
  const burgerRef = useRef(null);
  const prevMenuStateRef = useRef('closed');
  const iconTimelineRef = useRef(null);

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

    const timeout = setTimeout(() => {
      setMenuState('closed');
    }, 750);

    return () => {
      clearTimeout(timeout);
    };
  }, [menuState]);

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

  gsap.set([topLine, middleLine, bottomLine], { scaleX: 1 });
  gsap.set([xLineLeft, xLineRight], { strokeDashoffset: 44 });

  const tl = gsap.timeline({ paused: true });

  tl.to(topLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.2)
    .to(middleLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.5)
    .to(bottomLine, { scaleX: 0, duration: 0.3, ease: 'power2.inOut' }, 0.8)
    .to(xLineLeft, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.inOut' }, 1.1)
    .to(xLineRight, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.inOut' }, 1.3);

  iconTimelineRef.current = tl;

  return () => {
    tl.kill();
    iconTimelineRef.current = null;
  };
}, []);

useEffect(() => {
  const tl = iconTimelineRef.current;
  if (!tl) return;

  setIsAnimating(true);

  if (menuState === 'open') {
    tl.timeScale(1).play();
  } else if (menuState === 'closing' || menuState === 'closed') {
    tl.timeScale(1).reverse();
  }

  const onComplete = () => setIsAnimating(false);
  const onReverseComplete = () => setIsAnimating(false);

  tl.eventCallback('onComplete', onComplete);
  tl.eventCallback('onReverseComplete', onReverseComplete);

  prevMenuStateRef.current = menuState;
}, [menuState]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('locked');
    } else {
      document.body.classList.remove('locked');
    }
  }, [isMenuOpen]);

  useEffect(() => {
  if (isMenuOpen) {
    window.history.pushState({ menuOpen: true }, '');
  }

  const handlePopState = (e) => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, [isMenuOpen]);

const toggleMenu = () => {
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