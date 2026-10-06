import React, { useState, useEffect } from 'react';
import { Fuel, CheckCircle2, X, Clock, Car, Droplets, MapPin, CalendarClock, User, Check } from 'lucide-react';
import { translations } from '../../data/translations';
import StaffSelector from '../Common/StaffSelector';
import ImageUploader from '../Common/ImageUploader';

function getNowLocal() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function FuelLogForm({
  stations = [],
  onAddFuelLog,
  staff = [],
  lang = 'km',
  open,
  onClose,
  initialDate = '',
  assignedStation = { id: '', name: '' }
}) {
  const [stationId, setStationId]       = useState('');
  const [refillLiters, setRefillLiters] = useState('');
  const [oilIn, setOilIn]               = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [logDate, setLogDate]           = useState(initialDate || new Date().toISOString().substring(0, 10));
  const [description, setDescription]   = useState('ឡានចាក់សាំង');
  const [shift, setShift]               = useState('Morning');
  const [timeIn, setTimeIn]             = useState(getNowLocal());
  const [photoUrl, setPhotoUrl]         = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [isSuccess, setIsSuccess]       = useState(false);
  const [pendingSave, setPendingSave]   = useState(null);

  const t = translations[lang] || translations.km;
  const isKm = lang === 'km';

  useEffect(() => {
    if (open) {
      if (initialDate) {
        setLogDate(initialDate);
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        setTimeIn(`${initialDate}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
      }
    }
  }, [open, initialDate]);

  useEffect(() => {
    if (stations.length === 0) return;
    // If user has an assigned station and it exists in the list, pre-select it
    if (assignedStation?.id) {
      const match = stations.find(s => s.id === assignedStation.id);
      if (match) { setStationId(match.id); return; }
    }
    // Fallback: select first station
    if (!stationId) setStationId(stations[0].id);
  }, [stations, assignedStation]);

  if (!open) return null;

  const selectedStaff = staff.find(s => s.id === selectedStaffId) || null;

  const handleSelectStaff = (member) => {
    if (!member) {
      setSelectedStaffId(null);
      setSignatureUrl('');
      return;
    }
    setSelectedStaffId(member.id);
    // Auto-fill signature from staff profile if available
    if (member.signature_url) {
      setSignatureUrl(member.signature_url);
    }
    // Keep description clean without attaching name
    if (!description || description.includes('—')) {
      setDescription(isKm ? 'ឡានចាក់សាំង' : 'Refueling');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!timeIn) return;

    const plate = selectedStaff?.license_plate || '';
    const driverName = selectedStaff?.name || '';
    const selectedStation = stations.find(s => String(s.id) === String(stationId)) || stations[0];

    setPendingSave({
      id: `flog-${Date.now()}`,
      station_id: selectedStation?.id || stationId,
      station_name: selectedStation?.name || selectedStation?.station_name || 'ស្ថានីយ៍សាំង',
      logged_by: 'Phattra',
      log_date: logDate || new Date().toISOString().substring(0, 10),
      description: description || 'ឡានចាក់សាំង',
      driver_name: driverName,
      staff_id: selectedStaffId || null,
      refill_liters: parseFloat(refillLiters) || 0,
      oil_in: parseFloat(oilIn) || 0,
      license_plate: plate,
      time_in: timeIn,
      time_out: null,
      shift: shift || 'Morning',
      code_abbr: plate,
      photo_url: photoUrl || '',
      signature_url: signatureUrl || '',
      status: 'Completed',
      created_at: new Date().toISOString()
    });
  };

  const confirmSave = () => {
    if (!pendingSave) return;
    onAddFuelLog(pendingSave);
    setPendingSave(null);

    setRefillLiters(''); setOilIn('');
    setSelectedStaffId(null);
    setDescription('ឡានចាក់សាំង'); setShift('Morning');
    setTimeIn(getNowLocal()); setPhotoUrl(''); setSignatureUrl('');

    setIsSuccess(true);
    setTimeout(() => { setIsSuccess(false); onClose(); }, 1500);
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--fuel-subtle)' }}>
              <Fuel size={18} color="var(--fuel-accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.975rem' }}>{t.fuelFormTitle}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKm ? 'ជ្រើសរើសបុគ្គលិក ហើយបំពេញព័ត៌មានប្រេង' : 'Select staff then fill in fuel details'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={17} /></button>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="alert alert-success" style={{ margin: '0 0 12px', animation: 'fadeIn 0.2s ease' }}>
            <CheckCircle2 size={15} />
            <span>{t.fuelFormSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Row 1: Station + Date */}
          <div className="grid-form-2">
            <div className="form-group">
              <label className="form-label form-label-required">
                <MapPin size={13} style={{ marginRight: 4 }} />
                {isKm ? 'ស្ថានីយ៍' : 'Station'}
              </label>
              <select
                className="form-control"
                value={stationId}
                onChange={e => setStationId(e.target.value)}
                required
                disabled={!!assignedStation?.id}
                style={assignedStation?.id ? { opacity: 0.75, cursor: 'not-allowed' } : {}}
              >
                {stations.length === 0 ? (
                  <option value="">{isKm ? 'គ្មានស្ថានីយ៍' : 'No stations'}</option>
                ) : (
                  stations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.station_name} ({s.current_stock_liters} L)
                    </option>
                  ))
                )}
              </select>
              {assignedStation?.id && (
                <p style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📍</span>
                  {isKm ? 'ស្ថានីយ៍ត្រូវបានកំណត់ដោយអ្នកគ្រប់គ្រង' : 'Station assigned by your administrator'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">
                {isKm ? 'កាលបរិច្ឆេទ' : 'Log Date'}
              </label>
              <input
                type="date"
                className="form-control"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Staff Selector — full width */}
          <div className="form-group">
            <label className="form-label">
              <User size={13} style={{ marginRight: 4 }} />
              {isKm ? 'ជ្រើសរើសបុគ្គលិក (ឈ្មោះ + ផ្លាកលេខ)' : 'Select Staff (Name + License Plate auto-filled)'}
            </label>
            <StaffSelector
              staff={staff}
              selectedStaffId={selectedStaffId}
              onSelectStaff={handleSelectStaff}
              lang={lang}
            />
            {selectedStaff && (
              <div style={{ marginTop: '6px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isKm ? 'ឈ្មោះ:' : 'Name:'} <strong style={{ color: 'var(--text-main)' }}>{selectedStaff.name}</strong>
                </span>
                {selectedStaff.license_plate && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--fuel-accent)', fontFamily: 'monospace', fontWeight: 700 }}>
                    {isKm ? 'ផ្លាក:' : 'Plate:'} {selectedStaff.license_plate}
                  </span>
                )}
                {selectedStaff.role && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedStaff.role}
                  </span>
                )}
                {/* Signature auto-fill indicator */}
                {signatureUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', width: '100%' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>
                      ✔ {isKm ? 'ហត្ថលេខារបស់បុគ្គលិក:' : 'Staff signature loaded:'}
                    </span>
                    <div style={{
                      background: '#fff', border: '1px solid var(--border-subtle)',
                      borderRadius: '4px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center'
                    }}>
                      <img src={signatureUrl} alt="Signature" style={{ maxHeight: '22px', maxWidth: '90px', objectFit: 'contain' }} />
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', width: '100%', marginTop: '2px' }}>
                    {isKm ? '(គ្មានហត្ថលេខា — ទៅ Tab «បុគ្គលិក» ដើម្បីស្កេនហត្ថលេខា)' : '(No signature — scan one in the Staff tab first)'}
                  </span>
                )}
              </div>
            )}
            {staff.length === 0 && (
              <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isKm ? 'ទៅ Tab «បុគ្គលិក» ដើម្បីបន្ថែមបុគ្គលិកជាមុន' : 'Go to "Staff" tab first to add staff members'}
              </p>
            )}
          </div>

          {/* Row 2: Volume Out + Volume In */}
          <div className="grid-form-2">
            <div className="form-group">
              <label className="form-label">
                <Droplets size={13} style={{ marginRight: 4 }} />
                {isKm ? 'ប្រេងចេញ / ចាក់ (L)' : 'Volume Out / Dispensed (L)'}
              </label>
              <input
                type="number" step="any" min="0"
                className="form-control"
                placeholder={isKm ? 'ឧ. 350' : 'e.g. 350'}
                value={refillLiters}
                onChange={e => setRefillLiters(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" style={{ color: 'var(--success)' }}>
                <Droplets size={13} style={{ marginRight: 4, color: 'var(--success)' }} />
                {isKm ? 'ប្រេងចូល / បំពេញស្តុក (Oil In)' : 'Oil In / Stock Refill (L)'}
                <span style={{
                  marginLeft: '7px', fontSize: '0.67rem', fontWeight: 700,
                  background: 'var(--success-subtle)', color: 'var(--success)',
                  border: '1px solid var(--success-border)',
                  borderRadius: '4px', padding: '1px 6px', verticalAlign: 'middle'
                }}>
                  {isKm ? 'បំពេញស្តុក' : 'STOCK IN'}
                </span>
              </label>
              <input
                type="number" step="any" min="0"
                className="form-control"
                placeholder={isKm ? 'ឧ. 4000 (ប្រសិនបើមានប្រេងចូល)' : 'e.g. 4000 (only if fuel delivered today)'}
                value={oilIn}
                onChange={e => setOilIn(e.target.value)}
                style={{ borderColor: oilIn ? 'var(--success-border)' : undefined }}
              />
              {oilIn && parseFloat(oilIn) > 0 && (
                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>
                  ✅ {isKm ? `ប្រេង +${parseFloat(oilIn).toLocaleString()} L នឹងត្រូវបន្ថែមទៅស្តុក` : `+${parseFloat(oilIn).toLocaleString()} L will be added to tank stock`}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Description + Shift */}
          <div className="grid-form-2">
            <div className="form-group">
              <label className="form-label">
                {isKm ? 'ការពិពណ៌នា' : 'Description'}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="ឡានចាក់សាំង"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={13} style={{ marginRight: 4 }} />
                {isKm ? 'វេន' : 'Shift'}
              </label>
              <select
                className="form-control"
                value={shift}
                onChange={e => setShift(e.target.value)}
              >
                <option value="Morning">{isKm ? 'Morning — ព្រឹក' : 'Morning'}</option>
                <option value="Afternoon">{isKm ? 'Afternoon — រសៀល' : 'Afternoon'}</option>
              </select>
            </div>
          </div>

          {/* Row 4: Time In + Photo URL */}
          <div className="grid-form-2">
            <div className="form-group">
              <label className="form-label form-label-required">
                <CalendarClock size={13} style={{ marginRight: 4 }} />
                {t.timeIn}
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={timeIn}
                onChange={e => setTimeIn(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <ImageUploader
                value={photoUrl}
                onChange={setPhotoUrl}
                label={t.photoUrl || (isKm ? 'រូបថតសកម្មភាព/វិក្កយបត្រ (Upload Photo)' : 'Activity/Receipt Photo')}
                compact
              />
            </div>
          </div>

          {/* Signature Upload (manual override) */}
          <div className="form-group">
            <ImageUploader
              value={signatureUrl}
              onChange={setSignatureUrl}
              label={isKm ? 'ហត្ថលេខា (Signature — auto from staff or upload manually)' : 'Signature (auto-loaded from staff or upload)'}
              hint={isKm ? 'ហត្ថលេខាត្រូវបានផ្ទុករួចហើយ ប្រសិនបើបុគ្គលិកមានហត្ថលេខា' : 'Auto-filled if selected staff has a signature on file'}
              compact
            />
          </div>

          {/* Actions */}
          <div className="modal-footer" style={{ padding: '0', margin: '4px 0 0', borderTop: 'none' }}>
            <button type="submit" className="btn btn-fuel btn-lg" style={{ flex: 1 }}>
              <Fuel size={16} />
              {t.saveFuelLog}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-lg" style={{ minWidth: '110px' }}>
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>

      {pendingSave && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1200 }}
          onClick={e => { if (e.target === e.currentTarget) setPendingSave(null); }}
        >
          <div className="modal-box modal-box-sm" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: 'var(--fuel-subtle)' }}>
                  <Fuel size={18} color="var(--fuel-accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', margin: 0 }}>
                    {isKm ? 'បញ្ជាក់ការរក្សាទុក' : 'Confirm save'}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    {isKm ? 'សូមពិនិត្យព័ត៌មានមុនរក្សាទុក' : 'Please review this entry before saving'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setPendingSave(null)}><X size={17} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ស្ថានីយ៍' : 'Station'}</span>
                <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>{pendingSave.station_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'អ្នកបើកបរ' : 'Driver'}</span>
                <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>{pendingSave.driver_name || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ប្រេងចេញ' : 'Out'}</span>
                <strong style={{ color: 'var(--fuel-accent)' }}>{pendingSave.refill_liters} L</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ប្រេងចូល' : 'In'}</span>
                <strong style={{ color: 'var(--success)' }}>{pendingSave.oil_in} L</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ម៉ោង' : 'Time'}</span>
                <strong style={{ color: 'var(--text-main)' }}>{(pendingSave.time_in || '').replace('T', ' ').substring(0, 16)}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPendingSave(null)}>
                {isKm ? 'ត្រឡប់កែ' : 'Go back'}
              </button>
              <button type="button" className="btn btn-fuel" onClick={confirmSave}>
                <Check size={15} />
                {isKm ? 'បញ្ជាក់រក្សាទុក' : 'Confirm save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
