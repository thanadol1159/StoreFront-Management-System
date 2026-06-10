import { api } from './client'
import type { AuthTokens, LoginPayload, RegisterPayload, Product, Cart, Order } from '../types'
 
// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokens>('/token/', payload).then((r) => r.data),
 
  register: (payload: RegisterPayload) =>
    api.post<{ id: number; username: string }>('/register/', payload).then((r) => r.data),
 
  me: () =>
    api.get('/users/me/').then((r) => r.data),
}
 
// ── Products ──────────────────────────────────────────
export const productApi = {
  list: (params?: Record<string, string>) =>
    api.get<Product[]>('/products/', { params }).then((r) => r.data),
 
  detail: (id: number) =>
    api.get<Product>(`/products/${id}/`).then((r) => r.data),
 
  myProducts: () =>
    api.get<Product[]>('/products/my_products/').then((r) => r.data),
 
  create: (formData: FormData) =>
    api.post<Product>('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
 
  update: (id: number, formData: FormData) =>
    api.patch<Product>(`/products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
 
  remove: (id: number) =>
    api.delete(`/products/${id}/`),
}
 
// ── Cart ──────────────────────────────────────────────
export const cartApi = {
  get: () =>
    api.get<Cart>('/cart/').then((r) => r.data),
 
  addItem: (product_id: number, quantity: number) =>
    api.post<Cart>('/cart/add_item/', { product_id, quantity }).then((r) => r.data),
 
  removeItem: (product_id: number) =>
    api.post('/cart/remove_item/', { product_id }),
 
  clear: () =>
    api.post('/cart/clear/'),
}
 
// ── Orders ────────────────────────────────────────────
export const orderApi = {
  list: () =>
    api.get<Order[]>('/orders/').then((r) => r.data),
 
  detail: (id: number) =>
    api.get<Order>(`/orders/${id}/`).then((r) => r.data),
 
  checkout: () =>
    api.post<Order>('/orders/').then((r) => r.data),
}
 