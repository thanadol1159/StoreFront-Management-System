import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { cartApi } from '../../api/services'
import type { CartItem } from '../../types'
import { useState } from 'react'
 
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'
 
interface Props {
  item: CartItem
}
 
export default function CartItemRow({ item }: Props) {
  const { fetchCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const imageUrl = item.product.image ? `${API_URL}${item.product.image}` : null
 
  const handleQuantityChange = async (delta: number) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return
    if (newQty > item.product.quantity) return
    setLoading(true)
    try {
      // Remove then re-add with new quantity (API doesn't have update endpoint)
      await cartApi.removeItem(item.product.id)
      await cartApi.addItem(item.product.id, newQty)
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }
 
  const handleRemove = async () => {
    setLoading(true)
    try {
      await cartApi.removeItem(item.product.id)
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className={`cart-item-row ${loading ? 'loading' : ''}`}>
      <div
        className="cart-item-image"
        onClick={() => navigate(`/products/${item.product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={item.product.title} />
        ) : (
          <div className="cart-item-no-image">No img</div>
        )}
      </div>
 
      <div className="cart-item-info">
        <span
          className="cart-item-title"
          onClick={() => navigate(`/products/${item.product.id}`)}
        >
          {item.product.title}
        </span>
        <span className="cart-item-unit-price">฿{Number(item.product.unit_price).toLocaleString()} each</span>
      </div>
 
      <div className="cart-item-qty">
        <button
          className="qty-btn"
          onClick={() => handleQuantityChange(-1)}
          disabled={loading || item.quantity <= 1}
        >−</button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => handleQuantityChange(1)}
          disabled={loading || item.quantity >= item.product.quantity}
        >+</button>
      </div>
 
      <div className="cart-item-subtotal">
        ฿{Number(item.subtotal).toLocaleString()}
      </div>
 
      <button className="cart-item-remove" onClick={handleRemove} disabled={loading}>
        ✕
      </button>
    </div>
  )
}