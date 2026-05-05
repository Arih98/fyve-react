import React, { useEffect, useRef } from 'react';
import './FloatingPicturesSection.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const FloatingPicturesSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const items = Array.from(section.querySelectorAll('[data-float-item]'));

    let raf = null;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);

      items.forEach((item) => {
        const start = Number(item.dataset.floatStart || 50);
        const end = Number(item.dataset.floatEnd || -10);
        const y = start + (end - start) * progress;

        item.style.transform = `translateY(${y}vh)`;
      });

      raf = null;
    };

    const requestUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="floating-pictures-section" ref={sectionRef}>
      <div className="floating-pictures-inner">
        <div className="floating-pictures-copy" data-float-item data-float-start="24" data-float-end="-8">
          <p className="floating-pictures-kicker">FYVE London</p>
          <h2 className="floating-pictures-title">Little pieces, beautifully made</h2>
          <p className="floating-pictures-text">
            A soft, elevated edit of childrenswear for special days, slow mornings and everything in between.
          </p>
        </div>

        <div className="floating-picture floating-picture-one" data-float-item data-float-start="48" data-float-end="-18">
          <img src="/images/home-float-1.jpg" alt="" draggable="false" />
        </div>

        <div className="floating-picture floating-picture-two" data-float-item data-float-start="34" data-float-end="-24">
          <img src="/images/home-float-2.jpg" alt="" draggable="false" />
        </div>

        <div className="floating-picture floating-picture-three" data-float-item data-float-start="60" data-float-end="-8">
          <img src="/images/home-float-3.jpg" alt="" draggable="false" />
        </div>
      </div>
    </section>
  );
};

export default FloatingPicturesSection;