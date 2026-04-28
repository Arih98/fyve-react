import React from 'react';
import { useAuth } from './context/AuthContext';
import AccountTabs from './AccountTabs';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const Account = () => {
const { user, authLoading } = useAuth();

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

          <div className="account-skeleton account-skeleton-mobile-logout"></div>
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

        </div>
      </div>
    </div>
  );
};

export default Account;