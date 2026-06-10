import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'
 
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'buyer' as Role })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err: any) {
      const data = err?.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon large">◈</span>
          <h1>Join StoreMesh</h1>
        </div>
 
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label>I want to</label>
            <div className="role-selector">
              {(['buyer', 'seller'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-option ${form.role === r ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r })}
                >
                  <span className="role-icon">{r === 'buyer' ? '⊡' : '◧'}</span>
                  <span className="role-label">{r === 'buyer' ? 'Buy products' : 'Sell products'}</span>
                </button>
              ))}
            </div>
          </div>
 
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>
 
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
 
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
 
          {error && <p className="error-msg">{error}</p>}
 
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
 
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}