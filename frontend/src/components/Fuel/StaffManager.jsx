import React, { useState, useMemo } from 'react';
import {
  User, Plus, Trash2, Search, Pencil, X, Check, Car, Fuel,
  Phone, Briefcase, MapPin, ChevronDown, Users,
  CheckCircle2, UserPlus, Camera, ShieldCheck, Sparkles, LayoutGrid, List, Eye, Maximize2
} from 'lucide-react';
import ImageUploader from '../Common/ImageUploader';
import SignatureScannerModal from '../Common/SignatureScannerModal';

const GENDER_OPTIONS = {
  km: ['ប្រុស', 'ស្រី', 'មិនបញ្ជាក់'],
  en: ['Male', 'Female', 'Other']
};

const ROLE_OPTIONS = {
  km: [
    'ឡានចាក់ដី',
    'បុគ្គលិកប្រតិបត្តិការ',
    'អ្នកគ្រប់គ្រងស្ថានីយ៍',
    'ជំនួយការ',
    'អ្នកបើកអ៊ិចស្កាវ៉ាទ័រ',
    'អ្នកបើកអាប៊ុល',
    'អ្នកបើកឡានកិនដី',
    'សន្តិសុខ',
    'ផ្សេងៗ',
  ],
  en: [
    'Dump Truck Driver (ឡានចាក់ដី)',
    'Operations Staff',
    'Station Manager',
    'Assistant',
    'Excavator Operator (អ៊ិចស្កាវ៉ាទ័រ / ឡានកាយ)',
    'Bulldozer Operator (អាប៊ុល / ឡានឈូសដី)',
    'Road Roller Operator (ឡានកិនដី / រ៉ូឡូ)',
    'Security Guard (សន្តិសុខ)',
    'Other',
  ]
};

const CUSTOM_POSITIONS_STORAGE_KEY = 'app_custom_staff_positions';

function getCustomPositions() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_POSITIONS_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function StaffCard({ staff, lang, onView, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId }) {
  const isKm = lang === 'km';
  const initials = staff.name
    ? staff.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="card" style={{ padding: '16px', position: 'relative', transition: 'var(--transition-fast)' }}>
      {/* Delete confirm overlay */}
      {confirmDeleteId === staff.id && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: 'rgba(var(--danger-rgb, 239,68,68), 0.08)',
          border: '1.5px solid var(--danger-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5, gap: '10px', backdropFilter: 'blur(2px)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
            {isKm ? 'លុបបុគ្គលិកនេះ?' : 'Delete this staff?'}
          </span>
          <button
            onClick={() => onDelete(staff.id)}
            className="btn btn-sm"
            style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '4px 12px' }}
          >
            <Check size={13} /> {isKm ? 'លុប' : 'Yes'}
          </button>
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="btn btn-ghost btn-sm"
          >
            <X size={13} /> {isKm ? 'ទេ' : 'No'}
          </button>
        </div>
      )}

      {/* Header: Avatar + Name + Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        {staff.photo_url ? (
          <img
            src={staff.photo_url}
            alt={staff.name}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-subtle)' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--primary-subtle)', color: 'var(--primary)',
          display: staff.photo_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.9rem', border: '2px solid var(--primary-border)'
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {staff.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
            {staff.role || (isKm ? 'បុគ្គលិក' : 'Staff')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={() => onView(staff)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--text-sub)' }}
            title={isKm ? 'មើលព័ត៌មានលម្អិត' : 'View profile'}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit(staff)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--primary)' }}
            title={isKm ? 'កែប្រែ' : 'Edit'}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setConfirmDeleteId(staff.id)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 6px', color: 'var(--danger)' }}
            title={isKm ? 'លុប' : 'Delete'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Info Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {staff.staff_id && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-sub)' }}>
              {isKm ? 'លេខសម្គាល់៖' : 'Staff ID:'} {staff.staff_id}
            </span>
          </div>
        )}
        {staff.license_plate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Car size={12} style={{ color: 'var(--fuel-accent)', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem',
              color: 'var(--fuel-accent)', background: 'var(--fuel-subtle)',
              padding: '1px 7px', borderRadius: 'var(--r-xs)', letterSpacing: '0.5px'
            }}>{staff.license_plate}</span>
          </div>
        )}
        {staff.working_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{staff.working_at}</span>
          </div>
        )}
        {staff.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{staff.phone}</span>
          </div>
        )}
        {staff.gender && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{staff.gender}</span>
          </div>
        )}
        
        {/* Signature Preview / Scan Action */}
        <div style={{
          marginTop: '8px', paddingTop: '8px',
          borderTop: '1px dashed var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {staff.signature_url ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                background: '#fff', borderRadius: '4px', padding: '2px 6px',
                border: '1px solid var(--border-subtle)', height: '24px', display: 'flex', alignItems: 'center'
              }}>
                <img src={staff.signature_url} alt="Signature" style={{ maxHeight: '20px', maxWidth: '80px', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <CheckCircle2 size={12} /> {isKm ? 'បានស្កេន' : 'Signed'}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {isKm ? 'គ្មានហត្ថលេខា' : 'No signature'}
            </span>
          )}

          <button
            type="button"
            onClick={() => onScanSign(staff)}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '2px 8px', fontSize: '0.72rem', color: 'var(--primary)',
              background: 'var(--primary-subtle)', borderRadius: 'var(--r-xs)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <ShieldCheck size={12} />
            {staff.signature_url ? (isKm ? 'ស្កេនថ្មី' : 'Rescan') : (isKm ? 'ស្កេន' : 'Scan')}
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffProfileModal({ staff, fuelLogs = [], lang, onClose }) {
  const [preview, setPreview] = useState(null);
  if (!staff) return null;
  const isKm = lang === 'km';
  const initials = staff.name?.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'ST';
  const fields = [
    { label: isKm ? 'លេខសម្គាល់បុគ្គលិក' : 'Staff ID', value: staff.staff_id },
    { label: isKm ? 'តួនាទី' : 'Position', value: staff.role },
    { label: isKm ? 'ស្ថានីយ៍ / កន្លែងធ្វើការ' : 'Station / Work Location', value: staff.working_at || staff.station_name },
    { label: isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number', value: staff.phone },
    { label: isKm ? 'ភេទ' : 'Gender', value: staff.gender },
    { label: isKm ? 'ផ្លាកលេខឡាន' : 'License Plate', value: staff.license_plate },
  ];
  const normalizedPlate = staff.license_plate?.trim().toUpperCase();
  const vehicleFuelLogs = normalizedPlate
    ? fuelLogs
      .filter(log => log.license_plate?.trim().toUpperCase() === normalizedPlate)
      .sort((a, b) => new Date(b.time_in || 0) - new Date(a.time_in || 0))
    : [];
  const totalFuelUsed = vehicleFuelLogs.reduce((sum, log) => sum + (parseFloat(log.refill_liters) || 0), 0);
  const recentFuelLogs = vehicleFuelLogs.slice(0, 3);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card modal-box" style={{ maxWidth: '510px' }} role="dialog" aria-modal="true" aria-label={isKm ? 'ព័ត៌មានលម្អិតបុគ្គលិក' : 'Staff profile details'}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}><User size={18} /></div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>{isKm ? 'ព័ត៌មានលម្អិតបុគ្គលិក' : 'Staff Profile'}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{isKm ? 'ព័ត៌មានទំនាក់ទំនង និងការងារ' : 'Contact and work details'}</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={isKm ? 'បិទ' : 'Close'}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '12px', background: 'var(--primary-subtle)', borderRadius: 'var(--r-sm)' }}>
            {staff.photo_url ? (
              <button
                type="button"
                className="staff-image-preview-trigger"
                onClick={() => setPreview({ src: staff.photo_url, alt: staff.name, label: isKm ? 'រូបថតបុគ្គលិក' : 'Staff photo', round: true })}
                title={isKm ? 'ចុចដើម្បីមើលរូបធំ' : 'Click to view full-size image'}
                aria-label={isKm ? 'មើលរូបថតបុគ្គលិកធំ' : 'View staff photo in full size'}
              >
                <img src={staff.photo_url} alt={staff.name} />
                <span><Maximize2 size={16} /></span>
              </button>
            ) : (
              <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 800 }}>{initials}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{staff.name}</div>
              <div style={{ marginTop: '3px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>{staff.role || (isKm ? 'មិនកំណត់តួនាទី' : 'No position assigned')}</div>
            </div>
          </div>
          <div className="grid-form-2" style={{ gap: '10px' }}>
            {fields.map(field => (
              <div key={field.label} style={{ padding: '10px 11px', border: '1px solid var(--border-subtle)', background: 'var(--surface-subtle)', borderRadius: 'var(--r-xs)', minWidth: 0 }}>
                <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '3px' }}>{field.label}</div>
                <div style={{ fontSize: '0.82rem', color: field.value ? 'var(--text-main)' : 'var(--text-muted)', fontFamily: field.label.includes('ID') || field.label.includes('ផ្លាក') ? 'monospace' : 'inherit', overflowWrap: 'anywhere' }}>{field.value || '—'}</div>
              </div>
            ))}
          </div>
          {normalizedPlate && (
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <Fuel size={14} style={{ color: 'var(--fuel-accent)' }} />
                  {isKm ? 'ប្រវត្តិប្រើប្រាស់សាំងរថយន្ត' : 'Vehicle Fuel History'}
                </div>
                <span style={{ padding: '3px 8px', background: 'var(--fuel-subtle)', borderRadius: '999px', color: 'var(--fuel-accent)', fontSize: '0.76rem', fontWeight: 800 }}>
                  {totalFuelUsed.toLocaleString()} L
                </span>
              </div>
              {recentFuelLogs.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-xs)', overflow: 'hidden' }}>
                  {recentFuelLogs.map((log, index) => (
                    <div key={log.id || `${log.time_in}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 10px', background: index % 2 ? 'var(--surface-subtle)' : 'transparent', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-sub)' }}>{log.time_in?.substring(0, 10) || '—'}{log.shift ? ` · ${log.shift}` : ''}</span>
                      <strong style={{ color: 'var(--fuel-accent)' }}>{(parseFloat(log.refill_liters) || 0).toLocaleString()} L</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{isKm ? 'មិនទាន់មានប្រវត្តិប្រើប្រាស់សាំងសម្រាប់រថយន្តនេះ' : 'No fuel entries recorded for this vehicle.'}</span>
              )}
            </div>
          )}
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '7px' }}>{isKm ? 'ហត្ថលេខា' : 'Signature'}</div>
            {staff.signature_url ? (
              <button
                type="button"
                className="staff-signature-preview-trigger"
                onClick={() => setPreview({ src: staff.signature_url, alt: isKm ? 'ហត្ថលេខា' : 'Signature', label: isKm ? 'ហត្ថលេខា' : 'Signature', round: false })}
                title={isKm ? 'ចុចដើម្បីមើលរូបធំ' : 'Click to view full-size image'}
                aria-label={isKm ? 'មើលហត្ថលេខាធំ' : 'View signature in full size'}
              >
                <img src={staff.signature_url} alt={isKm ? 'ហត្ថលេខា' : 'Signature'} />
                <span><Maximize2 size={16} /></span>
              </button>
            ) : <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{isKm ? 'មិនទាន់មានហត្ថលេខា' : 'No signature saved'}</span>}
          </div>
        </div>
      </div>
      {preview && (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={preview.label} onClick={() => setPreview(null)}>
          <div className="image-lightbox-content" onClick={event => event.stopPropagation()}>
            <div className="image-lightbox-header">
              <span>{preview.label}</span>
              <button type="button" onClick={() => setPreview(null)} aria-label={isKm ? 'បិទ' : 'Close'}><X size={20} /></button>
            </div>
            <img className={preview.round ? 'image-lightbox-photo' : 'image-lightbox-signature'} src={preview.src} alt={preview.alt} />
          </div>
        </div>
      )}
    </div>
  );
}

function StaffForm({ initial = {}, stations = [], onSave, onCancel, lang }) {
  const isKm = lang === 'km';
  const [customPositions, setCustomPositions] = useState(getCustomPositions);
  const [newPosition, setNewPosition] = useState('');
  const [form, setForm] = useState({
    staff_id: initial.staff_id || '',
    name: initial.name || '',
    gender: initial.gender || '',
    role: initial.role || '',
    // Existing Supabase records use station_name; working_at is the UI alias.
    working_at: initial.working_at || initial.station_name || '',
    license_plate: initial.license_plate || '',
    phone: initial.phone || '',
    photo_url: initial.photo_url || '',
    signature_url: initial.signature_url || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addPosition = () => {
    const position = newPosition.trim();
    if (!position) return;
    const hasPosition = [...ROLE_OPTIONS[lang], ...customPositions]
      .some(item => item.toLowerCase() === position.toLowerCase());
    const updatedPositions = hasPosition ? customPositions : [...customPositions, position];
    if (!hasPosition) {
      setCustomPositions(updatedPositions);
      try { localStorage.setItem(CUSTOM_POSITIONS_STORAGE_KEY, JSON.stringify(updatedPositions)); } catch (_) {}
    }
    set('role', position);
    setNewPosition('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...initial, ...form, id: initial.id || `staff-${Date.now()}`, created_at: initial.created_at || new Date().toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="grid-form-2">
        {/* Staff ID */}
        <div className="form-group">
          <label className="form-label">
            <Briefcase size={13} style={{ marginRight: 4 }} />
            {isKm ? 'លេខសម្គាល់បុគ្គលិក' : 'Staff ID'}
          </label>
          <input
            className="form-control"
            placeholder={isKm ? 'ឧ. STF-001' : 'e.g. STF-001'}
            value={form.staff_id}
            onChange={e => set('staff_id', e.target.value)}
          />
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label form-label-required">
            <User size={13} style={{ marginRight: 4 }} />
            {isKm ? 'ឈ្មោះ' : 'Full Name'}
          </label>
          <input className="form-control" placeholder={isKm ? 'ឧ. សុខ ជា' : 'e.g. Sok Chea'} value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>

        {/* Gender */}
        <div className="form-group">
          <label className="form-label">
            {isKm ? 'ភេទ' : 'Gender'}
          </label>
          <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option value="">{isKm ? '— ជ្រើស —' : '— Select —'}</option>
            {/* Keep existing values visible after switching the app language. */}
            {form.gender && !GENDER_OPTIONS[lang]?.includes(form.gender) && (
              <option value={form.gender}>{form.gender}</option>
            )}
            {GENDER_OPTIONS[lang]?.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-form-2">
        {/* Role/Position */}
        <div className="form-group">
          <label className="form-label">
            <Briefcase size={13} style={{ marginRight: 4 }} />
            {isKm ? 'តួនាទី / មុខតំណែង' : 'Role / Position'}
          </label>
          <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="">{isKm ? '— ជ្រើស —' : '— Select —'}</option>
            {/* Roles saved in the other language remain selected instead of appearing blank. */}
            {form.role && ![...ROLE_OPTIONS[lang], ...customPositions].includes(form.role) && (
              <option value={form.role}>{form.role}</option>
            )}
            {ROLE_OPTIONS[lang]?.map(r => <option key={r} value={r}>{r}</option>)}
            {customPositions.length > 0 && (
              <optgroup label={isKm ? 'មុខតំណែងដែលបានបង្កើត' : 'Custom positions'}>
                {customPositions.map(position => <option key={position} value={position}>{position}</option>)}
              </optgroup>
            )}
          </select>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <input
              className="form-control"
              placeholder={isKm ? 'បង្កើតមុខតំណែងថ្មី' : 'Create new position'}
              value={newPosition}
              onChange={e => setNewPosition(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPosition(); } }}
              style={{ height: '32px', fontSize: '0.78rem' }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addPosition} style={{ whiteSpace: 'nowrap' }}>
              <Plus size={13} /> {isKm ? 'បង្កើត' : 'Create'}
            </button>
          </div>
        </div>

        {/* Working At */}
        <div className="form-group">
          <label className="form-label">
            <MapPin size={13} style={{ marginRight: 4 }} />
            {isKm ? 'ធ្វើការនៅ (ស្ថានីយ៍)' : 'Working At (Station)'}
          </label>
          {stations.length > 0 ? (
            <select className="form-control" value={form.working_at} onChange={e => set('working_at', e.target.value)}>
              <option value="">{isKm ? '— ជ្រើសស្ថានីយ៍ —' : '— Select Station —'}</option>
              {stations.map(s => (
                <option key={s.id} value={s.name || s.station_name}>{s.name || s.station_name}</option>
              ))}
            </select>
          ) : (
            <input className="form-control" placeholder={isKm ? 'ឧ. ស្ថានីយ៍ Y34' : 'e.g. Station Y34'} value={form.working_at} onChange={e => set('working_at', e.target.value)} />
          )}
        </div>
      </div>

      <div className="grid-form-2">
        {/* License Plate */}
        <div className="form-group">
          <label className="form-label">
            <Car size={13} style={{ marginRight: 4 }} />
            {isKm ? 'ផ្លាកលេខឡាន' : 'License Plate'}
          </label>
          <input
            className="form-control"
            placeholder={isKm ? 'ឧ. 2A-8899' : 'e.g. 2A-8899'}
            value={form.license_plate}
            onChange={e => set('license_plate', e.target.value.toUpperCase())}
            style={{ fontFamily: 'monospace', letterSpacing: '0.5px', fontWeight: 600 }}
          />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label">
            <Phone size={13} style={{ marginRight: 4 }} />
            {isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
          </label>
          <input className="form-control" placeholder={isKm ? 'ឧ. 012-xxx-xxx' : 'e.g. 012-xxx-xxx'} value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>

      {/* Photo & Signature Upload */}
      <div className="grid-form-2">
        <div className="form-group">
          <ImageUploader
            value={form.photo_url}
            onChange={val => set('photo_url', val)}
            label={isKm ? 'រូបថតបុគ្គលិក (Staff Photo)' : 'Staff Photo'}
            hint={isKm ? 'ជ្រើសរើសរូបថត' : 'Select photo'}
            compact
          />
        </div>
        <div className="form-group">
          <ImageUploader
            value={form.signature_url}
            onChange={val => set('signature_url', val)}
            label={isKm ? 'ហត្ថលេខា (Signature)' : 'Signature Image'}
            hint={isKm ? 'រូបថត/ស្កេនហត្ថលេខា' : 'Signature image'}
            compact
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
          {isKm ? 'បោះបង់' : 'Cancel'}
        </button>
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 22px' }}>
          <Check size={14} />
          {initial.id ? (isKm ? 'រក្សាទុក' : 'Save Changes') : (isKm ? 'បន្ថែម' : 'Add Staff')}
        </button>
      </div>
    </form>
  );
}

export default function StaffManager({
  staff = [],
  drivers = [],
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onSaveSignature,
  stations = [],
  fuelLogs = [],
  lang = 'km'
}) {
  const isKm = lang === 'km';
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [viewingStaff, setViewingStaff] = useState(null);

  const triggerToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleOpenScannerForStaff = (staffMember) => {
    setShowScannerModal(true);
  };

  const uniqueStations = useMemo(() => {
    const stationSet = new Set(staff.map(s => s.working_at).filter(Boolean));
    return [...stationSet];
  }, [staff]);

  const positionCounts = useMemo(() => {
    const counts = new Map();
    staff.forEach(member => {
      const position = member.role?.trim() || (isKm ? 'មិនកំណត់តួនាទី' : 'Unassigned');
      counts.set(position, (counts.get(position) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count || a.position.localeCompare(b.position));
  }, [staff, isKm]);

  const staffStats = useMemo(() => {
    const stats = {};
    fuelLogs.forEach(log => {
      const name = log.driver_name;
      if (name) {
        if (!stats[name]) stats[name] = { count: 0, totalLiters: 0 };
        stats[name].count += 1;
        stats[name].totalLiters += parseFloat(log.refill_liters) || 0;
      }
    });
    return stats;
  }, [fuelLogs]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchSearch = !searchTerm ||
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStation = filterStation === 'ALL' || s.working_at === filterStation;
      const matchRole = filterRole === 'ALL' || (s.role?.trim() || (isKm ? 'មិនកំណត់តួនាទី' : 'Unassigned')) === filterRole;
      return matchSearch && matchStation && matchRole;
    });
  }, [staff, searchTerm, filterStation, filterRole, isKm]);

  const handleSave = async (staffData) => {
    let result;
    if (staffData.id && staff.find(s => s.id === staffData.id)) {
      result = await onEditStaff(staffData);
    } else {
      result = await onAddStaff(staffData);
    }
    triggerToast(result?.success || result?.queued
      ? (result.queued
        ? (isKm ? 'បានរក្សាទុកនៅក្នុងឧបករណ៍ ហើយនឹងផ្ញើពេលអនឡាញ' : 'Saved locally and will sync when online.')
        : (staffData.id && staff.find(s => s.id === staffData.id)
          ? (isKm ? `បានកែប្រែ «${staffData.name}» ជោគជ័យ!` : `Updated "${staffData.name}" successfully!`)
          : (isKm ? `បានបន្ថែម «${staffData.name}» ជោគជ័យ!` : `Added "${staffData.name}" successfully!`)))
      : (isKm ? 'មិនអាចរក្សាទុកទៅ Supabase បានទេ' : 'Could not save to Supabase.')
    );
    setShowForm(false);
    setEditingStaff(null);
  };

  const handleDelete = (id) => {
    const found = staff.find(s => s.id === id);
    onDeleteStaff(id);
    setConfirmDeleteId(null);
    triggerToast(isKm ? `បានលុប «${found?.name || 'បុគ្គលិក'}»` : `Deleted "${found?.name || 'staff'}"`);
  };

  const handleEdit = (s) => {
    setEditingStaff(s);
    setShowForm(true);
  };

  const handleView = (s) => setViewingStaff(s);

  const totalLitersAll = fuelLogs.reduce((sum, l) => sum + (parseFloat(l.refill_liters) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast */}
      {successMsg && (
        <div className="alert alert-success" style={{ animation: 'fadeIn 0.2s ease' }}>
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="office-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isKm ? 'សរុបបុគ្គលិក' : 'Total Staff'}
            </span>
            <div style={{ padding: '5px', background: 'var(--primary-subtle)', borderRadius: 'var(--r-xs)', color: 'var(--primary)', display: 'flex' }}>
              <Users size={13} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{staff.length}</div>
          <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {uniqueStations.length} {isKm ? 'ស្ថានីយ៍' : 'stations'}
          </div>
        </div>

        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--fuel-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isKm ? 'ប្រេងប្រើប្រាស់' : 'Fuel Used'}
            </span>
            <div style={{ padding: '5px', background: 'var(--fuel-subtle)', borderRadius: 'var(--r-xs)', color: 'var(--fuel-accent)', display: 'flex' }}>
              <Car size={13} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--fuel-accent)' }}>
            {totalLitersAll.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>L</span>
          </div>
          <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {fuelLogs.length} {isKm ? 'ប្រតិបត្តិការ' : 'fuel logs total'}
          </div>
        </div>

        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isKm ? 'ផ្លាកលេខ' : 'License Plates'}
            </span>
            <div style={{ padding: '5px', background: 'var(--success-subtle)', borderRadius: 'var(--r-xs)', color: 'var(--success)', display: 'flex' }}>
              <Car size={13} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
            {staff.filter(s => s.license_plate).length}
          </div>
          <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isKm ? 'បុគ្គលិកមានឡាន' : 'staff with vehicles'}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
          <div className="filter-input-wrap" style={{ minWidth: '200px' }}>
            <Search size={13} className="filter-icon" />
            <input
              type="text"
              className="form-control"
              placeholder={isKm ? 'ស្វែងរកបុគ្គលិក, ផ្លាកលេខ...' : 'Search staff, plate...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '30px', height: '34px', fontSize: '0.79rem' }}
            />
          </div>

          {uniqueStations.length > 0 && (
            <select
              className="form-control"
              value={filterStation}
              onChange={e => setFilterStation(e.target.value)}
              style={{ height: '34px', fontSize: '0.79rem', width: '160px' }}
            >
              <option value="ALL">{isKm ? 'គ្រប់ស្ថានីយ៍' : 'All Stations'}</option>
              {uniqueStations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {positionCounts.length > 0 && (
            <select
              className="form-control"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              style={{ height: '34px', fontSize: '0.79rem', width: '180px' }}
              aria-label={isKm ? 'ត្រងតាមតួនាទី' : 'Filter by position'}
            >
              <option value="ALL">{isKm ? 'គ្រប់តួនាទី' : 'All positions'}</option>
              {positionCounts.map(({ position, count }) => (
                <option key={position} value={position}>{position} ({count})</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div
            className="btn btn-secondary"
            role="group"
            aria-label={isKm ? 'របៀបបង្ហាញ' : 'View mode'}
            style={{ height: '34px', padding: '3px', display: 'flex', gap: '2px' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className="btn btn-sm"
              title={isKm ? 'បង្ហាញជាកាត' : 'Card view'}
              aria-label={isKm ? 'បង្ហាញជាកាត' : 'Card view'}
              style={{ padding: '4px 7px', background: viewMode === 'cards' ? 'var(--primary)' : 'transparent', color: viewMode === 'cards' ? '#fff' : 'var(--text-muted)' }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="btn btn-sm"
              title={isKm ? 'បង្ហាញជាតារាង' : 'Table view'}
              aria-label={isKm ? 'បង្ហាញជាតារាង' : 'Table view'}
              style={{ padding: '4px 7px', background: viewMode === 'table' ? 'var(--primary)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--text-muted)' }}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowScannerModal(true)}
            className="btn btn-secondary"
            style={{
              height: '34px', whiteSpace: 'nowrap',
              color: 'var(--primary)', borderColor: 'var(--primary-border)',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
            }}
          >
            <ShieldCheck size={14} />
            {isKm ? 'ស្កេនហត្ថលេខា' : 'Scan Signature'}
          </button>

          <button
            onClick={() => { setEditingStaff(null); setShowForm(true); }}
            className="btn btn-primary"
            style={{ height: '34px', whiteSpace: 'nowrap' }}
          >
            <UserPlus size={14} />
            {isKm ? 'បន្ថែមបុគ្គលិក' : 'Add Staff'}
          </button>
        </div>
      </div>

      {positionCounts.length > 0 && (
        <div className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '2px' }}>
            {isKm ? 'តួនាទី' : 'Positions'}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setFilterRole('ALL')}
            style={{ padding: '3px 9px', fontSize: '0.72rem', background: filterRole === 'ALL' ? 'var(--primary)' : 'var(--surface-hover)', color: filterRole === 'ALL' ? '#fff' : 'var(--text-sub)' }}
          >
            {isKm ? `ទាំងអស់ ${staff.length}` : `All ${staff.length}`}
          </button>
          {positionCounts.map(({ position, count }) => (
            <button
              key={position}
              type="button"
              className="btn btn-sm"
              onClick={() => setFilterRole(position)}
              title={isKm ? `បង្ហាញ ${position}` : `Show ${position}`}
              style={{ padding: '3px 9px', fontSize: '0.72rem', background: filterRole === position ? 'var(--primary-subtle)' : 'var(--surface-hover)', color: filterRole === position ? 'var(--primary)' : 'var(--text-sub)', border: filterRole === position ? '1px solid var(--primary-border)' : '1px solid transparent' }}
            >
              {position} <span style={{ fontWeight: 800, marginLeft: '3px' }}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditingStaff(null);
            }
          }}
        >
          <div className="card modal-box" style={{ maxWidth: '760px' }} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  {editingStaff ? <Pencil size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
                    {editingStaff
                      ? (isKm ? `កែប្រែ — ${editingStaff.name}` : `Edit — ${editingStaff.name}`)
                      : (isKm ? 'បន្ថែមបុគ្គលិកថ្មី' : 'Add New Staff Member')}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    {isKm ? 'បំពេញព័ត៌មានបុគ្គលិកខាងក្រោម' : 'Fill in the staff member details below'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setShowForm(false); setEditingStaff(null); }}
                aria-label={isKm ? 'បិទ' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <StaffForm
                initial={editingStaff || {}}
                stations={stations}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingStaff(null); }}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ opacity: 0.25 }} />
            <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              {searchTerm
                ? (isKm ? `រកមិនឃើញ «${searchTerm}»` : `No results for "${searchTerm}"`)
                : (isKm ? 'មិនទាន់មានបុគ្គលិកនៅឡើយ' : 'No staff members yet')}
            </p>
            {!searchTerm && !showForm && (
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm" style={{ marginTop: '4px' }}>
                <UserPlus size={13} /> {isKm ? 'បន្ថែមបុគ្គលិកដំបូង' : 'Add First Staff Member'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredStaff.length} {isKm ? 'នាក់' : 'members'}{searchTerm || filterStation !== 'ALL' ? ` (${isKm ? 'ត្រងចេញ' : 'filtered'})` : ''}
          </div>
          {viewMode === 'table' ? (
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', fontSize: '0.79rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>{isKm ? 'បុគ្គលិក' : 'Staff'}</th>
                    <th style={{ padding: '10px 8px' }}>{isKm ? 'លេខសម្គាល់' : 'Staff ID'}</th>
                    <th style={{ padding: '10px 8px' }}>{isKm ? 'តួនាទី' : 'Position'}</th>
                    <th style={{ padding: '10px 8px' }}>{isKm ? 'ស្ថានីយ៍' : 'Station'}</th>
                    <th style={{ padding: '10px 8px' }}>{isKm ? 'ផ្លាកលេខ' : 'Plate'}</th>
                    <th style={{ padding: '10px 8px' }}>{isKm ? 'ហត្ថលេខា' : 'Signature'}</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>{isKm ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(s => (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          {s.photo_url ? (
                            <img src={s.photo_url} alt={s.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }} />
                          ) : (
                            <span style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '0.68rem' }}>
                              {s.name?.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
                            </span>
                          )}
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: 'var(--text-sub)' }}>{s.staff_id || '—'}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-sub)' }}>{s.role || '—'}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-sub)' }}>{s.working_at || s.station_name || '—'}</td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: 'var(--fuel-accent)' }}>{s.license_plate || '—'}</td>
                      <td style={{ padding: '6px 8px' }}>
                        {s.signature_url ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', height: '28px', padding: '2px 6px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
                            <img src={s.signature_url} alt={isKm ? 'ហត្ថលេខា' : 'Signature'} style={{ maxWidth: '74px', maxHeight: '22px', objectFit: 'contain' }} />
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{isKm ? 'គ្មាន' : 'None'}</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {confirmDeleteId === s.id ? (
                          <>
                            <button onClick={() => handleDelete(s.id)} className="btn btn-sm" style={{ padding: '4px 8px', background: 'var(--danger)', color: '#fff', border: 'none' }}><Check size={13} /></button>
                            <button onClick={() => setConfirmDeleteId(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><X size={13} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleView(s)} className="btn btn-ghost btn-sm" title={isKm ? 'មើលព័ត៌មានលម្អិត' : 'View profile'} style={{ padding: '4px 7px', color: 'var(--text-sub)' }}><Eye size={14} /></button>
                            <button onClick={() => handleEdit(s)} className="btn btn-ghost btn-sm" title={isKm ? 'កែប្រែ' : 'Edit'} style={{ padding: '4px 7px', color: 'var(--primary)' }}><Pencil size={14} /></button>
                            <button onClick={() => setConfirmDeleteId(s.id)} className="btn btn-ghost btn-sm" title={isKm ? 'លុប' : 'Delete'} style={{ padding: '4px 7px', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {filteredStaff.map(s => (
                <StaffCard
                  key={s.id}
                  staff={s}
                  lang={lang}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  confirmDeleteId={confirmDeleteId}
                  setConfirmDeleteId={setConfirmDeleteId}
                  onScanSign={handleOpenScannerForStaff}
                />
              ))}
            </div>
          )}
        </>
      )}

      <StaffProfileModal staff={viewingStaff} fuelLogs={fuelLogs} lang={lang} onClose={() => setViewingStaff(null)} />

      {/* Signature Camera Scanner Modal */}
      <SignatureScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        staff={staff}
        drivers={drivers}
        onSaveSignature={(targetId, signatureUrl, type) => {
          if (onSaveSignature) {
            onSaveSignature(targetId, signatureUrl, type);
          } else {
            const targetStaff = staff.find(st => st.id === targetId);
            if (targetStaff) {
              onEditStaff({ ...targetStaff, signature_url: signatureUrl });
            }
          }
          triggerToast(isKm ? 'បានស្កេន និងរក្សាទុកហត្ថលេខាជោគជ័យ!' : 'Signature scanned and saved successfully!');
        }}
        lang={lang}
      />
    </div>
  );
}
