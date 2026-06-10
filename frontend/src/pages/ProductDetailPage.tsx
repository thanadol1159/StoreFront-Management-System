import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
 
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'
 
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, isBuyer, isSeller } = useAuth()
  const { addItem } = useCart()
 
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
 
  useEffect(() => {
    if (!id) return
    productApi.detail(Number(id))
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])
 
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!isBuyer) return
    if (!product) return
 
    setAdding(true)
    try {
      await addItem(product.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setAdding(false)
    }
  }
 
  if (loading) return <div className="page-loading">Loading...</div>
  if (!product) return <div className="page-error">Product not found.</div>
 
  const imageUrl = product.image ? `${API_URL}${product.image}` : null
 
  return (
    <div className="page-product-detail">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
 
      <div className="product-detail-layout">
        <div className="product-detail-image">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title} />
          ) : (
            <div className="detail-no-image">No image available</div>
          )}
        </div>
 
        <div className="product-detail-info">
          <span className="detail-seller">Sold by {product.seller.username}</span>
          <h1 className="detail-title">{product.title}</h1>
          <p className="detail-price">฿{Number(product.unit_price).toLocaleString()}</p>
 
          <div className={`detail-stock ${product.in_stock ? 'in-stock' : 'no-stock'}`}>
            {product.in_stock ? `${product.quantity} items in stock` : 'Out of stock'}
          </div>
 
          <p className="detail-description">{product.description}</p>
 
          {/* Quantity selector */}
          {product.in_stock && (
            <div className="detail-qty-row">
              <span className="detail-qty-label">Quantity</span>
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                  disabled={quantity >= product.quantity}
                >+</button>
              </div>
            </div>
          )}
 
          {/* Add to cart button */}
          {isSeller ? (
            <div className="seller-notice">
              Sellers cannot purchase products.
            </div>
          ) : (
            <button
              className={`btn-add-cart ${added ? 'btn-success' : ''}`}
              onClick={handleAddToCart}
              disabled={!product.in_stock || adding}
            >
              {adding ? 'Adding...' : added ? '✓ Added to cart' : 'Add to cart'}
            </button>
          )}
 
          {!isAuthenticated && (
            <p className="detail-login-hint">
              <span onClick={() => navigate('/login')} className="link">Sign in</span> to add items to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}