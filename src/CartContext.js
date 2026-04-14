import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  addStoreCartItem,
  getStoreCart,
  removeStoreCartItem,
  updateStoreCartItem
} from './api/storeCart'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshCart = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStoreCart()
      setCart(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to load cart')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart().catch(() => {})
  }, [refreshCart])

  const addItem = useCallback(async (payload) => {
    setLoading(true)
    setError('')
    try {
      const data = await addStoreCartItem(payload)
      setCart(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to add item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateItemQuantity = useCallback(async (key, quantity) => {
    setLoading(true)
    setError('')
    try {
      const item = await updateStoreCartItem(key, quantity)
      setCart((prev) => {
        if (!prev) return prev

        const nextItems = (prev.items || []).map((existing) =>
          existing.key === key ? item : existing
        )

        return {
          ...prev,
          items: nextItems
        }
      })

      return item
    } catch (err) {
      setError(err.message || 'Failed to update quantity')
      throw err
    } finally {
      setLoading(false)
      refreshCart().catch(() => {})
    }
  }, [refreshCart])

  const removeItem = useCallback(async (key) => {
    setLoading(true)
    setError('')
    try {
      await removeStoreCartItem(key)
      await refreshCart()
    } catch (err) {
      setError(err.message || 'Failed to remove item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshCart])

  const value = useMemo(() => {
    const items = cart?.items || []
    const cartCount = cart?.items_count || items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const cartTotal = cart?.totals?.total_price || '0'

    return {
      cart,
      cartItems: items,
      cartCount,
      cartTotal,
      loading,
      error,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem
    }
  }, [cart, loading, error, refreshCart, addItem, updateItemQuantity, removeItem])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}