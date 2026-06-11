import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import type { Product } from '../types'
 
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'
 
export default function SellerDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
 
  const fetchProducts = () => {
    productApi.myProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }
 
  useEffect(() => {
    fetchProducts()
  }, [])
 
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    setDeletingId(id)
    try {
      await productApi.remove(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } finally {
      setDeletingId(null)
    }
  }
 
  return (
    <div className="page-seller">
      <div className="seller-header">
        <div>
          <h1 className="page-title">My Products</h1>
          <p className="seller-sub">Welcome back, <strong>{user?.username}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/seller/products/new')}>
          + New Product
        </button>
      </div>
 
      {loading ? (
        <div className="loading-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="product-card-skeleton" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◧</span>
          <p>You haven't listed any products yet.</p>
          <button className="btn-primary" onClick={() => navigate('/seller/products/new')}>
            Create your first listing
          </button>
        </div>
      ) : (
        <div className="seller-product-list">
          <div className="seller-list-header">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
 
          {products.map((p) => {
            const imageUrl = p.image ? `${API_URL}${p.image}` : null
            return (
              <div key={p.id} className="seller-product-row">
                <div className="seller-product-info">
                  <div className="seller-product-thumb">
                    {imageUrl
                      ? <img src={imageUrl} alt={p.title} />
                      : <div className="thumb-placeholder">No img</div>
                    }
                  </div>
                  <div className="seller-product-meta">
                    <span className="seller-product-title">{p.title}</span>
                    <span className="seller-product-desc">{p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}</span>
                  </div>
                </div>
 
                <span className="seller-product-price">
                  ฿{Number(p.unit_price).toLocaleString()}
                </span>
 
                <span className={`seller-stock ${p.in_stock ? 'in-stock' : 'no-stock'}`}>
                  {p.quantity} units
                </span>
 
                <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                  {p.is_active ? 'Active' : 'Hidden'}
                </span>
 
                <div className="seller-actions">
                  <button
                    className="btn-ghost small"
                    onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger small"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}