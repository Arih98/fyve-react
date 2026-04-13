import React, { useEffect, useRef, useState } from 'react';
import { Carousel } from '@fancyapps/ui/dist/carousel/';
import { Zoomable } from '@fancyapps/ui/dist/carousel/carousel.zoomable.js';
import '@fancyapps/ui/dist/carousel/carousel.css';
import '@fancyapps/ui/dist/carousel/carousel.zoomable.css';
import './FullscreenGallery.css';

const FullscreenGallery = ({ images, initialIndex = 0, isOpen, title, onClose }) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !containerRef.current || !images.length) return;

    const instance = Carousel(
      containerRef.current,
      {
        infinite: false,
        fill: true,
        dragFree: false,
        adaptiveHeight: false,
        Dots: false,
        Navigation: false,
        initialPage: initialIndex,
        Zoomable: {
          panOnlyZoomed: true
        },
        on: {
          ready: (carousel) => {
            setCurrentIndex(carousel.getPageIndex());
          },
          change: (carousel) => {
            setCurrentIndex(carousel.getPageIndex());
          }
        }
      },
      { Zoomable }
    ).init();

    instanceRef.current = instance;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') instance.prev();
      if (e.key === 'ArrowRight') instance.next();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      instance.destroy();
      instanceRef.current = null;
    };
  }, [images, initialIndex, isOpen, onClose]);

  if (!isOpen) return null;

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
            {images.length ? `${currentIndex + 1}/${images.length}` : '0/0'}
          </div>
          <div className="fyve-fullscreen-gallery-title">{title}</div>
        </div>

        <button
          type="button"
          className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-prev"
          onClick={() => instanceRef.current?.prev()}
          disabled={currentIndex <= 0}
          aria-label="Previous image"
        >
          ‹
        </button>

        <button
          type="button"
          className="fyve-fullscreen-gallery-nav fyve-fullscreen-gallery-nav-next"
          onClick={() => instanceRef.current?.next()}
          disabled={currentIndex >= images.length - 1}
          aria-label="Next image"
        >
          ›
        </button>

        <div ref={containerRef} className="f-carousel fyve-fullscreen-gallery-carousel">
          {images.map((img, idx) => (
            <div className="f-carousel__slide fyve-fullscreen-gallery-slide" key={`${img}-${idx}`}>
              <div className="f-panzoom fyve-fullscreen-gallery-panzoom">
                <img
                  className="f-panzoom__content fyve-fullscreen-gallery-image"
                  src={img}
                  alt={`${title} ${idx + 1}`}
                  onError={(e) => {
                    e.target.src = '/api/Uploads/fallback-image.png';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullscreenGallery;