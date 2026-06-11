import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
 
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'
 
interface Props {
  product: Product
}
 
export default function ProductCard({ product }: Props) {
  const navigate = useNavigate()
  const imageUrl = product.image
  ? product.image.startsWith('http')
    ? product.image
    : `${API_URL}${product.image}`
  : null
 
  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} />
        ) : (
          <div className="product-card-no-image">
            <span>No image</span>
          </div>
        )}
        {!product.in_stock && (
          <div className="out-of-stock-overlay">Out of stock</div>
        )}
      </div>
 
      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-seller">by {product.seller.username}</p>
        <div className="product-card-footer">
          <span className="product-price">฿{Number(product.unit_price).toLocaleString()}</span>
          <span className={`stock-badge ${product.in_stock ? 'in-stock' : 'no-stock'}`}>
            {product.in_stock ? `${product.quantity} left` : 'Sold out'}
          </span>
        </div>
      </div>
    </div>
  )
}