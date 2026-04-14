import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderDetail } from './api/account'

export default function AccountOrderDetail() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOrder() {
      try {
        setLoading(true)
        setError('')
        const data = await getOrderDetail(orderId)
        if (active) setOrder(data)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrder()

    return () => {
      active = false
    }
  }, [orderId])

  if (loading) {
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

          {order.items.map((item) => (
            <div key={item.item_id} className="account-order-item">
              {item.image ? (
                <img src={item.image} alt={item.name} className="account-order-item-image" />
              ) : null}

              <div className="account-order-item-info">
                <h3>{item.name}</h3>

                {item.meta?.length > 0 && (
                  <div className="account-order-item-meta">
                    {item.meta.map((meta, index) => (
                      <div key={index}>
                        {meta.key}: {meta.value}
                      </div>
                    ))}
                  </div>
                )}

                <div>Quantity: {item.quantity}</div>
                <div>Total: <span dangerouslySetInnerHTML={{ __html: item.total }} /></div>

                {item.permalink && (
                  <a href={item.permalink} target="_blank" rel="noreferrer">
                    View Product
                  </a>
                )}
              </div>
            </div>
          ))}
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