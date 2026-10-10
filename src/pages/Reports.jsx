import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Boxes,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import axiosClient, { formatCurrency, formatNumber, getErrorMessage } from '../api/axiosClient';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'inventory', 'insights'
  const [loading, setLoading] = useState(true);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Data
  const [salesSummary, setSalesSummary] = useState(null);
  const [inventoryReport, setInventoryReport] = useState([]);
  const [productInsights, setProductInsights] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await axiosClient.get('/reports/sales-summary', {
          params: {
            from: fromDate || undefined,
            to: toDate || undefined,
          },
        });
        setSalesSummary(res.data);
      } else if (activeTab === 'inventory') {
        const res = await axiosClient.get('/reports/inventory');
        setInventoryReport(res.data || []);
      } else if (activeTab === 'insights') {
        const res = await axiosClient.get('/reports/product-insights');
        setProductInsights(res.data || []);
      }
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Failed to generate report.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, fromDate, toDate]);

  const handleExportCsv = async (type) => {
    try {
      const response = await axiosClient.get('/reports/export', {
        params: {
          type,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smart_shop_${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: `Exported ${type} CSV successfully!`, type: 'success' });
    } catch (err) {
      setToast({ message: 'CSV export failed.', type: 'error' });
    }
  };

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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reports & Business Intelligence</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Financial revenue breakdowns, inventory valuations, and ML product insights.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleExportCsv(activeTab === 'inventory' ? 'inventory' : 'sales')}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-list">
        <div
          className={`tab-item ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={18} /> Sales Summary
          </div>
        </div>
        <div
          className={`tab-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Boxes size={18} /> Inventory Valuation
          </div>
        </div>
        <div
          className={`tab-item ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb size={18} /> Product Insights
          </div>
        </div>
      </div>

      {/* Date Range Filter (Visible on Sales tab) */}
      {activeTab === 'sales' && (
        <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Sales Range:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            {(fromDate || toDate) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <Loader message="Compiling report analytics..." />
      ) : (
        <>
          {/* TAB 1: Sales Summary */}
          {activeTab === 'sales' && salesSummary && (
            <div>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Revenue</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                    {formatCurrency(salesSummary.totalRevenue)}
                  </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Units Sold</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    {formatNumber(salesSummary.totalQuantitySold)} units
                  </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions Completed</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    {formatNumber(salesSummary.totalTransactions)}
                  </div>
                </div>
              </div>

              {/* Product-wise Sales Table */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title">Top Products by Revenue</h3>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>Units Sold</th>
                        <th style={{ textAlign: 'right' }}>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesSummary.productSales?.map((ps) => (
                        <tr key={ps.productId}>
                          <td style={{ fontWeight: 600 }}>{ps.productName}</td>
                          <td>
                            <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                              {ps.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>{ps.quantitySold} units</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                            {formatCurrency(ps.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily Sales Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Daily Sales Breakdown</h3>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Transactions</th>
                        <th style={{ textAlign: 'right' }}>Units Sold</th>
                        <th style={{ textAlign: 'right' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesSummary.dailySales?.map((ds) => (
                        <tr key={ds.date}>
                          <td style={{ fontWeight: 600 }}>{ds.date}</td>
                          <td style={{ textAlign: 'right' }}>{ds.transactions}</td>
                          <td style={{ textAlign: 'right' }}>{ds.quantitySold}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(ds.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Inventory Valuation */}
          {activeTab === 'inventory' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Stock Valuation & Health</h3>
                  <p className="card-subtitle">
                    Total Assets: {formatCurrency(inventoryReport.reduce((acc, r) => acc + (Number(r.inventoryValue) || 0), 0))}
                  </p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Current Stock</th>
                      <th style={{ textAlign: 'right' }}>Min Threshold</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Total Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReport.map((item) => (
                      <tr key={item.productId}>
                        <td style={{ fontWeight: 600 }}>{item.productName}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.sku}</td>
                        <td>{item.category}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.currentStock}</td>
                        <td style={{ textAlign: 'right' }}>{item.minStockLevel}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                          {formatCurrency(item.inventoryValue)}
                        </td>
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
                            {item.stockStatus?.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Product Insights */}
          {activeTab === 'insights' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Machine Learning Demand & Consumption Insights</h3>
                  <p className="card-subtitle">Long-term velocity, regression forecasts, and overstock analysis</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Total Sold</th>
                      <th>Revenue</th>
                      <th>Avg Daily Demand</th>
                      <th>7D Forecast</th>
                      <th>Suggested Restock</th>
                      <th>Confidence</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productInsights.map((pi) => (
                      <tr key={pi.productId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{pi.productName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pi.category}</div>
                        </td>
                        <td>{pi.totalQuantitySold} units</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(pi.totalRevenue)}</td>
                        <td>{pi.avgDailyDemand} units/day</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{pi.predictedDemand} units</td>
                        <td>{pi.suggestedRestock > 0 ? `+${pi.suggestedRestock}` : '0'}</td>
                        <td>
                          <span className={`badge-confidence ${pi.confidence?.toLowerCase()}`}>
                            {pi.confidence}
                          </span>
                        </td>
                        <td>
                          {pi.overstockRisk ? (
                            <span className="badge-risk">Overstock Risk</span>
                          ) : (
                            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                              Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
