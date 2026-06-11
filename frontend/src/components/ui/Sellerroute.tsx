import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
 
export default function SellerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSeller, loading } = useAuth()
 
  if (loading) return <div className="page-loading">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isSeller) return <Navigate to="/" replace />
 
  return <>{children}</>
}