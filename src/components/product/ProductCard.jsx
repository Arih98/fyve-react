import React from 'react';
import { motion } from 'framer-motion';
import ProductPrice from './ProductPrice';

const getRectData = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    x: Number(r.x.toFixed(2)),
    y: Number(r.y.toFixed(2)),
    width: Number(r.width.toFixed(2)),
    height: Number(r.height.toFixed(2)),
    top: Number(r.top.toFixed(2)),
    left: Number(r.left.toFixed(2)),
    bottom: Number(r.bottom.toFixed(2)),
    right: Number(r.right.toFixed(2))
  };
};

const logElementState = (label, wrapperEl, imageEl) => {
  console.log(label, {
    wrapper: getRectData(wrapperEl),
    image: getRectData(imageEl)
  });
};

const trackFrames = (label, wrapperEl, imageEl, frameCount = 20) => {
  let frame = 0;
  const tick = () => {
    if (!wrapperEl) return;
    console.log(`${label} frame ${frame}`, {
      wrapper: getRectData(wrapperEl),
      image: getRectData(imageEl)
    });
    frame += 1;
    if (frame < frameCount) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const ProductCard = ({
  item,
  index,
  onClick,
  imageRefs,
  placeholderImage
}) => {
  const imageSrc =
    item.gallery && item.gallery.length > 0
      ? item.gallery[0]
      : placeholderImage;

  const layoutId = `product-image-${item.displayId}`;

  return (
    <div
      key={`${item.displayId}-${index}`}
      onClick={(e) => {
        const wrapperEl = imageRefs.current.get(item.displayId);
        const imageEl = wrapperEl?.querySelector('.product-image') || null;

        logElementState('[PLP] before navigation', wrapperEl, imageEl);
        trackFrames('[PLP] after click', wrapperEl, imageEl, 12);

        console.log('[PLP] card click', {
          displayId: item.displayId,
          layoutId,
          title: item.title,
          image: imageSrc
        });

        onClick(item, e);
      }}
      className="product-card"
    >
      <motion.div
        initial={false}
        layoutId={layoutId}
        ref={el => {
          imageRefs.current.set(item.displayId, el);
          if (el) {
            const imageEl = el.querySelector('.product-image');
            logElementState('[PLP] wrapper ref set', el, imageEl);
          }
        }}
        id={`img-${item.displayId}`}
        className="product-image-wrapper"
        onLayoutAnimationStart={() => {
          const wrapperEl = imageRefs.current.get(item.displayId);
          const imageEl = wrapperEl?.querySelector('.product-image') || null;

          logElementState('[PLP] layout animation start', wrapperEl, imageEl);
          trackFrames('[PLP] animating', wrapperEl, imageEl, 20);

          if (wrapperEl) {
            wrapperEl.style.zIndex = '10000';
          }
        }}
        onLayoutAnimationComplete={() => {
          const wrapperEl = imageRefs.current.get(item.displayId);
          const imageEl = wrapperEl?.querySelector('.product-image') || null;

          logElementState('[PLP] layout animation complete', wrapperEl, imageEl);

          if (wrapperEl) {
            wrapperEl.style.zIndex = '';
          }
        }}
      >
        <img
          src={imageSrc}
          alt={item.title}
          className="product-image"
          onError={e => { e.target.src = placeholderImage; }}
          onLoad={e => {
            const wrapperEl = imageRefs.current.get(item.displayId);
            logElementState('[PLP] image loaded', wrapperEl, e.target);
          }}
        />
      </motion.div>

      <div className="product-info">
        <h3 className="product-title">
          {item.title}
        </h3>
        <ProductPrice price={item.price} />
      </div>
    </div>
  );
};

export default ProductCard;