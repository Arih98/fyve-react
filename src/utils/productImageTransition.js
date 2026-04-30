let activeClone = null;
let activeAnimation = null;
let activeSourceElement = null;
let activeRestoreFromElement = true;
let activeToken = 0;

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
  clone.style.opacity = '1';

  document.body.appendChild(clone);

  return clone;
};

const cancelActiveTransition = ({ restoreSource = true } = {}) => {
  activeToken += 1;

  if (activeAnimation) {
    try {
      activeAnimation.cancel();
    } catch {}
  }

  if (restoreSource && activeSourceElement && activeRestoreFromElement) {
    activeSourceElement.style.opacity = '';
  }

  if (activeClone) {
    activeClone.remove();
  }

  activeClone = null;
  activeAnimation = null;
  activeSourceElement = null;
  activeRestoreFromElement = true;
  document.body.classList.remove('product-image-transition-active');
};

const createPreparedSession = ({
  src,
  fromElement,
  zIndex = 999999,
  restoreFromElement = true
}) => {
  if (!src || !fromElement) return null;

  cancelActiveTransition({ restoreSource: true });

  const token = activeToken + 1;
  activeToken = token;

  const fromRect = getRect(fromElement);

  if (!fromRect.width || !fromRect.height) {
    document.body.classList.remove('product-image-transition-active');
    return null;
  }

  const fromStyle = window.getComputedStyle(fromElement);

  document.body.classList.add('product-image-transition-active');

  const clone = createClone({
    src,
    fromRect,
    fromStyle,
    zIndex
  });

  fromElement.style.opacity = '0';

  activeClone = clone;
  activeSourceElement = fromElement;
  activeRestoreFromElement = restoreFromElement;

  return {
    token,
    clone,
    fromElement,
    fromRect,
    restoreFromElement
  };
};

const playPreparedSession = async (
  session,
  {
    toElementGetter,
    duration = 750,
    minTargetTop = 0,
    hideTarget = true
  } = {}
) => {
  if (!session || !session.clone || !session.fromElement) return;
  if (session.token !== activeToken) return;

  const stableTargetPromise = waitForStableElementRect(toElementGetter, {
    maxAttempts: 90,
    maxFramesPerAttempt: 20,
    stableFrames: 2,
    hideElementWhileWaiting: hideTarget
  });

  await waitForImageReady(session.clone);

  if (session.token !== activeToken || !session.clone.isConnected) return;

  const stableTarget = await stableTargetPromise;

  if (session.token !== activeToken || !session.clone.isConnected) return;

  if (!stableTarget || !stableTarget.element || !stableTarget.rect) {
    cancelActiveTransition({ restoreSource: true });
    return;
  }

  const toElement = stableTarget.element;
  const stableRect = stableTarget.rect;

  if (!stableRect.width || !stableRect.height) {
    if (hideTarget) {
      toElement.style.opacity = '';
    }

    cancelActiveTransition({ restoreSource: true });
    return;
  }

  const fromRect = session.fromRect;

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

  session.clone.style.left = `${fromRect.left}px`;
  session.clone.style.top = `${fromRect.top}px`;
  session.clone.style.width = `${fromRect.width}px`;
  session.clone.style.height = `${fromRect.height}px`;
  session.clone.style.objectFit = 'cover';

  session.clone.getBoundingClientRect();

  const animation = session.clone.animate(
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
    if (session.token !== activeToken) return;

    cleaned = true;

    if (hideTarget) {
      toElement.style.opacity = '';
    }

    if (session.restoreFromElement && session.fromElement) {
      session.fromElement.style.opacity = '';
    }

    if (session.clone) {
      session.clone.remove();
    }

    activeClone = null;
    activeAnimation = null;
    activeSourceElement = null;
    activeRestoreFromElement = true;
    document.body.classList.remove('product-image-transition-active');
  };

  animation.addEventListener('finish', cleanup, { once: true });
  animation.addEventListener('cancel', cleanup, { once: true });
};

export const prepareProductImageTransition = ({
  src,
  fromElement,
  zIndex = 999999,
  restoreFromElement = true
}) => {
  const session = createPreparedSession({
    src,
    fromElement,
    zIndex,
    restoreFromElement
  });

  if (!session) return null;

  return {
    play(options) {
      return playPreparedSession(session, options);
    },
    cancel() {
      if (session.token === activeToken) {
        cancelActiveTransition({ restoreSource: true });
      }
    }
  };
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
  const prepared = prepareProductImageTransition({
    src,
    fromElement,
    zIndex,
    restoreFromElement
  });

  if (!prepared) return;

  return prepared.play({
    toElementGetter,
    duration,
    minTargetTop,
    hideTarget
  });
};

export const clearProductImageTransitionClone = () => {
  cancelActiveTransition({ restoreSource: true });
};