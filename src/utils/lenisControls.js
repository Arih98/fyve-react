let fyveLenis = null;
const stoppedReasons = new Set();

export const setFyveLenis = (instance) => {
  fyveLenis = instance || null;

  if (typeof window !== 'undefined') {
    window.__fyveLenis = fyveLenis;
  }

  if (fyveLenis && stoppedReasons.size > 0) {
    fyveLenis.stop?.();
  }
};

export const getFyveLenis = () => {
  if (typeof window !== 'undefined' && window.__fyveLenis) {
    return window.__fyveLenis;
  }

  return fyveLenis;
};

export const stopFyveLenis = (reason = 'default') => {
  stoppedReasons.add(reason);
  getFyveLenis()?.stop?.();
};

export const startFyveLenis = (reason = 'default') => {
  stoppedReasons.delete(reason);

  if (stoppedReasons.size === 0) {
    getFyveLenis()?.start?.();
  }
};

export const resetFyveLenisStops = () => {
  stoppedReasons.clear();
  getFyveLenis()?.start?.();
};

export const resizeFyveLenis = () => {
  getFyveLenis()?.resize?.();
};

export const fyveScrollTo = (target = 0, options = {}) => {
  const lenis = getFyveLenis();
  const immediate = options.immediate ?? true;
  const force = options.force ?? true;

  if (lenis?.scrollTo) {
    lenis.scrollTo(target, {
      immediate,
      force,
      offset: options.offset,
      duration: options.duration,
      lock: options.lock
    });

    return;
  }

  if (typeof target === 'number') {
    window.scrollTo(0, target);
    return;
  }

  if (target instanceof Element) {
    target.scrollIntoView({
      behavior: immediate ? 'auto' : 'smooth',
      block: options.block || 'start',
      inline: options.inline || 'nearest'
    });
  }
};

export const freezeFyveLenisAtCurrentScroll = () => {
  const lenis = getFyveLenis();
  const y = window.scrollY || window.pageYOffset || 0;

  if (!lenis) {
    return y;
  }

  lenis.scrollTo?.(y, {
    immediate: true,
    force: true
  });

  lenis.stop?.();

  return y;
};