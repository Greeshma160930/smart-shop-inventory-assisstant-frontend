import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../api/axiosClient';

const SaleForm = ({ isOpen, onClose, onSaleRecorded, products = [] }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id.toString());
    }
    setQuantity('1');
    setError('');
  }, [isOpen, products]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);
  const currentStock = selectedProduct ? (selectedProduct.stockQuantity ?? 0) : 0;
  const unitPrice = selectedProduct ? (selectedProduct.price ?? 0) : 0;
  const parsedQty = parseInt(quantity, 10) || 0;
  const totalAmount = parsedQty * unitPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }

    if (parsedQty <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (parsedQty > currentStock) {
      setError(`Cannot sell ${parsedQty} units. Only ${currentStock} available in stock.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSaleRecorded({
        productId: parseInt(selectedProductId, 10),
        quantity: parsedQty,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={18} />
            </div>
            <h3>Record New Sale</h3>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Product *</label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setError('');
                }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                    {p.name} ({p.sku}) — Stock: {p.stockQuantity} {p.stockQuantity <= 0 ? '(Out of Stock)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  backgroundColor: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    Available Stock
                  </span>
                  <span
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: currentStock <= 0 ? 'var(--danger)' : currentStock <= selectedProduct.minStockLevel ? 'var(--warning)' : 'var(--success)',
                    }}
                  >
                    {currentStock} units
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    Unit Price
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatCurrency(unitPrice)}
                  </span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Sale Quantity *</label>
              <input
                type="number"
                min="1"
                max={currentStock > 0 ? currentStock : 1}
                className="form-input"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError('');
                }}
                disabled={currentStock <= 0}
              />
            </div>

            {/* Total Calculation Display */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Total Bill Amount
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {parsedQty} units × {formatCurrency(unitPrice)}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || currentStock <= 0}
            >
              {submitting ? 'Recording Sale...' : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
