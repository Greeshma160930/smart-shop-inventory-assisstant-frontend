import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Package,
  Layers,
} from 'lucide-react';
import axiosClient, { formatNumber, getErrorMessage } from '../api/axiosClient';
import ForecastChart from '../components/ForecastChart';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const AiPrediction = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [currentForecast, setCurrentForecast] = useState(null);
  const [allForecasts, setAllForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, latestRes] = await Promise.all([
        axiosClient.get('/products/all'),
        axiosClient.get('/forecast/latest'),
      ]);

      const prods = prodRes.data || [];
      setProducts(prods);
      setAllForecasts(latestRes.data || []);

      if (prods.length > 0) {
        const firstId = prods[0].id;
        setSelectedProductId(firstId.toString());
        // Load detailed forecast for first product
        const detailRes = await axiosClient.get(`/forecast/${firstId}`);
        setCurrentForecast(detailRes.data);
      }
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Failed to load AI forecasting data.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleProductChange = async (productId) => {
    setSelectedProductId(productId);
    try {
      setLoading(true);
      const res = await axiosClient.get(`/forecast/${productId}`);
      setCurrentForecast(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch product forecast.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForecast = async () => {
    if (!selectedProductId) return;
    setGenerating(true);
    try {
      const res = await axiosClient.post(`/forecast/${selectedProductId}`);
      setCurrentForecast(res.data);
      setToast({ message: 'Generated fresh AI demand forecast!', type: 'success' });
      // Refresh list
      const latestRes = await axiosClient.get('/forecast/latest');
      setAllForecasts(latestRes.data || []);
    } catch (err) {
      setToast({ message: 'Forecast generation failed.', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      const res = await axiosClient.post('/forecast/all');
      setAllForecasts(res.data || []);
      if (selectedProductId) {
        const updated = res.data.find((f) => f.productId.toString() === selectedProductId);
        if (updated) setCurrentForecast(updated);
      }
      setToast({ message: 'Updated demand models for all products!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Bulk forecast generation failed.', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading && !currentForecast) {
    return <Loader message="Executing machine learning demand models..." />;
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Demand Prediction</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Dual-method machine learning engine blending least-squares regression (60%) with 7-day moving averages (40%).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleGenerateAll} disabled={generating}>
            <Sparkles size={16} /> Run All Models
          </button>
          <button className="btn btn-primary" onClick={handleGenerateForecast} disabled={generating}>
            <BrainCircuit size={16} /> {generating ? 'Forecasting...' : 'Generate Forecast'}
          </button>
        </div>
      </div>

      {/* Product Selector Card */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Target Product:</label>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.category} [Stock: {p.stockQuantity}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Prediction Metric Cards */}
      {currentForecast && (
        <>
          <div className="stat-card-grid">
            <StatCard
              title="Predicted 7-Day Demand"
              value={`${currentForecast.predictedDemand} units`}
              icon={TrendingUp}
              color="primary"
              footerText="Weighted combination (60% Reg + 40% MA)"
            />

            <StatCard
              title="Suggested Restock"
              value={`${currentForecast.suggestedRestock} units`}
              icon={Package}
              color={currentForecast.suggestedRestock > 0 ? 'warning' : 'success'}
              footerText="Includes 10% safety buffer (Stockout shield)"
            />

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Model Confidence</span>
                <div className="stat-card-icon primary">
                  <ShieldCheck size={24} />
                </div>
              </div>
              <div className="stat-card-value">
                <span className={`badge-confidence ${currentForecast.confidence?.toLowerCase()}`}>
                  {currentForecast.confidence} Confidence
                </span>
              </div>
              <div className="stat-card-footer">
                <span>Based on {currentForecast.historicalSalesCount || 0} recorded sales</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Overstock Risk</span>
                <div className={`stat-card-icon ${currentForecast.overstockRisk ? 'danger' : 'success'}`}>
                  <AlertTriangle size={24} />
                </div>
              </div>
              <div className="stat-card-value">
                {currentForecast.overstockRisk ? (
                  <span className="badge-risk">High Overstock Risk</span>
                ) : (
                  <span style={{ color: 'var(--success)', fontSize: '1.25rem', fontWeight: 700 }}>
                    Safe Inventory
                  </span>
                )}
              </div>
              <div className="stat-card-footer">
                <span>
                  {currentForecast.overstockRisk
                    ? `Current stock (${currentForecast.currentStock}) > 3× demand`
                    : `Stock level matches forecasted consumption`}
                </span>
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  {currentForecast.productName} — Historical Sales vs 7-Day Predicted Demand
                </h3>
                <p className="card-subtitle">
                  Solid bars represent actual daily quantity sold; dashed line shows projected demand
                </p>
              </div>
            </div>

            <ForecastChart
              historicalPoints={currentForecast.historicalPoints || []}
              forecastPoints={currentForecast.forecastPoints || []}
              height={340}
            />
          </div>
        </>
      )}

      {/* All Products Forecast Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Catalog Forecast Intelligence</h3>
            <p className="card-subtitle">Complete product-by-product predictive breakdown</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>7-Day Demand</th>
                <th>Suggested Restock</th>
                <th>Confidence</th>
                <th>Overstock Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allForecasts.map((f) => (
                <tr key={f.productId}>
                  <td style={{ fontWeight: 600 }}>{f.productName}</td>
                  <td>
                    <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                      {f.category}
                    </span>
                  </td>
                  <td>{f.currentStock} units</td>
                  <td style={{ fontWeight: 700 }}>{f.predictedDemand}</td>
                  <td style={{ fontWeight: 700, color: f.suggestedRestock > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {f.suggestedRestock > 0 ? `+${f.suggestedRestock}` : '0'}
                  </td>
                  <td>
                    <span className={`badge-confidence ${f.confidence?.toLowerCase()}`}>
                      {f.confidence}
                    </span>
                  </td>
                  <td>
                    {f.overstockRisk ? (
                      <span className="badge-risk">Overstock Risk</span>
                    ) : (
                      <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Normal</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleProductChange(f.productId.toString())}
                    >
                      View Curve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AiPrediction;
