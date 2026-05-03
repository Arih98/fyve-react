import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getOrderDetail } from './api/account';
import { lookupReturnOrder, createReturnRequest } from './api/returns';
import { useAuth } from './context/AuthContext';
import AccountTabs from './AccountTabs';

function getOrderItems(order) {
  return order?.items || order?.line_items || order?.order_items || [];
}

function getItemId(item) {
  return item.item_id || item.id || item.order_item_id;
}

function getItemName(item) {
  return item.name || item.product_name || item.title || 'Item';
}

function getItemQuantity(item) {
  return Number(item.quantity || item.qty || item.quantity_purchased || 0);
}

function getItemImage(item) {
  return item.image || item.image_src || item.thumbnail || item.product_image || '';
}

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

export default function AccountOrderDetail() {
  const { orderId } = useParams();
const [searchParams] = useSearchParams();
const returnSectionRef = useRef(null);
const shouldScrollToReturn = searchParams.get('return') === '1';
const { authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [returnOrder, setReturnOrder] = useState(null);
  const [returnToken, setReturnToken] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [returnChecking, setReturnChecking] = useState(true);
  const [returnCreating, setReturnCreating] = useState(false);
  const [returnError, setReturnError] = useState('');

  const displayItems = useMemo(() => getOrderItems(order), [order]);
  const returnItems = useMemo(() => getOrderItems(returnOrder || order), [returnOrder, order]);

  const selectedReturnItems = useMemo(() => {
    return returnItems
      .map((item) => {
        const itemId = getItemId(item);
        const quantity = Number(selectedItems[itemId] || 0);

        return {
          item_id: Number(itemId),
          quantity
        };
      })
      .filter((item) => item.item_id && item.quantity > 0);
  }, [returnItems, selectedItems]);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError('');

        const data = await getOrderDetail(orderId);

        if (active) {
          setOrder(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load order');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => {
  if (authLoading) return;
  if (!orderId) return;
  if (!order?.billing_address?.email) return;

  let active = true;

  async function checkReturnEligibility() {
    try {
      setReturnChecking(true);
      setReturnError('');

      const result = await lookupReturnOrder({
        orderId,
        email: order.billing_address.email
      });

      if (!active) return;

      setReturnOrder(result.order || null);
      setReturnToken(result.token || '');
    } catch (err) {
      if (!active) return;

      setReturnOrder(null);
      setReturnToken('');
      setReturnError(err.message || 'This order is not eligible for return');
    } finally {
      if (active) {
        setReturnChecking(false);
      }
    }
  }

  checkReturnEligibility();

  return () => {
    active = false;
  };
}, [authLoading, orderId, order?.billing_address?.email]);

useEffect(() => {
  if (!shouldScrollToReturn) return;
  if (authLoading || loading || returnChecking || !order) return;

  const frame = requestAnimationFrame(() => {
    const el = returnSectionRef.current;

    if (!el) return;

    const top = el.getBoundingClientRect().top + window.pageYOffset - 100;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  });

  return () => cancelAnimationFrame(frame);
}, [shouldScrollToReturn, authLoading, loading, returnChecking, order]);

  const handleQuantityChange = (itemId, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: Number(value)
    }));
  };

  const handleCreateReturn = async () => {
    if (!selectedReturnItems.length) {
      setReturnError('Please select at least one item to return');
      return;
    }

    try {
      setReturnCreating(true);
      setReturnError('');

      const result = await createReturnRequest({
        orderId,
        token: returnToken,
        returnItems: selectedReturnItems
      });

      const redirectUrl = result.checkout_url || result.redirect || result.url || '';

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setReturnError(result.message || 'Return started, but no payment link was returned');
    } catch (err) {
      setReturnError(err.message || 'Could not start return');
    } finally {
      setReturnCreating(false);
    }
  };

  if (authLoading || loading) {
  return (
    <div className="account-section-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-section-inner">
          <div className="account-skeleton account-skeleton-title"></div>
          <div className="account-skeleton account-skeleton-subtitle"></div>

          <div className="account-skeleton-detail-layout">
            <div className="account-skeleton-detail-main">
              <div className="account-skeleton-detail-panel">
                <div className="account-skeleton account-skeleton-card-title"></div>

                {Array.from({ length: 2 }).map((_, index) => (
                  <div className="account-skeleton-item" key={index}>
                    <div className="account-skeleton account-skeleton-image"></div>

                    <div className="account-skeleton-item-lines">
                      <div className="account-skeleton account-skeleton-line-lg"></div>
                      <div className="account-skeleton account-skeleton-line-md"></div>
                      <div className="account-skeleton account-skeleton-line-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="account-skeleton-detail-sidebar">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="account-skeleton-detail-panel" key={index}>
                  <div className="account-skeleton account-skeleton-card-title"></div>
                  <div className="account-skeleton account-skeleton-line-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (error) {
    return (
      <div className="account-section-page">
        <div className="account-shell">
          <AccountTabs />

          <div className="account-section-inner">
            <p className="account-auth-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="account-section-page">
        <div className="account-shell">
          <AccountTabs />

          <div className="account-section-inner">
            <p className="account-page-subtitle">Order not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const canReturnOrder = !returnChecking && Boolean(returnToken) && returnOrder?.eligible === true && !returnOrder?.done;

  return (
    <div className="account-section-page">
      <div className="account-shell">
        <AccountTabs />

        <div className="account-section-inner">
          <Link to="/account/orders" className="account-order-back-link">
            Back to orders
          </Link>

          <div className="account-order-detail-heading">
            <div>
              <h1 className="account-page-title account-section-title">Order #{order.number}</h1>

              <div className="account-order-detail-meta">
                <span>{formatOrderDate(order.date_created)}</span>
                <span className={`account-status-pill account-status-${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="account-order-detail-layout">
            <div className="account-order-detail-main">
              <section className="account-order-detail-panel">
                <div className="account-order-detail-panel-header">
                  <h2>Items</h2>
                  <span>{displayItems.length} item{displayItems.length === 1 ? '' : 's'}</span>
                </div>

                <div className="account-order-detail-items">
                  {displayItems.map((item) => (
                    <div key={getItemId(item)} className="account-order-detail-item">
                      {getItemImage(item) ? (
                        <img src={getItemImage(item)} alt={getItemName(item)} className="account-order-detail-item-image" />
                      ) : (
                        <div className="account-order-detail-item-image account-order-detail-item-image-empty"></div>
                      )}

                      <div className="account-order-detail-item-info">
                        <h3>{getItemName(item)}</h3>

                        {item.meta?.length > 0 ? (
                          <div className="account-order-detail-item-meta">
                            {item.meta.map((meta, index) => (
                              <span key={index}>
                                {meta.key}: {meta.value}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="account-order-detail-item-bottom">
                          <span>Quantity: {getItemQuantity(item)}</span>
                          <span>Total: <span dangerouslySetInnerHTML={{ __html: item.total }} /></span>
                        </div>

                        {item.permalink ? (
                          <a href={item.permalink} target="_blank" rel="noreferrer" className="account-order-detail-product-link">
                            View product
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section ref={returnSectionRef} id="return-this-order" className="account-order-detail-panel">
  <div className="account-order-detail-panel-header">
    <h2>Return this order</h2>
  </div>

                {returnChecking ? (
  <p className="account-page-subtitle">Checking return eligibility...</p>
) : null}

{!returnChecking && !canReturnOrder ? (
  <p className="account-page-subtitle">
    {returnError || 'This order is not eligible for return.'}
  </p>
) : null}

{canReturnOrder ? (
  <div className="account-return-box">
    <p className="account-page-subtitle">Select the items you wish to return.</p>

    {returnItems.map((item) => {
      const itemId = getItemId(item);
      const quantity = getItemQuantity(item);
      const image = getItemImage(item);

      return (
        <div className="returns-item" key={itemId}>
          <div className="returns-item-main">
            {image ? (
              <img src={image} alt={getItemName(item)} className="returns-item-image" />
            ) : (
              <div className="returns-item-image returns-item-image-empty"></div>
            )}

            <div className="returns-item-info">
              <div className="returns-item-name">{getItemName(item)}</div>
              <div className="returns-item-meta">Purchased quantity: {quantity}</div>
            </div>
          </div>

          <select
            value={selectedItems[itemId] || 0}
            onChange={(e) => handleQuantityChange(itemId, e.target.value)}
          >
            {Array.from({ length: quantity + 1 }, (_, index) => (
              <option key={index} value={index}>
                {index}
              </option>
            ))}
          </select>
        </div>
      );
    })}

    {returnError ? <div className="returns-error">{returnError}</div> : null}

    <button
      type="button"
      className="returns-button"
      onClick={handleCreateReturn}
      disabled={returnCreating}
    >
      {returnCreating ? 'Starting return...' : 'Start return'}
    </button>
  </div>
) : null}
              </section>
            </div>

            <aside className="account-order-detail-sidebar">
              <section className="account-order-detail-panel">
                <div className="account-order-detail-panel-header">
                  <h2>Summary</h2>
                </div>

                <div className="account-order-summary-lines">
                  <div>
                    <span>Subtotal</span>
                    <strong dangerouslySetInnerHTML={{ __html: order.totals.subtotal }} />
                  </div>

                  <div>
                    <span>Shipping</span>
                    <strong dangerouslySetInnerHTML={{ __html: order.totals.shipping }} />
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong dangerouslySetInnerHTML={{ __html: order.totals.discount }} />
                  </div>

                  <div className="account-order-summary-total">
                    <span>Total</span>
                    <strong dangerouslySetInnerHTML={{ __html: order.totals.total }} />
                  </div>
                </div>
              </section>

              <section className="account-order-detail-panel">
                <div className="account-order-detail-panel-header">
                  <h2>Billing address</h2>
                </div>

                <div className="account-order-address">
                  <span>{order.billing_address.first_name} {order.billing_address.last_name}</span>
                  <span>{order.billing_address.address_1}</span>
                  {order.billing_address.address_2 ? <span>{order.billing_address.address_2}</span> : null}
                  <span>{order.billing_address.city} {order.billing_address.postcode}</span>
                  <span>{order.billing_address.country}</span>
                  {order.billing_address.email ? <span>{order.billing_address.email}</span> : null}
                  {order.billing_address.phone ? <span>{order.billing_address.phone}</span> : null}
                </div>
              </section>

              <section className="account-order-detail-panel">
                <div className="account-order-detail-panel-header">
                  <h2>Shipping address</h2>
                </div>

                <div className="account-order-address">
                  <span>{order.shipping_address.first_name} {order.shipping_address.last_name}</span>
                  <span>{order.shipping_address.address_1}</span>
                  {order.shipping_address.address_2 ? <span>{order.shipping_address.address_2}</span> : null}
                  <span>{order.shipping_address.city} {order.shipping_address.postcode}</span>
                  <span>{order.shipping_address.country}</span>
                </div>
              </section>

              <section className="account-order-detail-panel">
                <div className="account-order-detail-panel-header">
                  <h2>Payment</h2>
                </div>

                <p className="account-order-payment-method">{order.payment_method || '—'}</p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}