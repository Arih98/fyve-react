import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lookupReturnOrder, createReturnRequest } from '../api/returns'
import { useAuth } from '../context/AuthContext'
import './Returns.css'

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

export default function Returns() {
  const { user, authLoading } = useAuth()

  const [lookupForm, setLookupForm] = useState({
    orderId: '',
    email: ''
  })

  const [order, setOrder] = useState(null)
  const [token, setToken] = useState('')
  const [selectedItems, setSelectedItems] = useState({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const items = useMemo(() => getOrderItems(order), [order])

  const selectedReturnItems = useMemo(() => {
    return items
      .map((item) => {
        const itemId = getItemId(item)
        const quantity = Number(selectedItems[itemId] || 0)

        return {
          item_id: Number(itemId),
          quantity
        }
      })
      .filter((item) => item.item_id && item.quantity > 0)
  }, [items, selectedItems])

  if (authLoading) {
    return null
  }

  if (user) {
    return (
      <main className="returns-page">
        <section className="returns-card">
          <h1>Create a return from your account</h1>
          <p>You are signed in, so please choose the order you want to return from your account orders.</p>
          <Link to="/account/orders" className="returns-button">
            View your orders
          </Link>
        </section>
      </main>
    )
  }

  const handleLookupChange = (e) => {
    const { name, value } = e.target

    setLookupForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLookup = async (e) => {
    e.preventDefault()

    try {
      setLookupLoading(true)
      setError('')
      setMessage('')
      setOrder(null)
      setToken('')
      setSelectedItems({})

      const result = await lookupReturnOrder({
        orderId: lookupForm.orderId,
        email: lookupForm.email
      })

      setOrder(result.order || null)
      setToken(result.token || '')
    } catch (err) {
      setError(err?.message || 'Could not find that order')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleQuantityChange = (itemId, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: Number(value)
    }))
  }

  const handleCreateReturn = async () => {
    if (!selectedReturnItems.length) {
      setError('Please select at least one item to return')
      return
    }

    try {
      setCreateLoading(true)
      setError('')
      setMessage('')

      const result = await createReturnRequest({
        orderId: lookupForm.orderId,
        token,
        returnItems: selectedReturnItems
      })

      const redirectUrl = result.checkout_url || result.redirect || result.url || ''

      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      setMessage(result.message || 'Your return request has been started. Please check your email for the next step.')
    } catch (err) {
      setError(err?.message || 'Could not start the return')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <main className="returns-page">
      <section className="returns-card">
        <div className="returns-header">
          <h1>Returns</h1>
          <p>Enter your order details to start a return.</p>
        </div>

        {!order && (
          <form className="returns-form" onSubmit={handleLookup}>
            <div className="returns-field">
              <label htmlFor="returns-order-id">Order number</label>
              <input
                id="returns-order-id"
                name="orderId"
                type="text"
                value={lookupForm.orderId}
                onChange={handleLookupChange}
                required
              />
            </div>

            <div className="returns-field">
              <label htmlFor="returns-email">Email address</label>
              <input
                id="returns-email"
                name="email"
                type="email"
                value={lookupForm.email}
                onChange={handleLookupChange}
                required
              />
            </div>

            {error && <div className="returns-error">{error}</div>}

            <button className="returns-button" type="submit" disabled={lookupLoading}>
              {lookupLoading ? 'Finding order...' : 'Find order'}
            </button>
          </form>
        )}

        {order && (
          <div className="returns-items">
            <div className="returns-order-top">
              <div>
                <span className="returns-small-label">Order</span>
                <strong>#{order.id || order.order_id || lookupForm.orderId}</strong>
              </div>

              <button
                type="button"
                className="returns-text-button"
                onClick={() => {
                  setOrder(null)
                  setToken('')
                  setSelectedItems({})
                  setError('')
                  setMessage('')
                }}
              >
                Change order
              </button>
            </div>

            <h2>Select items to return</h2>

            {items.map((item) => {
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

            {error && <div className="returns-error">{error}</div>}
            {message && <div className="returns-message">{message}</div>}

            <button
              className="returns-button"
              type="button"
              onClick={handleCreateReturn}
              disabled={createLoading}
            >
              {createLoading ? 'Starting return...' : 'Start return'}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}