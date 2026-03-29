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
  zIndex = 999999
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

  const toRectRaw = getRect(toElement);

  if (!toRectRaw.width || !toRectRaw.height) return;

  const toRect = {
    left: toRectRaw.left,
    top: Math.max(toRectRaw.top, minTargetTop),
    width: toRectRaw.width,
    height: toRectRaw.height
  };

  const clone = createClone({
    src,
    fromRect,
    zIndex
  });

  activeClone = clone;

  toElement.style.opacity = '0';

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