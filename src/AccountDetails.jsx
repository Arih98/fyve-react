import React, { useEffect, useState } from 'react';
import { getAccountDetails, updateAccountDetails } from './api/account';
import { useAuth } from './context/AuthContext';
import AccountTabs from './AccountTabs';

const AccountDetails = () => {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await getAccountDetails();
        setForm({
          first_name: data.details?.first_name || '',
          last_name: data.details?.last_name || '',
          email: data.details?.email || '',
          username: data.details?.username || ''
        });
      } catch (err) {
        setError(err.message || 'Failed to load account details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const data = await updateAccountDetails({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email
      });

      setForm((prev) => ({
        ...prev,
        first_name: data.details?.first_name || '',
        last_name: data.details?.last_name || '',
        email: data.details?.email || '',
        username: data.details?.username || prev.username
      }));

      await refreshUser();
      setSuccess('Account details updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update account details');
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

          <div className="account-skeleton-form">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="account-skeleton-field" key={index}>
                <div className="account-skeleton account-skeleton-label"></div>
                <div className="account-skeleton account-skeleton-input"></div>
              </div>
            ))}
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
          <h1 className="account-page-title">Account details</h1>
          <p className="account-page-subtitle">Update your name and email address.</p>

          <form onSubmit={handleSubmit} className="account-auth-form">
            <div className="account-auth-field">
              <label>First name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} />
            </div>

            <div className="account-auth-field">
              <label>Last name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} />
            </div>

            <div className="account-auth-field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="account-auth-field">
              <label>Username</label>
              <input name="username" value={form.username} disabled />
            </div>

            {error ? <p className="account-auth-error">{error}</p> : null}
            {success ? <p className="account-auth-success">{success}</p> : null}

            <button className="account-auth-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;