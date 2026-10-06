import React from 'react';
import StockGauge from './StockGauge';
import { Fuel, RefreshCw, MapPin, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../../data/translations';

export default function FuelStationCard({ station, onDeleteStation, lang = 'km', userRole = 'user' }) {
  const isLow = station.current_stock_liters < station.reorder_threshold_liters;
  const t = translations[lang] || translations.km;

  const handleDelete = () => {
    const confirmMsg = t.confirmDeleteStation || 'Are you sure you want to delete this fuel station?';
    if (window.confirm(confirmMsg)) {
      onDeleteStation(station.id);
    }
  };

  return (
    <div className="card card-hover" style={{
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            background: isLow ? 'var(--danger-subtle)' : 'var(--fuel-subtle)',
            color: isLow ? 'var(--danger)' : 'var(--fuel-accent)',
            display: 'flex'
          }}>
            <Fuel size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{station.name || station.station_name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <MapPin size={12} /> {station.location || (lang === 'km' ? 'ទីតាំងរោងចក្រ' : 'Station Site')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={isLow ? 'badge badge-danger' : 'badge badge-success'}>
            {isLow ? t.reorderNeeded : t.normalStock}
          </span>
          {onDeleteStation && userRole === 'admin' && (
            <button
              onClick={handleDelete}
              title={t.deleteStation || 'Delete Station'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-subtle)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Gauge */}
      <StockGauge
        currentStock={station.current_stock_liters}
        targetCapacity={station.target_capacity_liters}
        threshold={station.reorder_threshold_liters}
        lang={lang}
      />

      {/* Footer Info */}
      <div style={{
        paddingTop: '10px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)'
      }}>
        <span>{t.lastRefill}: {station.last_refill || 'N/A'}</span>
        <Link to="/fuel" className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
          <RefreshCw size={12} />
          <span>{t.recordRefill}</span>
        </Link>
      </div>
    </div>
  );
}
