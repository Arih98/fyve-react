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

  document.body.classList.add('product-image-transition-active');

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
    document.body.classList.remove('product-image-transition-active');
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

    document.body.classList.remove('product-image-transition-active');
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

    document.body.classList.remove('product-image-transition-active');
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

  const cleanup = () => {
  if (hideTarget) {
    toElement.style.opacity = '';
  }

  if (restoreFromElement) {
    fromElement.style.opacity = '';
  }

  requestAnimationFrame(() => {
    clone.remove();

    document.body.classList.remove('product-image-transition-active');

    if (activeClone === clone) {
      activeClone = null;
    }

    if (activeAnimation === animation) {
      activeAnimation = null;
    }
  });
};

  animation.addEventListener('finish', cleanup, { once: true });
  animation.addEventListener('cancel', cleanup, { once: true });
};