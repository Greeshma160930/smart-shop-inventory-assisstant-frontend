import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const ForecastChart = ({ historicalPoints = [], forecastPoints = [], height = 340 }) => {
  // Combine historical points and forecast points into a continuous timeline
  const combined = [];

  // Take the last 14 historical points for clean visualization
  const recentHistory = historicalPoints.slice(-14);

  recentHistory.forEach((pt) => {
    combined.push({
      date: pt.date,
      historical: pt.quantity,
      predicted: null,
    });
  });

  // Connect the last historical point with the first forecast point
  if (recentHistory.length > 0 && forecastPoints.length > 0) {
    const lastHist = recentHistory[recentHistory.length - 1];
    // Add point where historical and forecast meet
    combined[combined.length - 1].predicted = lastHist.quantity;
  }

  forecastPoints.forEach((pt) => {
    combined.push({
      date: pt.date,
      historical: null,
      predicted: pt.predictedQuantity,
    });
  });

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combined} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
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

          {/* Historical Actual Sales */}
          <Bar
            dataKey="historical"
            name="Actual Daily Sales"
            fill="#3B82F6"
            opacity={0.7}
            radius={[4, 4, 0, 0]}
          />

          {/* AI Predicted Demand Horizon */}
          <Line
            type="monotone"
            dataKey="predicted"
            name="AI Forecast (Next 7 Days)"
            stroke="#10B981"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
