import React, { useEffect, useState } from 'react';
import { getOrders } from './api/account';
import { Link } from 'react-router-dom';
import AccountTabs from './AccountTabs';

function formatOrderDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getStatusClass(status) {
  return String(status || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

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
          <h1 className="account-page-title account-section-title">Orders</h1>
          <p className="account-page-subtitle">View your order history and manage returns.</p>

          {loading ? (
  <div className="account-skeleton-panel" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div className="account-skeleton-order-row" key={index}>
        <div className="account-skeleton"></div>
        <div className="account-skeleton"></div>
        <div className="account-skeleton"></div>
        <div className="account-skeleton"></div>
        <div className="account-skeleton"></div>
        <div className="account-skeleton"></div>
      </div>
    ))}
  </div>
) : null}
          {error ? <p className="account-auth-error">{error}</p> : null}

          {!loading && !error && orders.length === 0 ? (
            <div className="account-empty-panel">
              <p>You haven’t placed any orders yet.</p>
              <Link to="/" className="account-empty-link">Start shopping</Link>
            </div>
          ) : null}

          {!loading && !error && orders.length > 0 ? (
            <div className="account-orders-panel">
              <div className="account-orders-header">
                <span>Order</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
                <span>Items</span>
                <span></span>
              </div>

              <div className="account-orders-list">
                {orders.map((order) => (
                  <div className="account-order-row" key={order.id}>
                    <div className="account-order-cell account-order-main">
                      <span className="account-order-mobile-label">Order</span>
                      <strong>#{order.number}</strong>
                    </div>

                    <div className="account-order-cell">
                      <span className="account-order-mobile-label">Date</span>
                      <span>{formatOrderDate(order.date_created)}</span>
                    </div>

                    <div className="account-order-cell">
                      <span className="account-order-mobile-label">Status</span>
                      <span className={`account-status-pill account-status-${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="account-order-cell">
                      <span className="account-order-mobile-label">Total</span>
                      <span>{order.total_display}</span>
                    </div>

                    <div className="account-order-cell">
                      <span className="account-order-mobile-label">Items</span>
                      <span>{order.item_count}</span>
                    </div>

                    <div className="account-order-actions">
                      <Link to={`/account/orders/${order.id}`} className="account-order-link">
                        View order
                      </Link>

                      {order.return_eligible ? (
                        <Link to={`/account/orders/${order.id}?return=1`} className="account-order-link">
                          Create return
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AccountOrders;