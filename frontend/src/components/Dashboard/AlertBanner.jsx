import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../../data/translations';

export default function AlertBanner({ lowStockStations = [], lang = 'km' }) {
  if (!lowStockStations || lowStockStations.length === 0) return null;
  const t = translations[lang] || translations.km;

  return (
    <div className="card" style={{
      padding: '14px 18px',
      background: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          padding: '8px',
          background: 'rgba(239, 68, 68, 0.15)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--danger)',
          display: 'flex',
          flexShrink: 0
        }}>
          <AlertTriangle size={18} />
        </div>
        <div>
          <h4 style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
            {t.alertTitle}
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '2px 0 0 0' }}>
            {t.alertDesc.replace('{count}', lowStockStations.length)} {' '}
            <strong style={{ color: 'var(--text-main)' }}>
              {lowStockStations.map(s => `${s.name || s.station_name} (${s.current_stock_liters} L)`).join(', ')}
            </strong>
          </p>
        </div>
      </div>

      <Link to="/fuel" className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
        <span>{t.reorderBtn}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
