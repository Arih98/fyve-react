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

function getDisplayValue(value) {
  return String(value || '').trim() || 'Not added yet';
}

function getFullName(value) {
  const fullName = [value.first_name, value.last_name].filter(Boolean).join(' ');
  return getDisplayValue(fullName);
}

function getStateName(value) {
  const input = String(value || '').trim();

  const match = US_STATES.find((state) => (
    state.code.toLowerCase() === input.toLowerCase() ||
    state.name.toLowerCase() === input.toLowerCase()
  ));

  return match?.name || input;
}

function SavedRow({ label, children }) {
  return (
    <div className="account-saved-row">
      <span className="account-saved-label">{label}</span>
      <div className="account-saved-value">{children}</div>
    </div>
  );
}

function SectionHeader({ title, editingTitle, isEditing, onEdit }) {
  return (
    <div className="account-profile-card-header">
      <h2>{isEditing ? editingTitle : title}</h2>

      <button
        type="button"
        className="account-edit-icon-button"
        onClick={onEdit}
        aria-label={isEditing ? `Close ${title}` : `Edit ${title}`}
      >
        <img src={isEditing ? '/assets/Close.svg' : '/assets/edit-pencil-icon.svg'} alt="" />
      </button>
    </div>
  );
}

function DetailsSummary({ details }) {
  return (
    <div className="account-saved-summary">
      <SavedRow label="Name">{getFullName(details)}</SavedRow>
      <SavedRow label="Email">{getDisplayValue(details.email)}</SavedRow>
    </div>
  );
}

function AddressSummary({ address, showContact = false }) {
  const cityLine = [address.city, getStateName(address.state), address.postcode].filter(Boolean).join(', ');
  const addressLines = [address.address_1, address.address_2, cityLine, 'United States (US)'].filter(Boolean);

  return (
    <div className="account-saved-summary">
      <SavedRow label="Name">{getFullName(address)}</SavedRow>

      <SavedRow label="Address">
        {addressLines.length ? (
          <div className="account-saved-address">
            {addressLines.map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </div>
        ) : (
          'Not added yet'
        )}
      </SavedRow>

      {showContact ? (
        <>
          <SavedRow label="Email">{getDisplayValue(address.email)}</SavedRow>
          <SavedRow label="Phone">{getDisplayValue(address.phone)}</SavedRow>
        </>
      ) : null}
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
  const [savingSection, setSavingSection] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSection, setEditingSection] = useState(null);
useEffect(() => {
  if (!success) return;

  const timer = window.setTimeout(() => {
    setSuccess('');
  }, 3000);

  return () => window.clearTimeout(timer);
}, [success]);
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

  const handleSaveDetails = async () => {
  setError('');
  setSuccess('');
  setSavingSection('details');

  try {
    const data = await updateAccountDetails({
      first_name: details.first_name,
      last_name: details.last_name,
      email: details.email
    });

    setDetails({
      first_name: data.details?.first_name || '',
      last_name: data.details?.last_name || '',
      email: data.details?.email || ''
    });

    await refreshUser();

    setSuccess('Personal details updated successfully.');
    setEditingSection(null);
  } catch (err) {
    setError(err.message || 'Failed to update personal details');
  } finally {
    setSavingSection(null);
  }
};

const handleSaveBilling = async () => {
  setError('');
  setSuccess('');
  setSavingSection('billing');

  try {
    const nextBilling = { ...billing, country: 'US' };
    const nextShipping = { ...shipping, country: 'US' };

    const data = await updateAddresses({
      billing: nextBilling,
      shipping: nextShipping
    });

    setBilling({ ...emptyBilling, ...(data.billing || {}), country: 'US' });
    setShipping({ ...emptyShipping, ...(data.shipping || {}), country: 'US' });

    setSuccess('Billing address updated successfully.');
    setEditingSection(null);
  } catch (err) {
    setError(err.message || 'Failed to update billing address');
  } finally {
    setSavingSection(null);
  }
};

const handleSaveShipping = async () => {
  setError('');
  setSuccess('');
  setSavingSection('shipping');

  try {
    const nextBilling = { ...billing, country: 'US' };
    const nextShipping = { ...shipping, country: 'US' };

    const data = await updateAddresses({
      billing: nextBilling,
      shipping: nextShipping
    });

    setBilling({ ...emptyBilling, ...(data.billing || {}), country: 'US' });
    setShipping({ ...emptyShipping, ...(data.shipping || {}), country: 'US' });

    setSuccess('Shipping address updated successfully.');
    setEditingSection(null);
  } catch (err) {
    setError(err.message || 'Failed to update shipping address');
  } finally {
    setSavingSection(null);
  }
};

  if (loading) {
  return (
    <div className="account-section-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-section-inner">
          <div className="account-skeleton account-skeleton-title account-skeleton-profile-title"></div>

          <div className="account-addresses-form">
            <div className="account-address-grid">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div
                  className={`account-profile-skeleton-card${cardIndex === 0 ? ' account-details-card' : ''}`}
                  key={cardIndex}
                >
                  <div className="account-profile-skeleton-header">
                    <div className="account-skeleton account-skeleton-profile-card-title"></div>
                    <div className="account-skeleton account-skeleton-edit-icon"></div>
                  </div>

                  <div className="account-skeleton-summary">
                    {Array.from({ length: cardIndex === 0 ? 2 : cardIndex === 1 ? 4 : 2 }).map((__, rowIndex) => (
                      <div className="account-skeleton-summary-row" key={rowIndex}>
                        <div className="account-skeleton account-skeleton-summary-label"></div>
                        <div className="account-skeleton account-skeleton-summary-value"></div>
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
        <h1 className="account-page-title account-section-title">Your profile</h1>

        <div className="account-addresses-form">
          <div className="account-address-grid">
            <div className="account-card account-address-card account-details-card">
              <SectionHeader
                title="Personal details"
                editingTitle="Edit your details"
                isEditing={editingSection === 'details'}
                onEdit={() => setEditingSection(editingSection === 'details' ? null : 'details')}
              />

              {editingSection === 'details' ? (
                <>
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

                  <div className="account-profile-card-actions">
                    <button
                      className="account-auth-button account-profile-save-button"
                      type="button"
                      onClick={handleSaveDetails}
                      disabled={Boolean(savingSection)}
                    >
                      {savingSection === 'details' ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </>
              ) : (
                <DetailsSummary details={details} />
              )}
            </div>

            <div className="account-card account-address-card">
              <SectionHeader
                title="Billing address"
                editingTitle="Edit address"
                isEditing={editingSection === 'billing'}
                onEdit={() => setEditingSection(editingSection === 'billing' ? null : 'billing')}
              />

              {editingSection === 'billing' ? (
                <>
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

                  <div className="account-profile-card-actions">
                    <button
                      className="account-auth-button account-profile-save-button"
                      type="button"
                      onClick={handleSaveBilling}
                      disabled={Boolean(savingSection)}
                    >
                      {savingSection === 'billing' ? 'Saving...' : 'Save address'}
                    </button>
                  </div>
                </>
              ) : (
                <AddressSummary address={billing} showContact />
              )}
            </div>

            <div className="account-card account-address-card">
              <SectionHeader
                title="Shipping address"
                editingTitle="Edit address"
                isEditing={editingSection === 'shipping'}
                onEdit={() => setEditingSection(editingSection === 'shipping' ? null : 'shipping')}
              />

              {editingSection === 'shipping' ? (
                <>
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

                  <div className="account-profile-card-actions">
                    <button
                      className="account-auth-button account-profile-save-button"
                      type="button"
                      onClick={handleSaveShipping}
                      disabled={Boolean(savingSection)}
                    >
                      {savingSection === 'shipping' ? 'Saving...' : 'Save address'}
                    </button>
                  </div>
                </>
              ) : (
                <AddressSummary address={shipping} />
              )}
            </div>
          </div>

          {error ? <p className="account-auth-error">{error}</p> : null}
          {success ? (
  <div className="account-success-popup" role="status" aria-live="polite">
    {success}
  </div>
) : null}
        </div>
      </div>
    </div>
  </div>
);
};

export default AccountAddresses;