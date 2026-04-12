import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import { startProductImageTransition } from './utils/productImageTransition';
import './Cart.css';

const Cart = ({ variant = 'page', onClose }) => {
const recentlyViewedImageRefs = useRef(new Map());
const placeholderImage = '/api/Uploads/fallback-image.png';
const { cartItems, setCartItems } = useContext(CartContext);
const navigate = useNavigate();
const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
const [recentlyViewedIndex, setRecentlyViewedIndex] = useState(0);
const recentlyViewedTouchStartX = useRef(0);
const recentlyViewedTouchDeltaX = useRef(0);
const recentlyViewedViewportRef = useRef(null);
const [recentlyViewedMaxIndex, setRecentlyViewedMaxIndex] = useState(0);

  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]');
  setRecentlyViewedProducts(stored);
}, []);

useEffect(() => {
  const updateRecentlyViewedBounds = () => {
    const viewport = recentlyViewedViewportRef.current;
    if (!viewport) return;

    const step = 152;
    const visibleCount = Math.max(1, Math.floor(viewport.clientWidth / step));
    const maxIndex = Math.max(0, recentlyViewedProducts.length - visibleCount);

    setRecentlyViewedMaxIndex(maxIndex);
    setRecentlyViewedIndex(prev => Math.min(prev, maxIndex));
  };

  updateRecentlyViewedBounds();
  window.addEventListener('resize', updateRecentlyViewedBounds);

  return () => window.removeEventListener('resize', updateRecentlyViewedBounds);
}, [recentlyViewedProducts.length]);

  const handleQuantityChange = (itemId, variationKey, delta) => {
  setCartItems(prevItems =>
    prevItems.map(item => {
      if (!(item.id === itemId && `${item.size || ''}-${item.color || ''}` === variationKey)) {
        return item;
      }

      const parsedStock = Number(item.stockQuantity);
      const maxStock = Number.isFinite(parsedStock) && parsedStock > 0 ? parsedStock : Infinity;
      const nextQuantity = item.quantity + delta;

      return {
        ...item,
        quantity: Math.max(1, Math.min(maxStock, nextQuantity))
      };
    })
  );
};

  const handleRemoveItem = (itemId, variationKey) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.id === itemId && `${item.size || ''}-${item.color || ''}` === variationKey)
      )
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isPanel = variant === 'panel';

  const cartItemsMarkup = (
    <ul className="cart-items">
      {cartItems.map(item => {
  const variationKey = `${item.size || ''}-${item.color || ''}`;
  const maxStock = Number(item.stockQuantity);
  const hasMaxStock = Number.isFinite(maxStock) && maxStock > 0;
  const canDecrease = item.quantity > 1;
  const canIncrease = !hasMaxStock || item.quantity < maxStock;

  return (
    <li key={`${item.id}-${variationKey}`} className="cart-item" data-cart-key={item.id}>
      <div className="cart-item-content cart-item-grid">
        <div className="cart-item-image">
          <div className="cart-item-image-box">
            <img src={item.image} alt={item.name} />
          </div>
        </div>

        <div className="cart-item-details">
          <Link to={`/product/${item.id}`} className="product-title" onClick={onClose}>
            {item.name}
          </Link>

          {item.color && (
            <p className="variation variation-color">
              <span className="variation-label">Color:</span> {item.color}
            </p>
          )}

          {item.size && (
            <p className="variation variation-size">
              <span className="variation-label">Size:</span> {item.size}
            </p>
          )}

          <div className="subtotal">
            ${(item.price * item.quantity).toFixed(2)}
          </div>

          <div className="cart-item-actions-row">
            <div className="quantity-controls">
              <button
                className="quantity-minus"
                onClick={() => handleQuantityChange(item.id, variationKey, -1)}
                disabled={!canDecrease}
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
                onClick={() => handleQuantityChange(item.id, variationKey, 1)}
                disabled={!canIncrease}
              >
                <span className="plus-horizontal"></span>
                <span className="plus-vertical"></span>
              </button>
            </div>

            <button className="remove-item" onClick={() => handleRemoveItem(item.id, variationKey)}>
              <img src="/assets/RemoveIcon.svg" alt="Remove" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
})}
    </ul>
  );

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
    style={{ transform: `translateX(calc(${recentlyViewedIndex} * -152px))` }}
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
          <p className="cart-recently-viewed-price">${Number(item.price || 0).toFixed(2)}</p>
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
            {cartItemCount > 0 && <span className="cart-page-count"> ({cartItemCount})</span>}
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
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="button cart-checkout-button" onClick={onClose}>
                <span>Checkout</span>
                <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
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
          {cartItemCount > 0 && <span className="cart-page-count"> ({cartItemCount})</span>}
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
                  <span>${cartTotal.toFixed(2)}</span>
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