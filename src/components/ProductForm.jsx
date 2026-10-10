import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, onSubmit, product, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stockQuantity: '',
    minStockLevel: '10',
    supplier: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        price: product.price ? product.price.toString() : '',
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity.toString() : '0',
        minStockLevel: product.minStockLevel !== undefined ? product.minStockLevel.toString() : '10',
        supplier: product.supplier || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: categories.length > 0 ? categories[0] : '',
        price: '',
        stockQuantity: '0',
        minStockLevel: localStorage.getItem('smartshop_default_min_stock') || '10',
        supplier: '',
      });
    }
    setErrors({});
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (!formData.category.trim()) errs.category = 'Category is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errs.price = 'Price must be greater than zero';
    }
    if (formData.stockQuantity === '' || isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0) {
      errs.stockQuantity = 'Stock quantity cannot be negative';
    }
    if (formData.minStockLevel === '' || isNaN(formData.minStockLevel) || Number(formData.minStockLevel) < 0) {
      errs.minStockLevel = 'Minimum stock level cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        minStockLevel: parseInt(formData.minStockLevel, 10),
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Failed to save product.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="btn-icon" onClick={onClose} style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errors.form}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Basmati Rice 5kg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error-text">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU (Stock Keeping Unit) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SKU-RICE-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                />
                {errors.sku && <span className="form-error-text">{errors.sku}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  list="categories-list"
                  className="form-input"
                  placeholder="e.g. Food Grains"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <datalist id="categories-list">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.category && <span className="form-error-text">{errors.category}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <span className="form-error-text">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                />
                {errors.stockQuantity && <span className="form-error-text">{errors.stockQuantity}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Stock Alert Level *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="10"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                />
                {errors.minStockLevel && <span className="form-error-text">{errors.minStockLevel}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Agro Farms India"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
