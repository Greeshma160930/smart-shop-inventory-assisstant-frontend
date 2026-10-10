import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const StockLevelChart = ({ data = [], height = 300 }) => {
  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No stock data available</div>;
  }

  // Slice to max 8 items for readability if too many
  const chartData = data.slice(0, 8).map((p) => ({
    name: p.name.length > 14 ? p.name.substring(0, 12) + '...' : p.name,
    stock: p.stockQuantity !== undefined ? p.stockQuantity : p.currentStock,
    minStock: p.minStockLevel,
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '0.5rem' }} />
          <Bar dataKey="stock" name="Current Stock" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="minStock" name="Min Level" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockLevelChart;
