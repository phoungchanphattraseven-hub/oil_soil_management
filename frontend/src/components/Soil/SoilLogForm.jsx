import React, { useState, useEffect, useMemo } from 'react';
import {
  HardHat, CheckCircle2, X, Clock, MapPin,
  Calendar, Check, AlertCircle, User
} from 'lucide-react';
import { translations } from '../../data/translations';
import StaffSelector from '../Common/StaffSelector';
import ImageUploader from '../Common/ImageUploader';

export default function SoilLogForm({
  open,
  onClose,
  initialDate = '',
  onAddSoilLog,
  stations = [],
  soilLogs = [],
  abbrCodes = [],
  staff = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  lang = 'km',
  assignedStation = { id: '', name: '' }
}) {
  const defaultStationName = assignedStation?.name || '';
  const [stationName, setStationName]               = useState(defaultStationName);
  const [selectedStaffId, setSelectedStaffId]       = useState(null);
  const [tripCount, setTripCount]                   = useState('');
  const [cubicMetersPerTrip, setCubicMetersPerTrip] = useState('');
  const [issuesDescription, setIssuesDescription]   = useState('');
  const [receiptPhotoUrl, setReceiptPhotoUrl]       = useState('');
  const [signatureUrl, setSignatureUrl]             = useState('');
  const [logDate, setLogDate]                       = useState(() => initialDate || new Date().toISOString().substring(0, 10));
  const [timeStart, setTimeStart]                   = useState('07:00');
  const [timeEnd, setTimeEnd]                       = useState('17:00');
  const [shift, setShift]                           = useState('Morning');
  const [isSuccess, setIsSuccess]                   = useState(false);
  const [pendingSave, setPendingSave]               = useState(null);

  const t = translations[lang] || translations.km;
  const isKm = lang === 'km';

  // Note: scroll locking is handled globally by CSS body:has(.modal-overlay)

  // Sync initialDate whenever modal opens
  useEffect(() => {
    if (open) {
      if (initialDate) {
        setLogDate(initialDate);
      }
    }
  }, [open, initialDate]);

  // Compute available stations list (assigned station, custom stations, logs history, standard defaults)
  const availableStations = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (assignedStation?.name) {
      seen.add(assignedStation.name);
      list.push({ id: assignedStation.id || assignedStation.name, name: assignedStation.name });
    }

    if (Array.isArray(stations) && stations.length > 0) {
      stations.forEach(s => {
        const name = s.name || s.station_name;
        if (name && !seen.has(name)) {
          seen.add(name);
          list.push({ id: s.id || name, name });
        }
      });
    }

    if (Array.isArray(soilLogs) && soilLogs.length > 0) {
      soilLogs.forEach(l => {
        if (l.station_name && !seen.has(l.station_name)) {
          seen.add(l.station_name);
          list.push({ id: l.station_name, name: l.station_name });
        }
      });
    }

    return list;
  }, [stations, soilLogs, assignedStation]);

  // Sync assigned or fallback station
  useEffect(() => {
    if (assignedStation?.name) {
      setStationName(assignedStation.name);
    } else if ((!stationName || !availableStations.some(s => s.name === stationName)) && availableStations.length > 0) {
      setStationName(availableStations[0].name);
    }
  }, [assignedStation, availableStations]);

  // Plate is auto-filled from the selected staff member

  if (!open) return null;

  const selectedStaff = staff.find(s => s.id === selectedStaffId) || null;

  const handleSelectStaff = (member) => {
    if (!member) { setSelectedStaffId(null); return; }
    setSelectedStaffId(member.id);
    if (member.signature_url) {
      setSignatureUrl(member.signature_url);
    }
  };

  const totalVolume = (parseFloat(tripCount) || 0) * (parseFloat(cubicMetersPerTrip) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationName || !tripCount || !cubicMetersPerTrip) return;
    const plate = selectedStaff?.license_plate || '';
    setPendingSave({
      id: `slog-${Date.now()}`,
      station_name: stationName,
      code_abbr: plate || 'SL-STN-001',
      logged_by: selectedStaff?.name || 'Phattra',
      staff_id: selectedStaffId || null,
      trip_count: parseInt(tripCount, 10),
      cubic_meters_per_trip: parseFloat(cubicMetersPerTrip),
      total_cubic_meters: totalVolume,
      issues_description: issuesDescription || '',
      receipt_photo_url: receiptPhotoUrl || '',
      signature_url: signatureUrl || selectedStaff?.signature_url || '',
      log_date: logDate || new Date().toISOString().substring(0, 10),
      time_start: timeStart,
      time_end: timeEnd,
      shift: shift || 'Morning',
      created_at: new Date().toISOString()
    });
  };

  const confirmSave = () => {
    if (!pendingSave) return;
    onAddSoilLog(pendingSave);
    setPendingSave(null);
    // Reset fields
    setSelectedStaffId(null);
    setTripCount('');
    setCubicMetersPerTrip('');
    setIssuesDescription('');
    setReceiptPhotoUrl('');
    setSignatureUrl('');
    setShift('Morning');
    setIsSuccess(true);
    setTimeout(() => { setIsSuccess(false); onClose(); }, 1500);
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box" style={{ maxWidth: '640px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--soil-subtle)' }}>
              <HardHat size={18} color="var(--soil-accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 800 }}>{t.soilFormTitle}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKm ? 'ជ្រើសរើសអ្នកបើកបរ/ផ្លាកលេខ ហើយកត់ត្រាចំនួនជើងដឹកដី' : 'Select staff/vehicle and record earthwork hauling'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="alert alert-success" style={{ margin: 0, borderRadius: 0, animation: 'fadeIn 0.2s ease' }}>
            <CheckCircle2 size={15} />
            <span>{t.soilFormSuccess}</span>
          </div>
        )}

        <form id="soil-log-form" onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row 1: Station + Date (Identical flow to Fuel) */}
          <div className="grid-form-2">
            <div className="form-group">
              <label className="form-label form-label-required">
                <MapPin size={13} style={{ marginRight: 4 }} />
                {t.stationNameLabel}
              </label>
              <select
                className="form-control"
                value={stationName}
                onChange={e => setStationName(e.target.value)}
                required
                disabled={!!assignedStation?.name}
                style={assignedStation?.name ? { opacity: 0.75, cursor: 'not-allowed' } : {}}
              >
                {availableStations.length === 0 ? (
                  <option value="">{isKm ? 'គ្មានស្ថានីយ៍' : 'No stations'}</option>
                ) : (
                  availableStations.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
              {assignedStation?.name && (
                <p style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📍</span>
                  {isKm ? 'ស្ថានីយ៍ត្រូវបានកំណត់ដោយអ្នកគ្រប់គ្រង' : 'Station assigned by administrator'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">
                <Calendar size={13} style={{ marginRight: 4 }} />
                {t.dateLabel}
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

          {/* Row 2: Staff / Driver Selector (Exact same flow as Fuel) */}
          <div className="form-group">
            <label className="form-label">
              <User size={13} style={{ marginRight: 4 }} />
              {isKm ? 'ជ្រើសរើសបុគ្គលិក / អ្នកបើកបរ (ឈ្មោះ + ផ្លាកលេខ)' : 'Select Staff / Driver (Name + License Plate auto-filled)'}
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
                  <span style={{ fontSize: '0.72rem', color: 'var(--soil-accent)', fontFamily: 'monospace', fontWeight: 700 }}>
                    {isKm ? 'ផ្លាកលេខ:' : 'Plate:'} {selectedStaff.license_plate}
                  </span>
                )}
                {selectedStaff.role && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ({selectedStaff.role})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Row 3: Trips, m³/trip, Total Volume Auto-calculated */}
          <div className="grid-3" style={{ gap: '10px' }}>
            <div className="form-group">
              <label className="form-label form-label-required">{t.tripCountLabel}</label>
              <input
                type="number"
                min="1"
                className="form-control"
                placeholder={isKm ? 'ឧ. 24' : 'e.g. 24'}
                value={tripCount}
                onChange={e => setTripCount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">{t.m3PerTripLabel}</label>
              <input
                type="number"
                step="any"
                min="0.1"
                className="form-control"
                placeholder={isKm ? 'ឧ. 12.5' : 'e.g. 12.5'}
                value={cubicMetersPerTrip}
                onChange={e => setCubicMetersPerTrip(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.totalVolumeAuto}</label>
              <input
                type="text"
                className="form-control"
                value={`${totalVolume.toLocaleString()} m³`}
                readOnly
                style={{
                  background: 'var(--soil-subtle)',
                  color: 'var(--soil-accent)',
                  fontWeight: 800,
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          {/* Row 4: Time Range + Shift (same as Fuel) */}
          <div className="grid-3" style={{ gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">
                <Clock size={13} style={{ marginRight: 4 }} />
                {isKm ? 'ម៉ោងចាប់ផ្តើម' : 'Start Time'}
              </label>
              <input
                type="time"
                className="form-control"
                value={timeStart}
                onChange={e => setTimeStart(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={13} style={{ marginRight: 4 }} />
                {isKm ? 'ម៉ោងបញ្ចប់' : 'End Time'}
              </label>
              <input
                type="time"
                className="form-control"
                value={timeEnd}
                onChange={e => setTimeEnd(e.target.value)}
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



          {/* Row 7: Issues & Receipt Photo */}
          <div className="grid-form-2">
            <div className="form-group">
              <label className="form-label">
                <AlertCircle size={13} style={{ marginRight: 4 }} />
                {t.issuesInputLabel}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={isKm ? 'ឧ. ស្ទះចរាចរណ៍ ឬ ភ្លៀងធ្លាក់' : 'e.g. Traffic delay or heavy rain'}
                value={issuesDescription}
                onChange={e => setIssuesDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <ImageUploader
                value={receiptPhotoUrl}
                onChange={setReceiptPhotoUrl}
                label={t.receiptPhotoUrlLabel || (isKm ? 'រូបថតវិក្កយបត្រ (Upload Receipt)' : 'Receipt Photo')}
                compact
              />
            </div>
          </div>

        </form>

        {/* Fixed Footer — outside the form, same pattern as FuelLogForm */}
        <div className="modal-footer">
          <button type="submit" form="soil-log-form" className="btn btn-soil btn-lg" style={{ flex: 1 }}>
            <HardHat size={16} />
            {t.saveSoilLog}
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-lg" style={{ minWidth: '110px' }}>
            {isKm ? 'បោះបង់' : 'Cancel'}
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal (Same safety flow as Fuel) */}
      {pendingSave && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1200 }}
          onClick={e => { if (e.target === e.currentTarget) setPendingSave(null); }}
        >
          <div className="modal-box modal-box-sm" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: 'var(--soil-subtle)' }}>
                  <HardHat size={18} color="var(--soil-accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', margin: 0 }}>
                    {isKm ? 'បញ្ជាក់ការរក្សាទុករបាយការណ៍' : 'Confirm Soil Entry'}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    {isKm ? 'សូមពិនិត្យព័ត៌មានមុនរក្សាទុក' : 'Please review this entry before saving'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setPendingSave(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ទីតាំង/ស្ថានីយ៍' : 'Location'}</span>
                <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>{pendingSave.station_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'អ្នកបើកបរ' : 'Driver'}</span>
                <strong style={{ color: 'var(--text-main)', textAlign: 'right' }}>{pendingSave.logged_by}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ផ្លាកលេខ' : 'Plate'}</span>
                <strong className="badge badge-info font-mono">{pendingSave.code_abbr}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'កាលបរិច្ឆេទ' : 'Date'}</span>
                <strong style={{ color: 'var(--text-main)' }}>{pendingSave.log_date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ចំនួនជើង' : 'Trips'}</span>
                <strong style={{ color: 'var(--text-main)' }}>{pendingSave.trip_count} {t.tripsUnit}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'មាឌដីសរុប' : 'Total Volume'}</span>
                <strong style={{ color: 'var(--soil-accent)', fontSize: '0.95rem' }}>
                  {pendingSave.total_cubic_meters.toLocaleString()} m³
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isKm ? 'ម៉ោងប្រតិបត្តិការ' : 'Time Range'}</span>
                <strong style={{ color: 'var(--text-main)' }}>{pendingSave.time_start} - {pendingSave.time_end}</strong>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPendingSave(null)}>
                {isKm ? 'ត្រឡប់កែ' : 'Go back'}
              </button>
              <button type="button" className="btn btn-soil" onClick={confirmSave}>
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
