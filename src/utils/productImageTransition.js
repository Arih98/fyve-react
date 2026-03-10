let activeClone = null;

const waitForElement = (getEl, maxFrames = 120) =>
  new Promise((resolve) => {
    let frame = 0;

    const check = () => {
      const el = getEl();
      if (el) {
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

const createClone = ({ src, fromRect, borderRadius }) => {
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
  clone.style.zIndex = '999999';
  clone.style.background = '#f7f7f7';
  clone.style.borderRadius = borderRadius || '0px';
  clone.style.transformOrigin = 'top left';
  clone.style.willChange = 'left, top, width, height, opacity, transform';
  document.body.appendChild(clone);
  return clone;
};

export const startProductImageTransition = async ({
  src,
  fromElement,
  toElementGetter,
  duration = 750
}) => {
  if (!src || !fromElement) return;

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }

  const fromRect = fromElement.getBoundingClientRect();
  const fromStyle = window.getComputedStyle(fromElement);
  const clone = createClone({
    src,
    fromRect,
    borderRadius: fromStyle.borderRadius
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

  const toRect = toElement.getBoundingClientRect();
  const toStyle = window.getComputedStyle(toElement);

  toElement.style.opacity = '0';

  clone.animate(
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

  setTimeout(() => {
    toElement.style.opacity = '';
    fromElement.style.opacity = '';
    clone.remove();
    if (activeClone === clone) activeClone = null;
  }, duration);
};

export const clearProductImageTransitionClone = () => {
  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }
};