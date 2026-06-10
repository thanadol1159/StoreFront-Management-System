
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
 
export default function Navbar() {
  const { user, isAuthenticated, isBuyer, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
 
  const handleLogout = () => {
    logout()
    navigate('/')
  }
 
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">◈</span>
        <span className="brand-name">StoreMesh</span>
      </Link>
 
      <div className="navbar-actions">
        {isAuthenticated && isBuyer && (
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            <span className="cart-icon">⊡</span>
            <span className="cart-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
 
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-role-tag">{user?.role}</span>
            <span className="user-name">{user?.username}</span>
            {user?.role === 'seller' && (
              <Link to="/seller/products" className="btn-ghost">My Products</Link>
            )}
            <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
          </div>
        ) : (
          <div className="auth-btns">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Join</Link>
          </div>
        )}
      </div>
    </nav>
  )
}