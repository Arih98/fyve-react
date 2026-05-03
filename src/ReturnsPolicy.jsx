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
        <strong>Log into Your Account:</strong> Go to the "My Account" section on our website and open your order history.
      </li>
      <li>
        <strong>Find Your Order:</strong> Select "View order" for the order you would like to return. If the order is eligible, you may also see a "Create return" option beside it.
      </li>
      <li>
        <strong>Open the Return Section:</strong> On the order details page, go to the "Return this order" section.
      </li>
      <li>
        <strong>Select Items:</strong> Choose the item or items you would like to return and select the quantity for each item.
      </li>
      <li>
        <strong>Start Your Return:</strong> Click "Start return" to submit your return request.
      </li>
      <li>
        <strong>Pay the Return Fee:</strong> You will be redirected to a secure payment page to pay the $8 return fee.
      </li>
      <li>
        <strong>Receive Your Shipping Label:</strong> Once payment has been confirmed, we will email you a prepaid shipping label. Please check your inbox, spam, or junk folder for the email with the attached PDF label.
      </li>
      <li>
        <strong>Pack and Ship:</strong> Pack the items in their original packaging with all tags attached. Attach the prepaid label to the parcel and drop it off at the designated shipping point within 7 days.
      </li>
      <li>
        <strong>Refund Processing:</strong> Once we receive and inspect your return, we will process your refund, provided the items meet our return conditions.
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
        <strong>Enter Order Details:</strong> Enter your order number and the billing email address used at checkout.
      </li>
      <li>
        <strong>Check Eligibility:</strong> If your order is eligible for return, you will be able to continue to the return form.
      </li>
      <li>
        <strong>Select Items:</strong> Choose the item or items you would like to return and select the quantity for each item.
      </li>
      <li>
        <strong>Start Your Return:</strong> Submit your return request to continue.
      </li>
      <li>
        <strong>Pay the Return Fee:</strong> You will be redirected to a secure payment page to pay the $8 return fee.
      </li>
      <li>
        <strong>Receive Your Shipping Label:</strong> Once payment has been confirmed, we will email you a prepaid shipping label. Please check your inbox, spam, or junk folder for the email with the attached PDF label.
      </li>
      <li>
        <strong>Pack and Ship:</strong> Pack the items in their original packaging with all tags attached. Attach the prepaid label to the parcel and drop it off at the designated shipping point within 7 days.
      </li>
      <li>
        <strong>Refund Processing:</strong> Once we receive and inspect your return, we will process your refund, provided the items meet our return conditions.
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