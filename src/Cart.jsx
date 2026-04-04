import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CartContext } from './CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);
  const cartContentRef = useRef(null);
  const backgroundRef = useRef(null);

    const closeCart = () => {
    gsap.to(cartContentRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out'
    });
    gsap.to(cartRef.current, {
      x: 100,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: () => {
        setIsCartOpen(false);
        cartRef.current.style.pointerEvents = 'none';
      }
    });
  };

  useEffect(() => {
    if (cartItems.length === 0 && isCartOpen) {
      closeCart();
    }
  }, [cartItems.length, isCartOpen]);

    useEffect(() => {
    if (isCartOpen) {
      cartRef.current.style.pointerEvents = 'auto';

      gsap.fromTo(
        cartRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );

      gsap.fromTo(
        cartContentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.12 }
      );
    }
  }, [isCartOpen]);

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
    style={{ opacity: 0, transform: 'translateX(100px)', pointerEvents: 'none' }}
  >
    <div className="cart-menu-background" ref={backgroundRef}></div>
    <div className="cart-menu-content" ref={cartContentRef}>
      <div className="cart-menu-header">
        <h2 className="cart-header-title">Your bag</h2>
        <div className="cart-close-button" onClick={toggleCart}>✕</div>
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
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="cart-item-details">
                          <Link to={`/product/${item.id}`} className="product-title">{item.name}</Link>
                          {item.size && (
                            <p className="variation variation-size">
                              <span className="variation-label">Size: </span>{item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="variation variation-color">
                              <span className="variation-label">Color: </span>{item.color}
                            </p>
                          )}
                          <div className="quantity-controls">
                            <button className="quantity-minus" onClick={() => handleQuantityChange(item.id, variationKey, -1)}>-</button>
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
  disabled={Number(item.quantity) >= Number(item.stockQuantity ?? Infinity)}
>
  +
</button>
                          </div>
                          <div className="subtotal" data-price={item.price}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <button className="remove-item" onClick={() => handleRemoveItem(item.id, variationKey)}>Remove</button>
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
            <Link to="/checkout" className="button" onClick={closeCart}>
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