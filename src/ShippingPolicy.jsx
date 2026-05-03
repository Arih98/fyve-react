import React from 'react';
import './ShippingPolicy.css';

const ShippingPolicy = () => {
  return (
    <main className="shipping-policy-page">
      <div className="shipping-policy-shell">
        <h1>Shipping Policy</h1>

        <section className="shipping-policy-section">
          <h2>Shipping Details</h2>
          <p>
            Once your order has been prepared and dispatched, you’ll receive a shipping confirmation email with your tracking details. You can follow your delivery using the tracking link included in that email.
          </p>
        </section>

        <section className="shipping-policy-section">
          <h2>Complimentary Standard Shipping</h2>
          <ul>
            <li>Free standard shipping is available in the US on all items.</li>
            <li>Estimated delivery time is 5-7 business days once dispatched.</li>

          </ul>
        </section>

        <section className="shipping-policy-section">
          <h2>Important Notes</h2>
          <ul>
            <li>Orders are usually processed within 1-2 business days.</li>
            <li>Delivery estimates may vary during busy periods, holidays, or carrier delays.</li>
            <li>Free shipping applies to full-price items only.</li>
            <li>For help with your order or delivery, please contact our customer service team.</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default ShippingPolicy;