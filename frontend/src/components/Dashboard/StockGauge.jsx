import React from 'react';
import { translations } from '../../data/translations';

export default function StockGauge({ currentStock = 0, targetCapacity = 6000, threshold = 4000, lang = 'km' }) {
  const percentage = Math.min(100, Math.max(0, (currentStock / targetCapacity) * 100));
  const isLow = currentStock < threshold;
  const t = translations[lang] || translations.km;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.currentStockLevel}</span>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: isLow ? '#ef4444' : 'var(--text-main)' }}>
          {currentStock.toLocaleString()} L <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-dim)' }}>/ {targetCapacity.toLocaleString()} L</span>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{
        height: '8px',
        background: '#0b1120',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Progress Fill */}
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: isLow ? '#ef4444' : '#10b981',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease'
        }} />

        {/* 4000L Threshold Marker Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${(threshold / targetCapacity) * 100}%`,
          width: '2px',
          background: '#f59e0b',
          zIndex: 2
        }} title="Reorder Threshold (4,000 L)" />
      </div>

      {/* Track Markers Text */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        <span>0 L</span>
        <span style={{ color: isLow ? '#ef4444' : 'var(--text-dim)', fontWeight: isLow ? 700 : 500 }}>
          {threshold.toLocaleString()} L (Min)
        </span>
        <span>{targetCapacity.toLocaleString()} L (Max)</span>
      </div>
    </div>
  );
}
