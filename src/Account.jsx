import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AccountTabs from './AccountTabs';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="account-page">
        <div className="account-shell">
          <AccountTabs />

          <div className="account-page-inner">
            <div className="account-dashboard-panel">
              <div className="account-skeleton account-skeleton-dashboard-heading"></div>

              <div className="account-skeleton-overview-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="account-skeleton-overview-item" key={index}>
                    <div className="account-skeleton account-skeleton-overview-label"></div>
                    <div className="account-skeleton account-skeleton-overview-value"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="account-skeleton account-skeleton-section-logout"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="account-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-page-inner">
          <div className="account-dashboard-panel">
            <h2>Account overview</h2>

            <div className="account-overview-grid">
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>First name</span>
                <strong>{user.first_name || '-'}</strong>
              </div>

              <div>
                <span>Last name</span>
                <strong>{user.last_name || '-'}</strong>
              </div>

              <div>
                <span>Username</span>
                <strong>{user.username}</strong>
              </div>
            </div>
          </div>

          <button className="account-logout-button account-section-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;