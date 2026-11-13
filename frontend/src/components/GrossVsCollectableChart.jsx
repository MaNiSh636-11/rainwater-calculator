import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#059669', '#f59e0b'];

export default function GrossVsCollectableChart({ grossLitres, collectableLitres }) {
  const lostLitres = Math.max(0, grossLitres - collectableLitres);
  const collectablePct = grossLitres > 0 ? ((collectableLitres / grossLitres) * 100).toFixed(1) : 0;
  const lostPct = grossLitres > 0 ? (100 - collectablePct).toFixed(1) : 0;

  const data = [
    { name: 'Collectable Rainwater', value: Math.round(collectableLitres), percent: collectablePct },
    { name: 'Runoff / Absorption Loss', value: Math.round(lostLitres), percent: lostPct },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
          <div>Volume: {item.value.toLocaleString()} Litres ({item.percent}%)</div>
          <div>Equivalent: {(item.value / 1000).toFixed(2)} m³ (kL)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Gross vs. Net Collectable Water</h3>
          <p className="chart-subtitle">
            Gross Catchment: {(grossLitres / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³ | Harvested: {(collectableLitres / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
