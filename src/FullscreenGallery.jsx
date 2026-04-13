import React, { useEffect, useRef, useState } from 'react';
import './FullscreenGallery.css';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_DELAY = 280;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getDistance = (touchA, touchB) => {
  const dx = touchB.clientX - touchA.clientX;
  const dy = touchB.clientY - touchA.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const getMidpoint = (touchA, touchB) => ({
  x: (touchA.clientX + touchB.clientX) / 2,
  y: (touchA.clientY + touchB.clientY) / 2
});

const FullscreenGallery = ({ images, initialIndex = 0, isOpen, title, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const shouldSkipHistoryBackRef = useRef(false);

const swipeRef = useRef({
  startX: 0,
  startY: 0,
  isSwiping: false
});

  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const pointerStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });

  const pinchStateRef = useRef({
    isPinching: false,
    startDistance: 0,
    startScale: 1,
    startTranslateX: 0,
    startTranslateY: 0,
    midpoint: { x: 0, y: 0 }
  });

const tapRef = useRef({
  lastTapTime: 0,
  lastTapX: 0,
  lastTapY: 0,
  suppressUntil: 0
});

const resetTransform = () => {
  setScale(1);
  setTranslate({ x: 0, y: 0 });
  pointerStateRef.current.isDragging = false;
  pinchStateRef.current.isPinching = false;
  tapRef.current.suppressUntil = Date.now() + 250;
  clearTapState();
};

  const clampTranslate = (nextScale, nextTranslate) => {
    const stage = stageRef.current;
    const image = imageRef.current;

    if (!stage || !image || nextScale <= 1) {
      return { x: 0, y: 0 };
    }

    const stageRect = stage.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    const displayedWidth = imageRect.width / scale;
    const displayedHeight = imageRect.height / scale;

    const scaledWidth = displayedWidth * nextScale;
    const scaledHeight = displayedHeight * nextScale;

    const maxX = Math.max(0, (scaledWidth - stageRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - stageRect.height) / 2);

    return {
      x: clamp(nextTranslate.x, -maxX, maxX),
      y: clamp(nextTranslate.y, -maxY, maxY)
    };
  };

  const updateScaleAtPoint = (nextScale, clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const pointX = clientX - rect.left - rect.width / 2;
    const pointY = clientY - rect.top - rect.height / 2;

    const scaleRatio = nextScale / scale;

    const nextTranslate = {
      x: translate.x - pointX * (scaleRatio - 1),
      y: translate.y - pointY * (scaleRatio - 1)
    };

    const clamped = clampTranslate(nextScale, nextTranslate);
    setScale(nextScale);
    setTranslate(clamped);
  };

const toggleZoomAtPoint = (clientX, clientY) => {
  if (scale > 1) {
    resetTransform();
    return;
  }

  updateScaleAtPoint(2.5, clientX, clientY);
  tapRef.current.suppressUntil = Date.now() + 250;
  clearTapState();
};

  const goToIndex = (nextIndex) => {
    const clampedIndex = clamp(nextIndex, 0, images.length - 1);
    setCurrentIndex(clampedIndex);
    resetTransform();
  };

  const goPrev = () => {
    goToIndex(currentIndex - 1);
  };

  const goNext = () => {
    goToIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
    resetTransform();
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
if (e.key === 'Escape') {
  closeGallery();
  return;
}

      if (e.key === 'ArrowLeft' && scale === 1) {
        goPrev();
      }

      if (e.key === 'ArrowRight' && scale === 1) {
        goNext();
      }

      if ((e.key === '+' || e.key === '=') && scale < MAX_SCALE) {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        updateScaleAtPoint(clamp(scale + 0.5, MIN_SCALE, MAX_SCALE), rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      if (e.key === '-' && scale > MIN_SCALE) {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const nextScale = clamp(scale - 0.5, MIN_SCALE, MAX_SCALE);
        if (nextScale === 1) {
          resetTransform();
        } else {
          updateScaleAtPoint(nextScale, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }

      if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, scale, currentIndex, images.length, translate, closeGallery]);

  useEffect(() => {
  if (!isOpen) return;

  shouldSkipHistoryBackRef.current = false;

  const galleryHistoryState = {
    fyveFullscreenGallery: true
  };

  window.history.pushState(galleryHistoryState, '');

  const handlePopState = () => {
    shouldSkipHistoryBackRef.current = true;
    onClose();
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);

    if (!shouldSkipHistoryBackRef.current && window.history.state?.fyveFullscreenGallery) {
      window.history.back();
    }
  };
}, [isOpen, onClose]);

const closeGallery = () => {
  if (window.history.state?.fyveFullscreenGallery) {
    window.history.back();
    return;
  }

  onClose();
};

  const handleWheel = (e) => {
    e.preventDefault();

    const delta = -e.deltaY;
    const zoomAmount = delta > 0 ? 0.25 : -0.25;
    const nextScale = clamp(scale + zoomAmount, MIN_SCALE, MAX_SCALE);

    if (nextScale === 1) {
      resetTransform();
      return;
    }

    updateScaleAtPoint(nextScale, e.clientX, e.clientY);
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    if (scale <= 1) return;

    pointerStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: translate.x,
      originY: translate.y
    };

    setIsInteracting(true);
  };

  const handlePointerMove = (e) => {
    if (!pointerStateRef.current.isDragging || scale <= 1) return;

    const deltaX = e.clientX - pointerStateRef.current.startX;
    const deltaY = e.clientY - pointerStateRef.current.startY;

    const nextTranslate = {
      x: pointerStateRef.current.originX + deltaX,
      y: pointerStateRef.current.originY + deltaY
    };

    setTranslate(clampTranslate(scale, nextTranslate));
  };

  const endPointerInteraction = () => {
    pointerStateRef.current.isDragging = false;
    setIsInteracting(false);
  };

  const clearTapState = () => {
  tapRef.current.lastTapTime = 0;
  tapRef.current.lastTapX = 0;
  tapRef.current.lastTapY = 0;
};

  const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    const [touchA, touchB] = e.touches;
    pinchStateRef.current = {
      isPinching: true,
      startDistance: getDistance(touchA, touchB),
      startScale: scale,
      startTranslateX: translate.x,
      startTranslateY: translate.y,
      midpoint: getMidpoint(touchA, touchB)
    };
    setIsInteracting(true);
    clearTapState();
    return;
  }

  if (e.touches.length !== 1) return;

  const touch = e.touches[0];
  const now = Date.now();

  if (now < tapRef.current.suppressUntil) {
    return;
  }

  swipeRef.current = {
    startX: touch.clientX,
    startY: touch.clientY,
    isSwiping: scale === 1
  };

  const timeSinceLastTap = now - tapRef.current.lastTapTime;
  const moveX = Math.abs(touch.clientX - tapRef.current.lastTapX);
  const moveY = Math.abs(touch.clientY - tapRef.current.lastTapY);
  const isCloseToLastTap = moveX < 30 && moveY < 30;

  if (
    tapRef.current.lastTapTime &&
    timeSinceLastTap < DOUBLE_TAP_DELAY &&
    isCloseToLastTap
  ) {
    toggleZoomAtPoint(touch.clientX, touch.clientY);
    return;
  }

  tapRef.current.lastTapTime = now;
  tapRef.current.lastTapX = touch.clientX;
  tapRef.current.lastTapY = touch.clientY;

  if (scale > 1) {
    pointerStateRef.current = {
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      originX: translate.x,
      originY: translate.y
    };
    setIsInteracting(true);
  }
};

  const handleTouchMove = (e) => {
  if (e.touches.length === 2 && pinchStateRef.current.isPinching) {
    e.preventDefault();

    const [touchA, touchB] = e.touches;
    const nextDistance = getDistance(touchA, touchB);
    const nextScale = clamp(
      pinchStateRef.current.startScale * (nextDistance / pinchStateRef.current.startDistance),
      MIN_SCALE,
      MAX_SCALE
    );

    const midpoint = getMidpoint(touchA, touchB);
    const deltaMidX = midpoint.x - pinchStateRef.current.midpoint.x;
    const deltaMidY = midpoint.y - pinchStateRef.current.midpoint.y;

    const nextTranslate = {
      x: pinchStateRef.current.startTranslateX + deltaMidX,
      y: pinchStateRef.current.startTranslateY + deltaMidY
    };

    setScale(nextScale);
    setTranslate(clampTranslate(nextScale, nextTranslate));
    return;
  }

  if (e.touches.length !== 1) return;

  const touch = e.touches[0];

if (scale === 1 && swipeRef.current.isSwiping) {
  const deltaX = touch.clientX - swipeRef.current.startX;
  const deltaY = touch.clientY - swipeRef.current.startY;

  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    swipeRef.current.isSwiping = false;
    return;
  }

  if (Math.abs(deltaX) > 60) {
    if (deltaX < 0) goNext();
    else goPrev();

    swipeRef.current.isSwiping = false;
  }

  return;
}

  if (!pointerStateRef.current.isDragging || scale <= 1) return;

  e.preventDefault();

  const deltaX = touch.clientX - pointerStateRef.current.startX;
  const deltaY = touch.clientY - pointerStateRef.current.startY;

  const nextTranslate = {
    x: pointerStateRef.current.originX + deltaX,
    y: pointerStateRef.current.originY + deltaY
  };

  setTranslate(clampTranslate(scale, nextTranslate));
};

  const handleTouchEnd = () => {
  pointerStateRef.current.isDragging = false;
  pinchStateRef.current.isPinching = false;
  setIsInteracting(false);

  if (scale <= 1) {
    setTranslate({ x: 0, y: 0 });
    setScale(1);
  }
};

  if (!isOpen || !images.length) return null;

  return (
    <div
      className="fyve-fullscreen-gallery-overlay"
      onClick={scale === 1 ? closeGallery : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Product image gallery"
    >
      <div
        className="fyve-fullscreen-gallery-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="fyve-fullscreen-gallery-close"
          onClick={closeGallery}
          aria-label="Close gallery"
        >
          ×
        </button>

        <div
          ref={stageRef}
          className={`fyve-fullscreen-gallery-stage ${scale > 1 ? 'is-zoomed' : ''} ${isInteracting ? 'is-interacting' : ''}`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointerInteraction}
          onPointerCancel={endPointerInteraction}
          onPointerLeave={endPointerInteraction}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="fyve-fullscreen-gallery-media"
            style={{
              transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`
            }}
          >
            <img
              key={images[currentIndex]}
              ref={imageRef}
              className="fyve-fullscreen-gallery-image"
              src={images[currentIndex]}
              alt={`${title} ${currentIndex + 1}`}
              draggable="false"
              onError={(e) => {
                e.target.src = '/api/Uploads/fallback-image.png';
              }}
            />
          </div>
        </div>

        <div className="fyve-fullscreen-gallery-controls">
  <div className="fyve-fullscreen-gallery-nav-group">
    <button
      type="button"
      className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-prev"
      onClick={goPrev}
      disabled={currentIndex <= 0}
      aria-label="Previous image"
    >
      <img src="/assets/Next&PrevArrows.svg" alt="" />
    </button>

    <button
      type="button"
      className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-next"
      onClick={goNext}
      disabled={currentIndex >= images.length - 1}
      aria-label="Next image"
    >
      <img src="/assets/Next&PrevArrows.svg" alt="" />
    </button>
  </div>

  {images.length > 1 && (
    <div className="fyve-fullscreen-gallery-progress">
      <div
        className="fyve-fullscreen-gallery-progress-bar"
        style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
      />
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default FullscreenGallery;