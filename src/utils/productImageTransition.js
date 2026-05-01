let activeClone = null;
let activeAnimation = null;

let lastTransitionStart = {
  src: '',
  fromElement: null,
  time: 0
};

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

const waitForStableElementRect = async (
  getEl,
  { maxAttempts = 90, maxFramesPerAttempt = 20, stableFrames = 2, hideElementWhileWaiting = true } = {}
) => {
  let hiddenElement = null;

  const hideElement = (el) => {
    if (!hideElementWhileWaiting) return;
    if (!el) return;

    if (hiddenElement && hiddenElement !== el && hiddenElement.isConnected) {
      hiddenElement.style.opacity = '';
    }

    el.style.opacity = '0';
    hiddenElement = el;
  };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const el = getEl?.();

    if (!el || !el.isConnected) {
      await waitForNextFrame();
      continue;
    }

    hideElement(el);

    let previousRect = null;
    let stableCount = 0;
    let disconnected = false;

    for (let i = 0; i < maxFramesPerAttempt; i += 1) {
      await waitForNextFrame();

      if (!el.isConnected) {
        disconnected = true;
        break;
      }

      const latestEl = getEl?.();

      if (!latestEl || !latestEl.isConnected || latestEl !== el) {
        disconnected = true;
        break;
      }

      hideElement(latestEl);

      const rect = getRect(el);

      if (!rect.width || !rect.height) {
        stableCount = 0;
        previousRect = rect;
        continue;
      }

      if (previousRect && rectsMatch(previousRect, rect)) {
        stableCount += 1;

        if (stableCount >= stableFrames) {
          return { element: el, rect };
        }
      } else {
        stableCount = 0;
      }

      previousRect = rect;
    }

    if (!disconnected && el.isConnected) {
      const rect = getRect(el);

      if (rect.width && rect.height) {
        return { element: el, rect };
      }
    }
  }

  return null;
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

const createClone = ({ src, fromRect, fromStyle, zIndex }) => {
  const clone = document.createElement('img');

  clone.src = src;
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.style.position = 'fixed';
  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.objectFit = 'cover';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = String(zIndex);
  clone.style.background = 'transparent';
  clone.style.borderRadius = fromStyle.borderRadius || '0px';
  clone.style.boxSizing = fromStyle.boxSizing || 'border-box';
  clone.style.transformOrigin = 'center center';
  clone.style.willChange = 'left, top, width, height, opacity, border-radius';
  clone.style.opacity = '0';

  document.body.appendChild(clone);

  return clone;
};

export const startProductImageTransition = async ({
  src,
  fromElement,
  toElementGetter,
  duration = 750,
  minTargetTop = 0,
  zIndex = 999999,
  restoreFromElement = true,
  hideTarget = true
}) => {
  if (!src || !fromElement) return;

  const currentTime = performance.now();

  if (
    lastTransitionStart.src === src &&
    lastTransitionStart.fromElement === fromElement &&
    currentTime - lastTransitionStart.time < 220
  ) {
    return;
  }

  lastTransitionStart = {
    src,
    fromElement,
    time: currentTime
  };

  document.body.classList.add('product-image-transition-active');

  const removeActiveClass = () => {
    document.body.classList.remove('product-image-transition-active');
  };

  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }

  const fromRect = getRect(fromElement);

  if (!fromRect.width || !fromRect.height) {
    removeActiveClass();
    return;
  }

  const fromStyle = window.getComputedStyle(fromElement);

  const clone = createClone({
    src,
    fromRect,
    fromStyle,
    zIndex
  });

  activeClone = clone;

  fromElement.style.opacity = '0';
  clone.style.opacity = '1';

  const stableTargetPromise = waitForStableElementRect(toElementGetter, {
    maxAttempts: 90,
    maxFramesPerAttempt: 20,
    stableFrames: 2,
    hideElementWhileWaiting: hideTarget
  });

  await waitForImageReady(clone);

  const stableTarget = await stableTargetPromise;

  if (!stableTarget || !stableTarget.element || !stableTarget.rect) {
    if (restoreFromElement) {
      fromElement.style.opacity = '';
    }

    clone.remove();

    if (activeClone === clone) {
      activeClone = null;
    }

    removeActiveClass();
    return;
  }

  const toElement = stableTarget.element;
  const stableRect = stableTarget.rect;

  if (!stableRect.width || !stableRect.height) {
    if (hideTarget) {
      toElement.style.opacity = '';
    }

    if (restoreFromElement) {
      fromElement.style.opacity = '';
    }

    clone.remove();

    if (activeClone === clone) {
      activeClone = null;
    }

    removeActiveClass();
    return;
  }

  const toRect = {
    left: stableRect.left,
    top: Math.max(stableRect.top, minTargetTop),
    width: stableRect.width,
    height: stableRect.height
  };

  const scale = Math.min(toRect.width / fromRect.width, toRect.height / fromRect.height);
  const finalWidth = fromRect.width * scale;
  const finalHeight = fromRect.height * scale;
  const finalLeft = toRect.left + (toRect.width - finalWidth) / 2;
  const finalTop = toRect.top + (toRect.height - finalHeight) / 2;

  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.objectFit = 'cover';

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
        left: `${finalLeft}px`,
        top: `${finalTop}px`,
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
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

  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;

    cleaned = true;

    if (hideTarget) {
      toElement.style.opacity = '';
    }

    if (restoreFromElement) {
      fromElement.style.opacity = '';
    }

    clone.remove();
    removeActiveClass();

    if (activeClone === clone) {
      activeClone = null;
    }

    if (activeAnimation === animation) {
      activeAnimation = null;
    }
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

  activeClone = null;
  document.body.classList.remove('product-image-transition-active');
};