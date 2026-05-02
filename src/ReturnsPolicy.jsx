import React from 'react';
import './ReturnsPolicy.css';

const ReturnsPolicy = () => {
  return (
    <main className="returns-policy-page">
      <div className="returns-policy-shell">
        <h1>Returns Policy</h1>

        <section className="returns-policy-section">
          <h2>Return Eligibility</h2>
          <p>
            You may return your item(s) within 7 days of delivery. There will be an $8 charge to process your return, and we'll provide you with a prepaid shipping label to make the process as smooth as possible. Please note, your return must be marked as posted within 7 calendar days from being delivered. Any returns received which do not meet our returns criteria will not be eligible for a refund.
          </p>
        </section>

        <section className="returns-policy-section">
          <h2>How to Process a Return</h2>

          <div className="returns-policy-subsection">
            <h3>For Account Holders</h3>

            <ol>
              <li>
                <strong>Log into Your Account:</strong> Go to the "My Account" section on our website and navigate to your order history.
              </li>
              <li>
                <strong>Request a Return:</strong> For eligible orders, completed and within 7 days of delivery, click the "Request Return" button next to the order.
              </li>
              <li>
                <strong>Select Items:</strong> Choose the items and quantities you wish to return, then submit the form.
              </li>
              <li>
                <strong>Pay the Return Fee:</strong> You'll be redirected to a payment page to pay the $8 return fee using your credit or debit card via our secure payment system.
              </li>
              <li>
                <strong>Receive Your Shipping Label:</strong> Once the payment is confirmed, we'll email you a prepaid shipping label. Check your inbox and spam or junk folder for the email with the attached PDF label.
              </li>
              <li>
                <strong>Pack and Ship:</strong> Pack the items in their original packaging with all tags attached. Attach the prepaid label to the package and drop it off at a designated shipping point within 7 days.
              </li>
              <li>
                <strong>Refund Processing:</strong> After we receive and inspect your return, we'll process your refund promptly, provided the items meet our return criteria.
              </li>
            </ol>
          </div>

          <div className="returns-policy-subsection">
            <h3>For Guest Users</h3>

            <ol>
              <li>
                <strong>Visit the Returns Page:</strong> Go to <a href="/returns/">https://fyvelondon.com/returns/</a>.
              </li>
              <li>
                <strong>Enter Order Details:</strong> Provide your order number and the billing email address used for the purchase.
              </li>
              <li>
                <strong>Select Items:</strong> If the order is eligible, completed and within 7 days of delivery, you'll be directed to a form to choose the items and quantities you wish to return, then submit the form.
              </li>
              <li>
                <strong>Pay the Return Fee:</strong> You'll be redirected to a payment page to pay the $8 return fee using your credit or debit card via our secure payment system.
              </li>
              <li>
                <strong>Receive Your Shipping Label:</strong> Once the payment is confirmed, we'll email you a prepaid shipping label. Check your inbox and spam or junk folder for the email with the attached PDF label.
              </li>
              <li>
                <strong>Pack and Ship:</strong> Pack the items in their original packaging with all tags attached. Attach the prepaid label to the package and drop it off at a designated shipping point within 7 days.
              </li>
              <li>
                <strong>Refund Processing:</strong> After we receive and inspect your return, we'll process your refund promptly, provided the items meet our return criteria.
              </li>
            </ol>
          </div>
        </section>

        <section className="returns-policy-section">
          <h2>Refund Conditions</h2>
          <p>
            To be eligible for a refund, items must be returned in their original packaging with all tags still attached. Refunds will only be issued for items meeting these conditions.
          </p>
        </section>

        <section className="returns-policy-section">
          <h2>Important Notes</h2>

          <ul>
            <li>
              <strong>Sale or Discounted Items:</strong> Sale or discounted items are not eligible for return.
            </li>
            <li>
              <strong>Assistance:</strong> If you have any questions or need help with your return, feel free to contact us at <a href="mailto:hello@fyvekids.com">hello@fyvekids.com</a>.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default ReturnsPolicy;