import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);
  const cartContentRef = useRef(null);
  const backgroundRef = useRef(null);
  const cartHistoryPushedRef = useRef(false);
  const isMobileRef = useRef(window.innerWidth <= 768);

  const animateCloseCart = () => {
  setIsCartOpen(false);
  if (cartRef.current) {
    cartRef.current.style.pointerEvents = 'none';
  }
};

  const closeCart = (skipHistoryBack = false) => {
    animateCloseCart();

if (isMobileRef.current && !skipHistoryBack && cartHistoryPushedRef.current) {
  cartHistoryPushedRef.current = false;
  window.history.back();
}
  };

  useEffect(() => {
    if (cartItems.length === 0 && isCartOpen) {
      closeCart();
    }
  }, [cartItems.length, isCartOpen]);

  useEffect(() => {
  if (isCartOpen) {
    if (isMobileRef.current && !cartHistoryPushedRef.current) {
      window.history.pushState({ cartOpen: true }, '');
      cartHistoryPushedRef.current = true;
    }

    if (cartRef.current) {
      cartRef.current.style.pointerEvents = 'auto';
    }
  }
}, [isCartOpen]);

  useEffect(() => {
    const handlePopState = () => {
  if (isMobileRef.current && isCartOpen) {
    cartHistoryPushedRef.current = false;
    animateCloseCart();
  }
};

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isCartOpen]);

  useEffect(() => {
  const handleResize = () => {
    isMobileRef.current = window.innerWidth <= 768;
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

  const toggleCart = () => {
    if (isCartOpen) {
      closeCart();
    } else {
      setIsCartOpen(true);
    }
  };

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

  useEffect(() => {
    const handleToggleCart = () => {
      if (isCartOpen) {
        closeCart();
      } else {
        setIsCartOpen(true);
      }
    };

    const handleOpenCart = () => {
      setIsCartOpen(true);
    };

    const handleCloseCart = () => {
      if (isCartOpen) {
        closeCart();
      }
    };

    window.addEventListener('cart:toggle', handleToggleCart);
    window.addEventListener('cart:open', handleOpenCart);
    window.addEventListener('cart:close', handleCloseCart);

    return () => {
      window.removeEventListener('cart:toggle', handleToggleCart);
      window.removeEventListener('cart:open', handleOpenCart);
      window.removeEventListener('cart:close', handleCloseCart);
    };
  }, [isCartOpen]);

  const handleRemoveItem = (itemId, variationKey) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.id === itemId && `${item.size || ''}-${item.color || ''}` === variationKey)
      )
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className={`cart-slide-menu cart-drawer-only${isCartOpen ? ' active' : ''}`}
      ref={cartRef}
      style={{ pointerEvents: 'none' }}
    >
      <div className="cart-menu-background" ref={backgroundRef}></div>
      <div className="cart-menu-content" ref={cartContentRef}>
        <div className="cart-menu-header">
          <h2 className="cart-header-title">Your bag</h2>
        </div>

        <div className="cart-items-wrapper">
          <div className="cart-items-inner">
            <div className="custom-cart-content">
              <ul className="cart-items">
                {cartItems.length > 0 ? (
                  cartItems.map(item => {
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
                            <Link to={`/product/${item.id}`} className="product-title" onClick={() => closeCart(true)}>
                              {item.name}
                            </Link>

                            {item.size && (
                              <p className="variation variation-size">{item.size}</p>
                            )}

                            {item.color && (
                              <p className="variation variation-color">{item.color}</p>
                            )}

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

                            <div className="subtotal" data-price={item.price}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>

                            <button className="remove-item" onClick={() => handleRemoveItem(item.id, variationKey)}>
                              <img src="/assets/RemoveIcon.svg" alt="Remove" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <p className="cart-empty">There are currently no items in your bag.</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="cart-footer">
          {cartItems.length > 0 && (
            <p className="cart-buttons">
              <Link to="/checkout" className="button" onClick={() => closeCart(true)}>
                Checkout <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;