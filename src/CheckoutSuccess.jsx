import React, { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CartContext } from './CartContext'
import { clearCheckoutCart } from './api/checkout'

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

    const confirmOrder = async () => {
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

        const nextOrder = result?.order || null
        const confirmed = Boolean(result?.confirmed || nextOrder?.is_paid)

        setOrder(nextOrder)

        if (!confirmed) {
          setError('Payment has not been confirmed yet')
          setLoading(false)
          return
        }

        await clearCheckoutCart().catch(() => {})
        await refreshCart({ silent: true }).catch(() => {})

        if (cancelled) return
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to confirm order')
        setLoading(false)
      }
    }

    confirmOrder()

    return () => {
      cancelled = true
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