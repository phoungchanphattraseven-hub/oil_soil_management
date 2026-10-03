import React, { useState, useMemo } from 'react';
import {
  User, Plus, Trash2, Search, Pencil, X, Check, Car,
  Phone, Briefcase, MapPin, ChevronDown, Users,
  CheckCircle2, UserPlus, Camera
} from 'lucide-react';
import ImageUploader from '../Common/ImageUploader';

const GENDER_OPTIONS = {
  km: ['ប្រុស', 'ស្រី', 'មិនបញ្ជាក់'],
  en: ['Male', 'Female', 'Other']
};

const ROLE_OPTIONS = {
  km: ['អ្នកបើកបរ', 'បុគ្គលិកប្រតិបត្តិការ', 'អ្នកគ្រប់គ្រងស្ថានីយ៍', 'ជំនួយការ', 'ផ្សេងៗ'],
  en: ['Driver', 'Operations Staff', 'Station Manager', 'Assistant', 'Other']
};

function StaffCard({ staff, lang, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId }) {
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
      </div>
    </div>
  );
}

function StaffForm({ initial = {}, stations = [], onSave, onCancel, lang }) {
  const isKm = lang === 'km';
  const [form, setForm] = useState({
    name: initial.name || '',
    gender: initial.gender || '',
    role: initial.role || '',
    working_at: initial.working_at || '',
    license_plate: initial.license_plate || '',
    phone: initial.phone || '',
    photo_url: initial.photo_url || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...initial, ...form, id: initial.id || `staff-${Date.now()}`, created_at: initial.created_at || new Date().toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="grid-form-2">
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
            {ROLE_OPTIONS[lang]?.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
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

      {/* Photo Upload */}
      <div className="form-group">
        <ImageUploader
          value={form.photo_url}
          onChange={val => set('photo_url', val)}
          label={isKm ? 'រូបថតបុគ្គលិក (Upload Photo)' : 'Staff Photo'}
          hint={isKm ? 'ជ្រើសរើសរូបថតពីកុំព្យូទ័រ ឬទូរស័ព្ទ' : 'Select photo from device'}
          compact
        />
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

export default function StaffManager({ staff = [], onAddStaff, onEditStaff, onDeleteStaff, stations = [], fuelLogs = [], lang = 'km' }) {
  const isKm = lang === 'km';
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const triggerToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const uniqueStations = useMemo(() => {
    const stationSet = new Set(staff.map(s => s.working_at).filter(Boolean));
    return [...stationSet];
  }, [staff]);

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
      return matchSearch && matchStation;
    });
  }, [staff, searchTerm, filterStation]);

  const handleSave = (staffData) => {
    if (staffData.id && staff.find(s => s.id === staffData.id)) {
      onEditStaff(staffData);
      triggerToast(isKm ? `បានកែប្រែ «${staffData.name}» ជោគជ័យ!` : `Updated "${staffData.name}" successfully!`);
    } else {
      onAddStaff(staffData);
      triggerToast(isKm ? `បានបន្ថែម «${staffData.name}» ជោគជ័យ!` : `Added "${staffData.name}" successfully!`);
    }
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
        </div>

        <button
          onClick={() => { setEditingStaff(null); setShowForm(true); }}
          className="btn btn-primary"
          style={{ height: '34px', whiteSpace: 'nowrap' }}
        >
          <UserPlus size={14} />
          {isKm ? 'បន្ថែមបុគ្គលិក' : 'Add Staff'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ padding: '20px', border: '1.5px solid var(--primary-border)', background: 'var(--primary-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ padding: '7px', background: 'var(--primary)', borderRadius: 'var(--r-sm)', color: '#fff', display: 'flex' }}>
              {editingStaff ? <Pencil size={15} /> : <UserPlus size={15} />}
            </div>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                {editingStaff
                  ? (isKm ? `កែប្រែ — ${editingStaff.name}` : `Edit — ${editingStaff.name}`)
                  : (isKm ? 'បន្ថែមបុគ្គលិកថ្មី' : 'Add New Staff Member')}
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKm ? 'បំពេញព័ត៌មានបុគ្គលិកខាងក្រោម' : 'Fill in the staff member details below'}
              </p>
            </div>
          </div>
          <StaffForm
            initial={editingStaff || {}}
            stations={stations}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingStaff(null); }}
            lang={lang}
          />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            {filteredStaff.map(s => (
              <StaffCard
                key={s.id}
                staff={s}
                lang={lang}
                onEdit={handleEdit}
                onDelete={handleDelete}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
