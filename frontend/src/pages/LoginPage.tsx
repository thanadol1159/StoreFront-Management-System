import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
 
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ username, password })
      // redirect ตาม role
      if (user?.role === 'seller') {
        navigate('/seller/products')
      } else {
        navigate('/')
      }
    } catch {
      setError('Incorrect username or password.')
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon large">◈</span>
          <h1>Sign in to StoreMesh</h1>
        </div>
 
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
 
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
 
          {error && <p className="error-msg">{error}</p>}
 
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
 
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Join StoreMesh</Link>
        </p>
      </div>
    </div>
  )
}