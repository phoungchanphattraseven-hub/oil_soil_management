import React, { useState } from 'react';
import SoilLogForm from '../components/Soil/SoilLogForm';
import SoilLogTable from '../components/Soil/SoilLogTable';
import AbbrCodeModal from '../components/Common/AbbrCodeModal';
import { HardHat, Box, Truck, DollarSign, Tag } from 'lucide-react';
import { translations } from '../data/translations';

export default function SoilManagement({ soilLogs = [], abbrCodes = [], onAddAbbrCode, onAddSoilLog, onDeleteSoilLog, onEditSoilLog, lang = 'km' }) {
  const [showCodeModal, setShowCodeModal] = useState(false);

  const totalVolume = soilLogs.reduce((sum, s) => sum + (s.total_cubic_meters || 0), 0);
  const totalTrips = soilLogs.reduce((sum, s) => sum + (s.trip_count || 0), 0);
  const totalScrap = soilLogs.reduce((sum, s) => sum + (s.scrap_sales_amount || 0), 0);

  const t = translations[lang] || translations.km;

  return (
    <div className="page-wrapper">
      {/* Title & Actions */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span style={{ color: 'var(--soil-accent)', display: 'flex' }}><HardHat size={22} /></span>
            <span>{t.soilPageTitle}</span>
          </h1>
          <p style={{ fontSize: '0.8125rem' }}>{t.soilPageSub}</p>
        </div>

        <div>
          <button onClick={() => setShowCodeModal(true)} className="btn btn-secondary">
            <Tag size={15} />
            <span>{t.manageCodes || 'Manage Plates'}</span>
          </button>
        </div>
      </div>

      {/* Operational Stats Summary */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'var(--soil-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--soil-accent)', display: 'flex' }}>
              <Box size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.totalSoilVolumeStat}</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--soil-accent)', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {totalVolume.toLocaleString()} m³
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--primary)', display: 'flex' }}>
              <Truck size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.totalTripsStat}</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {totalTrips.toLocaleString()} {t.tripsUnit}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(251, 191, 36, 0.12)', borderRadius: 'var(--radius-xs)', color: '#fbbf24', display: 'flex' }}>
              <DollarSign size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.totalScrapStat}</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.02em', marginTop: '2px' }}>
                ${totalScrap.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Soil Log Form */}
      <SoilLogForm onAddSoilLog={onAddSoilLog} abbrCodes={abbrCodes} onAddAbbrCode={onAddAbbrCode} lang={lang} />

      {/* Soil Log Table */}
      <SoilLogTable logs={soilLogs} onDelete={onDeleteSoilLog} onEdit={onEditSoilLog} abbrCodes={abbrCodes} onAddAbbrCode={onAddAbbrCode} lang={lang} />

      {/* Abbreviation Code Modal */}
      <AbbrCodeModal open={showCodeModal} onClose={() => setShowCodeModal(false)} abbrCodes={abbrCodes} onAddAbbrCode={onAddAbbrCode} lang={lang} />
    </div>
  );
}
