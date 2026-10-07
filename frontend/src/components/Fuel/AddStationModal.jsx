import React, { useEffect, useState } from 'react';
import { Fuel, MapPin, X, Check, Droplets } from 'lucide-react';
import { translations } from '../../data/translations';

export default function AddStationModal({ open, onClose, onAddStation, onEditStation, station = null, lang = 'km' }) {
  const [stationName, setStationName] = useState('');
  const [location, setLocation] = useState('');
  const [initialStock, setInitialStock] = useState('6000');
  const [targetCapacity, setTargetCapacity] = useState('6000');
  const [reorderThreshold, setReorderThreshold] = useState('4000');
  const [successMsg, setSuccessMsg] = useState(false);
  const t = translations[lang] || translations.km;

  useEffect(() => {
    if (!open) return;
    setStationName(station?.name || station?.station_name || '');
    setLocation(station?.location || '');
    setInitialStock(String(station?.current_stock_liters ?? 6000));
    setTargetCapacity(String(station?.target_capacity_liters ?? 6000));
    setReorderThreshold(String(station?.reorder_threshold_liters ?? 4000));
    setSuccessMsg(false);
  }, [open, station]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationName.trim()) return;

    const newStation = {
      id: station?.id || `st-fuel-${Date.now()}`,
      name: stationName,
      location: location || (lang === 'km' ? 'ទីតាំងរោងចក្រ' : 'Station Site'),
      current_stock_liters: parseFloat(initialStock) || 6000,
      target_capacity_liters: parseFloat(targetCapacity) || 6000,
      reorder_threshold_liters: parseFloat(reorderThreshold) || 4000,
      last_refill: 'N/A',
      status: (parseFloat(initialStock) || 6000) < 4000 ? 'Reorder Needed' : 'Normal',
      code: `ST-FL-${Math.floor(100 + Math.random() * 900)}`
    };

    if (station) onEditStation(newStation);
    else onAddStation(newStation);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setStationName('');
      setLocation('');
      setInitialStock('6000');
      setTargetCapacity('6000');
      setReorderThreshold('4000');
      onClose();
    }, 1200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="modal-overlay"
    >
      <div className="card modal-box" style={{
        maxWidth: '520px',
        boxShadow: 'var(--shadow-modal)',
        animation: 'slideUp 0.25s ease'
      }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{
              background: 'var(--fuel-subtle)',
              color: 'var(--fuel-accent)'
            }}>
              <Fuel size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
                {station ? (lang === 'km' ? 'កែប្រែស្ថានីយ៍សាំង' : 'Edit Fuel Station') : (lang === 'km' ? 'បង្កើតស្ថានីយ៍សាំងថ្មី' : 'Create Fuel Station')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {station ? (lang === 'km' ? 'កែប្រែព័ត៌មាន និងកម្រិតស្តុក' : 'Update station details and fuel levels') : (lang === 'km' ? 'បញ្ចូលព័ត៌មានស្ថានីយ៍សាំងថ្មី' : 'Enter new fuel station details')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                {lang === 'km' ? 'ស្តុកប្រេងបច្ចុប្បន្ន (L)' : 'Current Fuel Stock (Liters)'}
              </label>
              <input
                type="number"
                className="form-control"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                min="0"
                step="any"
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {lang === 'km' ? 'កែប្រែស្តុកដោយប្រុងប្រយ័ត្ន ព្រោះវាប៉ះពាល់ដល់របាយការណ៍សាំង។' : 'Change stock carefully; it affects fuel reports.'}
              </div>
            </div>

            <div className="grid-form-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{lang === 'km' ? 'សមត្ថភាពធុង (L)' : 'Tank Capacity (L)'}</label>
                <input type="number" className="form-control" value={targetCapacity} onChange={e => setTargetCapacity(e.target.value)} min="0" step="any" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{lang === 'km' ? 'កម្រិតព្រមានទាប (L)' : 'Low-stock Alert (L)'}</label>
                <input type="number" className="form-control" value={reorderThreshold} onChange={e => setReorderThreshold(e.target.value)} min="0" step="any" />
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
                {station ? (lang === 'km' ? 'បានកែប្រែស្ថានីយ៍ជោគជ័យ!' : 'Station updated successfully!') : (lang === 'km' ? 'បានបង្កើតស្ថានីយ៍ជោគជ័យ!' : 'Station created successfully!')}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
              {lang === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-fuel" style={{ padding: '8px 18px' }}>
              <Fuel size={14} />
              <span>{station ? (lang === 'km' ? 'រក្សាទុកការកែប្រែ' : 'Save Changes') : (lang === 'km' ? 'រក្សាទុកស្ថានីយ៍' : 'Save Station')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
