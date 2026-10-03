import React, { useState } from 'react';
import { Fuel, MapPin, X, Check, Droplets } from 'lucide-react';
import { translations } from '../../data/translations';

export default function AddStationModal({ open, onClose, onAddStation, lang = 'km' }) {
  const [stationName, setStationName] = useState('');
  const [location, setLocation] = useState('');
  const [initialStock, setInitialStock] = useState('6000');
  const [successMsg, setSuccessMsg] = useState(false);
  const t = translations[lang] || translations.km;

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationName.trim()) return;

    const newStation = {
      id: `st-fuel-${Date.now()}`,
      name: stationName,
      location: location || (lang === 'km' ? 'ទីតាំងរោងចក្រ' : 'Station Site'),
      current_stock_liters: parseFloat(initialStock) || 6000,
      target_capacity_liters: 6000,
      reorder_threshold_liters: 4000,
      last_refill: 'N/A',
      status: (parseFloat(initialStock) || 6000) < 4000 ? 'Reorder Needed' : 'Normal',
      code: `ST-FL-${Math.floor(100 + Math.random() * 900)}`
    };

    onAddStation(newStation);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setStationName('');
      setLocation('');
      setInitialStock('6000');
      onClose();
    }, 1200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1200, padding: '16px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div className="card" style={{
        width: '100%', maxWidth: '520px',
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '8px',
              background: 'var(--fuel-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--fuel-accent)',
              display: 'flex'
            }}>
              <Fuel size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
                {lang === 'km' ? 'បង្កើតស្ថានីយ៍សាំងថ្មី' : 'Create Fuel Station'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {lang === 'km' ? 'បញ្ចូលព័ត៌មានស្ថានីយ៍សាំងថ្មី' : 'Enter new fuel station details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              padding: '6px', cursor: 'pointer', color: 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)', transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Station Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fuel size={14} color="var(--fuel-accent)" />
                {lang === 'km' ? 'ឈ្មោះស្ថានីយ៍' : 'Station Name'}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={lang === 'km' ? 'ឧ. ស្ថានីយ៍សាំង ភ្នំពេញ (Station A)' : 'e.g. Fuel Station Phnom Penh'}
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Location */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--text-muted)" />
                {lang === 'km' ? 'ទីតាំង' : 'Location'}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={lang === 'km' ? 'ឧ. ផ្លូវជាតិលេខ ៤' : 'e.g. National Road No. 4'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Initial Stock */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={14} color="var(--fuel-accent)" />
                {lang === 'km' ? 'ស្តុកដំបូង (L)' : 'Initial Stock (Liters)'}
              </label>
              <input
                type="number"
                className="form-control"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                min="0"
                step="100"
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {lang === 'km' ? 'កម្រិតស្តុកគោលដៅ: 6,000L / កម្រិតព្រមានទាប: 4,000L' : 'Target capacity: 6,000L / Reorder threshold: 4,000L'}
              </div>
            </div>

            {/* Success Message */}
            {successMsg && (
              <div style={{
                fontSize: '0.8rem', color: 'var(--success)',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', background: 'var(--success-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <Check size={16} />
                {lang === 'km' ? 'បានបង្កើតស្ថានីយ៍ជោគជ័យ!' : 'Station created successfully!'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'flex-end', gap: '8px'
          }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
              {lang === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-fuel" style={{ padding: '8px 18px' }}>
              <Fuel size={14} />
              <span>{lang === 'km' ? 'រក្សាទុកស្ថានីយ៍' : 'Save Station'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
