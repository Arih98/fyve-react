import React, { useEffect, useState } from 'react';
import { getAddresses, updateAddresses, getAccountDetails, updateAccountDetails } from './api/account';
import { useAuth } from './context/AuthContext';
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
  country: 'US',
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
  country: 'US'
};

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

function FloatingField({ id, name, value, onChange, label, type = 'text', inputMode }) {
  return (
    <div className="account-auth-field account-floating-field">
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder=" "
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

function FloatingSelect({ id, name, value, onChange, label, options }) {
  return (
    <div className={`account-auth-field account-floating-field account-floating-select-field${value ? ' is-filled' : ''}`}>
      <select id={id} name={name} value={value} onChange={onChange}>
        <option value=""></option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

const AccountAddresses = () => {
  const { refreshUser } = useAuth();

const [details, setDetails] = useState({
  first_name: '',
  last_name: '',
  email: ''
});
  const [billing, setBilling] = useState(emptyBilling);
  const [shipping, setShipping] = useState(emptyShipping);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
const handleDetailsChange = (e) => {
  const { name, value } = e.target;
  setDetails((prev) => ({ ...prev, [name]: value }));
};
  useEffect(() => {
    const loadAddresses = async () => {
      try {
const [addressData, detailsData] = await Promise.all([
  getAddresses(),
  getAccountDetails()
]);

setBilling({ ...emptyBilling, ...(addressData.billing || {}), country: 'US' });
setShipping({ ...emptyShipping, ...(addressData.shipping || {}), country: 'US' });

setDetails({
  first_name: detailsData.details?.first_name || '',
  last_name: detailsData.details?.last_name || '',
  email: detailsData.details?.email || ''
});
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
const nextBilling = { ...billing, country: 'US' };
const nextShipping = { ...shipping, country: 'US' };

const [addressData, detailsData] = await Promise.all([
  updateAddresses({ billing: nextBilling, shipping: nextShipping }),
  updateAccountDetails({
    first_name: details.first_name,
    last_name: details.last_name,
    email: details.email
  })
]);

setBilling({ ...emptyBilling, ...(addressData.billing || {}), country: 'US' });
setShipping({ ...emptyShipping, ...(addressData.shipping || {}), country: 'US' });

setDetails({
  first_name: detailsData.details?.first_name || '',
  last_name: detailsData.details?.last_name || '',
  email: detailsData.details?.email || ''
});

await refreshUser();

setSuccess('Account details and addresses updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update account details and addresses');
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
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div className="account-skeleton-card" key={cardIndex}>
                  <div className="account-skeleton account-skeleton-card-title"></div>

                  <div className="account-skeleton-form">
                    {Array.from({ length: cardIndex === 0 ? 3 : cardIndex === 1 ? 9 : 7 }).map((__, fieldIndex) => (
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
          <h1 className="account-page-title">Your profile</h1>

          <form onSubmit={handleSubmit} className="account-addresses-form">
            <div className="account-address-grid">
  <div className="account-card account-address-card account-details-card">
    <h2>Personal details</h2>

    <div className="account-field-row">
      <FloatingField
        id="details-first-name"
        name="first_name"
        label="First name"
        value={details.first_name}
        onChange={handleDetailsChange}
      />

      <FloatingField
        id="details-last-name"
        name="last_name"
        label="Last name"
        value={details.last_name}
        onChange={handleDetailsChange}
      />
    </div>

    <FloatingField
      id="details-email"
      name="email"
      type="email"
      label="Email"
      value={details.email}
      onChange={handleDetailsChange}
    />
  </div>

  <div className="account-card account-address-card">
    <h2>Billing address</h2>

  <div className="account-field-row">
    <FloatingField id="billing-first-name" name="first_name" label="First name" value={billing.first_name} onChange={handleBillingChange} />
    <FloatingField id="billing-last-name" name="last_name" label="Last name" value={billing.last_name} onChange={handleBillingChange} />
  </div>

  <div className="account-address-static-field">United States (US)</div>

  <FloatingField id="billing-address-1" name="address_1" label="Address line 1" value={billing.address_1} onChange={handleBillingChange} />
  <FloatingField id="billing-address-2" name="address_2" label="Address line 2" value={billing.address_2} onChange={handleBillingChange} />

  <div className="account-field-row account-field-row-3">
    <FloatingField id="billing-city" name="city" label="City" value={billing.city} onChange={handleBillingChange} />
    <FloatingSelect id="billing-state" name="state" label="State" value={billing.state} onChange={handleBillingChange} options={US_STATES} />
    <FloatingField id="billing-postcode" name="postcode" label="ZIP code" value={billing.postcode} onChange={handleBillingChange} />
  </div>

  <div className="account-field-row">
    <FloatingField id="billing-email" name="email" type="email" label="Email" value={billing.email} onChange={handleBillingChange} />
    <FloatingField id="billing-phone" name="phone" type="tel" inputMode="tel" label="Phone" value={billing.phone} onChange={handleBillingChange} />
  </div>
</div>

<div className="account-card account-address-card">
  <h2>Shipping address</h2>

  <div className="account-field-row">
    <FloatingField id="shipping-first-name" name="first_name" label="First name" value={shipping.first_name} onChange={handleShippingChange} />
    <FloatingField id="shipping-last-name" name="last_name" label="Last name" value={shipping.last_name} onChange={handleShippingChange} />
  </div>

  <div className="account-address-static-field">United States (US)</div>

  <FloatingField id="shipping-address-1" name="address_1" label="Address line 1" value={shipping.address_1} onChange={handleShippingChange} />
  <FloatingField id="shipping-address-2" name="address_2" label="Address line 2" value={shipping.address_2} onChange={handleShippingChange} />

  <div className="account-field-row account-field-row-3">
    <FloatingField id="shipping-city" name="city" label="City" value={shipping.city} onChange={handleShippingChange} />
    <FloatingSelect id="shipping-state" name="state" label="State" value={shipping.state} onChange={handleShippingChange} options={US_STATES} />
    <FloatingField id="shipping-postcode" name="postcode" label="ZIP code" value={shipping.postcode} onChange={handleShippingChange} />
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