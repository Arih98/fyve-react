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

export const getFyveLenis = () => fyveLenis;

export const stopFyveLenis = (reason = 'default') => {
  stoppedReasons.add(reason);
  fyveLenis?.stop?.();
};

export const startFyveLenis = (reason = 'default') => {
  stoppedReasons.delete(reason);

  if (stoppedReasons.size === 0) {
    fyveLenis?.start?.();
  }
};

export const resetFyveLenisStops = () => {
  stoppedReasons.clear();
  fyveLenis?.start?.();
};

export const resizeFyveLenis = () => {
  fyveLenis?.resize?.();
};

export const fyveScrollTo = (target = 0, options = {}) => {
  const immediate = options.immediate ?? true;
  const force = options.force ?? true;

  if (fyveLenis?.scrollTo) {
    fyveLenis.scrollTo(target, {
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