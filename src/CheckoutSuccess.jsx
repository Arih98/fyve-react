import React, { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CartContext } from './CartContext'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const { refreshCart } = useContext(CartContext)

  useEffect(() => {
    if (!orderId) {
      setError('Missing order id')
      setLoading(false)
      return
    }

    let cancelled = false
    let attempts = 0
    let timeoutId

    const pollOrder = async () => {
      try {
        const response = await fetch(`https://fyvelondon.com/wp-json/fyve-checkout/v1/confirm-revolut-payment/${orderId}`, {
          method: 'POST',
          credentials: 'include'
        })

        const raw = await response.text()

let result = null

try {
  result = raw ? JSON.parse(raw) : null
} catch (e) {
  throw new Error(raw || `Request failed with status ${response.status}`)
}

if (!response.ok) {
  throw new Error(result?.message || `Request failed with status ${response.status}`)
}

        if (cancelled) return

        if (!response.ok) {
          throw new Error(result?.message || 'Failed to confirm order')
        }

        const nextOrder = result.order || null
        setOrder(nextOrder)

        if (nextOrder?.is_paid || nextOrder?.status === 'processing' || nextOrder?.status === 'completed') {
          await refreshCart({ silent: true }).catch(() => {})
          setLoading(false)
          return
        }

        attempts += 1

        if (attempts >= 12) {
          setLoading(false)
          return
        }

        timeoutId = setTimeout(pollOrder, 2500)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to confirm order')
        setLoading(false)
      }
    }

    pollOrder()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [orderId, refreshCart])

  if (loading) {
    return (
      <div className="checkout-success-page">
        <h1>Confirming your payment...</h1>
        <p>Please stay on this page for a moment.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="checkout-success-page">
        <h1>We could not confirm your order</h1>
        <p>{error}</p>
        <Link to="/checkout">Return to checkout</Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="checkout-success-page">
        <h1>We could not find your order</h1>
        <Link to="/checkout">Return to checkout</Link>
      </div>
    )
  }

  if (order.is_paid || order.status === 'processing' || order.status === 'completed') {
    return (
      <div className="checkout-success-page">
        <h1>Thank you for your order</h1>
        <p>Order #{order.number}</p>
        <p>Status: {order.status_label}</p>
        <p>Total: {order.total} {order.currency}</p>
        <a href={order.received_url}>View order confirmation</a>
      </div>
    )
  }

  return (
    <div className="checkout-success-page">
      <h1>Your payment is still being confirmed</h1>
      <p>Order #{order.number}</p>
      <p>Status: {order.status_label}</p>
      <p>If this does not update shortly, check your account orders page.</p>
      <Link to="/account/orders">Go to my orders</Link>
    </div>
  )
}