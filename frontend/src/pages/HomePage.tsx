import { useEffect, useState, useMemo } from 'react'
import { productApi } from '../api/services'
import ProductCard from '../components/product/ProductCard'
import ProductFilter from '../components/product/ProductFilter'
import type { Product } from '../types'
 
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('-created_at')
  const [inStockOnly, setInStockOnly] = useState(false)
 
  useEffect(() => {
    productApi.list({ ordering: sortBy })
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [sortBy])
 
const filtered = useMemo(() => {
  let result = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchStock = inStockOnly ? p.in_stock : true
    return matchSearch && matchStock
  })

  result = [...result].sort((a, b) => {
    switch (sortBy) {
      case 'unit_price':
        return Number(a.unit_price) - Number(b.unit_price)
      case '-unit_price':
        return Number(b.unit_price) - Number(a.unit_price)
      case 'created_at':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case '-created_at':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return result
}, [products, search, inStockOnly, sortBy])

  return (
    <div className="page-home">
      <section className="home-hero">
        <h1 className="hero-title">
          <span className="hero-title-accent">Discover</span> products<br />from real sellers.
        </h1>
        <p className="hero-sub">{products.length} listings available now</p>
      </section>
 
      <ProductFilter
        search={search}
        sortBy={sortBy}
        inStockOnly={inStockOnly}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        onInStockChange={setInStockOnly}
      />
 
      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◫</span>
          <p>No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}