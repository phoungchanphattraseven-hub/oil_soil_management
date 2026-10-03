import React, { useState } from 'react';
import { User, ChevronDown, Check, Car, Search } from 'lucide-react';

/**
 * StaffSelector — a smart dropdown to pick a staff member.
 * Auto-fills driver name + license plate when a staff is selected.
 */
export default function StaffSelector({
  staff = [],
  selectedStaffId,
  onSelectStaff,
  lang = 'km'
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const isKm = lang === 'km';

  const selectedMember = staff.find(s => s.id === selectedStaffId) || null;

  const filteredStaff = staff.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.license_plate?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.working_at?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (member) => {
    onSelectStaff(member);
    setShowDropdown(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelectStaff(null);
    setShowDropdown(false);
    setSearch('');
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Trigger button / display */}
      <div
        onClick={() => setShowDropdown(d => !d)}
        className="form-control"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', paddingRight: '10px',
          minHeight: '37px', userSelect: 'none'
        }}
      >
        {selectedMember ? (
          <>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'var(--primary-subtle)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 800, flexShrink: 0
            }}>
              {selectedMember.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedMember.name}
              </div>
              {selectedMember.license_plate && (
                <div style={{ fontSize: '0.7rem', color: 'var(--fuel-accent)', fontFamily: 'monospace', fontWeight: 700 }}>
                  {selectedMember.license_plate}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '2px', flexShrink: 0 }}
              title={isKm ? 'សម្អាត' : 'Clear'}
            >
              ×
            </button>
          </>
        ) : (
          <>
            <User size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', flex: 1 }}>
              {isKm ? 'ជ្រើសរើសបុគ្គលិក...' : 'Select staff member...'}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            onClick={() => setShowDropdown(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1050 }}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 1060, maxHeight: '260px', display: 'flex', flexDirection: 'column'
          }}>
            {/* Search input inside dropdown */}
            <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  autoFocus
                  type="text"
                  className="form-control"
                  placeholder={isKm ? 'ស្វែងរកឈ្មោះ, ផ្លាកលេខ...' : 'Search name, plate...'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ paddingLeft: '26px', height: '30px', fontSize: '0.77rem' }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
              {filteredStaff.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {isKm ? 'រកមិនឃើញ' : 'No results found'}
                </div>
              ) : filteredStaff.map(member => (
                <div
                  key={member.id}
                  onClick={() => handleSelect(member)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    background: selectedStaffId === member.id ? 'var(--primary-subtle)' : 'transparent',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if (selectedStaffId !== member.id) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = selectedStaffId === member.id ? 'var(--primary-subtle)' : 'transparent'; }}
                >
                  {/* Avatar */}
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: selectedStaffId === member.id ? 'var(--primary)' : 'var(--surface-hover)',
                      color: selectedStaffId === member.id ? '#fff' : 'var(--text-sub)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 800, flexShrink: 0
                    }}>
                      {member.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-main)' }}>
                      {member.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '1px' }}>
                      {member.license_plate && (
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--fuel-accent)', background: 'var(--fuel-subtle)', padding: '1px 5px', borderRadius: 'var(--radius-xs)' }}>
                          {member.license_plate}
                        </span>
                      )}
                      {member.role && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedStaffId === member.id && <Check size={14} color="var(--primary)" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
