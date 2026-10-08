import React, { useState } from 'react';
import { Fuel, CheckCircle2, MapPin, Calendar, Clock, Droplets, ChevronDown, ChevronUp, User, Pencil, Trash2, X, Check, FileCheck, Image as ImageIcon } from 'lucide-react';
import StaffSelector from '../components/Common/StaffSelector';
import ImageUploader from '../components/Common/ImageUploader';
import { playSuccessSound } from '../utils/notifications';

function getNowLocal() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function formatDatetimeForInput(val) {
  if (!val) return '';
  return val.substring(0, 16);
}

export default function UserFuelPage({
  stations = [], fuelLogs = [], staff = [],
  onAddFuelLog, onEditFuelLog, onDeleteFuelLog,
  lang = 'km',
  assignedStation = { id: '', name: '' }
}) {
  const isKm = lang === 'km';
  const todayStr = new Date().toISOString().substring(0, 10);

  // ── form state ──────────────────────────────────────────────
  const getDefaultStation = () => {
    if (assignedStation?.id) {
      const m = stations.find(s => s.id === assignedStation.id);
      return m ? m.id : (stations[0]?.id || '');
    }
    return stations[0]?.id || '';
  };

  const [stationId, setStationId]     = useState(getDefaultStation);
  const [refillLiters, setRefill]     = useState('');
  const [oilIn, setOilIn]             = useState('');
  const [selectedStaffId, setStaffId] = useState(null);
  const [logDate, setLogDate]         = useState(todayStr);
  const [shift, setShift]             = useState('Morning');
  const [timeIn, setTimeIn]           = useState(getNowLocal);
  const [description, setDesc]        = useState(isKm ? 'ឡានចាក់សាំង' : 'Fuel refill');
  const [photoUrl, setPhoto]          = useState('');
  const [signatureUrl, setSig]        = useState('');
  const [showExtra, setShowExtra]     = useState(false);
  const [isSuccess, setSuccess]       = useState(false);
  const [successKind, setSuccessKind] = useState('saved');
  const [editingLog, setEditingLog]   = useState(null);
  const [pendingSave, setPendingSave] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const selectedStaff = staff.find(s => s.id === selectedStaffId) || null;
  const reportLogs = fuelLogs.filter(l => (l.log_date || l.time_in || '').substring(0, 10) === logDate);
  const reportFuelOut = reportLogs.reduce((sum, log) => sum + (parseFloat(log.refill_liters) || 0), 0);
  const reportFuelIn = reportLogs.reduce((sum, log) => sum + (parseFloat(log.oil_in) || 0), 0);
  const signedReports = reportLogs.filter(log => log.signature_url).length;
  const photoReports = reportLogs.filter(log => log.photo_url).length;
  const locked = !!assignedStation?.id;

  const handleSelectStaff = (member) => {
    setStaffId(member?.id || null);
    if (member?.signature_url) setSig(member.signature_url);
  };

  const resetForm = () => {
    setRefill(''); setOilIn(''); setStaffId(null); setSig(''); setPhoto('');
    setDesc(isKm ? 'ឡានចាក់សាំង' : 'Fuel refill');
    setTimeIn(getNowLocal());
    setLogDate(todayStr);
    setShift('Morning');
    setEditingLog(null);
    setShowExtra(false);
  };

  const buildLogPayload = () => {
    const selectedStation = stations.find(s => String(s.id) === String(stationId)) || stations[0];
    return {
      ...(editingLog || {}),
      id: editingLog?.id || `flog-${Date.now()}`,
      station_id: selectedStation?.id || stationId,
      station_name: selectedStation?.name || selectedStation?.station_name || 'ស្ថានីយ៍សាំង',
      logged_by: editingLog?.logged_by || 'user',
      log_date: logDate,
      description: description || (isKm ? 'ឡានចាក់សាំង' : 'Fuel refill'),
      driver_name: selectedStaff?.name || editingLog?.driver_name || '',
      staff_id: selectedStaffId || null,
      refill_liters: parseFloat(refillLiters) || 0,
      oil_in: parseFloat(oilIn) || 0,
      license_plate: selectedStaff?.license_plate || editingLog?.license_plate || '',
      time_in: timeIn,
      time_out: editingLog?.time_out || null,
      shift,
      code_abbr: selectedStaff?.license_plate || editingLog?.code_abbr || '',
      photo_url: photoUrl || '',
      signature_url: signatureUrl || '',
      status: 'Completed',
      created_at: editingLog?.created_at || new Date().toISOString()
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!timeIn) return;
    setPendingSave(buildLogPayload());
  };

  const confirmSave = async () => {
    if (!pendingSave) return;
    const wasEdit = !!editingLog;
    let result;
    if (wasEdit && onEditFuelLog) {
      result = await onEditFuelLog(pendingSave);
    } else if (onAddFuelLog) {
      result = await onAddFuelLog(pendingSave);
    }
    setPendingSave(null);
    resetForm();
    if (result && !result.success && !result.queued) return;
    setSuccessKind(result?.queued ? 'queued' : result?.success ? 'sent' : wasEdit ? 'updated' : 'saved');
    playSuccessSound();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const startEdit = (log) => {
    setEditingLog(log);
    setStationId(log.station_id || getDefaultStation());
    setRefill(log.refill_liters != null && log.refill_liters !== '' ? String(log.refill_liters) : '');
    setOilIn(log.oil_in != null && log.oil_in !== '' ? String(log.oil_in) : '');
    setStaffId(log.staff_id || null);
    setLogDate((log.log_date || log.time_in || todayStr).substring(0, 10));
    setShift(log.shift || 'Morning');
    setTimeIn(formatDatetimeForInput(log.time_in) || getNowLocal());
    setDesc(log.description || (isKm ? 'ឡានចាក់សាំង' : 'Fuel refill'));
    setPhoto(log.photo_url || '');
    setSig(log.signature_url || '');
    if (log.photo_url || log.signature_url || (log.description && log.description !== 'ឡានចាក់សាំង' && log.description !== 'Fuel refill')) {
      setShowExtra(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 0 100px' }}>

      {/* ── Page title ─────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
          }}>
            <Fuel size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {editingLog
                ? (isKm ? 'កែប្រែកត់ត្រាប្រេង' : 'Edit Fuel Log')
                : (isKm ? 'កត់ត្រាប្រេងឥន្ធនៈ' : 'Fuel Log Entry')}
            </h1>
            <p style={{ fontSize: '0.7rem', lineHeight: 1.6, paddingTop: '2px', color: 'var(--text-muted)', margin: 0 }}>
              {isKm ? `${reportLogs.length} ករណី សម្រាប់កាលបរិច្ឆេទដែលបានជ្រើស` : `${reportLogs.length} entries for the selected date`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Selected-date report snapshot ───────────── */}
      <section className="user-report-summary" style={{ margin: '22px 16px 0', padding: '13px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 800 }}>
            <FileCheck size={15} color="var(--fuel-accent)" />
            {isKm ? 'សង្ខេបរបាយការណ៍ប្រចាំថ្ងៃ' : 'Daily Report Summary'}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{logDate}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {[
            { label: isKm ? 'ប្រេងចេញ' : 'Fuel Out', value: `${reportFuelOut.toLocaleString()} L`, color: 'var(--fuel-accent)' },
            { label: isKm ? 'ប្រេងចូល' : 'Fuel In', value: `${reportFuelIn.toLocaleString()} L`, color: 'var(--success)' },
            { label: isKm ? 'ហត្ថលេខា' : 'Signed', value: `${signedReports}/${reportLogs.length}`, color: 'var(--primary)' },
            { label: isKm ? 'រូបថតភ្ជាប់' : 'Photo Evidence', value: `${photoReports}/${reportLogs.length}`, color: 'var(--text-sub)' },
          ].map(metric => (
            <div key={metric.label} style={{ padding: '8px 10px', background: 'var(--surface-subtle)', borderRadius: 'var(--r-xs)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{metric.label}</div>
              <div style={{ marginTop: '2px', fontSize: '0.9rem', fontWeight: 800, color: metric.color }}>{metric.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form card ───────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 16px 0' }}>

        {/* Station */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <MapPin size={12} color="var(--fuel-accent)" />
            {isKm ? 'ស្ថានីយ៍' : 'Station'}
          </label>
          {locked ? (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <MapPin size={14} color="var(--fuel-accent)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--fuel-accent)' }}>
                {assignedStation.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {isKm ? 'កំណត់ដោយ Admin' : 'Set by Admin'}
              </span>
            </div>
          ) : (
            <select
              className="form-control"
              value={stationId}
              onChange={e => setStationId(e.target.value)}
              required
              style={{ fontSize: '0.88rem' }}
            >
              {stations.length === 0
                ? <option value="">{isKm ? 'គ្មានស្ថានីយ៍' : 'No stations available'}</option>
                : stations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.station_name} — {s.current_stock_liters} L
                    </option>
                  ))}
            </select>
          )}
        </div>

        {/* Date + Shift in a row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Calendar size={12} />
              {isKm ? 'កាលបរិច្ឆេទ' : 'Date'}
            </label>
            <input type="date" className="form-control" value={logDate}
              onChange={e => setLogDate(e.target.value)} required style={{ fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Clock size={12} />
              {isKm ? 'វេន' : 'Shift'}
            </label>
            <select className="form-control" value={shift} onChange={e => setShift(e.target.value)} style={{ fontSize: '0.88rem' }}>
              <option value="Morning">{isKm ? '☀️ ព្រឹក' : '☀️ Morning'}</option>
              <option value="Afternoon">{isKm ? '🌤 រសៀល' : '🌤 Afternoon'}</option>
            </select>
          </div>
        </div>

        {/* Staff */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <User size={12} />
            {isKm ? 'បុគ្គលិក / អ្នកបើកបរ' : 'Staff / Driver'}
          </label>
          <StaffSelector staff={staff} selectedStaffId={selectedStaffId} onSelectStaff={handleSelectStaff} lang={lang} />
          {selectedStaff && (
            <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--fuel-subtle)', color: 'var(--fuel-accent)', borderRadius: 'var(--r-full)', fontWeight: 600 }}>
                {selectedStaff.name}
              </span>
              {selectedStaff.license_plate && (
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--bg-elevated)', color: 'var(--text-sub)', borderRadius: 'var(--r-full)', fontFamily: 'monospace' }}>
                  🚗 {selectedStaff.license_plate}
                </span>
              )}
              {signatureUrl && (
                <span style={{ fontSize: '0.68rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  ✔ {isKm ? 'ហត្ថលេខាបានផ្ទុក' : 'Signature loaded'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Volume fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Droplets size={12} color="var(--fuel-accent)" />
              {isKm ? 'ប្រេងចេញ (L)' : 'Out (L)'}
            </label>
            <input type="number" step="any" min="0" className="form-control"
              placeholder="e.g. 350" value={refillLiters}
              onChange={e => setRefill(e.target.value)} style={{ fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Droplets size={12} color="var(--success)" />
              {isKm ? 'ប្រេងចូល (L)' : 'In (L)'}
            </label>
            <input type="number" step="any" min="0" className="form-control"
              placeholder="e.g. 4000" value={oilIn}
              onChange={e => setOilIn(e.target.value)}
              style={{ fontSize: '0.88rem', borderColor: oilIn ? 'var(--success-border)' : undefined }} />
          </div>
        </div>

        {/* Time In */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
            {isKm ? 'ម៉ោង' : 'Time'}
          </label>
          <input type="datetime-local" className="form-control" value={timeIn}
            onChange={e => setTimeIn(e.target.value)} required style={{ fontSize: '0.88rem' }} />
        </div>

        {/* Expandable extras */}
        <button type="button"
          onClick={() => setShowExtra(v => !v)}
          style={{
            width: '100%', padding: '9px', marginBottom: '12px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-md)', color: 'var(--text-muted)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
          {showExtra ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isKm ? 'ព័ត៌មានបន្ថែម (ការពិពណ៌នា, រូបថត...)' : 'Extra details (description, photo...)'}
        </button>

        {showExtra && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
                {isKm ? 'ការពិពណ៌នា' : 'Description'}
              </label>
              <input type="text" className="form-control" value={description}
                onChange={e => setDesc(e.target.value)} style={{ fontSize: '0.88rem' }} />
            </div>
            <ImageUploader value={photoUrl} onChange={setPhoto}
              label={isKm ? 'រូបថត' : 'Photo'} compact />
            <ImageUploader value={signatureUrl} onChange={setSig}
              label={isKm ? 'ហត្ថលេខា' : 'Signature'} compact />
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {editingLog && (
            <button type="button" onClick={resetForm} style={{
              flex: '0 0 auto', padding: '14px 16px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--r-md)',
              color: 'var(--text-sub)', fontSize: '0.88rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <X size={16} />
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
          )}
          <button type="submit" style={{
            flex: 1, padding: '14px',
            background: editingLog ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none', borderRadius: 'var(--r-md)',
            color: '#fff', fontSize: '0.95rem', fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: editingLog ? '0 4px 16px rgba(37,99,235,0.35)' : '0 4px 16px rgba(245,158,11,0.35)',
            transition: 'transform 0.15s ease'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {editingLog ? <Pencil size={18} /> : <Fuel size={18} />}
            {editingLog
              ? (isKm ? 'កែប្រែរបាយការណ៍' : 'Update Fuel Log')
              : (isKm ? 'រក្សាទុករបាយការណ៍' : 'Save Fuel Log')}
          </button>
        </div>
      </form>

      {/* ── Selected-date logs ─────────────────────── */}
      {reportLogs.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} color="var(--success)" />
            {isKm ? `បញ្ជីរបាយការណ៍ (${reportLogs.length})` : `Report entries (${reportLogs.length})`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reportLogs.slice().reverse().map(log => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                background: editingLog?.id === log.id ? 'var(--primary-subtle)' : 'var(--surface-card)',
                border: editingLog?.id === log.id ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--fuel-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Fuel size={14} color="var(--fuel-accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.driver_name || log.description || (isKm ? 'ការចាក់សាំង' : 'Fuel entry')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {log.license_plate ? `${log.license_plate} · ` : ''}{(log.time_in || '').substring(11, 16)}
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--fuel-accent)', flexShrink: 0 }}>
                  {parseFloat(log.refill_liters || 0)}L
                </div>
                {(log.signature_url || log.photo_url) && (
                  <span title={isKm ? 'ភស្តុតាងភ្ជាប់' : 'Evidence attached'} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 700 }}>
                    {log.signature_url && <FileCheck size={13} />}
                    {log.photo_url && <ImageIcon size={13} />}
                  </span>
                )}
                {deleteConfirmId === log.id ? (
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => { if (onDeleteFuelLog) onDeleteFuelLog(log.id); setDeleteConfirmId(null); }}
                      style={{
                        padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                        background: 'var(--danger)', border: 'none', color: '#fff',
                        display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700
                      }}
                    >
                      <Check size={12} /> {isKm ? 'លុប' : 'Yes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      style={{
                        padding: '6px', borderRadius: '8px', cursor: 'pointer',
                        background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => startEdit(log)}
                      title={isKm ? 'កែប្រែ' : 'Edit'}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                        background: 'var(--primary-subtle)', border: '1px solid var(--primary-border)',
                        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(log.id)}
                      title={isKm ? 'លុប' : 'Delete'}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                        background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)',
                        color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingSave && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPendingSave(null); }}>
          <div className="modal-box modal-box-sm" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: 'var(--fuel-subtle)' }}>
                  <Fuel size={18} color="var(--fuel-accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', margin: 0 }}>
                    {editingLog
                      ? (isKm ? 'បញ្ជាក់ការកែប្រែ' : 'Confirm update')
                      : (isKm ? 'បញ្ជាក់ការរក្សាទុក' : 'Confirm save')}
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
                {editingLog
                  ? (isKm ? 'បញ្ជាក់កែប្រែ' : 'Confirm update')
                  : (isKm ? 'បញ្ជាក់រក្សាទុក' : 'Confirm save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setSuccess(false)}>
          <div className="card modal-box" style={{ width: 'min(360px, calc(100% - 32px))', textAlign: 'center', padding: '28px 22px' }} role="alertdialog" aria-modal="true">
            <div style={{ width: '52px', height: '52px', margin: '0 auto 14px', borderRadius: '50%', background: 'var(--success-subtle)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>
              {successKind === 'sent'
                ? (isKm ? 'បានផ្ញើរបាយការណ៍ជោគជ័យ!' : 'Report sent successfully!')
                : successKind === 'queued'
                  ? (isKm ? 'បានរក្សាទុករបាយការណ៍រួចហើយ' : 'Report saved and queued for sync')
                  : successKind === 'updated'
                    ? (isKm ? 'កែប្រែរបាយការណ៍ជោគជ័យ!' : 'Report updated successfully!')
                    : (isKm ? 'បានរក្សាទុករបាយការណ៍ជោគជ័យ!' : 'Report saved successfully!')}
            </h3>
            <p style={{ margin: '7px 0 18px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isKm ? 'ព័ត៌មានរបស់អ្នកត្រូវបានកត់ត្រារួចរាល់។' : 'Your report has been recorded.'}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setSuccess(false)}>{isKm ? 'យល់ព្រម' : 'Done'}</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .user-report-summary { position: relative; clear: both; isolation: isolate; }
      `}</style>
    </div>
  );
}
