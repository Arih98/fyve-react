import React, { useState, useEffect, useRef, useContext } from 'react';
import gsap from 'gsap';
import { CartContext } from './CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);
  const cartContentRef = useRef(null);
  const backgroundRef = useRef(null);
  const cartIconRef = useRef(null);

  const closeCart = () => {
    gsap.to(cartContentRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
    gsap.to(cartRef.current, {
      width: 50,
      height: 50,
      borderRadius: 25,
      duration: 1.2,
      ease: 'expo.inOut',
      onComplete: () => setIsCartOpen(false)
    });
    gsap.to(backgroundRef.current, { borderRadius: 25, duration: 1.2, ease: 'expo.inOut' });
    gsap.to(cartContentRef.current, { borderRadius: 25, duration: 1.2, ease: 'expo.inOut' });
    gsap.to(cartIconRef.current, { opacity: 1, duration: 0.8, ease: 'expo.inOut' , delay: 0.45});
  };

  useEffect(() => {
    if (cartItems.length === 0 && isCartOpen) {
      closeCart();
    }
  }, [cartItems.length, isCartOpen]);

  useEffect(() => {
    if (cartRef.current) {
      if (cartItems.length > 0) {
        gsap.fromTo(cartRef.current, 
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'bounce.out', 
            onComplete: () => { cartRef.current.style.pointerEvents = 'auto'; }
          }
        );
      } else {
        gsap.to(cartRef.current, {
          x: 100, opacity: 0, duration: 0.6, ease: 'power3.inOut',
          onComplete: () => { 
            cartRef.current.style.pointerEvents = 'none'; 
            gsap.set(cartRef.current, { width: 50, height: 50 });
          }
        });
      }
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (isCartOpen) {
      gsap.to(cartRef.current, {
        width: 400,
        height: 600,
        borderRadius: 20,
        duration: 1.2,
        ease: 'expo.inOut'
      });
      gsap.to(backgroundRef.current, { borderRadius: 20, duration: 1.2, ease: 'expo.inOut' });
      gsap.to(cartContentRef.current, { borderRadius: 20, duration: 1.2, ease: 'expo.inOut' });
      gsap.to(cartContentRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.6});
    }
  }, [isCartOpen]);

  const toggleCart = () => {
    if (isCartOpen) {
      closeCart();
    } else {
      gsap.set(cartIconRef.current, { clearProps: 'opacity' });
      setIsCartOpen(true);
    }
  };

  const handleQuantityChange = (itemId, variationKey, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && `${item.size}-${item.color}` === variationKey
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId, variationKey) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.id === itemId && `${item.size}-${item.color}` === variationKey)));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`cart-slide-menu${isCartOpen ? ' active' : ''}`} ref={cartRef} style={{ opacity: 0, transform: 'translateX(100px)', pointerEvents: 'none' }}>
      <div className={`cart-icon${cartItems.length > 0 ? ' has-items' : ''}`} onClick={toggleCart} ref={cartIconRef}>
        <img src="http://localhost:3000/api/Uploads/Asset%202FYVE%20FI.svg" alt="Cart Icon" />
        <span className={`cart-count${cartItems.length > 0 ? ' has-items' : ''}`}>{cartItems.length}</span>
      </div>
      <div className="cart-menu-background" ref={backgroundRef}></div>
      <div className="cart-menu-content" ref={cartContentRef}>
        <div className="cart-menu-header">
          <h2 className="cart-header-title">What's in your bag</h2>
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
                            <a href={`/product/${item.id}`} className="product-title">{item.name}</a>
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
                              <button className="quantity-plus" onClick={() => handleQuantityChange(item.id, variationKey, 1)}>+</button>
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
              <a href="/checkout" className="button">
                Checkout <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;