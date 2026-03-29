let activeClone = null;
let activeAnimation = null;

const waitForNextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const getRect = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
};

const rectsMatch = (a, b, tolerance = 0.5) =>
  Math.abs(a.left - b.left) <= tolerance &&
  Math.abs(a.top - b.top) <= tolerance &&
  Math.abs(a.width - b.width) <= tolerance &&
  Math.abs(a.height - b.height) <= tolerance;

const waitForStableRect = async (el, { maxFrames = 12, stableFrames = 2 } = {}) => {
  let previousRect = null;
  let stableCount = 0;

  for (let i = 0; i < maxFrames; i += 1) {
    await waitForNextFrame();

    if (!el || !el.isConnected) return null;

    const rect = getRect(el);

    if (!rect.width || !rect.height) {
      previousRect = rect;
      stableCount = 0;
      continue;
    }

    if (previousRect && rectsMatch(previousRect, rect)) {
      stableCount += 1;
      if (stableCount >= stableFrames) {
        return rect;
      }
    } else {
      stableCount = 0;
    }

    previousRect = rect;
  }

  return el && el.isConnected ? getRect(el) : null;
};

const waitForImageReady = async (el) => {
  if (!(el instanceof HTMLImageElement)) return;

  if (el.complete && el.naturalWidth > 0) {
    if (typeof el.decode === 'function') {
      try {
        await el.decode();
      } catch {}
    }
    return;
  }

  await new Promise((resolve) => {
    const done = () => {
      el.removeEventListener('load', done);
      el.removeEventListener('error', done);
      resolve();
    };

    el.addEventListener('load', done, { once: true });
    el.addEventListener('error', done, { once: true });
  });

  if (typeof el.decode === 'function') {
    try {
      await el.decode();
    } catch {}
  }
};

const createClone = ({ src, fromRect, zIndex = 999999 }) => {
  const clone = document.createElement('img');
  clone.src = src;
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.style.position = 'fixed';
  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.objectFit = 'contain';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = String(zIndex);
  clone.style.background = '#f7f7f7';
  clone.style.boxSizing = 'border-box';
  clone.style.opacity = '1';
  clone.style.willChange = 'left, top, width, height, opacity';
  document.body.appendChild(clone);
  return clone;
};

export const startProductImageTransitionToTarget = async ({
  src,
  fromRect,
  toElement,
  duration = 750,
  minTargetTop = 0,
  zIndex = 999999,
  onFinish
}) => {
  if (!src || !fromRect || !toElement) return;
  if (!toElement.isConnected) return;

  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }

  toElement.style.opacity = '0';

  await waitForImageReady(toElement);

  const stableRect = await waitForStableRect(toElement, {
    maxFrames: 12,
    stableFrames: 2
  });

  if (!stableRect || !stableRect.width || !stableRect.height) {
    toElement.style.opacity = '';
    if (onFinish) onFinish();
    return;
  }

  const toRect = {
    left: stableRect.left,
    top: Math.max(stableRect.top, minTargetTop),
    width: stableRect.width,
    height: stableRect.height
  };

  const clone = createClone({
    src,
    fromRect,
    zIndex
  });

  activeClone = clone;

  await waitForNextFrame();
  clone.getBoundingClientRect();

  const animation = clone.animate(
    [
      {
        left: `${fromRect.left}px`,
        top: `${fromRect.top}px`,
        width: `${fromRect.width}px`,
        height: `${fromRect.height}px`,
        opacity: 1
      },
      {
        left: `${toRect.left}px`,
        top: `${toRect.top}px`,
        width: `${toRect.width}px`,
        height: `${toRect.height}px`,
        opacity: 1
      }
    ],
    {
      duration,
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
      fill: 'forwards'
    }
  );

  activeAnimation = animation;

  const cleanup = () => {
    toElement.style.opacity = '';
    clone.remove();

    if (activeClone === clone) {
      activeClone = null;
    }

    if (activeAnimation === animation) {
      activeAnimation = null;
    }

    if (onFinish) onFinish();
  };

  animation.addEventListener('finish', cleanup, { once: true });
  animation.addEventListener('cancel', cleanup, { once: true });
};

export const clearProductImageTransitionClone = () => {
  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }
};