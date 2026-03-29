let activeClone = null;
let activeAnimation = null;

const waitForElement = (getEl, { maxFrames = 90 } = {}) =>
  new Promise((resolve) => {
    let frame = 0;

    const check = () => {
      const el = getEl?.();

      if (el && el.isConnected) {
        resolve(el);
        return;
      }

      frame += 1;
      if (frame >= maxFrames) {
        resolve(null);
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });

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

const waitForStableRect = async (el, { maxFrames = 20, stableFrames = 2 } = {}) => {
  let previousRect = null;
  let stableCount = 0;

  for (let i = 0; i < maxFrames; i += 1) {
    await waitForNextFrame();

    if (!el || !el.isConnected) return null;

    const rect = getRect(el);

    if (!rect.width || !rect.height) {
      stableCount = 0;
      previousRect = rect;
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
  clone.style.objectFit = fromStyle.objectFit || 'contain';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = String(zIndex);
  clone.style.background = fromStyle.backgroundColor || '#f7f7f7';
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
  zIndex = 999999
}) => {
  if (!src || !fromElement) return;

  if (activeAnimation) {
    console.log('[TRANSITION] cancelling previous animation');
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    console.log('[TRANSITION] removing previous clone');
    activeClone.remove();
    activeClone = null;
  }

  const fromRect = getRect(fromElement);

  console.log('[TRANSITION] source', {
    src,
    fromRect,
    sourceTag: fromElement.tagName,
    sourceCurrentSrc: fromElement.currentSrc || fromElement.src || null,
    scrollY: window.scrollY
  });

  if (!fromRect.width || !fromRect.height) {
    console.log('[TRANSITION] invalid source rect', fromRect);
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

  const toElement = await waitForElement(toElementGetter);

  if (!toElement) {
    console.log('[TRANSITION] target not found');
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  console.log('[TRANSITION] target found', {
    targetTag: toElement.tagName,
    targetRect: getRect(toElement),
    targetCurrentSrc: toElement.currentSrc || toElement.src || null,
    sameNodeAsSource: toElement === fromElement,
    scrollY: window.scrollY
  });

  toElement.style.opacity = '0';

  if (!toElement.isConnected) {
    console.log('[TRANSITION] target disconnected immediately');
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  await waitForImageReady(toElement);

  const stableRect = await waitForStableRect(toElement, {
    maxFrames: 20,
    stableFrames: 2
  });

  console.log('[TRANSITION] target stable rect', {
    stableRect,
    targetCurrentSrc: toElement.currentSrc || toElement.src || null,
    targetConnected: toElement.isConnected,
    scrollY: window.scrollY
  });

  if (!stableRect || !stableRect.width || !stableRect.height) {
    console.log('[TRANSITION] invalid stable rect', stableRect);
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  const toStyle = window.getComputedStyle(toElement);

  const toRect = {
    left: stableRect.left,
    top: Math.max(stableRect.top, minTargetTop),
    width: stableRect.width,
    height: stableRect.height
  };

  clone.getBoundingClientRect();

  console.log('[TRANSITION] animating', {
    fromRect,
    toRect,
    cloneRectBefore: getRect(clone),
    cloneSrc: clone.currentSrc || clone.src || null,
    targetCurrentSrc: toElement.currentSrc || toElement.src || null,
    scrollY: window.scrollY
  });

  const animation = clone.animate(
    [
      {
        left: `${fromRect.left}px`,
        top: `${fromRect.top}px`,
        width: `${fromRect.width}px`,
        height: `${fromRect.height}px`,
        borderRadius: fromStyle.borderRadius,
        opacity: 1
      },
      {
        left: `${toRect.left}px`,
        top: `${toRect.top}px`,
        width: `${toRect.width}px`,
        height: `${toRect.height}px`,
        borderRadius: toStyle.borderRadius,
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

  const cleanup = (reason) => {
    console.log('[TRANSITION] cleanup', {
      reason,
      targetConnected: toElement.isConnected,
      targetRect: toElement.isConnected ? getRect(toElement) : null,
      targetCurrentSrc: toElement.currentSrc || toElement.src || null,
      cloneConnected: clone.isConnected,
      cloneRect: clone.isConnected ? getRect(clone) : null,
      scrollY: window.scrollY
    });

    toElement.style.opacity = '';
    fromElement.style.opacity = '';

    clone.remove();

    if (activeClone === clone) {
      activeClone = null;
    }

    if (activeAnimation === animation) {
      activeAnimation = null;
    }
  };

  animation.addEventListener('finish', () => cleanup('finish'), { once: true });
  animation.addEventListener('cancel', () => cleanup('cancel'), { once: true });
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