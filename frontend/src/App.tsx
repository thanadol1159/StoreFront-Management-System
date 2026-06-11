import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/layout/navbar'
import SellerRoute from './components/ui/Sellerroute'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OrderConfirmPage from './pages/OrderConfirmPage'
import SellerDashboardPage from './pages/Sellerdashboardpage'
import ProductFormPage from './pages/Productformpage'
import './App.css'
 
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  )
}
 
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
 
              {/* Buyer */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders/:id" element={<OrderConfirmPage />} />
 
              {/* Seller */}
              <Route path="/seller/products" element={
                <SellerRoute><SellerDashboardPage /></SellerRoute>
              } />
              <Route path="/seller/products/new" element={
                <SellerRoute><ProductFormPage /></SellerRoute>
              } />
              <Route path="/seller/products/:id/edit" element={
                <SellerRoute><ProductFormPage /></SellerRoute>
              } />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}