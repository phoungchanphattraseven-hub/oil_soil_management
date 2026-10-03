import React from 'react';
import { HardHat, Truck, Box, DollarSign, UserCheck, AlertCircle } from 'lucide-react';
import { translations } from '../../data/translations';

export default function SoilStationCard({ soilLog, lang = 'km' }) {
  const t = translations[lang] || translations.km;

  return (
    <div className="card card-hover" style={{
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--soil-subtle)',
            color: 'var(--soil-accent)',
            display: 'flex'
          }}>
            <HardHat size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{soilLog.station_name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
              {soilLog.log_date} ({soilLog.time_start?.substring(0, 5)} - {soilLog.time_end?.substring(0, 5)})
            </span>
          </div>
        </div>
        <span className="badge badge-info">
          {soilLog.code_abbr || 'SL-N/A'}
        </span>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        background: 'var(--surface-input)',
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
            <Truck size={12} /> {t.tripsCount}
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
            {soilLog.trip_count} {t.tripsUnit}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
            <Box size={12} /> {t.totalVolumeLabel}
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--soil-accent)', marginTop: '2px' }}>
            {soilLog.total_cubic_meters} m³
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
            <DollarSign size={12} /> {t.scrapSalesLabel}
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
            ${soilLog.scrap_sales_amount}
          </div>
        </div>
      </div>

      {/* Staff Decisions */}
      {soilLog.staff_decisions && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.06)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}>
            <UserCheck size={13} />
            <span>{t.staffDecisionLabel}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
            {soilLog.staff_decisions}
          </p>
        </div>
      )}

      {/* Operational Issues if any */}
      {soilLog.issues_description && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#fca5a5' }}>
          <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span><strong>{t.issuesLabel}</strong> {soilLog.issues_description}</span>
        </div>
      )}
    </div>
  );
}
