import React, { useState, useEffect, useMemo } from 'react';
import {
  HardHat, Image as ImageIcon, UserCheck, Trash2, Pencil,
  X, Check, FileSpreadsheet, Search, Calendar, ChevronLeft,
  ChevronRight, RotateCcw, AlertTriangle, Layers, Filter, CheckCircle2
} from 'lucide-react';
import { translations } from '../../data/translations';
import AbbrCodeSelector from '../Common/AbbrCodeSelector';
import ImageUploader from '../Common/ImageUploader';
import { exportSoilLogsToExcel } from '../../utils/excelExport';

function formatTimeForInput(val) {
  if (!val) return '07:00';
  return val.substring(0, 5);
}

export default function SoilLogTable({
  logs = [],
  staff = [],
  onDelete,
  onEdit,
  onClearActiveLogs,
  abbrCodes = [],
  onAddAbbrCode,
  lang = 'km',
  activeDate = '',
  onDateChange,
  onOpenLogForm,
  userRole = 'user'
}) {
  const t = translations[lang] || translations.km;
  const [editingLog, setEditingLog] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(activeDate || '');
  const [plateFilter, setPlateFilter] = useState('ALL');

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (editingLog || showClearConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingLog, showClearConfirm]);

  // Sync external activeDate prop
  useEffect(() => {
    if (activeDate !== undefined && activeDate !== null) {
      setDateFilter(activeDate);
    }
  }, [activeDate]);

  const handleDateChange = (newDate) => {
    setDateFilter(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const handlePrevDay = () => {
    const base = dateFilter ? new Date(dateFilter) : new Date();
    base.setDate(base.getDate() - 1);
    handleDateChange(base.toISOString().substring(0, 10));
  };

  const handleNextDay = () => {
    const base = dateFilter ? new Date(dateFilter) : new Date();
    base.setDate(base.getDate() + 1);
    handleDateChange(base.toISOString().substring(0, 10));
  };

  const handleToday = () => {
    handleDateChange(new Date().toISOString().substring(0, 10));
  };

  const handleYesterday = () => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    handleDateChange(yest.toISOString().substring(0, 10));
  };

  const handleAllDates = () => {
    handleDateChange('');
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date filter
      if (dateFilter) {
        const logDate = log.log_date || (log.created_at ? log.created_at.substring(0, 10) : '');
        if (logDate !== dateFilter) return false;
      }

      // Plate filter
      if (plateFilter !== 'ALL' && log.code_abbr !== plateFilter) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const station = (log.station_name || '').toLowerCase();
        const issue = (log.issues_description || '').toLowerCase();
        if (!station.includes(term) && !code.includes(term) && !issue.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [logs, dateFilter, plateFilter, searchTerm]);



  // Merge real fleet plates and purge old demo mock data
  const allAvailablePlates = useMemo(() => {
    const demoPlates = new Set(['2A-8899', '3B-4455', 'PP-3912', '3C-7788']);
    const staffPlates = staff.map(s => s.license_plate?.trim()).filter(Boolean);
    const combined = Array.from(new Set([...staffPlates, ...abbrCodes])).filter(p => !demoPlates.has(p));
    return combined;
  }, [staff, abbrCodes]);

  // Unique plates for filtering dropdown
  const uniquePlates = useMemo(() => {
    const demoPlates = new Set(['2A-8899', '3B-4455', 'PP-3912', '3C-7788']);
    const set = new Set();
    logs.forEach(l => { if (l.code_abbr) set.add(l.code_abbr); });
    staff.forEach(s => { if (s.license_plate) set.add(s.license_plate); });
    return Array.from(set).filter(p => !demoPlates.has(p));
  }, [logs, staff]);

  const handleEditSave = () => {
    if (!editingLog) return;
    const trips = parseInt(editingLog.trip_count, 10) || 0;
    const m3 = parseFloat(editingLog.cubic_meters_per_trip) || 0;
    const updated = {
      ...editingLog,
      trip_count: trips,
      cubic_meters_per_trip: m3,
      total_cubic_meters: trips * m3
    };
    onEdit(updated);
    setEditingLog(null);
  };

  const handleExport = () => {
    const dateSuffix = dateFilter ? `_${dateFilter}` : `_All_${new Date().toISOString().substring(0, 10)}`;
    exportSoilLogsToExcel(filteredLogs, `Soil_Logs${dateSuffix}.xlsx`, lang);
  };

  const handleConfirmClear = () => {
    if (onClearActiveLogs) {
      onClearActiveLogs();
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      {/* ── Header Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <div style={{ padding: '6px', background: 'var(--soil-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--soil-accent)', display: 'flex' }}>
            <HardHat size={18} />
          </div>
          <span>{t.soilLogsTitle}</span>
          <span className="badge badge-neutral font-mono" style={{ fontSize: '0.72rem' }}>
            {filteredLogs.length} / {logs.length}
          </span>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenLogForm && (
            <button
              onClick={() => onOpenLogForm(dateFilter)}
              className="btn btn-soil btn-sm"
              style={{ height: '32px', fontSize: '0.78rem' }}
            >
              + {lang === 'km' ? 'កត់ត្រាការដឹកដី' : 'Log Soil Entry'}
            </button>
          )}

          <button
            onClick={handleExport}
            className="btn btn-success btn-sm"
            style={{ height: '32px', fontSize: '0.76rem', background: '#10b981', color: '#ffffff', borderColor: '#059669' }}
            title={lang === 'km' ? 'ទាញយកទិន្នន័យចាក់ដីជាឯកសារ Excel (.xlsx)' : 'Export soil logs as Excel (.xlsx)'}
          >
            <FileSpreadsheet size={13} />
            <span>{lang === 'km' ? 'ទាញយក Excel' : 'Export Excel'}</span>
          </button>

          {userRole === 'admin' && onClearActiveLogs && logs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn btn-secondary btn-sm"
              style={{ height: '32px', fontSize: '0.76rem', color: 'var(--danger)' }}
              title={lang === 'km' ? 'សម្អាតទិន្នន័យទាំងអស់' : 'Clear all logs'}
            >
              <RotateCcw size={13} />
              <span>{lang === 'km' ? 'សម្អាតតារាង' : 'Clear Table'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Date Navigation & Filter Bar ── */}
      <div className="office-date-ctrl-bar" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrevDay}
            className="office-date-btn"
            title={lang === 'km' ? 'ថ្ងៃមុន' : 'Previous Day'}
          >
            <ChevronLeft size={15} />
          </button>

          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={e => handleDateChange(e.target.value)}
            style={{ width: '150px', height: '32px', fontSize: '0.78rem' }}
          />

          <button
            onClick={handleNextDay}
            className="office-date-btn"
            title={lang === 'km' ? 'ថ្ងៃបន្ទាប់' : 'Next Day'}
          >
            <ChevronRight size={15} />
          </button>

          <button
            onClick={handleToday}
            className={`btn btn-sm ${dateFilter === new Date().toISOString().substring(0, 10) ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: '32px', fontSize: '0.75rem' }}
          >
            {lang === 'km' ? 'ថ្ងៃនេះ' : 'Today'}
          </button>

          <button
            onClick={handleYesterday}
            className="btn btn-secondary btn-sm"
            style={{ height: '32px', fontSize: '0.75rem' }}
          >
            {lang === 'km' ? 'ម្សិលមិញ' : 'Yesterday'}
          </button>

          <button
            onClick={handleAllDates}
            className={`btn btn-sm ${!dateFilter ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: '32px', fontSize: '0.75rem' }}
          >
            {lang === 'km' ? 'គ្រប់កាលបរិច្ឆេទ' : 'All Dates'}
          </button>
        </div>

        {/* Search & Plate Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="filter-input-wrap">
            <Search size={14} className="filter-icon" />
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'km' ? 'ស្វែងរក ផ្លាកលេខ/ទីតាំង...' : 'Search plate/location...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '180px', height: '32px', fontSize: '0.78rem' }}
            />
          </div>

          {uniquePlates.length > 0 && (
            <select
              className="form-control"
              value={plateFilter}
              onChange={e => setPlateFilter(e.target.value)}
              style={{ width: '130px', height: '32px', fontSize: '0.78rem' }}
            >
              <option value="ALL">{lang === 'km' ? 'គ្រប់ផ្លាកលេខ' : 'All Plates'}</option>
              {uniquePlates.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
        </div>
      </div>



      {/* ── Clear Table Confirmation Modal ── */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1200, backdropFilter: 'blur(6px)'
        }}>
          <div className="card" style={{ width: '420px', padding: '24px', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                {lang === 'km' ? 'បញ្ជាក់ការសម្អាតទិន្នន័យ' : 'Confirm Clear Table'}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {lang === 'km'
                ? 'តើលោកអ្នកពិតជាចង់លុបទិន្នន័យចាក់ដីទាំងអស់ចេញពីតារាង និងប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។'
                : 'Are you sure you want to clear all active soil logs from the database? This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1, padding: '10px', fontWeight: 700 }}
                onClick={handleConfirmClear}
              >
                {lang === 'km' ? 'យល់ព្រមលុបទាំងអស់' : 'Clear All'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setShowClearConfirm(false)}
              >
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal for Soil Log ── */}
      {editingLog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, backdropFilter: 'blur(6px)'
        }}>
          <div className="card" style={{ width: '540px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--soil-accent)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                  {lang === 'km' ? 'កែប្រែរបាយការណ៍ចាក់ដី' : 'Edit Soil Log'}
                </h3>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">{t.stationNameLabel}</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingLog.station_name || ''}
                  onChange={e => setEditingLog({ ...editingLog, station_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.codeAbbr}</label>
                <AbbrCodeSelector
                  value={editingLog.code_abbr || ''}
                  onChange={val => setEditingLog({ ...editingLog, code_abbr: val })}
                  abbrCodes={abbrCodes}
                  onAddAbbrCode={onAddAbbrCode}
                  lang={lang}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.tripCountLabel}</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingLog.trip_count ?? ''}
                  onChange={e => setEditingLog({ ...editingLog, trip_count: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.m3PerTripLabel}</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={editingLog.cubic_meters_per_trip ?? ''}
                  onChange={e => setEditingLog({ ...editingLog, cubic_meters_per_trip: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.dateLabel}</label>
                <input
                  type="date"
                  className="form-control"
                  value={editingLog.log_date || (editingLog.created_at ? editingLog.created_at.substring(0, 10) : '')}
                  onChange={e => setEditingLog({ ...editingLog, log_date: e.target.value })}
                />
              </div>


              <div className="form-group">
                <label className="form-label">{lang === 'km' ? 'ម៉ោងចាប់ផ្តើម' : 'Start Time'}</label>
                <input
                  type="time"
                  className="form-control"
                  value={formatTimeForInput(editingLog.time_start)}
                  onChange={e => setEditingLog({ ...editingLog, time_start: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'km' ? 'ម៉ោងបញ្ចប់' : 'End Time'}</label>
                <input
                  type="time"
                  className="form-control"
                  value={formatTimeForInput(editingLog.time_end)}
                  onChange={e => setEditingLog({ ...editingLog, time_end: e.target.value })}
                />
              </div>
            </div>



            <div className="form-group">
              <label className="form-label">{t.issuesInputLabel}</label>
              <input
                type="text"
                className="form-control"
                value={editingLog.issues_description || ''}
                onChange={e => setEditingLog({ ...editingLog, issues_description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <ImageUploader
                value={editingLog.signature_url || ''}
                onChange={val => setEditingLog({ ...editingLog, signature_url: val })}
                label={lang === 'km' ? 'ហត្ថលេខា (Signature)' : 'Signature'}
                compact
                removeBackground
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-soil" style={{ flex: 1, padding: '10px' }} onClick={handleEditSave}>
                <Check size={15} /> {lang === 'km' ? 'រក្សាទុក' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setEditingLog(null)}>
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Data Table ── */}
      <div className="data-table-wrapper hide-on-mobile">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '42px', textAlign: 'center' }}>#</th>
              <th>{t.thCode}</th>
              <th>{t.thDateRange}</th>
              <th>{t.thTrips}</th>
              <th>{t.thTotalM3}</th>
              <th style={{ textAlign: 'center', width: '80px' }}>{lang === 'km' ? 'ហត្ថលេខា' : 'Sign'}</th>
              <th>{t.thReceipt}</th>
              <th>{t.thIssues}</th>
              <th style={{ textAlign: 'center' }}>{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px' }}>
                  <HardHat size={28} style={{ margin: '0 auto 8px auto', opacity: 0.3 }} />
                  <div>{t.noData}</div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={log.id}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-dim)', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td>
                    <span className="badge badge-info">{log.code_abbr || 'SL-N/A'}</span>
                    {log.station_name && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '3px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.station_name}>
                        {log.station_name}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {log.log_date || (log.created_at ? log.created_at.substring(0, 10) : '—')}<br />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {formatTimeForInput(log.time_start)} - {formatTimeForInput(log.time_end)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.trip_count} {t.tripsUnit}</td>
                  <td style={{ fontWeight: 700, color: 'var(--soil-accent)' }}>
                    {(parseFloat(log.total_cubic_meters) || (parseFloat(log.trip_count) * parseFloat(log.cubic_meters_per_trip)) || 0).toLocaleString()} m³
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-dim)' }}>
                      ({log.cubic_meters_per_trip} m³/{t.tripsUnit})
                    </div>
                  </td>
                  {/* Sign */}
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {log.signature_url || log.signature_data_url ? (
                      <a
                        href={log.signature_url || log.signature_data_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={lang === 'km' ? 'មើលរូបហត្ថលេខា' : 'View Signature Image'}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <img
                          src={log.signature_url || log.signature_data_url}
                          alt="Signature"
                          style={{
                            maxHeight: '26px', maxWidth: '75px', objectFit: 'contain',
                            background: '#ffffff', borderRadius: '4px', padding: '2px 4px',
                            border: '1px solid var(--border-subtle, #cbd5e1)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {log.receipt_photo_url ? (
                      <a href={log.receipt_photo_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}>
                        <ImageIcon size={12} /> {t.receiptLink}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>-</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: log.issues_description ? '#fca5a5' : 'var(--text-dim)' }}>
                    {log.issues_description || '-'}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {deleteConfirmId === log.id ? (
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => { onDelete && onDelete(log.id); setDeleteConfirmId(null); }}
                          style={{ background: '#ef4444', border: 'none', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}
                        >
                          {lang === 'km' ? 'បញ្ជាក់' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{ background: 'var(--border-medium)', border: 'none', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }}
                        >
                          {lang === 'km' ? 'ទេ' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          title={lang === 'km' ? 'កែប្រែ' : 'Edit'}
                          onClick={() => setEditingLog({ ...log })}
                          style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Pencil size={12} /> {lang === 'km' ? 'កែ' : 'Edit'}
                        </button>
                        <button
                          title={lang === 'km' ? 'លុប' : 'Delete'}
                          onClick={() => setDeleteConfirmId(log.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Trash2 size={12} /> {lang === 'km' ? 'លុប' : 'Del'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Native Cards List (Shown only on Mobile) ── */}
      <div className="mobile-logs-list hide-on-desktop">
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <HardHat size={28} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.85rem' }}>{t.noData}</div>
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={log.id} className="mobile-log-card">
              <div className="mobile-log-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', minWidth: '18px' }}>#{idx + 1}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    {log.code_abbr || 'SL-N/A'}
                  </span>
                  {log.station_name && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }} title={log.station_name}>
                      {log.station_name}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {log.log_date || (log.created_at ? log.created_at.substring(0, 10) : '')}
                </div>
              </div>

              <div className="mobile-log-card-body">
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.trip_count} {t.tripsUnit} ({log.cubic_meters_per_trip} m³/{t.tripsUnit})
                  </div>
                  {log.issues_description && (
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: '2px' }}>
                      ⚠ {log.issues_description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--soil-accent)', lineHeight: 1 }}>
                    {(parseFloat(log.total_cubic_meters) || (parseFloat(log.trip_count) * parseFloat(log.cubic_meters_per_trip)) || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>m³</span>
                  </div>
                </div>
              </div>

              <div className="mobile-log-card-footer">
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {log.receipt_photo_url && (
                    <a
                      href={log.receipt_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ImageIcon size={11} /> {t.receiptLink}
                    </a>
                  )}
                  {(log.signature_url || log.signature_data_url) && (
                    <a
                      href={log.signature_url || log.signature_data_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <CheckCircle2 size={11} /> {lang === 'km' ? 'ហត្ថលេខា' : 'Sign'}
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingLog({ ...log })}
                    className="mobile-action-btn edit"
                  >
                    <Pencil size={12} color="var(--soil-accent)" />
                    <span>{lang === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(log.id)}
                    className="mobile-action-btn delete"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'km' ? 'លុប' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
