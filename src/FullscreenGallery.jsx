import React, { useEffect, useRef, useState } from 'react';
import { Panzoom } from '@fancyapps/ui/dist/panzoom/panzoom.js';
import '@fancyapps/ui/dist/panzoom/panzoom.css';
import './FullscreenGallery.css';

const FullscreenGallery = ({ images, initialIndex = 0, isOpen, title, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const panzoomRef = useRef(null);
  const containerRef = useRef(null);
  const debugIntervalRef = useRef(null);
  const debugMutationObserverRef = useRef(null);
  const debugPreviousSnapshotRef = useRef('');

  const getDebugElements = () => {
    const overlay = document.querySelector('.fyve-fullscreen-gallery-overlay');
    const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
    const stage = document.querySelector('.fyve-fullscreen-gallery-stage');
    const panzoom = document.querySelector('.fyve-fullscreen-gallery-panzoom');
    const allImages = [...document.querySelectorAll('.fyve-fullscreen-gallery-image, .f-panzoom__content')];
    const transformedImage =
      allImages.find((img) => getComputedStyle(img).transform !== 'none') ||
      allImages[0] ||
      null;

    return {
      overlay,
      shell,
      stage,
      panzoom,
      allImages,
      transformedImage
    };
  };

  const buildDebugSnapshot = (label) => {
    const { overlay, shell, stage, panzoom, allImages, transformedImage } = getDebugElements();

    const readRect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: Math.round(r.left),
        top: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height)
      };
    };

    return {
      label,
      currentIndex,
      imageCount: images.length,
      currentImage: images[currentIndex] || null,
      overlayRect: readRect(overlay),
      shellRect: readRect(shell),
      stageRect: readRect(stage),
      panzoomRect: readRect(panzoom),
      transformedImage: transformedImage
        ? {
            className: transformedImage.className,
            src: transformedImage.currentSrc || transformedImage.src,
            inlineStyle: transformedImage.getAttribute('style'),
            computedTransform: getComputedStyle(transformedImage).transform,
            computedTransformOrigin: getComputedStyle(transformedImage).transformOrigin,
            rect: readRect(transformedImage)
          }
        : null,
      allImages: allImages.map((img, index) => ({
        index,
        className: img.className,
        src: img.currentSrc || img.src,
        inlineStyle: img.getAttribute('style'),
        computedTransform: getComputedStyle(img).transform,
        computedTransformOrigin: getComputedStyle(img).transformOrigin,
        rect: readRect(img)
      }))
    };
  };

  const emitDebugSnapshot = (label) => {
  const snapshot = buildDebugSnapshot(label);

  const simplified = {
    label: snapshot.label,
    currentIndex: snapshot.currentIndex,
    currentImage: snapshot.currentImage,
    overlayRect: snapshot.overlayRect,
    stageRect: snapshot.stageRect,
    panzoomRect: snapshot.panzoomRect,
    transformedImage: snapshot.transformedImage
      ? {
          className: snapshot.transformedImage.className,
          src: snapshot.transformedImage.src,
          inlineStyle: snapshot.transformedImage.inlineStyle,
          computedTransform: snapshot.transformedImage.computedTransform,
          computedTransformOrigin: snapshot.transformedImage.computedTransformOrigin,
          rect: snapshot.transformedImage.rect
        }
      : null,
    allImages: snapshot.allImages.map((img) => ({
      className: img.className,
      src: img.src,
      inlineStyle: img.inlineStyle,
      computedTransform: img.computedTransform,
      computedTransformOrigin: img.computedTransformOrigin,
      rect: img.rect
    }))
  };

  const serialized = JSON.stringify(simplified);

  if (debugPreviousSnapshotRef.current !== serialized) {
    debugPreviousSnapshotRef.current = serialized;
    console.log('[FYVE FULLSCREEN DEBUG JSON]', JSON.stringify(simplified, null, 2));
  }
};

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
  window.__fyveFullscreenDump = () => {
    const snapshot = buildDebugSnapshot('MANUAL_DUMP');
    const simplified = {
      label: snapshot.label,
      currentIndex: snapshot.currentIndex,
      currentImage: snapshot.currentImage,
      overlayRect: snapshot.overlayRect,
      stageRect: snapshot.stageRect,
      panzoomRect: snapshot.panzoomRect,
      transformedImage: snapshot.transformedImage,
      allImages: snapshot.allImages
    };

    console.log('[FYVE MANUAL DUMP]', JSON.stringify(simplified, null, 2));
    return simplified;
  };

  return () => {
    delete window.__fyveFullscreenDump;
  };
}, [currentIndex, images, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    console.log('[FYVE FULLSCREEN DEBUG] viewer opened', {
      currentIndex,
      imageCount: images.length,
      currentImage: images[currentIndex] || null
    });

    emitDebugSnapshot('OPEN');

    debugIntervalRef.current = window.setInterval(() => {
      emitDebugSnapshot('INTERVAL');
    }, 150);

    debugMutationObserverRef.current = new MutationObserver(() => {
      emitDebugSnapshot('MUTATION');
    });

    debugMutationObserverRef.current.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'src']
    });

    return () => {
      document.body.style.overflow = previousOverflow;

      if (debugIntervalRef.current) {
        clearInterval(debugIntervalRef.current);
        debugIntervalRef.current = null;
      }

      if (debugMutationObserverRef.current) {
        debugMutationObserverRef.current.disconnect();
        debugMutationObserverRef.current = null;
      }

      console.log('[FYVE FULLSCREEN DEBUG] viewer closed');
    };
  }, [isOpen, currentIndex, images]);

  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e) => {
  const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
  if (!shell || !shell.contains(e.target)) return;

  console.log('[FYVE TOUCHSTART]', JSON.stringify({
    touchesCount: e.touches.length,
    touches: [...e.touches].map((t) => ({
      x: Math.round(t.clientX),
      y: Math.round(t.clientY)
    }))
  }, null, 2));

  emitDebugSnapshot('TOUCHSTART');
};

const handleTouchMove = (e) => {
  const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
  if (!shell || !shell.contains(e.target)) return;

  console.log('[FYVE TOUCHMOVE]', JSON.stringify({
    touchesCount: e.touches.length,
    touches: [...e.touches].map((t) => ({
      x: Math.round(t.clientX),
      y: Math.round(t.clientY)
    }))
  }, null, 2));

  emitDebugSnapshot('TOUCHMOVE');
};

const handleTouchEnd = (e) => {
  const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
  if (!shell || !shell.contains(e.target)) return;

  console.log('[FYVE TOUCHEND]', JSON.stringify({
    touchesCount: e.touches.length,
    touches: [...e.touches].map((t) => ({
      x: Math.round(t.clientX),
      y: Math.round(t.clientY)
    }))
  }, null, 2));

  emitDebugSnapshot('TOUCHEND');
};

    const handleTouchMove = (e) => {
      const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
      if (!shell || !shell.contains(e.target)) return;

      console.log('[FYVE FULLSCREEN DEBUG] TOUCHMOVE', {
        touchesCount: e.touches.length,
        touches: [...e.touches].map((t) => ({
          x: Math.round(t.clientX),
          y: Math.round(t.clientY)
        }))
      });

      emitDebugSnapshot('TOUCHMOVE');
    };

    const handleTouchEnd = (e) => {
      const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
      if (!shell || !shell.contains(e.target)) return;

      console.log('[FYVE FULLSCREEN DEBUG] TOUCHEND', {
        touchesCount: e.touches.length,
        touches: [...e.touches].map((t) => ({
          x: Math.round(t.clientX),
          y: Math.round(t.clientY)
        }))
      });

      emitDebugSnapshot('TOUCHEND');
    };

    const handlePointerDown = (e) => {
      const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
      if (!shell || !shell.contains(e.target)) return;

      console.log('[FYVE FULLSCREEN DEBUG] POINTERDOWN', {
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        pointerType: e.pointerType
      });

      emitDebugSnapshot('POINTERDOWN');
    };

    const handlePointerMove = (e) => {
      const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
      if (!shell || !shell.contains(e.target)) return;

      emitDebugSnapshot('POINTERMOVE');
    };

    const handlePointerUp = (e) => {
      const shell = document.querySelector('.fyve-fullscreen-gallery-shell');
      if (!shell || !shell.contains(e.target)) return;

      console.log('[FYVE FULLSCREEN DEBUG] POINTERUP', {
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        pointerType: e.pointerType
      });

      emitDebugSnapshot('POINTERUP');
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerup', handlePointerUp, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isOpen, currentIndex, images]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    if (panzoomRef.current) {
      console.log('[FYVE FULLSCREEN DEBUG] destroying previous panzoom instance');
      panzoomRef.current.destroy();
      panzoomRef.current = null;
    }

    console.log('[FYVE FULLSCREEN DEBUG] creating panzoom instance', {
      currentIndex,
      image: images[currentIndex] || null
    });

    const instance = Panzoom(containerRef.current, {
      bounds: true,
      rubberband: false,
      maxScale: 4,
      panOnlyZoomed: true
    }).init();

    panzoomRef.current = instance;

    emitDebugSnapshot('PANZOOM_INIT');

    return () => {
      console.log('[FYVE FULLSCREEN DEBUG] destroying panzoom instance on cleanup', {
        currentIndex,
        image: images[currentIndex] || null
      });

      instance.destroy();

      if (panzoomRef.current === instance) {
        panzoomRef.current = null;
      }
    };
  }, [isOpen, currentIndex, images]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, isOpen, onClose]);

  if (!isOpen || !images.length) return null;

  return (
    <div
      className="fyve-fullscreen-gallery-overlay"
      onClick={onClose}
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
          onClick={onClose}
          aria-label="Close gallery"
        >
          ×
        </button>

        <div className="fyve-fullscreen-gallery-topbar">
          <div className="fyve-fullscreen-gallery-counter">
            {`${currentIndex + 1}/${images.length}`}
          </div>
          <div className="fyve-fullscreen-gallery-title">{title}</div>
        </div>

        <button
          type="button"
          className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-prev"
          onClick={() => {
            console.log('[FYVE FULLSCREEN DEBUG] PREV_CLICK', {
              from: currentIndex,
              to: Math.max(0, currentIndex - 1)
            });
            setCurrentIndex((prev) => Math.max(0, prev - 1));
          }}
          disabled={currentIndex <= 0}
          aria-label="Previous image"
        >
          ‹
        </button>

        <button
          type="button"
          className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-next"
          onClick={() => {
            console.log('[FYVE FULLSCREEN DEBUG] NEXT_CLICK', {
              from: currentIndex,
              to: Math.min(images.length - 1, currentIndex + 1)
            });
            setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
          }}
          disabled={currentIndex >= images.length - 1}
          aria-label="Next image"
        >
          ›
        </button>

        <div className="fyve-fullscreen-gallery-stage">
          <div ref={containerRef} className="f-panzoom fyve-fullscreen-gallery-panzoom">
            <img
              key={images[currentIndex]}
              className="f-panzoom__content fyve-fullscreen-gallery-image"
              src={images[currentIndex]}
              alt={`${title} ${currentIndex + 1}`}
              draggable="false"
              onLoad={(e) => {
                console.log('[FYVE FULLSCREEN DEBUG] IMAGE_LOAD', {
                  src: e.currentTarget.currentSrc || e.currentTarget.src,
                  naturalWidth: e.currentTarget.naturalWidth,
                  naturalHeight: e.currentTarget.naturalHeight
                });
                emitDebugSnapshot('IMAGE_LOAD');
              }}
              onError={(e) => {
                console.log('[FYVE FULLSCREEN DEBUG] IMAGE_ERROR', {
                  src: e.currentTarget.currentSrc || e.currentTarget.src
                });
                e.target.src = '/api/Uploads/fallback-image.png';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenGallery;