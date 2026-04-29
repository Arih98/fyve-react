import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { startProductImageTransition } from './utils/productImageTransition';
import './Cart.css';
import { formatWooMoney, formatCurrency } from './utils/formatMoney';

const Cart = ({ variant = 'page', onClose }) => {
const recentlyViewedImageRefs = useRef(new Map());
const placeholderImage = '/api/Uploads/fallback-image.png';
const {
  cart,
  cartItems,
  cartCount,
  cartTotal,
  loading,
  updateItemQuantity,
  removeItem
} = useContext(CartContext);
const navigate = useNavigate();
const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
const [recentlyViewedIndex, setRecentlyViewedIndex] = useState(0);
const recentlyViewedTouchStartX = useRef(0);
const recentlyViewedTouchDeltaX = useRef(0);
const recentlyViewedViewportRef = useRef(null);
const [recentlyViewedMaxIndex, setRecentlyViewedMaxIndex] = useState(0);
const storedProducts = useMemo(() => {
  try {
    return JSON.parse(localStorage.getItem('products') || '[]');
  } catch {
    return [];
  }
}, []);

  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]');
  setRecentlyViewedProducts(stored);
}, []);

useEffect(() => {
  const updateRecentlyViewedBounds = () => {
    const maxIndex = Math.max(0, recentlyViewedProducts.length - 1);
    setRecentlyViewedMaxIndex(maxIndex);
    setRecentlyViewedIndex(prev => Math.min(prev, maxIndex));
  };

  updateRecentlyViewedBounds();
  window.addEventListener('resize', updateRecentlyViewedBounds);

  return () => window.removeEventListener('resize', updateRecentlyViewedBounds);
}, [recentlyViewedProducts.length]);

const handleQuantityChange = async (itemKey, delta, currentQty) => {
  const nextQty = Math.max(1, currentQty + delta)

  try {
    await updateItemQuantity(itemKey, nextQty)
  } catch (err) {
    console.error(err)
  }
}

const handleRemoveItem = async (itemKey) => {
  try {
    await removeItem(itemKey)
  } catch (err) {
    console.error(err)
  }
}
  const isPanel = variant === 'panel';

  const getVariationValue = (variation) => {
  return String(variation?.value || variation?.display || variation?.term_name || variation?.term_slug || '').trim();
};

const findCartItemParentProduct = (item) => {
  return storedProducts.find((product) => {
    if (String(product.id) === String(item.id)) return true;

    return Array.isArray(product.variations) && product.variations.some((variation) =>
      String(variation.id) === String(item.id)
    );
  });
};

const getCartProductLink = (item, variationColor) => {
  const colorValue = getVariationValue(variationColor);

  try {
    const storedCartLinks = JSON.parse(localStorage.getItem('fyveCartProductLinks') || '{}');
    const storedLink = storedCartLinks[String(item.id)];

    if (storedLink?.path) {
      return storedLink.path;
    }
  } catch {}

  try {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]');

    const recentlyViewedMatch = recentlyViewed.find((product) => {
      const sameVariation = String(product.id) === String(item.id);
      const sameColor = !colorValue || String(product.selectedColor || '').toLowerCase() === String(colorValue).toLowerCase();

      return sameVariation && sameColor && product.path;
    });

    if (recentlyViewedMatch?.path) {
      return recentlyViewedMatch.path;
    }
  } catch {}

  const parentProduct = findCartItemParentProduct(item);

  const parentId =
    item.parentId ||
    item.parent_id ||
    item.product_id ||
    item.productId ||
    parentProduct?.id ||
    item.id;

  return colorValue
    ? `/product/${parentId}?color=${encodeURIComponent(colorValue)}`
    : `/product/${parentId}`;
};

  const cartItemsMarkup = (
  <ul className="cart-items">
    {cartItems.map((item) => {
      const canDecrease = item.quantity > 1
      const imageSrc =
        item.images?.[0]?.thumbnail ||
        item.images?.[0]?.src ||
        '/api/Uploads/fallback-image.png'

      const itemTotal = formatWooMoney(item.totals?.line_total, item.totals)

const variationColor = item.variation?.find((attr) => {
  const label = String(attr.attribute || attr.name || '').toLowerCase()
  return (
    label.includes('color') ||
    label.includes('colour') ||
    label.includes('pa_color') ||
    label.includes('pa_colour') ||
    label.includes('stitching') ||
    label.includes('stiching')
  )
})

const variationSize = item.variation?.find((attr) => {
  const label = String(attr.attribute || attr.name || '').toLowerCase()
  return label.includes('size') || label.includes('pa_size')
})

const productLink = getCartProductLink(item, variationColor);

      return (
        <li key={item.key} className="cart-item" data-cart-key={item.key}>
          <div className="cart-item-content cart-item-grid">
            <div className="cart-item-image">
              <div className="cart-item-image-box">
                <img src={imageSrc} alt={item.name} />
              </div>
            </div>

            <div className="cart-item-details">
<Link to={productLink} className="product-title" onClick={onClose}>
  {item.name}
</Link>

{variationColor && (
  <p className="variation variation-color">
    <span className="variation-label">
  {String(variationColor.attribute || variationColor.name || '').toLowerCase().includes('stitch') ? 'Stitching:' : 'Color:'}
</span> {variationColor.value || variationColor.display || ''}
  </p>
)}

{variationSize && (
  <p className="variation variation-size">
    <span className="variation-label">Size:</span> {variationSize.value || variationSize.display || ''}
  </p>
)}
              <div className="subtotal">
                {itemTotal}
              </div>

              <div className="cart-item-actions-row">
                <div className="quantity-controls">
                  <button
  className="quantity-minus"
  onClick={() => handleQuantityChange(item.key, -1, item.quantity)}
  disabled={!canDecrease || loading}
>
                    <span className="minus-line"></span>
                  </button>

                  <input
                    type="number"
                    className="quantity-input"
                    value={item.quantity}
                    min="1"
                    readOnly
                  />

                  <button
  className="quantity-plus"
  onClick={() => handleQuantityChange(item.key, 1, item.quantity)}
  disabled={loading}
>
                    <span className="plus-horizontal"></span>
                    <span className="plus-vertical"></span>
                  </button>
                </div>

                <button className="remove-item" onClick={() => handleRemoveItem(item.key)} disabled={loading}>
                  <img src="/assets/RemoveIcon.svg" alt="Remove" />
                </button>
              </div>
            </div>
          </div>
        </li>
      )
    })}
  </ul>
)

  const handleRecentlyViewedClick = (item) => {
  const sourceEl = recentlyViewedImageRefs.current.get(item.path);
  const sourceSrc = item.image || placeholderImage;
  const isMobileViewport = window.innerWidth <= 768;

  if (sourceEl) {
    startProductImageTransition({
      src: sourceSrc,
      fromElement: sourceEl,
      toElementGetter: () => document.querySelector('[data-pdp-primary-image="true"]'),
      duration: isMobileViewport ? 520 : 620,
      minTargetTop: isMobileViewport ? 80 : 0,
      zIndex: isMobileViewport ? 1 : 999999
    });
  }

  navigate(item.path, {
    state: {
      product: item.product,
      initialColor: item.selectedColor,
      transitionSourceDisplayId: item.path,
      transitionSourceSrc: sourceSrc,
      fromProductGrid: true
    }
  });
};

const handleRecentlyViewedTouchStart = (e) => {
  recentlyViewedTouchStartX.current = e.touches[0].clientX;
  recentlyViewedTouchDeltaX.current = 0;
};

const handleRecentlyViewedTouchMove = (e) => {
  recentlyViewedTouchDeltaX.current = e.touches[0].clientX - recentlyViewedTouchStartX.current;
};

const handleRecentlyViewedTouchEnd = () => {
  const threshold = 50;
  const deltaX = recentlyViewedTouchDeltaX.current;

if (deltaX <= -threshold) {
  setRecentlyViewedIndex((prev) => Math.min(prev + 1, recentlyViewedMaxIndex));
} else if (deltaX >= threshold) {
  setRecentlyViewedIndex((prev) => Math.max(prev - 1, 0));
}

  recentlyViewedTouchStartX.current = 0;
  recentlyViewedTouchDeltaX.current = 0;
};

const getRecentlyViewedTranslateX = () => {
  const viewport = recentlyViewedViewportRef.current;
  if (!viewport) return 0;

  const viewportWidth = viewport.clientWidth;
  const cardWidth = 144;
  const gap = 8;
  const step = cardWidth + gap;
  const trackWidth = (recentlyViewedProducts.length * step) - gap;
  const maxTranslate = Math.max(0, trackWidth - viewportWidth);

  if (recentlyViewedIndex <= 0) return 0;
  if (recentlyViewedIndex >= recentlyViewedProducts.length - 1) return maxTranslate;

  const centeredOffset = (viewportWidth - cardWidth) / 2;
  const rawTranslate = (recentlyViewedIndex * step) - centeredOffset;

  return Math.max(0, Math.min(rawTranslate, maxTranslate));
};

  const recentlyViewedMarkup = recentlyViewedProducts.length > 0 && (
  <section className="cart-recently-viewed" aria-label="Products you recently viewed">
    <h3 className="cart-recently-viewed-title">Products you recently viewed</h3>

<div
  ref={recentlyViewedViewportRef}
  className="cart-recently-viewed-carousel"
  onTouchStart={handleRecentlyViewedTouchStart}
  onTouchMove={handleRecentlyViewedTouchMove}
  onTouchEnd={handleRecentlyViewedTouchEnd}
>
  <div
    className="cart-recently-viewed-track"
style={{
  transform: `translateX(-${getRecentlyViewedTranslateX()}px)`
}}
  >
    {recentlyViewedProducts.map((item) => (
      <button
        key={item.path}
        type="button"
        className="cart-recently-viewed-card"
        onClick={() => handleRecentlyViewedClick(item)}
      >
        <div className="cart-recently-viewed-image-wrap">
          <img
            ref={el => {
              if (el) {
                recentlyViewedImageRefs.current.set(item.path, el);
              } else {
                recentlyViewedImageRefs.current.delete(item.path);
              }
            }}
            src={item.image}
            alt={item.title}
            className="cart-recently-viewed-image"
            onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
          />
        </div>

        <div className="cart-recently-viewed-info">
          <p className="cart-recently-viewed-name">{item.title}</p>
          <p className="cart-recently-viewed-price">{formatCurrency(item.price)}</p>
        </div>
      </button>
    ))}
  </div>
</div>
  </section>
);

  if (isPanel) {
    return (
      <div className="cart-panel">
        <div className="cart-panel-header">
          <h2 className="cart-panel-title">
            <span>Your bag</span>
            {cartCount > 0 && <span className="cart-page-count"> ({cartCount})</span>}
          </h2>
        </div>

        {cartItems.length > 0 ? (
          <>
            <div className="cart-panel-items">
              {cartItemsMarkup}
            </div>

            <div className="cart-panel-footer">
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>{formatWooMoney(cartTotal, cart?.totals)}</span>
              </div>

              <Link to="/checkout" className="button cart-checkout-button" onClick={onClose}>
                <span>Checkout</span>
                <span className="cart-total-amount">{formatWooMoney(cartTotal, cart?.totals)}</span>
              </Link>

              <Link to="/cart" className="cart-panel-view-bag" onClick={onClose}>
                View bag
              </Link>
            </div>
          </>
        ) : (
  <div className="cart-panel-empty">
  <div className="cart-empty-state">
    <div className="cart-empty-icon-wrapper">
      <img src="/assets/EmptyBag.svg" alt="" className="cart-empty-icon" />
    </div>

    <p className="cart-empty">Your bag is empty</p>

    <button
      className="cart-empty-continue"
      type="button"
      onClick={() => navigate('/products?category=ss26')}
    >
      <span className="cart-empty-continue-text">Continue shopping</span>
    </button>

    {recentlyViewedMarkup}
  </div>
</div>
)}
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page-inner">
        <h1 className="cart-page-title">
          <span>Your bag</span>
          {cartCount > 0 && <span className="cart-page-count"> ({cartCount})</span>}
        </h1>

        {cartItems.length > 0 ? (
          <main className="cart-page-main">
            <section className="cart-page-items">
              {cartItemsMarkup}
            </section>

            <aside className="cart-page-summary">
              <div className="cart-summary-box">
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="cart-summary-row cart-summary-total">
                  <span>Total</span>
                  <span>{formatWooMoney(cartTotal, cart?.totals)}</span>
                </div>

              </div>
            </aside>
          </main>
        ) : (
          <div className="cart-page-empty">
  <div className="cart-empty-state">
    <div className="cart-empty-icon-wrapper">
      <img src="/assets/EmptyBag.svg" alt="" className="cart-empty-icon" />
    </div>

    <p className="cart-empty">Your bag is empty</p>

    <button
      className="cart-empty-continue"
      type="button"
      onClick={() => navigate('/products?category=ss26')}
    >
      <span className="cart-empty-continue-text">Continue shopping</span>
    </button>

    {recentlyViewedMarkup}
  </div>
</div>
        )}
      </div>
    </div>
  );
};

export default Cart;