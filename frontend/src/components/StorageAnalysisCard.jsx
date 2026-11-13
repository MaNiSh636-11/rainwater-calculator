import React from 'react';
import { Cylinder, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function StorageAnalysisCard({ storageAnalysis, annualCollectableLitres }) {
  if (!storageAnalysis) return null;

  const recLitres = storageAnalysis.recommended_capacity_litres || 0;
  const userTank = storageAnalysis.user_tank_capacity_litres;
  const overflow = storageAnalysis.estimated_annual_overflow_litres;
  const coverageDays = storageAnalysis.storage_coverage_days;

  return (
    <div className="panel-card" style={{ marginBottom: 24 }}>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div className="panel-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Cylinder size={18} />
          </div>
          <div>
            <h3 className="panel-title">Storage Tank Sizing & Overflow Analysis</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Optimized balancing of tank capital cost versus seasonal storage retention
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Recommended Capacity */}
        <div style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
            Recommended Tank Size
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {recLitres.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
              Litres ({storageAnalysis.recommended_capacity_m3} m³)
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.8rem', color: '#334155' }}>
            <Info size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{storageAnalysis.recommendation_basis}</span>
          </div>
        </div>

        {/* User Tank Status */}
        <div style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
            Site Storage Capacity
          </div>
          {userTank !== null && userTank !== undefined ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                  {Number(userTank).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
                  Litres ({(Number(userTank) / 1000).toFixed(1)} m³)
                </span>
              </div>

              {overflow !== null && overflow !== undefined && (
                <div style={{ fontSize: '0.8rem', marginTop: 8 }}>
                  {overflow > 0 ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#b45309' }}>
                      <AlertTriangle size={15} />
                      <span>
                        Estimated <strong>{Number(overflow).toLocaleString()} L</strong> annual overflow during peak monsoon months.
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#15803d' }}>
                      <CheckCircle size={15} />
                      <span>Adequate volume: 100% of harvest retained without overflow.</span>
                    </div>
                  )}
                </div>
              )}

              {coverageDays && (
                <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#0369a1' }}>
                  Provides approximately <strong>{coverageDays} days</strong> of continuous autonomous supply at specified demand.
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem', paddingTop: 6 }}>
              No tank capacity specified. Enter your existing or planned tank volume in the form to simulate overflow and autonomy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
