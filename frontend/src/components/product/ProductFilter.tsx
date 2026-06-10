interface Props {
  search: string
  sortBy: string
  inStockOnly: boolean
  onSearchChange: (v: string) => void
  onSortChange: (v: string) => void
  onInStockChange: (v: boolean) => void
}
 
export default function ProductFilter({
  search, sortBy, inStockOnly,
  onSearchChange, onSortChange, onInStockChange,
}: Props) {
  return (
    <div className="product-filter">
      <div className="filter-search">
        <span className="filter-search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-input"
        />
      </div>
 
      <div className="filter-controls">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="filter-select"
        >
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
          <option value="unit_price">Price: Low to High</option>
          <option value="-unit_price">Price: High to Low</option>
        </select>
 
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
          />
          <span>In stock only</span>
        </label>
      </div>
    </div>
  )
}