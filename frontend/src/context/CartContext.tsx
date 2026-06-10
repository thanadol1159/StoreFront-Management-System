import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react'
import { cartApi } from '../api/services'
import { useAuth } from './AuthContext'
import type { Cart } from '../types'
 
interface CartContextValue {
  cart: Cart | null
  cartCount: number
  fetchCart: () => Promise<void>
  addItem: (product_id: number, quantity: number) => Promise<void>
  removeItem: (product_id: number) => Promise<void>
  clearCart: () => Promise<void>
}
 
const CartContext = createContext<CartContextValue | null>(null)
 
export function CartProvider({ children }: { children: ReactNode }) {
  const { isBuyer } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
 
  const fetchCart = useCallback(async () => {
    if (!isBuyer) return
    try {
      const data = await cartApi.get()
      // Backend returns list; get first item
      const cartData = Array.isArray(data) ? data[0] : data
      setCart(cartData ?? null)
    } catch {
      setCart(null)
    }
  }, [isBuyer])
 
  useEffect(() => {
    fetchCart()
  }, [fetchCart])
 
  const addItem = async (product_id: number, quantity: number) => {
    await cartApi.addItem(product_id, quantity)
    await fetchCart()
  }
 
  const removeItem = async (product_id: number) => {
    await cartApi.removeItem(product_id)
    await fetchCart()
  }
 
  const clearCart = async () => {
    await cartApi.clear()
    await fetchCart()
  }
 
  const cartCount = cart?.items?.length ?? 0
 
  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
 
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}