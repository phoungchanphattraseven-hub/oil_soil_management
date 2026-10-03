import React, { useState } from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';
import AbbrCodeModal from './AbbrCodeModal';

export default function AbbrCodeSelector({
  value,
  onChange,
  abbrCodes = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  drivers = [],
  onAddDriver,
  onDeleteDriver,
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
            placeholder={lang === 'km' ? 'ឧ. 2A-8899' : 'e.g. 2A-8899'}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="form-control"
            style={{
              paddingRight: '32px',
              ...inputStyle
            }}
          />

          {/* Quick preset dropdown toggle */}
          {abbrCodes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              title="Select existing license plate"
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

        {/* Create new code button */}
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
            height: '37px'
          }}
          title={lang === 'km' ? 'បន្ថែមផ្លាកលេខ' : 'Add license plate'}
        >
          <Plus size={14} />
          <span>{lang === 'km' ? 'ផ្លាកលេខ' : 'New'}</span>
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
              {lang === 'km' ? 'ជ្រើសរើសផ្លាកលេខ' : 'Select License Plate'}
            </div>
            {abbrCodes.map(code => (
              <div
                key={code}
                onClick={() => {
                  onChange(code);
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
                  color: value === code ? 'var(--primary)' : 'var(--text-main)',
                  background: value === code ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = value === code ? 'var(--primary-subtle)' : 'transparent'}
              >
                <span style={{ fontWeight: 600 }}>{code}</span>
                {value === code && <Check size={14} color="var(--primary)" />}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Code Creation Modal */}
      <AbbrCodeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialTab="plates"
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
