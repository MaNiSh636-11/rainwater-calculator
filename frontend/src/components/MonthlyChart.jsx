import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function MonthlyChart({ monthlyData, isEstimated }) {
  if (!monthlyData || monthlyData.length === 0) return null;

  const chartData = monthlyData.map((d) => ({
    name: d.month,
    rainfall: d.rainfall_mm,
    collectable: d.collectable_litres,
    gross: d.gross_litres,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rainfallItem = payload.find((p) => p.dataKey === 'rainfall');
      const collectableItem = payload.find((p) => p.dataKey === 'collectable');
      const grossItem = payload.find((p) => p.dataKey === 'gross');

      const rainfallVal = rainfallItem ? Number(rainfallItem.value) : 0;
      const collectableVal = collectableItem ? Number(collectableItem.value) : 0;
      const grossVal = grossItem ? Number(grossItem.value) : null;

      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#38bdf8' }}>{label}</div>
          <div style={{ marginBottom: 4, color: '#38bdf8' }}>
            🌧️ Rainfall:{' '}
            <span style={{ fontWeight: 600 }}>{rainfallVal.toLocaleString()} mm</span>
          </div>
          <div style={{ marginBottom: 4, color: '#34d399' }}>
            💧 Harvested Water:{' '}
            <span style={{ fontWeight: 600 }}>{collectableVal.toLocaleString()} Litres</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, marginLeft: 4 }}>
              ({(collectableVal / 1000).toFixed(2)} m³)
            </span>
          </div>
          {grossVal !== null && (
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              Roof Gross: {grossVal.toLocaleString()} Litres
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Monthly Rainfall & Water Harvest</h3>
          <p className="chart-subtitle">
            {isEstimated
              ? 'Estimated uniform distribution (monthly actuals not specified)'
              : 'Computed directly from 12-month precipitation input'}
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#0d9488"
              fontSize={12}
              tickLine={false}
              label={{
                value: 'Harvest (Litres)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#0d9488', fontSize: 11, fontWeight: 600 },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#0284c7"
              fontSize={12}
              tickLine={false}
              label={{
                value: 'Rainfall (mm)',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#0284c7', fontSize: 11, fontWeight: 600 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
            <Bar
              yAxisId="left"
              dataKey="collectable"
              name="Harvested Water (L)"
              fill="#0d9488"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rainfall"
              name="Rainfall (mm)"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0284c7' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
