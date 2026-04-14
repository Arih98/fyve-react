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

  const refreshCart = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }

    try {
      const data = await getStoreCart()
      setCart(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to load cart')
      throw err
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    refreshCart().catch(() => {})
  }, [refreshCart])

const addItem = useCallback(async (payload) => {
  setLoading(true)
  setError('')

  try {
    const item = await addStoreCartItem(payload)

    setCart((prev) => {
      if (!prev) return prev

      const existingItems = Array.isArray(prev.items) ? prev.items : []
      const existingIndex = existingItems.findIndex((existing) => existing.key === item.key)

      let nextItems

      if (existingIndex !== -1) {
        nextItems = [...existingItems]
        nextItems[existingIndex] = item
      } else {
        nextItems = [...existingItems, item]
      }

      const addedQuantity = Number(item.quantity || 0)
      const previousQuantity =
        existingIndex !== -1 ? Number(existingItems[existingIndex]?.quantity || 0) : 0
      const quantityDelta = Math.max(0, addedQuantity - previousQuantity)

      return {
        ...prev,
        items: nextItems,
        items_count: Number(prev.items_count || 0) + quantityDelta
      }
    })

    refreshCart({ silent: true }).catch(() => {})

    return item
  } catch (err) {
    setError(err.message || 'Failed to add item')
    await refreshCart({ silent: true }).catch(() => {})
    throw err
  } finally {
    setLoading(false)
  }
}, [refreshCart])

  const updateItemQuantity = useCallback(async (key, quantity) => {
    setLoading(true)
    setError('')

    setCart((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        items: prev.items.map((item) =>
          item.key === key ? { ...item, quantity } : item
        )
      }
    })

    try {
      await updateStoreCartItem(key, quantity)
      await refreshCart({ silent: true })
    } catch (err) {
      setError(err.message || 'Failed to update quantity')
      await refreshCart({ silent: true })
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshCart])

  const removeItem = useCallback(async (key) => {
    setLoading(true)
    setError('')

    setCart((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        items: prev.items.filter((item) => item.key !== key)
      }
    })

    try {
      await removeStoreCartItem(key)
      await refreshCart({ silent: true })
    } catch (err) {
      setError(err.message || 'Failed to remove item')
      await refreshCart({ silent: true })
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