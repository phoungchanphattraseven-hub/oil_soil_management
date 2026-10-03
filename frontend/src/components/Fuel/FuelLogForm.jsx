import React, { useState, useEffect } from 'react';
import { Fuel, CheckCircle2, X, Clock, Car, Droplets, MapPin, CalendarClock, User } from 'lucide-react';
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
  initialDate = ''
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
    if (!stationId && stations.length > 0) setStationId(stations[0].id);
  }, [stations, stationId]);

  if (!open) return null;

  const selectedStaff = staff.find(s => s.id === selectedStaffId) || null;

  const handleSelectStaff = (member) => {
    if (!member) {
      setSelectedStaffId(null);
      return;
    }
    setSelectedStaffId(member.id);
    // Auto-fill description if empty
    if (!description || description === 'ឡានចាក់សាំង') {
      setDescription(isKm ? `ឡានចាក់សាំង — ${member.name}` : `Refueling — ${member.name}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!timeIn) return;

    const plate = selectedStaff?.license_plate || '';
    const driverName = selectedStaff?.name || '';
    const selectedStation = stations.find(s => String(s.id) === String(stationId)) || stations[0];

    onAddFuelLog({
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

    // Reset
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
              <div style={{ marginTop: '6px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

            <div className="form-group">
              <label className="form-label">
                {isKm ? 'ប្រេងចូល / បំពេញស្តុក (L)' : 'Oil In / Stock Top-up (L)'}
              </label>
              <input
                type="number" step="any" min="0"
                className="form-control"
                placeholder={isKm ? 'ឧ. 1000' : 'e.g. 1000'}
                value={oilIn}
                onChange={e => setOilIn(e.target.value)}
              />
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
    </div>
  );
}
