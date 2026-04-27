import React, { useEffect, useState } from 'react';
import { getOrders } from './api/account';
import { Link } from 'react-router-dom';
import AccountTabs from './AccountTabs';

const AccountOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="account-section-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-section-inner">
          <h1 className="account-page-title">Orders</h1>

          {loading ? <p className="account-page-subtitle">Loading orders...</p> : null}
          {error ? <p className="account-auth-error">{error}</p> : null}

          {!loading && !error && orders.length === 0 ? (
            <div className="account-empty-panel">
              <p>You haven’t placed any orders yet.</p>
              <Link to="/" className="account-empty-link">Start shopping</Link>
            </div>
          ) : null}

          {!loading && !error && orders.length > 0 ? (
            <div className="account-grid">
              {orders.map((order) => (
                <div className="account-card" key={order.id}>
                  <h2>Order #{order.number}</h2>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Date:</strong> {order.date_created ? new Date(order.date_created).toLocaleDateString() : '-'}</p>
                  <p><strong>Total:</strong> {order.total_display}</p>
                  <p><strong>Items:</strong> {order.item_count}</p>

                  <div className="account-card-actions">
                    <Link to={`/account/orders/${order.id}`} className="account-card-link">
                      View order
                    </Link>

                    {order.return_eligible ? (
                      <Link to={`/account/orders/${order.id}?return=1`} className="account-card-link">
                        Create return
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AccountOrders;