import React, { useEffect, useRef, useState } from 'react';
import './FullscreenGallery.css';

const FullscreenGallery = ({ images, initialIndex = 0, isOpen, title, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const zoomScrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
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

    if (zoomScrollRef.current) {
      zoomScrollRef.current.scrollTop = 0;
      zoomScrollRef.current.scrollLeft = 0;
    }
  }, [isOpen, currentIndex]);

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
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex <= 0}
          aria-label="Previous image"
        >
          ‹
        </button>

        <button
          type="button"
          className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-next"
          onClick={() => setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))}
          disabled={currentIndex >= images.length - 1}
          aria-label="Next image"
        >
          ›
        </button>

        <div className="fyve-fullscreen-gallery-stage">
          <div
            ref={zoomScrollRef}
            className="fyve-fullscreen-gallery-zoom-scroll"
          >
            <img
              key={images[currentIndex]}
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
      </div>
    </div>
  );
};

export default FullscreenGallery;