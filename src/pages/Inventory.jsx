import React, { useState, useEffect } from 'react';
import {
  Boxes,
  History,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';
import axiosClient, { formatCurrency } from '../api/axiosClient';
import DataTable from '../components/DataTable';
import Toast from '../components/Toast';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'logs'
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('10');
  const [changeType, setChangeType] = useState('RESTOCK');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  // Pagination for logs
  const [logsPage, setLogsPage] = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(0);
  const [logsTotalElements, setLogsTotalElements] = useState(0);

  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products/all');
      setProducts(res.data || []);
    } catch (err) {
      setToast({ message: 'Failed to fetch inventory stock.', type: 'error' });
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/inventory/logs', {
        params: { page: logsPage, size: 15 },
      });
      setLogs(res.data.content || []);
      setLogsTotalPages(res.data.totalPages || 0);
      setLogsTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setToast({ message: 'Failed to load inventory logs.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, logsPage]);

  const handleOpenRestock = (product) => {
    setSelectedProduct(product);
    setRestockQty('10');
    setChangeType('RESTOCK');
    setRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty < 0) {
      setToast({ message: 'Please enter a valid stock quantity.', type: 'error' });
      return;
    }

    if (changeType === 'RESTOCK' && qty <= 0) {
      setToast({ message: 'Restock quantity must be at least 1 unit.', type: 'error' });
      return;
    }

    setSubmittingRestock(true);
    try {
      if (changeType === 'RESTOCK') {
        await axiosClient.post('/inventory/restock', {
          productId: selectedProduct.id,
          quantity: qty,
        });
        setToast({
          message: `Restocked ${qty} units for ${selectedProduct.name}! New stock reflected.`,
          type: 'success',
        });
      } else {
        await axiosClient.post('/inventory/adjust', {
          productId: selectedProduct.id,
          newPhysicalStock: qty,
          reason: 'Physical stock audit adjustment',
        });
        setToast({
          message: `Adjusted stock for ${selectedProduct.name} to ${qty} units. Audit log recorded.`,
          type: 'success',
        });
      }
      setRestockModalOpen(false);
      fetchProducts();
      if (activeTab === 'logs') fetchLogs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update stock.', type: 'error' });
    } finally {
      setSubmittingRestock(false);
    }
  };

  // Columns for Current Stock Table
  const currentColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
          {p.category}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Current Stock',
      render: (p) => <span style={{ fontWeight: 700, fontSize: '1rem' }}>{p.stockQuantity} units</span>,
    },
    {
      key: 'minStockLevel',
      header: 'Min Threshold',
      render: (p) => <span>{p.minStockLevel} units</span>,
    },
    {
      key: 'stockStatus',
      header: 'Stock Status',
      render: (p) => {
        let pillClass = 'in-stock';
        let label = 'In Stock';
        if (p.stockQuantity <= 0) {
          pillClass = 'out-of-stock';
          label = 'Out of Stock';
        } else if (p.stockQuantity <= p.minStockLevel) {
          pillClass = 'low-stock';
          label = 'Low Stock';
        }
        return <span className={`status-pill ${pillClass}`}>{label}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (p) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleOpenRestock(p)}
        >
          <Plus size={14} /> Adjust / Restock
        </button>
      ),
    },
  ];

  // Columns for Inventory Audit Logs
  const logColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (l) => (
        <div>
          <div style={{ fontWeight: 600 }}>{l.product?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'changeType',
      header: 'Change Type',
      render: (l) => {
        let color = '#2563EB';
        let bg = '#EFF6FF';
        if (l.changeType === 'SALE') {
          color = '#DC2626';
          bg = '#FEF2F2';
        } else if (l.changeType === 'RESTOCK') {
          color = '#16A34A';
          bg = '#F0FDF4';
        }
        return (
          <span
            style={{
              color,
              backgroundColor: bg,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {l.changeType}
          </span>
        );
      },
    },
    {
      key: 'quantityChange',
      header: 'Quantity Change',
      render: (l) => (
        <span
          style={{
            fontWeight: 700,
            color: l.quantityChange > 0 ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange} units
        </span>
      ),
    },
    {
      key: 'resultingStock',
      header: 'Resulting Stock',
      render: (l) => (
        <span style={{ fontWeight: 600 }}>{l.resultingStock} units</span>
      ),
    },
    {
      key: 'logDate',
      header: 'Log Timestamp',
      render: (l) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {l.logDate ? l.logDate.replace('T', ' ').substring(0, 16) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header Toolbar */}
      <div className="toolbar-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Inventory Tracking & Audit</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Monitor on-hand inventory levels and inspect immutable stock change history.
          </p>
        </div>
        <div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              fetchProducts();
              if (activeTab === 'logs') fetchLogs();
            }}
            title="Refresh"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-list">
        <div
          className={`tab-item ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Boxes size={18} /> Current Stock Overview
          </div>
        </div>
        <div
          className={`tab-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={18} /> Inventory Change Logs Timeline
          </div>
        </div>
      </div>

      {/* Tab 1: Current Stock */}
      {activeTab === 'current' && (
        <div className="card">
          <DataTable
            columns={currentColumns}
            data={products}
            loading={loading}
            emptyTitle="No inventory data"
            emptyDescription="No products are registered in the store."
          />
        </div>
      )}

      {/* Tab 2: Logs Timeline */}
      {activeTab === 'logs' && (
        <div className="card">
          <DataTable
            columns={logColumns}
            data={logs}
            loading={loading}
            emptyTitle="No inventory logs recorded"
            emptyDescription="Every sale, restock, or stock adjustment will appear in this timeline."
            pagination={{
              page: logsPage,
              totalPages: logsTotalPages,
              totalElements: logsTotalElements,
              onPageChange: (newPage) => setLogsPage(newPage),
            }}
          />
        </div>
      )}

      {/* Restock / Adjust Modal */}
      {restockModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setRestockModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Stock Adjustment / Restock</h3>
            </div>
            <form onSubmit={handleRestockSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedProduct.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Current Stock: {selectedProduct.stockQuantity} units
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select
                    className="form-select"
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                  >
                    <option value="RESTOCK">Restock (Supplier Delivery)</option>
                    <option value="ADJUSTMENT">Stock Count Adjustment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {changeType === 'RESTOCK' ? 'Units Received from Supplier *' : 'Actual Physical Count on Shelf *'}
                  </label>
                  <input
                    type="number"
                    min={changeType === 'RESTOCK' ? '1' : '0'}
                    className="form-input"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {changeType === 'RESTOCK'
                      ? 'Adds newly delivered units to the existing inventory level.'
                      : 'Reconciles the recorded database stock to match the actual physical store count.'}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  {changeType === 'RESTOCK' ? (
                    <div>
                      Resulting Stock after restock:{' '}
                      <strong style={{ color: 'var(--success)' }}>
                        {selectedProduct.stockQuantity + (parseInt(restockQty, 10) || 0)} units
                      </strong>
                    </div>
                  ) : (
                    <div>
                      New On-Hand Stock:{' '}
                      <strong style={{ color: 'var(--primary)' }}>
                        {parseInt(restockQty, 10) || 0} units
                      </strong>
                      <span style={{ marginLeft: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        (Difference: {(parseInt(restockQty, 10) || 0) - selectedProduct.stockQuantity >= 0 ? '+' : ''}
                        {(parseInt(restockQty, 10) || 0) - selectedProduct.stockQuantity} units)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRestockModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingRestock}>
                  {submittingRestock ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
