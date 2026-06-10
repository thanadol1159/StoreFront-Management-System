import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../api/services'
import type { User, LoginPayload, RegisterPayload } from '../types'
 
interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isBuyer: boolean
  isSeller: boolean
}
 
const AuthContext = createContext<AuthContextValue | null>(null)
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    const access = localStorage.getItem('access')
    if (access) {
      authApi.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])
 
  const login = async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload)
    localStorage.setItem('access', tokens.access)
    localStorage.setItem('refresh', tokens.refresh)
    const me = await authApi.me()
    setUser(me)
  }
 
  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload)
    await login({ username: payload.username, password: payload.password })
  }
 
  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }
 
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isBuyer: user?.role === 'buyer',
      isSeller: user?.role === 'seller',
    }}>
      {children}
    </AuthContext.Provider>
  )
}
 
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}