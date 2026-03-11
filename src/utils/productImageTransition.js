let activeClone = null;
let activeAnimation = null;

const waitForElement = (getEl, { maxFrames = 180 } = {}) =>
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

const waitForStableRect = (
  el,
  {
    maxFrames = 180,
    stableFrames = 6,
    minWidth = 20,
    minHeight = 20
  } = {}
) =>
  new Promise((resolve) => {
    let frame = 0;
    let stableCount = 0;
    let prevRect = null;

    const check = () => {
      if (!el || !el.isConnected) {
        frame += 1;
        if (frame >= maxFrames) {
          resolve(null);
          return;
        }
        requestAnimationFrame(check);
        return;
      }

      const rect = el.getBoundingClientRect();

      if (rect.width < minWidth || rect.height < minHeight) {
        prevRect = null;
        stableCount = 0;
        frame += 1;
        if (frame >= maxFrames) {
          resolve(null);
          return;
        }
        requestAnimationFrame(check);
        return;
      }

      const currentRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };

      const isStable =
        prevRect &&
        Math.abs(currentRect.left - prevRect.left) < 0.5 &&
        Math.abs(currentRect.top - prevRect.top) < 0.5 &&
        Math.abs(currentRect.width - prevRect.width) < 0.5 &&
        Math.abs(currentRect.height - prevRect.height) < 0.5;

      stableCount = isStable ? stableCount + 1 : 1;
      prevRect = currentRect;

      if (stableCount >= stableFrames) {
        resolve(currentRect);
        return;
      }

      frame += 1;
      if (frame >= maxFrames) {
        resolve(currentRect);
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });

const createClone = ({ src, fromRect, borderRadius, zIndex }) => {
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
  clone.style.borderRadius = borderRadius || '0px';
  clone.style.transformOrigin = 'top left';
  clone.style.willChange = 'left, top, width, height, opacity';
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
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }

  const fromRectRaw = fromElement.getBoundingClientRect();

  if (!fromRectRaw.width || !fromRectRaw.height) {
    return;
  }

  const fromRect = {
    left: fromRectRaw.left,
    top: fromRectRaw.top,
    width: fromRectRaw.width,
    height: fromRectRaw.height
  };

  const fromStyle = window.getComputedStyle(fromElement);

  const clone = createClone({
    src,
    fromRect,
    borderRadius: fromStyle.borderRadius,
    zIndex
  });

  activeClone = clone;
  fromElement.style.opacity = '0';

  const toElement = await waitForElement(toElementGetter);

  if (!toElement) {
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  toElement.style.opacity = '0';

  const stableRect = await waitForStableRect(toElement);

  if (!stableRect) {
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  const toStyle = window.getComputedStyle(toElement);

  const finalTop = Math.max(stableRect.top, minTargetTop);

  const toRect = {
    left: stableRect.left,
    top: finalTop,
    width: stableRect.width,
    height: stableRect.height
  };

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
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    }
  );

  activeAnimation = animation;

  const cleanup = () => {
    toElement.style.opacity = '';
    fromElement.style.opacity = '';

    if (activeClone === clone) {
      clone.remove();
      activeClone = null;
    } else {
      clone.remove();
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
};