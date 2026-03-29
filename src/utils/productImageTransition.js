let activeClone = null;
let activeAnimation = null;
let transitionSeq = 0;

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

const getViewportMetrics = () => {
  const vv = window.visualViewport;
  return {
    scrollY: window.scrollY,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    vvWidth: vv ? vv.width : null,
    vvHeight: vv ? vv.height : null,
    vvOffsetTop: vv ? vv.offsetTop : null,
    vvOffsetLeft: vv ? vv.offsetLeft : null,
    vvPageTop: vv ? vv.pageTop : null,
    vvPageLeft: vv ? vv.pageLeft : null
  };
};

const logFrameSeries = async (label, el, id, frames = 8) => {
  for (let i = 0; i < frames; i += 1) {
    await waitForNextFrame();
    if (!el || !el.isConnected) {
      console.log(`[transition ${id}] ${label} frame ${i}`, {
        connected: false,
        ...getViewportMetrics()
      });
      continue;
    }

    console.log(`[transition ${id}] ${label} frame ${i}`, {
      rect: getRect(el),
      ...getViewportMetrics()
    });
  }
};

export const startProductImageTransition = async ({
  src,
  fromElement,
  toElementGetter,
  duration = 750,
  minTargetTop = 0,
  zIndex = 999999
}) => {
  const id = ++transitionSeq;

  if (!src || !fromElement) {
    console.log(`[transition ${id}] aborted before start`, {
      hasSrc: !!src,
      hasFromElement: !!fromElement
    });
    return;
  }

  if (activeAnimation) {
    console.log(`[transition ${id}] cancelling previous animation`);
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    console.log(`[transition ${id}] removing previous clone`);
    activeClone.remove();
    activeClone = null;
  }

  const fromRect = getRect(fromElement);

  console.log(`[transition ${id}] source initial`, {
    fromRect,
    computed: {
      objectFit: window.getComputedStyle(fromElement).objectFit,
      borderRadius: window.getComputedStyle(fromElement).borderRadius
    },
    ...getViewportMetrics()
  });

  if (!fromRect.width || !fromRect.height) {
    console.log(`[transition ${id}] source rect invalid`, { fromRect });
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

  console.log(`[transition ${id}] clone shown`, {
    cloneRect: getRect(clone),
    ...getViewportMetrics()
  });

  logFrameSeries('source-after-click', fromElement, id, 6);

  const toElement = await waitForElement(toElementGetter);

  if (!toElement) {
    console.log(`[transition ${id}] target not found`);
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  console.log(`[transition ${id}] target found`, {
    tagName: toElement.tagName,
    rect: getRect(toElement),
    ...getViewportMetrics()
  });

  toElement.style.opacity = '0';

  logFrameSeries('target-after-found', toElement, id, 10);

  if (!toElement.isConnected) {
    console.log(`[transition ${id}] target disconnected immediately`);
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  await waitForNextFrame();

  const measuredRect = getRect(toElement);
  const toStyle = window.getComputedStyle(toElement);

  const toRect = {
    left: measuredRect.left,
    top: Math.max(measuredRect.top, minTargetTop),
    width: measuredRect.width,
    height: measuredRect.height
  };

  console.log(`[transition ${id}] target used for animation`, {
    measuredRect,
    adjustedToRect: toRect,
    minTargetTop,
    computed: {
      objectFit: toStyle.objectFit,
      borderRadius: toStyle.borderRadius
    },
    ...getViewportMetrics()
  });

  clone.getBoundingClientRect();

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

  logFrameSeries('target-during-animation', toElement, id, 12);
  logFrameSeries('clone-during-animation', clone, id, 12);

  const cleanup = (reason) => {
    console.log(`[transition ${id}] cleanup`, {
      reason,
      targetRect: toElement && toElement.isConnected ? getRect(toElement) : null,
      cloneRect: clone.isConnected ? getRect(clone) : null,
      ...getViewportMetrics()
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