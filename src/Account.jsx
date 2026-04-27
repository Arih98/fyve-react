import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  if (authLoading || loggingOut || !user) {
    return <div className="route-loading-space"></div>;
  }

  return (
    <div className="account-page">
      <div className="account-page-inner">
        <div className="account-page-header">
          <div>
            <p className="account-page-eyebrow">My Account</p>
            <h1 className="account-page-title">
              Welcome, {user.first_name || user.username || 'User'}
            </h1>
            <p className="account-page-subtitle">
              Manage your account details, orders and saved addresses.
            </p>
          </div>

          <button className="account-logout-button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <div className="account-grid">
          <div className="account-card">
            <h2>Account details</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>First name:</strong> {user.first_name || '-'}</p>
            <p><strong>Last name:</strong> {user.last_name || '-'}</p>
            <p><strong>Username:</strong> {user.username}</p>
          </div>

          <div className="account-card">
            <h2>Orders</h2>
            <p>View your order history and track recent purchases.</p>
            <Link to="/account/orders" className="account-card-link">View orders</Link>
          </div>

          <div className="account-card">
            <h2>Addresses</h2>
            <p>Manage your billing and shipping addresses.</p>
            <Link to="/account/addresses" className="account-card-link">Manage addresses</Link>
          </div>

          <div className="account-card">
            <h2>Account settings</h2>
            <p>Update your personal details and password.</p>
            <Link to="/account/details" className="account-card-link">Edit details</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;