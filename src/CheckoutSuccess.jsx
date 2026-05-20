import React, { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CartContext } from './CartContext'
import { clearCheckoutCart } from './api/checkout'
import { clearStoredCartToken } from './api/request'
import { useAuth } from './context/AuthContext'
import './CheckoutSuccess.css'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [loading, setLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const { refreshCart, clearCartState } = useContext(CartContext)
  const { user } = useAuth()

  useEffect(() => {
    if (!orderId) {
      setError('Missing order id')
      setLoading(false)
      return
    }

    let cancelled = false

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const clearFrontendCart = async () => {
      await clearCheckoutCart().catch(() => {})
      clearStoredCartToken()
      clearCartState()
      localStorage.removeItem('fyveCartProductLinks')
      await refreshCart({ silent: true }).catch(() => {})
    }

    const loadOrderStatus = async () => {
      try {
        setLoading(true)
        setIsConfirming(false)
        setError('')

        const firstResponse = await fetch(`https://fyvelondon.com/wp-json/fyve-checkout/v1/order-status/${orderId}`, {
          method: 'GET',
          credentials: 'include'
        })

        const firstRaw = await firstResponse.text()

        let firstResult = null

        try {
          firstResult = firstRaw ? JSON.parse(firstRaw) : null
        } catch (e) {
          throw new Error(firstRaw || `Request failed with status ${firstResponse.status}`)
        }

        if (!firstResponse.ok) {
          throw new Error(firstResult?.message || `Request failed with status ${firstResponse.status}`)
        }

        if (cancelled) return

        const firstOrder = firstResult?.order || null
        const firstPaid = Boolean(firstOrder?.is_paid)
        const firstStatus = String(firstOrder?.status || '').toLowerCase()

        setOrder(firstOrder)

        if (firstPaid || firstStatus === 'processing' || firstStatus === 'completed') {
          await clearFrontendCart()
          if (cancelled) return
          setLoading(false)
          return
        }

        setIsConfirming(true)

        for (let attempt = 0; attempt < 4; attempt += 1) {
          await sleep(2000)

          const response = await fetch(`https://fyvelondon.com/wp-json/fyve-checkout/v1/order-status/${orderId}`, {
            method: 'GET',
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
          const paid = Boolean(nextOrder?.is_paid)
          const status = String(nextOrder?.status || '').toLowerCase()

          setOrder(nextOrder)

          if (paid || status === 'processing' || status === 'completed') {
            await clearFrontendCart()
            if (cancelled) return
            setLoading(false)
            setIsConfirming(false)
            return
          }
        }

        const confirmResponse = await fetch(`https://fyvelondon.com/wp-json/fyve-checkout/v1/confirm-revolut-payment/${orderId}`, {
          method: 'POST',
          credentials: 'include'
        })

        const confirmRaw = await confirmResponse.text()

        let confirmResult = null

        try {
          confirmResult = confirmRaw ? JSON.parse(confirmRaw) : null
        } catch (e) {
          throw new Error(confirmRaw || `Request failed with status ${confirmResponse.status}`)
        }

        if (!confirmResponse.ok) {
          throw new Error(confirmResult?.message || `Request failed with status ${confirmResponse.status}`)
        }

        if (cancelled) return

        const nextOrder = confirmResult?.order || null
        const confirmed = Boolean(confirmResult?.confirmed || nextOrder?.is_paid)
        const status = String(nextOrder?.status || '').toLowerCase()

        setOrder(nextOrder)

        if (confirmed || status === 'processing' || status === 'completed') {
          await clearFrontendCart()
          if (cancelled) return
          setLoading(false)
          setIsConfirming(false)
          return
        }

        setError('Your payment is still being finalised. Please refresh this page in a moment.')
        setLoading(false)
        setIsConfirming(false)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load order status')
        setLoading(false)
        setIsConfirming(false)
      }
    }

    loadOrderStatus()

    return () => {
      cancelled = true
    }
  }, [orderId, refreshCart, clearCartState])

  const status = String(order?.status || '').toLowerCase()
  const statusLabel = order?.status_label || order?.status || 'Confirmed'
  const statusClass = ['processing', 'completed'].includes(status) ? 'is-success' : 'is-pending'
  const formattedTotal = order?.total && order?.currency ? `${order.total} ${order.currency}` : order?.total || '-'

  if (loading) {
    return (
      <div className="checkout-success-page">
        <div className="checkout-success-shell">
          <div className="checkout-success-card">
            <div className="checkout-success-loader"></div>

            <div className="checkout-success-copy">
              <p className="checkout-success-eyebrow">
                {isConfirming ? 'Payment confirmation' : 'Order confirmation'}
              </p>

              <h1>
                {isConfirming ? 'Confirming your payment' : 'Loading your order'}
              </h1>

              <p>
                {isConfirming
                  ? 'Please stay on this page while we finalise your order.'
                  : 'We are getting your order details ready.'}
              </p>
            </div>

            <div className="checkout-success-skeleton">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="checkout-success-page">
        <div className="checkout-success-shell">
          <div className="checkout-success-card checkout-success-card-error">
            <div className="checkout-success-error-icon" aria-hidden="true">
              !
            </div>

            <div className="checkout-success-copy">
              <p className="checkout-success-eyebrow">Order status</p>
              <h1>We could not confirm your order</h1>
              <p>{error}</p>
            </div>

            <div className="checkout-success-actions">
  {user ? (
    <Link
      className="checkout-success-button"
      to={`/account/orders/${encodeURIComponent(orderId)}`}
    >
      View order
    </Link>
  ) : (
    <Link className="checkout-success-button" to="/">
      Continue shopping
    </Link>
  )}

  {user ? (
    <Link className="checkout-success-link" to="/">
      Continue shopping
    </Link>
  ) : null}
</div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="checkout-success-page">
        <div className="checkout-success-shell">
          <div className="checkout-success-card checkout-success-card-error">
            <div className="checkout-success-error-icon" aria-hidden="true">
              !
            </div>

            <div className="checkout-success-copy">
              <p className="checkout-success-eyebrow">Order status</p>
              <h1>We could not find your order</h1>
              <p>Please return to checkout or continue shopping.</p>
            </div>

            <div className="checkout-success-actions">
              <Link className="checkout-success-button" to="/checkout">
                Return to checkout
              </Link>

              <Link className="checkout-success-link" to="/">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-success-page">
      <div className="checkout-success-shell">
        <div className="checkout-success-card">
          <div className="checkout-success-icon" aria-hidden="true">
            <span></span>
          </div>

          <div className="checkout-success-copy">
            <p className="checkout-success-eyebrow">Order confirmed</p>
            <h1>Thank you for your order</h1>
            <p>
              We have received your order and will send your confirmation details by email.
            </p>
          </div>

          <div className="checkout-success-summary">
            <div className="checkout-success-summary-row">
              <span>Order number</span>
              <strong>#{order.number}</strong>
            </div>

            <div className="checkout-success-summary-row">
              <span>Status</span>
              <strong className={`checkout-success-status ${statusClass}`}>
                {statusLabel}
              </strong>
            </div>

            <div className="checkout-success-summary-row">
              <span>Total</span>
              <strong>{formattedTotal}</strong>
            </div>
          </div>

          <div className="checkout-success-actions">
  {user ? (
    <Link
      className="checkout-success-button"
      to={`/account/orders/${encodeURIComponent(orderId)}`}
    >
      View order
    </Link>
  ) : (
    <Link className="checkout-success-button" to="/">
      Continue shopping
    </Link>
  )}

  {user ? (
    <Link className="checkout-success-link" to="/">
      Continue shopping
    </Link>
  ) : null}
</div>
        </div>
      </div>
    </div>
  )
}