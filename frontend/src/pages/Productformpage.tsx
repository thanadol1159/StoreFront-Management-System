import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi } from '../api/services'
 
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'
 
interface FormState {
  title: string
  description: string
  unit_price: string
  quantity: string
  is_active: boolean
}
 
const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  unit_price: '',
  quantity: '',
  is_active: true,
}
 
export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
 
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormState & { general: string }>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
 
  // Load existing product if editing
  useEffect(() => {
    if (!isEdit) return
    productApi.detail(Number(id))
      .then((p) => {
        setForm({
          title: p.title,
          description: p.description,
          unit_price: p.unit_price,
          quantity: String(p.quantity),
          is_active: p.is_active,
        })
        if (p.image) setExistingImage(`${API_URL}${p.image}`)
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])
 
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
 
  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.unit_price || Number(form.unit_price) <= 0) errs.unit_price = 'Price must be greater than 0'
    if (!form.quantity || Number(form.quantity) < 0) errs.quantity = 'Quantity must be 0 or more'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
 
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('unit_price', form.unit_price)
      formData.append('quantity', form.quantity)
      formData.append('is_active', String(form.is_active))
      if (imageFile) formData.append('image', imageFile)
 
      if (isEdit) {
        await productApi.update(Number(id), formData)
      } else {
        await productApi.create(formData)
      }
      navigate('/seller/products')
    } catch (err: any) {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        setErrors(data)
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }
 
  if (loading) return <div className="page-loading">Loading...</div>
 
  const previewSrc = imagePreview ?? existingImage
 
  return (
    <div className="page-product-form">
      <button className="btn-back" onClick={() => navigate('/seller/products')}>
        ← Back to My Products
      </button>
 
      <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
 
      <form onSubmit={handleSubmit} className="product-form">
        {/* Image upload */}
        <div className="form-section">
          <label className="form-label">Product Image</label>
          <div
            className="image-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewSrc ? (
              <div className="image-preview-wrap">
                <img src={previewSrc} alt="preview" className="image-preview" />
                <div className="image-preview-overlay">
                  <span>Click to change</span>
                </div>
              </div>
            ) : (
              <div className="image-upload-placeholder">
                <span className="upload-icon">⊕</span>
                <span>Click to upload image</span>
                <span className="upload-hint">PNG, JPG up to 10MB</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
 
        {/* Title */}
        <div className="form-field">
          <label className="form-label" htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Product name"
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>
 
        {/* Description */}
        <div className="form-field">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your product..."
            rows={4}
          />
        </div>
 
        {/* Price + Quantity row */}
        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="unit_price">
              Price (฿) <span className="required">*</span>
            </label>
            <input
              id="unit_price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
              placeholder="0.00"
              className={errors.unit_price ? 'input-error' : ''}
            />
            {errors.unit_price && <span className="field-error">{errors.unit_price}</span>}
          </div>
 
          <div className="form-field">
            <label className="form-label" htmlFor="quantity">
              Quantity <span className="required">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
              className={errors.quantity ? 'input-error' : ''}
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </div>
        </div>
 
        {/* Active toggle */}
        <div className="form-field">
          <label className="toggle-label">
            <div className="toggle-info">
              <span className="form-label">Listing Status</span>
              <span className="toggle-hint">
                {form.is_active ? 'Visible to buyers' : 'Hidden from marketplace'}
              </span>
            </div>
            <div
              className={`toggle ${form.is_active ? 'on' : 'off'}`}
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
            >
              <div className="toggle-knob" />
            </div>
          </label>
        </div>
 
        {errors.general && <p className="error-msg">{errors.general}</p>}
 
        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate('/seller/products')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create listing'}
          </button>
        </div>
      </form>
    </div>
  )
}