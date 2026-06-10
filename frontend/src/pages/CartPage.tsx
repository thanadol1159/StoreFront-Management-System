import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderApi } from '../api/services'
import CartItemRow from '../components/cart/CartItemRow'
 
export default function CartPage() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
 
  const handleCheckout = async () => {
    setCheckingOut(true)
    setError('')
    try {
      const order = await orderApi.checkout()
      await clearCart()
      navigate(`/orders/${order.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }
 
  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-cart">
        <h1 className="page-title">Your Cart</h1>
        <div className="empty-state">
          <span className="empty-icon">⊡</span>
          <p>Your cart is empty.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Browse products</button>
        </div>
      </div>
    )
  }
 
  return (
    <div className="page-cart">
      <h1 className="page-title">Your Cart</h1>
 
      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>
 
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
 
        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>
 
          <div className="summary-rows">
            {cart.items.map((item) => (
              <div key={item.id} className="summary-row">
                <span className="summary-item-name">{item.product.title} × {item.quantity}</span>
                <span>฿{Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>
 
          <div className="summary-total">
            <span>Total</span>
            <span className="total-amount">฿{Number(cart.total).toLocaleString()}</span>
          </div>
 
          {error && <p className="error-msg">{error}</p>}
 
          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? 'Processing...' : 'Checkout'}
          </button>
 
          <button className="btn-ghost" onClick={() => navigate('/')}>
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  )
}
