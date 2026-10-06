import React, { useState } from 'react';
import { Tag, User, Plus, Trash2, X, Check, Car } from 'lucide-react';
import { translations } from '../../data/translations';

export default function AbbrCodeModal({
  open,
  onClose,
  abbrCodes = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  drivers = [],
  onAddDriver,
  onDeleteDriver,
  initialTab = 'plates',
  lang = 'km'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [newCode, setNewCode] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = translations[lang] || translations.km;

  if (!open) return null;

  const handleAddPlateSubmit = (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    if (onAddAbbrCode) onAddAbbrCode(newCode);
    setNewCode('');
    setSuccessMsg(lang === 'km' ? 'បានបន្ថែមផ្លាកលេខជោគជ័យ!' : 'License plate added!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleAddDriverSubmit = (e) => {
    e.preventDefault();
    if (!newDriver.trim()) return;
    if (onAddDriver) onAddDriver(newDriver);
    setNewDriver('');
    setSuccessMsg(lang === 'km' ? 'បានបន្ថែមឈ្មោះអ្នកបើកបរជោគជ័យ!' : 'Driver name added!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="modal-overlay"
    >
      <div className="card modal-box" style={{
        maxWidth: '520px',
        boxShadow: 'var(--shadow-modal)'
      }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--fuel-subtle)', color: 'var(--fuel-accent)' }}>
              <Tag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>
                {lang === 'km' ? 'គ្រប់គ្រង ផ្លាកលេខ និង អ្នកបើកបរ' : 'Manage License Plates & Drivers'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {lang === 'km' ? 'បន្ថែម ឬ លុប ផ្លាកលេខ និង ឈ្មោះអ្នកបើកបរ' : 'Add or delete license plates & driver names'}
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

        {/* Tab Selector */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255,255,255,0.02)',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTab('plates')}
            style={{
              flex: 1, padding: '10px 14px', border: 'none', background: 'transparent',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              color: activeTab === 'plates' ? 'var(--fuel-accent)' : 'var(--text-muted)',
              borderBottom: activeTab === 'plates' ? '2px solid var(--fuel-accent)' : '2px solid transparent'
            }}
          >
            <Car size={15} />
            <span>{lang === 'km' ? 'ផ្លាកលេខរថយន្ត' : 'License Plates'} ({abbrCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            style={{
              flex: 1, padding: '10px 14px', border: 'none', background: 'transparent',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              color: activeTab === 'drivers' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'drivers' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            <User size={15} />
            <span>{lang === 'km' ? 'អ្នកបើកបរ' : 'Drivers'} ({drivers.length})</span>
          </button>
        </div>

        <div className="modal-content-scrollable" style={{
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: 0,
          padding: '20px'
        }}>
          {/* Success Banner */}
          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '14px', fontSize: '0.78rem' }}>
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: License Plates */}
          {activeTab === 'plates' && (
            <div>
              <form onSubmit={handleAddPlateSubmit} style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                  {lang === 'km' ? 'បន្ថែមផ្លាកលេខថ្មី' : 'Add New License Plate'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder={lang === 'km' ? 'ឧ. 2A-8899' : 'e.g. 2A-8899'}
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="form-control"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-fuel"
                    style={{ padding: '8px 16px', flexShrink: 0 }}
                  >
                    <Plus size={15} />
                    <span>{lang === 'km' ? 'បន្ថែម' : 'Add'}</span>
                  </button>
                </div>
              </form>

              <div>
                <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {lang === 'km' ? 'ផ្លាកលេខដែលមានស្រាប់' : 'Registered License Plates'} ({abbrCodes.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
                  {abbrCodes.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      {lang === 'km' ? 'មិនទាន់មានផ្លាកលេខនៅឡើយ' : 'No license plates registered'}
                    </div>
                  ) : abbrCodes.map(code => (
                    <div
                      key={code}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'var(--fuel-subtle)', border: '1px solid var(--fuel-border)',
                        color: 'var(--fuel-accent)', padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem', fontWeight: 700
                      }}
                    >
                      <span>{code}</span>
                      {onDeleteAbbrCode && (
                        <button
                          type="button"
                          onClick={() => onDeleteAbbrCode(code)}
                          title={lang === 'km' ? 'លុបផ្លាកលេខ' : 'Delete plate'}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--danger)', display: 'flex', alignItems: 'center', padding: '1px'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Driver Names */}
          {activeTab === 'drivers' && (
            <div>
              <form onSubmit={handleAddDriverSubmit} style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                  {lang === 'km' ? 'បន្ថែមឈ្មោះអ្នកបើកបរថ្មី' : 'Add New Driver Name'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder={lang === 'km' ? 'ឧ. សុខ ជា' : 'e.g. Sok Chea'}
                    value={newDriver}
                    onChange={e => setNewDriver(e.target.value)}
                    className="form-control"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', flexShrink: 0 }}
                  >
                    <Plus size={15} />
                    <span>{lang === 'km' ? 'បន្ថែម' : 'Add'}</span>
                  </button>
                </div>
              </form>

              <div>
                <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {lang === 'km' ? 'អ្នកបើកបរដែលមានស្រាប់' : 'Registered Drivers'} ({drivers.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
                  {drivers.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      {lang === 'km' ? 'មិនទាន់មានឈ្មោះអ្នកបើកបរនៅឡើយ' : 'No drivers registered'}
                    </div>
                  ) : drivers.map(dName => (
                    <div
                      key={dName}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)',
                        color: 'var(--primary)', padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem', fontWeight: 600
                      }}
                    >
                      <span>{dName}</span>
                      {onDeleteDriver && (
                        <button
                          type="button"
                          onClick={() => onDeleteDriver(dName)}
                          title={lang === 'km' ? 'លុបឈ្មោះអ្នកបើកបរ' : 'Delete driver'}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--danger)', display: 'flex', alignItems: 'center', padding: '1px'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '7px 18px' }}
          >
            {lang === 'km' ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
