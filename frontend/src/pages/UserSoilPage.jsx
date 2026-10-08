import React, { useState, useEffect } from 'react';
import { HardHat, Plus, CheckCircle2, MapPin, Calendar, ChevronDown, ChevronUp, Truck, Box } from 'lucide-react';
import AbbrCodeSelector from '../components/Common/AbbrCodeSelector';
import ImageUploader from '../components/Common/ImageUploader';
import { playSuccessSound } from '../utils/notifications';

export default function UserSoilPage({
  soilLogs = [], abbrCodes = [], onAddAbbrCode,
  onAddSoilLog, lang = 'km',
  assignedStation = { id: '', name: '' }
}) {
  const isKm = lang === 'km';
  const todayStr = new Date().toISOString().substring(0, 10);

  const defaultName = assignedStation?.name || (isKm ? 'ស្ថានីយ៍ចាក់ដី' : 'Soil Site');
  const [stationName, setStation] = useState(defaultName);
  const [codeAbbr, setCode]       = useState('');
  const [tripCount, setTrips]     = useState('');
  const [m3PerTrip, setM3]        = useState('');
  const [scrap, setScrap]         = useState('');
  const [decisions, setDecisions] = useState('');
  const [issues, setIssues]       = useState('');
  const [photo, setPhoto]         = useState('');
  const [logDate, setDate]        = useState(todayStr);
  const [timeStart, setStart]     = useState('07:00');
  const [timeEnd, setEnd]         = useState('17:30');
  const [showExtra, setShowExtra] = useState(false);
  const [isSuccess, setSuccess]   = useState(false);

  useEffect(() => {
    if (assignedStation?.name) setStation(assignedStation.name);
  }, [assignedStation?.name]);

  const locked = !!assignedStation?.name;
  const totalVol = (parseFloat(tripCount) || 0) * (parseFloat(m3PerTrip) || 0);
  const reportLogs = soilLogs.filter(l => (l.log_date || '').substring(0, 10) === logDate);
  const reportTrips = reportLogs.reduce((sum, log) => sum + (parseInt(log.trip_count, 10) || 0), 0);
  const reportVolume = reportLogs.reduce((sum, log) => sum + (parseFloat(log.total_cubic_meters) || 0), 0);
  const receiptCount = reportLogs.filter(log => log.receipt_photo_url).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stationName || !tripCount || !m3PerTrip) return;
    const result = await onAddSoilLog({
      id: `slog-${Date.now()}`,
      station_name: stationName,
      code_abbr: codeAbbr || 'SL-001',
      logged_by: 'user',
      trip_count: parseInt(tripCount, 10),
      cubic_meters_per_trip: parseFloat(m3PerTrip),
      total_cubic_meters: totalVol,
      scrap_sales_amount: parseFloat(scrap) || 0,
      staff_decisions: decisions || (isKm ? 'ប្រតិបត្តិការតាមផែនការ' : 'Operations as planned'),
      issues_description: issues || '',
      receipt_photo_url: photo || '',
      log_date: logDate,
      time_start: timeStart,
      time_end: timeEnd,
      created_at: new Date().toISOString()
    });
    setTrips(''); setM3(''); setScrap(''); setDecisions(''); setIssues(''); setPhoto(''); setCode('');
    if (!result || result.success || result.queued) {
      playSuccessSound();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 0 100px' }}>

      {/* ── Page title ─────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
          }}>
            <HardHat size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {isKm ? 'កត់ត្រាការចាក់ដី' : 'Soil Log Entry'}
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
            <Box size={15} color="var(--soil-accent)" />
            {isKm ? 'សង្ខេបរបាយការណ៍ប្រចាំថ្ងៃ' : 'Daily Report Summary'}
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{logDate}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {[
            { label: isKm ? 'ចំនួនករណី' : 'Entries', value: reportLogs.length, color: 'var(--soil-accent)' },
            { label: isKm ? 'ចំនួនដំណើរ' : 'Trips', value: reportTrips, color: 'var(--text-main)' },
            { label: isKm ? 'មាឌសរុប' : 'Total Volume', value: `${reportVolume.toFixed(1)} m³`, color: 'var(--soil-accent)' },
            { label: isKm ? 'រូបថតបង្កាន់ដៃ' : 'Receipt Evidence', value: `${receiptCount}/${reportLogs.length}`, color: 'var(--text-sub)' },
          ].map(metric => (
            <div key={metric.label} style={{ padding: '8px 10px', background: 'var(--surface-subtle)', borderRadius: 'var(--r-xs)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{metric.label}</div>
              <div style={{ marginTop: '2px', fontSize: '0.9rem', fontWeight: 800, color: metric.color }}>{metric.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form ────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 16px 0' }}>

        {/* Station */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <MapPin size={12} color="var(--soil-accent)" />
            {isKm ? 'ទីតាំង / ស្ថានីយ៍' : 'Station / Site'}
          </label>
          {locked ? (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <MapPin size={14} color="var(--soil-accent)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--soil-accent)' }}>
                {assignedStation.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {isKm ? 'កំណត់ដោយ Admin' : 'Set by Admin'}
              </span>
            </div>
          ) : (
            <input type="text" className="form-control" value={stationName}
              onChange={e => setStation(e.target.value)} required style={{ fontSize: '0.88rem' }} />
          )}
        </div>

        {/* Date + Code in row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Calendar size={12} />
              {isKm ? 'កាលបរិច្ឆេទ' : 'Date'}
            </label>
            <input type="date" className="form-control" value={logDate}
              onChange={e => setDate(e.target.value)} required style={{ fontSize: '0.88rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
              {isKm ? 'លេខកូដ' : 'Code'}
            </label>
            <AbbrCodeSelector value={codeAbbr} onChange={setCode} abbrCodes={abbrCodes} onAddAbbrCode={onAddAbbrCode} lang={lang} />
          </div>
        </div>

        {/* Trips + m3/trip + Total */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} />
            {isKm ? 'ចំនួនដំណើរ & មាឌ' : 'Trips & Volume'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{isKm ? 'ដំណើរ' : 'Trips'}</div>
              <input type="number" className="form-control" placeholder="24"
                value={tripCount} onChange={e => setTrips(e.target.value)} required style={{ fontSize: '0.88rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{isKm ? 'm³/ដំណើរ' : 'm³/trip'}</div>
              <input type="number" step="any" className="form-control" placeholder="12.5"
                value={m3PerTrip} onChange={e => setM3(e.target.value)} required style={{ fontSize: '0.88rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--soil-accent)', marginBottom: '4px', fontWeight: 700 }}>{isKm ? 'សរុប' : 'Total'}</div>
              <div style={{
                padding: '8px 10px', borderRadius: 'var(--r-sm)',
                background: 'var(--soil-subtle)', border: '1px solid var(--soil-border)',
                fontSize: '0.88rem', fontWeight: 800, color: 'var(--soil-accent)',
                minHeight: '38px', display: 'flex', alignItems: 'center'
              }}>
                {totalVol > 0 ? `${totalVol.toFixed(1)} m³` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Time range */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
            {isKm ? 'ម៉ោងចាប់ផ្តើម — បញ្ចប់' : 'Time Start — End'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input type="time" className="form-control" value={timeStart}
              onChange={e => setStart(e.target.value)} style={{ fontSize: '0.88rem' }} />
            <input type="time" className="form-control" value={timeEnd}
              onChange={e => setEnd(e.target.value)} style={{ fontSize: '0.88rem' }} />
          </div>
        </div>

        {/* Extra toggle */}
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
          {isKm ? 'ព័ត៌មានបន្ថែម (ការសម្រេចចិត្ត, បញ្ហា, រូបថត)' : 'Extra (decisions, issues, photo...)'}
        </button>

        {showExtra && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
                {isKm ? 'ការសម្រេចចិត្ត' : 'Decisions'}
              </label>
              <textarea rows={2} className="form-control" value={decisions}
                onChange={e => setDecisions(e.target.value)} style={{ fontSize: '0.88rem' }}
                placeholder={isKm ? 'ឧ. បន្ថែមឡាន ២ គ្រឿង...' : 'e.g. Added 2 extra trucks...'} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
                {isKm ? 'ប្រេងលក់/ការស' : 'Scrap Sales ($)'}
              </label>
              <input type="number" step="any" className="form-control" value={scrap}
                onChange={e => setScrap(e.target.value)} placeholder="e.g. 150.00" style={{ fontSize: '0.88rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' }}>
                {isKm ? 'បញ្ហា' : 'Issues'}
              </label>
              <input type="text" className="form-control" value={issues}
                onChange={e => setIssues(e.target.value)} style={{ fontSize: '0.88rem' }}
                placeholder={isKm ? 'ឧ. ភ្លៀងធ្លាក់...' : 'e.g. Heavy rain...'} />
            </div>
            <ImageUploader value={photo} onChange={setPhoto}
              label={isKm ? 'រូបថតវិក្កយបត្រ' : 'Receipt Photo'} compact />
          </div>
        )}

        {/* Submit */}
        <button type="submit" style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          border: 'none', borderRadius: 'var(--r-md)',
          color: '#fff', fontSize: '0.95rem', fontWeight: 800,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
          transition: 'transform 0.15s ease'
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <HardHat size={18} />
          {isKm ? 'រក្សាទុករបាយការណ៍ដី' : 'Save Soil Log'}
        </button>
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
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                background: 'var(--surface-card)', border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--soil-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HardHat size={14} color="var(--soil-accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.station_name || (isKm ? 'ការចាក់ដី' : 'Soil operation')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {log.trip_count} {isKm ? 'ដំណើរ' : 'trips'} · {log.time_start}–{log.time_end}
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--soil-accent)', flexShrink: 0 }}>
                  {parseFloat(log.total_cubic_meters || 0).toFixed(1)}m³
                </div>
              </div>
            ))}
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
              {isKm ? 'បានផ្ញើរបាយការណ៍ជោគជ័យ!' : 'Report sent successfully!'}
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
