let activeClone = null;
let activeAnimation = null;
let activeTargetWaitController = null;
let transitionRunId = 0;

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
  { maxAttempts = 90, maxFramesPerAttempt = 20, stableFrames = 2, signal } = {}
) => {
  let hiddenElement = null;
  let hiddenElementOpacity = '';

  const restoreHiddenElement = () => {
    if (hiddenElement && hiddenElement.isConnected) {
      hiddenElement.style.opacity = hiddenElementOpacity;
    }

    hiddenElement = null;
    hiddenElementOpacity = '';
  };

  const hideElement = (el) => {
    if (!el) return;

    if (hiddenElement === el) {
      el.style.opacity = '0';
      return;
    }

    restoreHiddenElement();

    hiddenElement = el;
    hiddenElementOpacity = el.style.opacity;
    el.style.opacity = '0';
  };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (signal?.aborted) {
      restoreHiddenElement();
      return null;
    }

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
      if (signal?.aborted) {
        restoreHiddenElement();
        return null;
      }

      await waitForNextFrame();

      if (signal?.aborted) {
        restoreHiddenElement();
        return null;
      }

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
          return {
            element: el,
            rect,
            restore: restoreHiddenElement
          };
        }
      } else {
        stableCount = 0;
      }

      previousRect = rect;
    }

    if (!disconnected && el.isConnected) {
      const rect = getRect(el);

      if (rect.width && rect.height) {
        return {
          element: el,
          rect,
          restore: restoreHiddenElement
        };
      }
    }
  }

  restoreHiddenElement();
  return null;
};

const decodeImage = async (el) => {
  if (el.naturalWidth <= 0) return false;

  if (typeof el.decode === 'function') {
    try {
      await el.decode();
    } catch {}
  }

  return el.naturalWidth > 0;
};

const waitForImageReady = async (el) => {
  if (!(el instanceof HTMLImageElement)) return false;

  if (el.complete) {
    return decodeImage(el);
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

  return decodeImage(el);
};

const createClone = ({ src, fromRect, fromStyle, zIndex }) => {
  const clone = document.createElement('img');
  const objectFit = fromStyle.objectFit && fromStyle.objectFit !== 'fill' ? fromStyle.objectFit : 'cover';

  clone.src = src;
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.style.position = 'fixed';
  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.display = 'block';
  clone.style.maxWidth = 'none';
  clone.style.maxHeight = 'none';
  clone.style.objectFit = objectFit;
  clone.style.objectPosition = fromStyle.objectPosition || 'center center';
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
  fillTarget = false,
  beforeTargetMeasure = null,
  onBeforeRemove = null,
  onComplete = null,
  hideFromElement = true
}) => {
  if (!src || !fromElement) return;

  transitionRunId += 1;
  const runId = transitionRunId;

  if (activeTargetWaitController) {
    activeTargetWaitController.abort();
    activeTargetWaitController = null;
  }

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
    return;
  }

  const fromStyle = window.getComputedStyle(fromElement);
  const previousFromOpacity = fromElement.style.opacity;

  const clone = createClone({
    src,
    fromRect,
    fromStyle,
    zIndex
  });

  activeClone = clone;
  document.body.classList.add('product-image-transition-active');

  let targetWaitController = null;
  let stableTarget = null;
  let toElement = null;
  let animation = null;

  const cleanup = () => {
    stableTarget?.restore?.();

    if (toElement && toElement.isConnected) {
      toElement.style.opacity = '';
    }

    if (fromElement && fromElement.isConnected) {
      fromElement.style.opacity = previousFromOpacity;
    }

    if (clone && clone.isConnected) {
      clone.remove();
    }

    if (activeClone === clone) {
      activeClone = null;
    }

    if (activeAnimation === animation) {
      activeAnimation = null;
    }

    if (activeTargetWaitController === targetWaitController) {
      activeTargetWaitController = null;
    }

    if (runId === transitionRunId) {
      document.body.classList.remove('product-image-transition-active');
    }
  };

  const imageReady = await waitForImageReady(clone);

  if (!imageReady || runId !== transitionRunId || activeClone !== clone || !clone.isConnected) {
    cleanup();
    return;
  }

if (hideFromElement) {
  fromElement.style.opacity = '0';
}

clone.style.opacity = '1';

  try {
    if (typeof beforeTargetMeasure === 'function') {
      await beforeTargetMeasure({
        clone,
        fromElement
      });
    }
  } catch (error) {
    console.error(error);
  }

  targetWaitController = new AbortController();
  activeTargetWaitController = targetWaitController;

  stableTarget = await waitForStableElementRect(toElementGetter, {
    maxAttempts: 90,
    maxFramesPerAttempt: 20,
    stableFrames: 2,
    signal: targetWaitController.signal
  });

  if (runId !== transitionRunId || activeClone !== clone || !clone.isConnected) {
    cleanup();
    return;
  }

  if (!stableTarget || !stableTarget.element || !stableTarget.rect) {
    cleanup();
    return;
  }

  toElement = stableTarget.element;
  const stableRect = stableTarget.rect;

  if (!stableRect.width || !stableRect.height) {
    cleanup();
    return;
  }

  const toRect = {
    left: stableRect.left,
    top: Math.max(stableRect.top, minTargetTop),
    width: stableRect.width,
    height: stableRect.height
  };

  const finalRect = fillTarget
    ? {
        left: toRect.left,
        top: toRect.top,
        width: toRect.width,
        height: toRect.height
      }
    : (() => {
        const scale = Math.min(toRect.width / fromRect.width, toRect.height / fromRect.height);
        const width = fromRect.width * scale;
        const height = fromRect.height * scale;

        return {
          left: toRect.left + (toRect.width - width) / 2,
          top: toRect.top + (toRect.height - height) / 2,
          width,
          height
        };
      })();

  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;

  clone.getBoundingClientRect();

  animation = clone.animate(
    [
      {
        left: `${fromRect.left}px`,
        top: `${fromRect.top}px`,
        width: `${fromRect.width}px`,
        height: `${fromRect.height}px`,
        opacity: 1
      },
      {
        left: `${finalRect.left}px`,
        top: `${finalRect.top}px`,
        width: `${finalRect.width}px`,
        height: `${finalRect.height}px`,
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

  const finishTransition = async () => {
    if (activeClone !== clone || activeAnimation !== animation) {
      cleanup();
      return;
    }

    try {
      if (typeof onBeforeRemove === 'function') {
        await onBeforeRemove();
      }
    } catch (error) {
      console.error(error);
    }

    await waitForNextFrame();

    cleanup();

    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  animation.addEventListener('finish', finishTransition, { once: true });
  animation.addEventListener('cancel', cleanup, { once: true });
};

export const clearProductImageTransitionClone = () => {
  transitionRunId += 1;

  if (activeTargetWaitController) {
    activeTargetWaitController.abort();
    activeTargetWaitController = null;
  }

  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }

  document.body.classList.remove('product-image-transition-active');
};