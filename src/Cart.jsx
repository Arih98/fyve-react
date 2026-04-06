import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Cart.css';

const Cart = ({ variant = 'page', onClose }) => {
  const { cartItems, setCartItems } = useContext(CartContext);

  const handleQuantityChange = (itemId, variationKey, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (!(item.id === itemId && `${item.size || ''}-${item.color || ''}` === variationKey)) {
          return item;
        }

        const maxStock = Number(item.stockQuantity ?? Infinity);
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
  const isPanel = variant === 'panel';

  const cartItemsMarkup = (
    <ul className="cart-items">
      {cartItems.map(item => {
        const variationKey = `${item.size || ''}-${item.color || ''}`;

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

  if (isPanel) {
    return (
      <div className="cart-panel">
        <div className="cart-panel-header">
          <h2 className="cart-panel-title">
            <span>Your bag</span>
            {cartItems.length > 0 && <span className="cart-page-count"> ({cartItems.length})</span>}
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
            <p className="cart-empty">There are currently no items in your bag.</p>
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
          {cartItems.length > 0 && <span className="cart-page-count"> ({cartItems.length})</span>}
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

                <Link to="/checkout" className="button cart-checkout-button">
                  <span>Checkout</span>
                  <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
                </Link>
              </div>
            </aside>
          </main>
        ) : (
          <div className="cart-page-empty">
            <p className="cart-empty">There are currently no items in your bag.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;