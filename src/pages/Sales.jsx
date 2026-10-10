import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Calendar,
  Filter,
  RefreshCw,
  Plus,
  Receipt,
  IndianRupee,
  Layers,
} from 'lucide-react';
import axiosClient, { formatCurrency, formatNumber } from '../api/axiosClient';
import DataTable from '../components/DataTable';
import SaleForm from '../components/SaleForm';
import Toast from '../components/Toast';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [selectedProductId, setSelectedProductId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products/all');
      setProducts(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/sales', {
        params: {
          productId: selectedProductId || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
          page,
          size: 15,
        },
      });
      setSales(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setToast({ message: 'Failed to fetch sales history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [page, selectedProductId, fromDate, toDate]);

  const handleSaleRecorded = async (saleData) => {
    await axiosClient.post('/sales', saleData);
    setToast({ message: 'Sale successfully completed and logged!', type: 'success' });
    fetchSales();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSelectedProductId('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  // Quick summary calculations for current loaded list
  const currentTotalRevenue = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
  const currentTotalQuantity = sales.reduce((acc, s) => acc + (Number(s.quantitySold) || 0), 0);

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.product?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'quantitySold',
      header: 'Quantity Sold',
      render: (s) => (
        <span style={{ fontWeight: 600 }}>
          {s.quantitySold} unit{s.quantitySold > 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: 'Unit Price',
      render: (s) => formatCurrency(s.unitPrice),
    },
    {
      key: 'totalAmount',
      header: 'Total Bill',
      render: (s) => (
        <span style={{ fontWeight: 700, color: 'var(--success)' }}>
          {formatCurrency(s.totalAmount)}
        </span>
      ),
    },
    {
      key: 'saleDate',
      header: 'Sale Date & Time',
      render: (s) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {s.saleDate ? s.saleDate.replace('T', ' ').substring(0, 16) : '—'}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Recorded By',
      render: (s) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>
          {s.user?.name || 'Store Staff'}
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sales Transactions</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Log customer purchases and review billing transaction records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchSales} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="btn btn-primary" onClick={() => setSaleModalOpen(true)}>
            <ShoppingCart size={16} /> Record Sale
          </button>
        </div>
      </div>

      {/* Mini Summary Cards for Current View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Page Transactions</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatNumber(sales.length)}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Units Sold (Page)</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatNumber(currentTotalQuantity)}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Revenue (Page)</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
            {formatCurrency(currentTotalRevenue)}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Product Filter */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div style={{ minWidth: '150px' }}>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              placeholder="From Date"
            />
          </div>

          {/* Date to */}
          <div style={{ minWidth: '150px' }}>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              placeholder="To Date"
            />
          </div>

          {(selectedProductId || fromDate || toDate) && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Sales History Table */}
      <div className="card">
        <DataTable
          columns={columns}
          data={sales}
          loading={loading}
          emptyTitle="No sales found"
          emptyDescription="There are no recorded sales matching your filter criteria."
          pagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>

      {/* Sale Form Modal */}
      <SaleForm
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSaleRecorded={handleSaleRecorded}
        products={products}
      />
    </div>
  );
};

export default Sales;
