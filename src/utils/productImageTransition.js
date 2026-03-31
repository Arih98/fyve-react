let activeClone = null;
let activeAnimation = null;
let transitionDebugCounter = 0;

const debugNow = () => {
  try {
    return new Date().toISOString();
  } catch {
    return '';
  }
};

const debugViewport = () => {
  const vv = window.visualViewport;
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    devicePixelRatio: window.devicePixelRatio,
    visualViewport: vv
      ? {
          width: vv.width,
          height: vv.height,
          offsetLeft: vv.offsetLeft,
          offsetTop: vv.offsetTop,
          pageLeft: vv.pageLeft,
          pageTop: vv.pageTop,
          scale: vv.scale
        }
      : null
  };
};

const debugRect = (label, rect) => {
  if (!rect) {
    console.log(`[ProductImageTransition][${debugNow()}] ${label}:`, rect);
    return;
  }

  console.log(`[ProductImageTransition][${debugNow()}] ${label}:`, {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height
  });
};

const debugElementInfo = (label, el) => {
  if (!el) {
    console.log(`[ProductImageTransition][${debugNow()}] ${label}:`, el);
    return;
  }

  const rect = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
  const computed = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(el) : null;

  console.log(`[ProductImageTransition][${debugNow()}] ${label}:`, {
    tagName: el.tagName,
    id: el.id,
    className: el.className,
    isConnected: el.isConnected,
    isImage: el instanceof HTMLImageElement,
    currentSrc: el instanceof HTMLImageElement ? el.currentSrc || el.src : undefined,
    complete: el instanceof HTMLImageElement ? el.complete : undefined,
    naturalWidth: el instanceof HTMLImageElement ? el.naturalWidth : undefined,
    naturalHeight: el instanceof HTMLImageElement ? el.naturalHeight : undefined,
    clientWidth: el.clientWidth,
    clientHeight: el.clientHeight,
    offsetWidth: el.offsetWidth,
    offsetHeight: el.offsetHeight,
    rect: rect
      ? {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        }
      : null,
    computed: computed
      ? {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          transform: computed.transform,
          transition: computed.transition,
          animation: computed.animation,
          objectFit: computed.objectFit,
          borderRadius: computed.borderRadius,
          boxSizing: computed.boxSizing,
          pointerEvents: computed.pointerEvents,
          zIndex: computed.zIndex
        }
      : null
  });
};

const debugLog = (transitionId, message, data) => {
  if (typeof data === 'undefined') {
    console.log(`[ProductImageTransition #${transitionId}][${debugNow()}] ${message}`);
  } else {
    console.log(`[ProductImageTransition #${transitionId}][${debugNow()}] ${message}`, data);
  }
};

const waitForElement = (getEl, { maxFrames = 90, transitionId = 'unknown' } = {}) =>
  new Promise((resolve) => {
    let frame = 0;

    debugLog(transitionId, 'waitForElement start', {
      maxFrames,
      hasGetter: typeof getEl === 'function',
      viewport: debugViewport()
    });

    const check = () => {
      let el = null;

      try {
        el = getEl?.();
      } catch (error) {
        debugLog(transitionId, 'waitForElement getter threw error', error);
        resolve(null);
        return;
      }

      debugLog(transitionId, 'waitForElement frame check', {
        frame,
        found: !!el,
        isConnected: !!el?.isConnected
      });

      if (el) {
        debugElementInfo(`waitForElement candidate at frame ${frame}`, el);
      }

      if (el && el.isConnected) {
        debugLog(transitionId, 'waitForElement resolved with connected element', { frame });
        resolve(el);
        return;
      }

      frame += 1;
      if (frame >= maxFrames) {
        debugLog(transitionId, 'waitForElement timed out', { frame, maxFrames });
        resolve(null);
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });

const waitForNextFrame = (transitionId = 'unknown', label = '') =>
  new Promise((resolve) => {
    debugLog(transitionId, `waitForNextFrame queued${label ? ` (${label})` : ''}`);
    requestAnimationFrame(() => {
      debugLog(transitionId, `waitForNextFrame resolved${label ? ` (${label})` : ''}`);
      resolve();
    });
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

const waitForStableRect = async (
  el,
  { maxFrames = 20, stableFrames = 2, transitionId = 'unknown' } = {}
) => {
  let previousRect = null;
  let stableCount = 0;

  debugLog(transitionId, 'waitForStableRect start', {
    maxFrames,
    stableFrames
  });
  debugElementInfo('waitForStableRect target initial', el);

  for (let i = 0; i < maxFrames; i += 1) {
    await waitForNextFrame(transitionId, `waitForStableRect frame ${i + 1}`);

    if (!el || !el.isConnected) {
      debugLog(transitionId, 'waitForStableRect aborted because element is missing or disconnected', {
        frame: i + 1
      });
      return null;
    }

    const rect = getRect(el);

    debugLog(transitionId, 'waitForStableRect measured rect', {
      frame: i + 1,
      rect,
      previousRect,
      stableCount
    });

    if (!rect.width || !rect.height) {
      debugLog(transitionId, 'waitForStableRect got zero-sized rect', {
        frame: i + 1,
        rect
      });
      stableCount = 0;
      previousRect = rect;
      continue;
    }

    if (previousRect && rectsMatch(previousRect, rect)) {
      stableCount += 1;
      debugLog(transitionId, 'waitForStableRect rect matched previous rect', {
        frame: i + 1,
        stableCount,
        requiredStableFrames: stableFrames
      });
      if (stableCount >= stableFrames) {
        debugLog(transitionId, 'waitForStableRect resolved stable rect', {
          frame: i + 1,
          rect
        });
        return rect;
      }
    } else {
      debugLog(transitionId, 'waitForStableRect rect changed', {
        frame: i + 1,
        previousRect,
        rect
      });
      stableCount = 0;
    }

    previousRect = rect;
  }

  const fallbackRect = el && el.isConnected ? getRect(el) : null;
  debugLog(transitionId, 'waitForStableRect finished without enough stable frames, returning fallback', {
    fallbackRect
  });
  return fallbackRect;
};

const waitForImageReady = async (el, transitionId = 'unknown', label = 'image') => {
  debugLog(transitionId, `waitForImageReady start for ${label}`);
  debugElementInfo(`waitForImageReady target ${label}`, el);

  if (!(el instanceof HTMLImageElement)) {
    debugLog(transitionId, `waitForImageReady skipped because ${label} is not an image element`);
    return;
  }

  if (el.complete && el.naturalWidth > 0) {
    debugLog(transitionId, `waitForImageReady image already complete for ${label}`, {
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      currentSrc: el.currentSrc || el.src
    });
    if (typeof el.decode === 'function') {
      try {
        debugLog(transitionId, `waitForImageReady decode start for already complete ${label}`);
        await el.decode();
        debugLog(transitionId, `waitForImageReady decode success for already complete ${label}`);
      } catch (error) {
        debugLog(transitionId, `waitForImageReady decode failed for already complete ${label}`, error);
      }
    }
    return;
  }

  debugLog(transitionId, `waitForImageReady waiting for load/error for ${label}`, {
    complete: el.complete,
    naturalWidth: el.naturalWidth,
    naturalHeight: el.naturalHeight,
    currentSrc: el.currentSrc || el.src
  });

  await new Promise((resolve) => {
    const done = (event) => {
      debugLog(transitionId, `waitForImageReady received ${event?.type || 'unknown'} for ${label}`, {
        complete: el.complete,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        currentSrc: el.currentSrc || el.src
      });
      el.removeEventListener('load', done);
      el.removeEventListener('error', done);
      resolve();
    };

    el.addEventListener('load', done, { once: true });
    el.addEventListener('error', done, { once: true });
  });

  if (typeof el.decode === 'function') {
    try {
      debugLog(transitionId, `waitForImageReady decode start after load/error for ${label}`);
      await el.decode();
      debugLog(transitionId, `waitForImageReady decode success after load/error for ${label}`);
    } catch (error) {
      debugLog(transitionId, `waitForImageReady decode failed after load/error for ${label}`, error);
    }
  }
};

const createClone = ({ src, fromRect, fromStyle, zIndex, transitionId = 'unknown' }) => {
  debugLog(transitionId, 'createClone start', {
    src,
    fromRect,
    zIndex,
    fromStyle: {
      borderRadius: fromStyle.borderRadius,
      boxSizing: fromStyle.boxSizing
    }
  });

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

  debugElementInfo('createClone created clone', clone);
  debugLog(transitionId, 'createClone appended clone to body', {
    bodyChildCount: document.body?.childElementCount
  });

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
  const transitionId = ++transitionDebugCounter;

  debugLog(transitionId, 'startProductImageTransition called', {
    src,
    duration,
    minTargetTop,
    zIndex,
    hasFromElement: !!fromElement,
    hasToElementGetter: typeof toElementGetter === 'function',
    viewport: debugViewport(),
    activeCloneExists: !!activeClone,
    activeAnimationExists: !!activeAnimation
  });

  debugElementInfo('fromElement on entry', fromElement);

  if (!src || !fromElement) {
    debugLog(transitionId, 'startProductImageTransition aborted بسبب missing src or fromElement', {
      src,
      hasFromElement: !!fromElement
    });
    return;
  }

  await waitForImageReady(fromElement, transitionId, 'fromElement');

  if (activeAnimation) {
    debugLog(transitionId, 'cancelling existing activeAnimation before starting new one');
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    debugLog(transitionId, 'removing existing activeClone before starting new one');
    debugElementInfo('existing activeClone before removal', activeClone);
    activeClone.remove();
    activeClone = null;
  }

  const fromRect = getRect(fromElement);
  debugRect('fromRect', fromRect);

  if (!fromRect.width || !fromRect.height) {
    debugLog(transitionId, 'aborting because fromRect has zero width or height', { fromRect });
    return;
  }

  const fromStyle = window.getComputedStyle(fromElement);
  debugLog(transitionId, 'fromElement computed style snapshot', {
    opacity: fromStyle.opacity,
    display: fromStyle.display,
    visibility: fromStyle.visibility,
    position: fromStyle.position,
    transform: fromStyle.transform,
    objectFit: fromStyle.objectFit,
    borderRadius: fromStyle.borderRadius,
    boxSizing: fromStyle.boxSizing,
    zIndex: fromStyle.zIndex
  });

  const clone = createClone({
    src,
    fromRect,
    fromStyle,
    zIndex,
    transitionId
  });

  await waitForImageReady(clone, transitionId, 'clone');

  activeClone = clone;
  debugLog(transitionId, 'activeClone assigned', { isSameClone: activeClone === clone });

  fromElement.style.opacity = '0';
  clone.style.opacity = '1';

  debugLog(transitionId, 'source hidden and clone shown', {
    fromOpacity: fromElement.style.opacity,
    cloneOpacity: clone.style.opacity
  });

  debugElementInfo('fromElement after hiding', fromElement);
  debugElementInfo('clone after showing', clone);

  const toElement = await waitForElement(toElementGetter, { transitionId });

  if (!toElement) {
    debugLog(transitionId, 'toElement not found, cleaning up');
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    debugLog(transitionId, 'cleanup after missing toElement complete', {
      fromOpacity: fromElement.style.opacity,
      activeCloneExists: !!activeClone
    });
    return;
  }

  debugElementInfo('toElement found', toElement);

  await waitForImageReady(toElement, transitionId, 'toElement');

  toElement.style.opacity = '0';
  debugLog(transitionId, 'toElement hidden before measuring stable rect', {
    toOpacity: toElement.style.opacity
  });

  const stableRect = await waitForStableRect(toElement, {
    maxFrames: 20,
    stableFrames: 2,
    transitionId
  });

  debugRect('stableRect', stableRect);

  if (!stableRect || !stableRect.width || !stableRect.height) {
    debugLog(transitionId, 'stableRect invalid, cleaning up', { stableRect });
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    debugLog(transitionId, 'cleanup after invalid stableRect complete', {
      toOpacity: toElement.style.opacity,
      fromOpacity: fromElement.style.opacity,
      activeCloneExists: !!activeClone
    });
    return;
  }

  const toRect = {
    left: stableRect.left,
    top: Math.max(stableRect.top, minTargetTop),
    width: stableRect.width,
    height: stableRect.height
  };

  debugRect('toRect adjusted with minTargetTop', toRect);

  const scale = Math.min(toRect.width / fromRect.width, toRect.height / fromRect.height);
  const finalWidth = fromRect.width * scale;
  const finalHeight = fromRect.height * scale;
  const finalLeft = toRect.left + (toRect.width - finalWidth) / 2;
  const finalTop = toRect.top + (toRect.height - finalHeight) / 2;

  debugLog(transitionId, 'final animation geometry calculated', {
    scale,
    finalWidth,
    finalHeight,
    finalLeft,
    finalTop,
    fromRect,
    toRect
  });

  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.objectFit = 'cover';

  debugLog(transitionId, 'clone styles reset before animation', {
    left: clone.style.left,
    top: clone.style.top,
    width: clone.style.width,
    height: clone.style.height,
    objectFit: clone.style.objectFit
  });

  const forcedLayoutRect = clone.getBoundingClientRect();
  debugLog(transitionId, 'forced layout read on clone', {
    left: forcedLayoutRect.left,
    top: forcedLayoutRect.top,
    width: forcedLayoutRect.width,
    height: forcedLayoutRect.height
  });

  let animation;
  try {
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
    debugLog(transitionId, 'clone.animate created animation successfully', {
      playState: animation.playState,
      currentTime: animation.currentTime,
      effect: animation.effect
    });
  } catch (error) {
    debugLog(transitionId, 'clone.animate threw error', error);
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  activeAnimation = animation;
  debugLog(transitionId, 'activeAnimation assigned', {
    isSameAnimation: activeAnimation === animation
  });

  try {
    animation.ready
      .then(() => {
        debugLog(transitionId, 'animation.ready resolved', {
          playState: animation.playState,
          currentTime: animation.currentTime
        });
      })
      .catch((error) => {
        debugLog(transitionId, 'animation.ready rejected', error);
      });
  } catch (error) {
    debugLog(transitionId, 'reading animation.ready threw error', error);
  }

  try {
    animation.finished
      .then(() => {
        debugLog(transitionId, 'animation.finished promise resolved', {
          playState: animation.playState,
          currentTime: animation.currentTime
        });
      })
      .catch((error) => {
        debugLog(transitionId, 'animation.finished promise rejected', error);
      });
  } catch (error) {
    debugLog(transitionId, 'reading animation.finished threw error', error);
  }

  const cleanup = () => {
    debugLog(transitionId, 'cleanup start', {
      toElementConnected: !!toElement?.isConnected,
      fromElementConnected: !!fromElement?.isConnected,
      cloneConnected: !!clone?.isConnected,
      activeCloneMatches: activeClone === clone,
      activeAnimationMatches: activeAnimation === animation
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

    debugLog(transitionId, 'cleanup end', {
      toOpacity: toElement.style.opacity,
      fromOpacity: fromElement.style.opacity,
      cloneConnectedAfterRemove: !!clone?.isConnected,
      activeCloneExists: !!activeClone,
      activeAnimationExists: !!activeAnimation
    });
  };

  animation.addEventListener(
    'finish',
    () => {
      debugLog(transitionId, 'animation finish event fired', {
        playState: animation.playState,
        currentTime: animation.currentTime
      });
      cleanup();
    },
    { once: true }
  );

  animation.addEventListener(
    'cancel',
    () => {
      debugLog(transitionId, 'animation cancel event fired', {
        playState: animation.playState,
        currentTime: animation.currentTime
      });
      cleanup();
    },
    { once: true }
  );

  debugLog(transitionId, 'startProductImageTransition setup complete, waiting for animation events');
};

export const clearProductImageTransitionClone = () => {
  const transitionId = `clear-${++transitionDebugCounter}`;

  debugLog(transitionId, 'clearProductImageTransitionClone called', {
    activeCloneExists: !!activeClone,
    activeAnimationExists: !!activeAnimation
  });

  if (activeAnimation) {
    debugLog(transitionId, 'cancelling activeAnimation from clearProductImageTransitionClone');
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    debugElementInfo('activeClone before clear removal', activeClone);
    activeClone.remove();
    activeClone = null;
  }

  debugLog(transitionId, 'clearProductImageTransitionClone complete', {
    activeCloneExists: !!activeClone,
    activeAnimationExists: !!activeAnimation
  });
};