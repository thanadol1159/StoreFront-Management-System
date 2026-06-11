import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../api/services'
import type { Order } from '../types'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'

export default function OrderHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/')
      return
    }

    const fetchOrders = async () => {
      try {
        const data = await orderApi.list()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, navigate])

  if (loading) return <div className="page-loading">Loading...</div>

  return (
    <div className="page-order-history">
      <div className="page-header">
        <h1>Order History</h1>
        <p>View your past orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.ordered_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="order-status">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item) => {
                  const imageUrl = item.product.image
                    ? item.product.image.startsWith('http')
                      ? item.product.image
                      : `${API_URL}${item.product.image}`
                    : null

                  return (
                    <div key={item.id} className="order-item">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={item.product.title}
                          className="order-item-image"
                        />
                      )}
                      <div className="order-item-details">
                        <h4>{item.product.title}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ${item.unit_price}</p>
                      </div>
                      <div className="order-item-subtotal">
                        <p>${item.subtotal}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">${order.total_amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
