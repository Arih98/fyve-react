import React, { useEffect, useState } from 'react';
import { getAddresses, updateAddresses } from './api/account';
import AccountTabs from './AccountTabs';

const emptyBilling = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: '',
  email: '',
  phone: ''
};

const emptyShipping = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: ''
};

const AccountAddresses = () => {
  const [billing, setBilling] = useState(emptyBilling);
  const [shipping, setShipping] = useState(emptyShipping);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await getAddresses();
        setBilling({ ...emptyBilling, ...(data.billing || {}) });
        setShipping({ ...emptyShipping, ...(data.shipping || {}) });
      } catch (err) {
        setError(err.message || 'Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const data = await updateAddresses({ billing, shipping });
      setBilling({ ...emptyBilling, ...(data.billing || {}) });
      setShipping({ ...emptyShipping, ...(data.shipping || {}) });
      setSuccess('Addresses updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update addresses');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
  return (
    <div className="account-section-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-section-inner">
          <div className="account-skeleton account-skeleton-title"></div>
          <div className="account-skeleton account-skeleton-subtitle"></div>

          <div className="account-addresses-form">
            <div className="account-address-grid">
              {Array.from({ length: 2 }).map((_, cardIndex) => (
                <div className="account-skeleton-card" key={cardIndex}>
                  <div className="account-skeleton account-skeleton-card-title"></div>

                  <div className="account-skeleton-form">
                    {Array.from({ length: cardIndex === 0 ? 11 : 9 }).map((__, fieldIndex) => (
                      <div className="account-skeleton-field" key={fieldIndex}>
                        <div className="account-skeleton account-skeleton-label"></div>
                        <div className="account-skeleton account-skeleton-input"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="account-section-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-section-inner">
          <h1 className="account-page-title">Addresses</h1>
          <p className="account-page-subtitle">Manage your billing and shipping information.</p>

          <form onSubmit={handleSubmit} className="account-addresses-form">
            <div className="account-address-grid">
              <div className="account-card">
  <h2>Billing address</h2>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-first-name"
      name="first_name"
      value={billing.first_name}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-first-name">First name</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-last-name"
      name="last_name"
      value={billing.last_name}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-last-name">Last name</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-company"
      name="company"
      value={billing.company}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-company">Company</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-address-1"
      name="address_1"
      value={billing.address_1}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-address-1">Address line 1</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-address-2"
      name="address_2"
      value={billing.address_2}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-address-2">Address line 2</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-city"
      name="city"
      value={billing.city}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-city">City</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-state"
      name="state"
      value={billing.state}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-state">County / State</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-postcode"
      name="postcode"
      value={billing.postcode}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-postcode">Postcode</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-country"
      name="country"
      value={billing.country}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-country">Country</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-email"
      name="email"
      type="email"
      value={billing.email}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-email">Email</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="billing-phone"
      name="phone"
      type="tel"
      value={billing.phone}
      onChange={handleBillingChange}
      placeholder=" "
    />
    <label htmlFor="billing-phone">Phone</label>
  </div>
</div>

<div className="account-card">
  <h2>Shipping address</h2>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-first-name"
      name="first_name"
      value={shipping.first_name}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-first-name">First name</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-last-name"
      name="last_name"
      value={shipping.last_name}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-last-name">Last name</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-company"
      name="company"
      value={shipping.company}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-company">Company</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-address-1"
      name="address_1"
      value={shipping.address_1}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-address-1">Address line 1</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-address-2"
      name="address_2"
      value={shipping.address_2}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-address-2">Address line 2</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-city"
      name="city"
      value={shipping.city}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-city">City</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-state"
      name="state"
      value={shipping.state}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-state">County / State</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-postcode"
      name="postcode"
      value={shipping.postcode}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-postcode">Postcode</label>
  </div>

  <div className="account-auth-field account-floating-field">
    <input
      id="shipping-country"
      name="country"
      value={shipping.country}
      onChange={handleShippingChange}
      placeholder=" "
    />
    <label htmlFor="shipping-country">Country</label>
  </div>
</div>
            </div>

            {error ? <p className="account-auth-error">{error}</p> : null}
            {success ? <p className="account-auth-success">{success}</p> : null}

            <button className="account-auth-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save addresses'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountAddresses;