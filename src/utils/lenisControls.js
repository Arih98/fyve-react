export const getFyveLenis = () => window.__fyveLenis || null;

export const resizeFyveLenis = () => {
  const lenis = getFyveLenis();

  if (lenis && typeof lenis.resize === 'function') {
    lenis.resize();
  }
};

export const fyveScrollTo = (target, options = {}) => {
  const lenis = getFyveLenis();

  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(target, {
      immediate: true,
      force: true,
      ...options
    });

    return;
  }

  window.scrollTo(0, Number(target) || 0);
};

export const freezeFyveLenisAtCurrentScroll = () => {
  const lenis = getFyveLenis();
  const y = window.scrollY || window.pageYOffset || 0;

  if (!lenis) return y;

  if (typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(y, {
      immediate: true,
      force: true
    });
  }

  if (typeof lenis.stop === 'function') {
    lenis.stop();
  }

  return y;
};

export const stopFyveLenis = () => {
  const lenis = getFyveLenis();

  if (lenis && typeof lenis.stop === 'function') {
    lenis.stop();
  }
};

export const startFyveLenis = () => {
  const lenis = getFyveLenis();

  if (lenis && typeof lenis.start === 'function') {
    lenis.start();
  }
};