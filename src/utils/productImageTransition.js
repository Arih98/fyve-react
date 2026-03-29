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