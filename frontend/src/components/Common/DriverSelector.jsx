import React, { useState } from 'react';
import { Plus, ChevronDown, Check, User } from 'lucide-react';
import AbbrCodeModal from './AbbrCodeModal';

export default function DriverSelector({
  value,
  onChange,
  drivers = [],
  onAddDriver,
  onDeleteDriver,
  abbrCodes = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  lang = 'km',
  inputStyle = {}
}) {
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={lang === 'km' ? 'ឧ. សុខ ជា' : 'e.g. Sok Chea'}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="form-control"
            style={{
              paddingRight: '32px',
              ...inputStyle
            }}
          />

          {/* Preset dropdown toggle */}
          {drivers.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              title="Select existing driver"
              style={{
                position: 'absolute',
                right: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <ChevronDown size={15} />
            </button>
          )}
        </div>

        {/* Manage Drivers button */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn btn-secondary"
          style={{
            padding: '7px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--primary)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            height: '37px',
            flexShrink: 0
          }}
          title={lang === 'km' ? 'គ្រប់គ្រងអ្នកបើកបរ' : 'Manage drivers'}
        >
          <User size={14} />
          <span>{lang === 'km' ? 'អ្នកបើកបរ' : 'Drivers'}</span>
        </button>
      </div>

      {/* Preset Dropdown Menu */}
      {showDropdown && (
        <>
          <div
            onClick={() => setShowDropdown(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 1060,
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '4px'
          }}>
            <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              {lang === 'km' ? 'ជ្រើសរើសឈ្មោះអ្នកបើកបរ' : 'Select Driver Name'}
            </div>
            {drivers.map(dName => (
              <div
                key={dName}
                onClick={() => {
                  onChange(dName);
                  setShowDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: value === dName ? 'var(--primary)' : 'var(--text-main)',
                  background: value === dName ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = value === dName ? 'var(--primary-subtle)' : 'transparent'}
              >
                <span style={{ fontWeight: 500 }}>{dName}</span>
                {value === dName && <Check size={14} color="var(--primary)" />}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Creation/Management Modal */}
      <AbbrCodeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialTab="drivers"
        abbrCodes={abbrCodes}
        onAddAbbrCode={onAddAbbrCode}
        onDeleteAbbrCode={onDeleteAbbrCode}
        drivers={drivers}
        onAddDriver={onAddDriver}
        onDeleteDriver={onDeleteDriver}
        lang={lang}
      />
    </div>
  );
}
