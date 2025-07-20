import React, { useState, useEffect, useContext } from 'react';
import RevolutCheckout from '@revolut/checkout';
import { CartContext } from './CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState({ email: '', name: '', address: '' });
  const [publicToken, setPublicToken] = useState('pk_4Vz86AUZwd356oEaE8mTXaymLyMSushzlPa6rx6cKnMQBQOI');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(cartTotal);
    setLoading(false);
  }, [cartItems]);

  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const createOrder = async () => {
    try {
      const response = await fetch('/api/create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'USD',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return { publicId: data.token };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const initializePayments = async () => {
    const payments = await RevolutCheckout.payments({
      locale: 'en',
      publicToken,
    });
    return payments;
  };

  useEffect(() => {
    if (loading) return;
    initializePayments().then(({ revolutPay }) => {
      revolutPay.mount(document.getElementById('revolut-pay'), {
        currency: 'USD',
        totalAmount: Math.round(total * 100),
        createOrder,
        onSuccess: () => {
          alert('Payment successful with Revolut Pay!');
          setCartItems([]);
        },
        onError: (err) => {
          setError(err.message);
        },
        onCancel: () => {
          setError('Payment cancelled');
        },
      });
    });
  }, [loading, total, setCartItems]);

  useEffect(() => {
    if (loading) return;
    initializePayments().then(({ paymentRequest }) => {
      const prInstance = paymentRequest(document.getElementById('payment-request'), {
        currency: 'USD',
        amount: Math.round(total * 100),
        createOrder,
        onSuccess: () => {
          alert('Payment successful with Apple/Google Pay!');
          setCartItems([]);
        },
        onError: (err) => {
          setError(err.message);
        },
        onCancel: () => {
          setError('Payment cancelled');
        },
      });
      prInstance.canMakePayment().then((method) => {
        if (method) {
          prInstance.render();
        } else {
          prInstance.destroy();
          document.getElementById('payment-request').style.display = 'none';
        }
      });
    });
  }, [loading, total, setCartItems]);

  const handleCardPayment = async () => {
    try {
      const { token } = await createOrder();
      const rcInstance = await RevolutCheckout(token);
      rcInstance.payWithPopup({
        email: customer.email,
        name: customer.name,
        onSuccess: () => {
          alert('Payment successful with Card!');
          setCartItems([]);
        },
        onError: (err) => {
          setError(err.message);
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading checkout...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="cart-summary">
        <h2>Your Cart</h2>
        <ul>
          {cartItems.map(item => (
            <li key={`${item.id}-${item.size}-${item.color}`}>
              {item.name} - ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <p>Total: ${total.toFixed(2)}</p>
      </div>
      <div className="customer-form">
        <h2>Customer Details</h2>
        <input name="name" placeholder="Full Name" value={customer.name} onChange={handleInputChange} />
        <input name="email" placeholder="Email" value={customer.email} onChange={handleInputChange} />
        <input name="address" placeholder="Shipping Address" value={customer.address} onChange={handleInputChange} />
      </div>
      <div className="payment-methods">
        <h2>Payment Methods</h2>
        <div id="revolut-pay" className="payment-button"></div>
        <div id="payment-request" className="payment-button"></div>
        <button onClick={handleCardPayment} className="card-button">Pay with Credit/Debit Card</button>
      </div>
    </div>
  );
};

export default Checkout;