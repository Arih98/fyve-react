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
          <p className="account-page-eyebrow">My Account</p>
          <h1 className="account-page-title">Addresses</h1>
          <p className="account-page-subtitle">Loading addresses...</p>
        </div>
      </div>
    );
  }

return (
  <div className="account-section-page">
    <div className="account-shell">
      <AccountTabs />

      <div className="account-section-inner">
        <p className="account-page-eyebrow">My Account</p>
        <h1 className="account-page-title">Addresses</h1>
        <p className="account-page-subtitle">Manage your billing and shipping information.</p>

        <form onSubmit={handleSubmit} className="account-addresses-form">
          <div className="account-address-grid">
            <div className="account-card">
              <h2>Billing address</h2>

              <div className="account-auth-field">
                <label>First name</label>
                <input name="first_name" value={billing.first_name} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Last name</label>
                <input name="last_name" value={billing.last_name} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Company</label>
                <input name="company" value={billing.company} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Address line 1</label>
                <input name="address_1" value={billing.address_1} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Address line 2</label>
                <input name="address_2" value={billing.address_2} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>City</label>
                <input name="city" value={billing.city} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>County / State</label>
                <input name="state" value={billing.state} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Postcode</label>
                <input name="postcode" value={billing.postcode} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Country</label>
                <input name="country" value={billing.country} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Email</label>
                <input name="email" type="email" value={billing.email} onChange={handleBillingChange} />
              </div>
              <div className="account-auth-field">
                <label>Phone</label>
                <input name="phone" value={billing.phone} onChange={handleBillingChange} />
              </div>
            </div>

            <div className="account-card">
              <h2>Shipping address</h2>

              <div className="account-auth-field">
                <label>First name</label>
                <input name="first_name" value={shipping.first_name} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>Last name</label>
                <input name="last_name" value={shipping.last_name} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>Company</label>
                <input name="company" value={shipping.company} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>Address line 1</label>
                <input name="address_1" value={shipping.address_1} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>Address line 2</label>
                <input name="address_2" value={shipping.address_2} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>City</label>
                <input name="city" value={shipping.city} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>County / State</label>
                <input name="state" value={shipping.state} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>Postcode</label>
                <input name="postcode" value={shipping.postcode} onChange={handleShippingChange} />
              </div>
              <div className="account-auth-field">
                <label>Country</label>
                <input name="country" value={shipping.country} onChange={handleShippingChange} />
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
    </div>
  );
};

export default AccountAddresses;