import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderApi } from '../api/services'
import type { Order } from '../types'
 
export default function OrderConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    if (!id) return
    orderApi.detail(Number(id))
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])
 
  if (loading) return <div className="page-loading">Loading...</div>
  if (!order) return <div className="page-error">Order not found.</div>
 
  return (
    <div className="page-order-confirm">
      <div className="confirm-card">
        <div className="confirm-icon">✓</div>
        <h1>Order placed!</h1>
        <p className="confirm-sub">Order <strong>#{order.id}</strong> has been confirmed.</p>
 
        <div className="order-items-list">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="order-item-row"
              onClick={() => navigate(`/products/${item.product.id}`)}
            >
              <span className="order-item-title">{item.product.title}</span>
              <span className="order-item-qty">× {item.quantity}</span>
              <span className="order-item-price">฿{Number(item.subtotal).toLocaleString()}</span>
            </div>
          ))}
        </div>
 
        <div className="order-total">
          <span>Total paid</span>
          <span className="total-amount">฿{Number(order.total_amount).toLocaleString()}</span>
        </div>
 
        <button className="btn-primary" onClick={() => navigate('/')}>
          Continue shopping
        </button>
      </div>
    </div>
  )
}