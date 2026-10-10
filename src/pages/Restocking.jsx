import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import axiosClient, { formatNumber, getErrorMessage } from '../api/axiosClient';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const Restocking = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [filterNeedsRestock, setFilterNeedsRestock] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/forecast/latest');
      const data = res.data || [];
      setRecommendations(data);

      // Pre-fill quantities dictionary with suggestedRestock
      const initialQty = {};
      data.forEach((r) => {
        initialQty[r.productId] = (r.suggestedRestock > 0 ? r.suggestedRestock : 10).toString();
      });
      setQuantities(initialQty);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Failed to fetch restocking recommendations.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleQuantityChange = (productId, val) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleRestock = async (product) => {
    const rawQty = quantities[product.productId];
    const qty = parseInt(rawQty, 10);

    if (!qty || qty <= 0) {
      setToast({ message: 'Please specify a restock quantity greater than 0.', type: 'error' });
      return;
    }

    setSubmittingId(product.productId);
    try {
      await axiosClient.post('/inventory/restock', {
        productId: product.productId,
        quantity: qty,
        changeType: 'RESTOCK',
      });

      // Refresh forecast for product
      await axiosClient.post(`/forecast/${product.productId}`);

      setToast({
        message: `Successfully restocked ${qty} units of ${product.productName}!`,
        type: 'success',
      });
      fetchRecommendations();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to complete restocking.',
        type: 'error',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredItems = filterNeedsRestock
    ? recommendations.filter((r) => r.suggestedRestock > 0 || r.currentStock <= r.minStockLevel)
    : recommendations;

  const totalUnitsNeeded = recommendations.reduce((acc, r) => acc + (r.suggestedRestock || 0), 0);
  const urgentItemsCount = recommendations.filter((r) => r.currentStock <= r.minStockLevel).length;

  if (loading && recommendations.length === 0) {
    return <Loader message="Compiling restocking recommendations..." />;
  }

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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Restocking Recommendations</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automatically planned procurement orders with 10% safety buffer to eliminate stockout risk.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchRecommendations} title="Refresh">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stat Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Recommended Purchase Volume</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatNumber(totalUnitsNeeded)} units
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Urgent Low/Out-of-Stock</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: urgentItemsCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {urgentItemsCount} products
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Filter Mode</span>
          <div style={{ marginTop: '0.35rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterNeedsRestock}
                onChange={(e) => setFilterNeedsRestock(e.target.checked)}
              />
              Show only products needing stock
            </label>
          </div>
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Current Stock</th>
                <th style={{ textAlign: 'right' }}>7-Day Demand</th>
                <th style={{ textAlign: 'right' }}>Suggested Qty</th>
                <th>Confidence</th>
                <th>Order Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isUrgent = item.currentStock <= item.minStockLevel;
                  return (
                    <tr key={item.productId}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.sku} • {item.category}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className={`status-pill ${
                            item.currentStock <= 0
                              ? 'out-of-stock'
                              : isUrgent
                              ? 'low-stock'
                              : 'in-stock'
                          }`}
                        >
                          {item.currentStock} units
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.predictedDemand}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: item.suggestedRestock > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {item.suggestedRestock > 0 ? `+${item.suggestedRestock}` : '0'}
                      </td>
                      <td>
                        <span className={`badge-confidence ${item.confidence?.toLowerCase()}`}>
                          {item.confidence}
                        </span>
                      </td>
                      <td style={{ width: '130px' }}>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          style={{ padding: '0.35rem 0.5rem', textAlign: 'center', fontWeight: 600 }}
                          value={quantities[item.productId] || ''}
                          onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={submittingId === item.productId}
                          onClick={() => handleRestock(item)}
                        >
                          {submittingId === item.productId ? (
                            'Restocking...'
                          ) : (
                            <>
                              <PackageCheck size={14} /> Restock Now
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 0.5rem auto', display: 'block' }} />
                    All products currently have sufficient inventory coverage!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Restocking;
