import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderDetail } from './api/account'
import { lookupReturnOrder, createReturnRequest } from './api/returns'
import { useAuth } from './context/AuthContext'

function getOrderItems(order) {
  return order?.items || order?.line_items || order?.order_items || []
}

function getItemId(item) {
  return item.item_id || item.id || item.order_item_id
}

function getItemName(item) {
  return item.name || item.product_name || item.title || 'Item'
}

function getItemQuantity(item) {
  return Number(item.quantity || item.qty || item.quantity_purchased || 0)
}

function getItemImage(item) {
  return item.image || item.image_src || item.thumbnail || item.product_image || ''
}

export default function AccountOrderDetail() {
  const { orderId } = useParams()
  const { user, authLoading } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [returnOrder, setReturnOrder] = useState(null)
  const [returnToken, setReturnToken] = useState('')
  const [selectedItems, setSelectedItems] = useState({})
  const [returnChecking, setReturnChecking] = useState(true)
  const [returnCreating, setReturnCreating] = useState(false)
  const [returnError, setReturnError] = useState('')

  const displayItems = useMemo(() => getOrderItems(order), [order])
  const returnItems = useMemo(() => getOrderItems(returnOrder || order), [returnOrder, order])

  const selectedReturnItems = useMemo(() => {
    return returnItems
      .map((item) => {
        const itemId = getItemId(item)
        const quantity = Number(selectedItems[itemId] || 0)

        return {
          item_id: Number(itemId),
          quantity
        }
      })
      .filter((item) => item.item_id && item.quantity > 0)
  }, [returnItems, selectedItems])

  useEffect(() => {
    let active = true

    async function loadOrder() {
      try {
        setLoading(true)
        setError('')

        const data = await getOrderDetail(orderId)

        if (active) {
          setOrder(data)
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load order')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      active = false
    }
  }, [orderId])

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) return
    if (!orderId) return

    let active = true

    async function checkReturnEligibility() {
      try {
        setReturnChecking(true)
        setReturnError('')

        const result = await lookupReturnOrder({
          orderId,
          email: user.email
        })

        if (!active) return

        setReturnOrder(result.order || null)
        setReturnToken(result.token || '')
      } catch (err) {
        if (!active) return

        setReturnOrder(null)
        setReturnToken('')
        setReturnError(err.message || 'This order is not eligible for return')
      } finally {
        if (active) {
          setReturnChecking(false)
        }
      }
    }

    checkReturnEligibility()

    return () => {
      active = false
    }
  }, [authLoading, user?.email, orderId])

  const handleQuantityChange = (itemId, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: Number(value)
    }))
  }

  const handleCreateReturn = async () => {
    if (!selectedReturnItems.length) {
      setReturnError('Please select at least one item to return')
      return
    }

    try {
      setReturnCreating(true)
      setReturnError('')

      const result = await createReturnRequest({
        orderId,
        token: returnToken,
        returnItems: selectedReturnItems
      })

      const redirectUrl = result.checkout_url || result.redirect || result.url || ''

      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      setReturnError(result.message || 'Return started, but no payment link was returned')
    } catch (err) {
      setReturnError(err.message || 'Could not start return')
    } finally {
      setReturnCreating(false)
    }
  }

  if (authLoading || loading) {
    return <div>Loading order...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!order) {
    return <div>Order not found.</div>
  }

  return (
    <div className="account-order-detail-page">
      <div className="account-order-detail-header">
        <Link to="/account/orders">Back to Orders</Link>
        <h1>Order #{order.number}</h1>
        <p>{order.status} • {order.date_created}</p>
      </div>

      <div className="account-order-detail-content">
        <div className="account-order-items">
          <h2>Items</h2>

          {displayItems.map((item) => (
            <div key={getItemId(item)} className="account-order-item">
              {getItemImage(item) ? (
                <img src={getItemImage(item)} alt={getItemName(item)} className="account-order-item-image" />
              ) : null}

              <div className="account-order-item-info">
                <h3>{getItemName(item)}</h3>

                {item.meta?.length > 0 && (
                  <div className="account-order-item-meta">
                    {item.meta.map((meta, index) => (
                      <div key={index}>
                        {meta.key}: {meta.value}
                      </div>
                    ))}
                  </div>
                )}

                <div>Quantity: {getItemQuantity(item)}</div>
                <div>Total: <span dangerouslySetInnerHTML={{ __html: item.total }} /></div>

                {item.permalink && (
                  <a href={item.permalink} target="_blank" rel="noreferrer">
                    View Product
                  </a>
                )}
              </div>
            </div>
          ))}

          <div className="account-return-section">
            <h2>Return this order</h2>

            {returnChecking && (
              <p>Checking return eligibility...</p>
            )}

            {!returnChecking && !returnToken && (
              <p>{returnError || 'This order is not eligible for return.'}</p>
            )}

            {!returnChecking && returnToken && (
              <div className="account-return-box">
                <p>Select the items you want to return.</p>

                {returnItems.map((item) => {
                  const itemId = getItemId(item)
                  const quantity = getItemQuantity(item)
                  const image = getItemImage(item)

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
                  )
                })}

                {returnError && <div className="returns-error">{returnError}</div>}

                <button
                  type="button"
                  className="returns-button"
                  onClick={handleCreateReturn}
                  disabled={returnCreating}
                >
                  {returnCreating ? 'Starting return...' : 'Start return'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="account-order-summary">
          <h2>Summary</h2>
          <div>Subtotal: <span dangerouslySetInnerHTML={{ __html: order.totals.subtotal }} /></div>
          <div>Shipping: <span dangerouslySetInnerHTML={{ __html: order.totals.shipping }} /></div>
          <div>Discount: <span dangerouslySetInnerHTML={{ __html: order.totals.discount }} /></div>
          <div>Total: <span dangerouslySetInnerHTML={{ __html: order.totals.total }} /></div>

          <h2>Billing Address</h2>
          <div>{order.billing_address.first_name} {order.billing_address.last_name}</div>
          <div>{order.billing_address.address_1}</div>
          {order.billing_address.address_2 ? <div>{order.billing_address.address_2}</div> : null}
          <div>{order.billing_address.city} {order.billing_address.postcode}</div>
          <div>{order.billing_address.country}</div>
          {order.billing_address.email ? <div>{order.billing_address.email}</div> : null}
          {order.billing_address.phone ? <div>{order.billing_address.phone}</div> : null}

          <h2>Shipping Address</h2>
          <div>{order.shipping_address.first_name} {order.shipping_address.last_name}</div>
          <div>{order.shipping_address.address_1}</div>
          {order.shipping_address.address_2 ? <div>{order.shipping_address.address_2}</div> : null}
          <div>{order.shipping_address.city} {order.shipping_address.postcode}</div>
          <div>{order.shipping_address.country}</div>

          <h2>Payment</h2>
          <div>{order.payment_method || '—'}</div>
        </div>
      </div>
    </div>
  )
}