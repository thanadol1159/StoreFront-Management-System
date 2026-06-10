
export type Role = 'seller' | 'buyer'
 
export interface User {
  id: number
  username: string
  email: string
  role: Role
  first_name: string
  last_name: string
}
 
export interface Product {
  id: number
  seller: User
  title: string
  description: string
  unit_price: string
  quantity: number
  image: string | null
  is_active: boolean
  in_stock: boolean
  created_at: string
  updated_at: string
}
 
export interface CartItem {
  id: number
  product: Product
  quantity: number
  subtotal: string
}
 
export interface Cart {
  id: number
  buyer: User
  items: CartItem[]
  total: string
  created_at: string
}
 
export interface OrderItem {
  id: number
  product: Product
  quantity: number
  unit_price: string
  subtotal: string
}
 
export interface Order {
  id: number
  buyer: User
  total_amount: string
  status: 'pending' | 'completed'
  items: OrderItem[]
  ordered_at: string
}
 
export interface AuthTokens {
  access: string
  refresh: string
}
 
export interface LoginPayload {
  username: string
  password: string
}
 
export interface RegisterPayload {
  username: string
  email: string
  password: string
  role: Role
}