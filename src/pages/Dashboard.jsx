import React, { useState, useEffect } from 'react';
import {
  Package,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient, { formatCurrency, formatNumber, getErrorMessage } from '../api/axiosClient';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import SalesTrendChart from '../components/SalesTrendChart';
import CategoryPieChart from '../components/CategoryPieChart';
import StockLevelChart from '../components/StockLevelChart';
import SaleForm from '../components/SaleForm';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [sumRes, prodRes] = await Promise.all([
        axiosClient.get('/dashboard/summary'),
        axiosClient.get('/products/all'),
      ]);
      setSummary(sumRes.data);
      setAllProducts(prodRes.data || []);
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Failed to load dashboard data.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSaleRecorded = async (saleData) => {
    await axiosClient.post('/sales', saleData);
    setToast({ message: 'Sale successfully recorded! Stock updated.', type: 'success' });
    fetchDashboard();
  };

  const handleQuickRestock = async (productId, qty) => {
    try {
      await axiosClient.post('/inventory/restock', {
        productId,
        quantity: qty,
        changeType: 'RESTOCK',
      });
      setToast({ message: `Restocked ${qty} units successfully!`, type: 'success' });
      fetchDashboard();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to restock.', type: 'error' });
    }
  };

  if (loading && !summary) {
    return <Loader message="Analyzing shop performance & inventory..." />;
  }

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Top Alert Banner if there are active unread alerts */}
      {summary?.activeAlerts && summary.activeAlerts.length > 0 && (
        <AlertBanner alerts={summary.activeAlerts} />
      )}

      {/* Action Header */}
      <div className="toolbar-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Store Overview</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time sales, inventory status, and AI restocking recommendations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchDashboard} title="Refresh data">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setSaleModalOpen(true)}>
            <ShoppingCart size={16} /> Record Sale
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Products"
          value={formatNumber(summary?.totalProducts || 0)}
          icon={Package}
          color="primary"
          footerText="Active items in store catalog"
        />
        <StatCard
          title="Total Sales Today"
          value={formatCurrency(summary?.totalSalesToday || 0)}
          icon={IndianRupee}
          color="success"
          growth={summary?.salesTodayGrowth}
          footerText="vs yesterday's revenue"
        />
        <StatCard
          title="Low Stock Items"
          value={formatNumber(summary?.lowStockCount || 0)}
          icon={AlertTriangle}
          color={summary?.lowStockCount > 0 ? 'warning' : 'primary'}
          footerText={`${summary?.outOfStockCount || 0} out of stock`}
        />
        <StatCard
          title="Predicted Demand (7 Days)"
          value={`${formatNumber(summary?.predictedDemandNext7Days || 0)} units`}
          icon={TrendingUp}
          color="primary"
          footerText="Combined regression & MA forecast"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Sales Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Sales Revenue Trend</h3>
              <p className="card-subtitle">Daily sales revenue over the past 14 days</p>
            </div>
            <Link to="/sales" className="btn btn-secondary btn-sm">
              View History <ArrowRight size={14} />
            </Link>
          </div>
          <SalesTrendChart data={summary?.salesTrend || []} height={280} />
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Stock</h3>
              <p className="card-subtitle">Inventory share by product category</p>
            </div>
          </div>
          <CategoryPieChart data={summary?.categoryStock || []} height={280} />
        </div>
      </div>

      {/* Second Row: Stock Levels & AI Restocking Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Stock Level Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Catalog Stock Levels</h3>
              <p className="card-subtitle">Stock quantity vs minimum threshold</p>
            </div>
            <Link to="/inventory" className="btn btn-secondary btn-sm">
              Inventory <ArrowRight size={14} />
            </Link>
          </div>
          <StockLevelChart data={allProducts} height={280} />
        </div>

        {/* AI Restocking Suggestions */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">AI Restocking Suggestions</h3>
              <p className="card-subtitle">Demand-based purchase recommendations</p>
            </div>
            <Link to="/restocking" className="btn btn-secondary btn-sm">
              All Recommendations <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>7D Demand</th>
                  <th>Suggested Qty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary?.restockingSuggestions && summary.restockingSuggestions.length > 0 ? (
                  summary.restockingSuggestions.map((item) => (
                    <tr key={item.productId}>
                      <td style={{ fontWeight: 600 }}>{item.productName}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            item.currentStock <= 0
                              ? 'out-of-stock'
                              : item.currentStock <= item.minStockLevel
                              ? 'low-stock'
                              : 'in-stock'
                          }`}
                        >
                          {item.currentStock} units
                        </span>
                      </td>
                      <td>{item.predictedDemand}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        +{item.suggestedRestock}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleQuickRestock(item.productId, item.suggestedRestock)}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      All product stock levels are currently optimal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Sales</h3>
            <p className="card-subtitle">Latest store transactions</p>
          </div>
          <Link to="/sales" className="btn btn-secondary btn-sm">
            View All Sales <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity Sold</th>
                <th>Unit Price</th>
                <th>Total Bill</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentSales && summary.recentSales.length > 0 ? (
                summary.recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: 600 }}>{sale.productName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{sale.sku}</td>
                    <td>{sale.quantitySold} units</td>
                    <td>{formatCurrency(sale.unitPrice)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {sale.saleDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recent sales recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Sale Modal */}
      <SaleForm
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        onSaleRecorded={handleSaleRecorded}
        products={allProducts}
      />
    </div>
  );
};

export default Dashboard;
