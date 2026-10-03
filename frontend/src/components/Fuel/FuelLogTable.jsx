import React, { useState, useEffect } from 'react';
import {
  Fuel, FileSignature, Trash2, Pencil, X, Check,
  Search, Calendar, RotateCcw, Save, Archive,
  Layers, CheckCircle2, BarChart2, Zap, Filter, FileText,
  ChevronLeft, ChevronRight, Plus, Clock, FileSpreadsheet, Download
} from 'lucide-react';
import { translations } from '../../data/translations';
import AbbrCodeSelector from '../Common/AbbrCodeSelector';
import GenerateDocumentModal from './GenerateDocumentModal';
import { formatDateKhmer, formatDateEnglish } from './FuelDateMaster';
import { exportFuelLogsToExcel } from '../../utils/excelExport';

function formatDatetimeForInput(val) {
  if (!val) return '';
  return val.substring(0, 16);
}

function formatTime12h(timeStr) {
  if (!timeStr) return '—';
  let hhmm = timeStr;
  if (timeStr.includes('T')) {
    hhmm = timeStr.substring(11, 16);
  } else if (timeStr.includes(':')) {
    hhmm = timeStr.substring(0, 5);
  } else {
    return timeStr;
  }
  const parts = hhmm.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

function getStoredArchives() {
  try {
    const raw = localStorage.getItem('saved_fuel_table_archives');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function FuelLogTable({
  logs = [],
  stations = [],
  onDelete,
  onEdit,
  onClearActiveLogs,
  abbrCodes = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  drivers = [],
  onAddDriver,
  onDeleteDriver,
  staff = [],
  lang = 'km',
  activeDate = '',
  onDateChange,
  onOpenLogForm,
  initialViewMode = 'LIVE',
  savedArchives: externalArchives,
  setSavedArchives: externalSetArchives
}) {
  const t = translations[lang] || translations.km;
  const [editingLog, setEditingLog]       = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [internalArchives, setInternalArchives] = useState(getStoredArchives);
  const savedArchives = externalArchives || internalArchives;
  const setSavedArchives = externalSetArchives || setInternalArchives;

  const [viewMode, setViewMode]           = useState(initialViewMode); // LIVE | ARCHIVE | ALL_DATES
  const [selectedArchiveId, setSelectedArchiveId] = useState('');
  const [toastMsg, setToastMsg]           = useState('');
  const [showDocModal, setShowDocModal]   = useState(false);

  // Filters
  const [searchTerm, setSearchTerm]     = useState('');
  const [dateFilter, setDateFilter]     = useState(activeDate || '');
  const [shiftFilter, setShiftFilter]   = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');

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

  useEffect(() => {
    try { localStorage.setItem('saved_fuel_table_archives', JSON.stringify(savedArchives)); }
    catch (e) { console.error(e); }
  }, [savedArchives]);

  // ── Handlers ──────────────────────────────────────────
  const handleEditSave = () => {
    if (!editingLog) return;
    onEdit({
      ...editingLog,
      refill_liters: parseFloat(editingLog.refill_liters) || 0,
      oil_in: parseFloat(editingLog.oil_in) || 0
    });
    setEditingLog(null);
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 4000); };

  const handleSaveTable = () => {
    if (logs.length === 0) {
      alert(lang === 'km' ? 'គ្មានទិន្នន័យក្នុងតារាងបច្ចុប្បន្ន' : 'No entries to save.');
      return;
    }
    const todayStr = new Date().toISOString().substring(0, 10);
    const totalLiters = logs.reduce((sum, l) => sum + (parseFloat(l.refill_liters) || 0), 0);
    const newArchive = {
      id: 'arch-' + Date.now(),
      date: todayStr,
      saved_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total_liters: totalLiters,
      logs: [...logs]
    };
    setSavedArchives([newArchive, ...savedArchives]);
    if (onClearActiveLogs) onClearActiveLogs();
    showToast(lang === 'km' ? 'បានរក្សាទុកតារាងជោគជ័យ! ផ្ទៃការងារបានសម្អាត។' : 'Table saved! Active table is now clean.');
  };

  const handleClearWorkingTable = () => {
    if (logs.length === 0) return;
    if (window.confirm(lang === 'km' ? 'តើអ្នកពិតជាចង់សម្អាតតារាងបច្ចុប្បន្នមែនទេ?' : 'Clear active table?')) {
      if (onClearActiveLogs) onClearActiveLogs();
    }
  };

  const handleDeleteArchive = (archId) => {
    if (window.confirm(lang === 'km' ? 'លុបរបាយការណ៍ថ្ងៃ?' : 'Delete this saved archive?')) {
      setSavedArchives(savedArchives.filter(a => a.id !== archId));
      if (selectedArchiveId === archId) { setSelectedArchiveId(''); setViewMode('LIVE'); }
    }
  };

  // ── Compute displayed logs ─────────────────────────────
  const activeArchive = savedArchives.find(a => a.id === selectedArchiveId);
  let displayedLogs = [];
  if (viewMode === 'LIVE') displayedLogs = logs;
  else if (viewMode === 'ARCHIVE') displayedLogs = activeArchive ? activeArchive.logs : [];
  else displayedLogs = [...logs, ...savedArchives.flatMap(a => a.logs)];

  const uniqueStations = Array.from(new Set(displayedLogs.map(l => l.station_name).filter(Boolean)));

  const filteredLogs = displayedLogs.filter(log => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      (log.description?.toLowerCase().includes(s)) ||
      (log.driver_name?.toLowerCase().includes(s)) ||
      (log.license_plate?.toLowerCase().includes(s)) ||
      (log.code_abbr?.toLowerCase().includes(s)) ||
      (log.station_name?.toLowerCase().includes(s)) ||
      (log.logged_by?.toLowerCase().includes(s));
    const logDate = log.log_date || log.time_in?.substring(0, 10) || '';
    const matchDate    = !dateFilter || logDate === dateFilter;
    const matchShift   = shiftFilter === 'ALL' || (log.shift || 'Morning') === shiftFilter;
    const matchStation = stationFilter === 'ALL' || log.station_name === stationFilter;
    return matchSearch && matchDate && matchShift && matchStation;
  });

  const hasFilters = searchTerm || dateFilter || shiftFilter !== 'ALL' || stationFilter !== 'ALL';

  // Totals
  const liveTotalLiters     = logs.reduce((sum, l) => sum + (parseFloat(l.refill_liters) || 0), 0);
  const archivedTotalLiters = savedArchives.reduce((sum, a) => sum + a.total_liters, 0);
  const allTotalLiters      = liveTotalLiters + archivedTotalLiters;
  const filteredTotal       = filteredLogs.reduce((sum, l) => sum + (parseFloat(l.refill_liters) || 0), 0);

  // Date group for ALL_DATES
  const groupedByDate = {};
  if (viewMode === 'ALL_DATES') {
    filteredLogs.forEach(log => {
      const d = log.time_in?.substring(0, 10) || 'N/A';
      if (!groupedByDate[d]) groupedByDate[d] = { count: 0, total: 0 };
      groupedByDate[d].count++;
      groupedByDate[d].total += parseFloat(log.refill_liters) || 0;
    });
  }

  // Shift style helper
  const shiftStyle = (shift) => shift === 'Afternoon'
    ? { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }
    : { background: 'rgba(245,158,11,0.1)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.3)' };

  return (
    <div className="table-panel">
      {/* ── Toast ── */}
      {toastMsg && (
        <div className="alert alert-success" style={{ margin: '16px 20px 0', animation: 'fadeIn 0.2s ease' }}>
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Panel Header ── */}
      <div className="table-panel-header">
        <div className="table-panel-title">
          <div style={{ padding: '7px', background: 'var(--fuel-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--fuel-accent)', display: 'flex' }}>
            <Fuel size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {lang === 'km' ? 'ប្រវត្តិការប្រើប្រាស់សាំង' : 'Fuel Consumption Log'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {lang === 'km' ? 'ស្ថានភាព' : 'Live'}: {logs.length} {lang === 'km' ? 'ក.' : 'entries'} ·{' '}
              {lang === 'km' ? 'ប័ណ្ណ' : 'Archives'}: {savedArchives.length} {lang === 'km' ? 'ថ្ងៃ' : 'days'} ·{' '}
              {lang === 'km' ? 'សរុប' : 'Total'}: {allTotalLiters.toLocaleString()} L
            </div>
          </div>
        </div>

        {/* Save & Clear */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => setShowDocModal(true)} className="btn btn-primary btn-sm" title={lang === 'km' ? 'បង្កើតឯកសារ' : 'Generate Document'}>
            <FileText size={13} /> {lang === 'km' ? 'បង្កើតឯកសារ' : 'Generate Doc'}
          </button>
          <button onClick={handleSaveTable} className="btn btn-success btn-sm" title={lang === 'km' ? 'រក្សាទុក និងសម្អាត' : 'Save & archive'}>
            <Save size={13} /> {lang === 'km' ? 'រក្សាទុក' : 'Save Table'}
          </button>
          <button onClick={handleClearWorkingTable} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}>
            <Trash2 size={13} /> {lang === 'km' ? 'សម្អាត' : 'Clear'}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* ── Summary Stat Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            {
              label: lang === 'km' ? 'ការប្រើប្រាស់ - ផ្ទាល់' : 'Active Table',
              value: `${liveTotalLiters.toLocaleString()} L`,
              color: 'var(--fuel-accent)',
              bg: 'var(--fuel-subtle)',
              border: 'var(--fuel-border)',
              icon: <Zap size={13} />
            },
            {
              label: lang === 'km' ? 'ការរក្សាទុក' : 'Saved Archives',
              value: `${savedArchives.length} ${lang === 'km' ? 'ថ្ងៃ' : 'days'}`,
              sub: `(${archivedTotalLiters.toLocaleString()} L)`,
              color: 'var(--primary)',
              bg: 'var(--primary-subtle)',
              border: 'var(--primary-border)',
              icon: <Archive size={13} />
            },
            {
              label: lang === 'km' ? 'សរុបគ្រប់ថ្ងៃ' : 'All-Time Total',
              value: `${allTotalLiters.toLocaleString()} L`,
              color: 'var(--success)',
              bg: 'var(--success-subtle)',
              border: 'var(--success-border)',
              icon: <BarChart2 size={13} />
            }
          ].map(({ label, value, sub, color, bg, border, icon }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${border}`,
              borderRadius: 'var(--r-sm)', padding: '11px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {value}
              </div>
              {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Modern Office Date & Shift Navigator ── */}
        <div className="office-date-ctrl-bar">
          <div className="office-date-jumper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handlePrevDay}
                className="office-date-btn"
                title={lang === 'km' ? 'ថ្ងៃមុន' : 'Previous Day'}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="office-date-display">
                <Calendar size={14} color="var(--fuel-accent)" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => handleDateChange(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                {dateFilter && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-medium)', paddingLeft: '8px' }}>
                    {lang === 'km' ? formatDateKhmer(dateFilter) : formatDateEnglish(dateFilter)}
                  </span>
                )}
              </div>

              <button
                onClick={handleNextDay}
                className="office-date-btn"
                title={lang === 'km' ? 'ថ្ងៃបន្ទាប់' : 'Next Day'}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Quick Preset Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <button
                className={`office-preset-pill ${dateFilter === new Date().toISOString().substring(0, 10) ? 'active' : ''}`}
                onClick={handleToday}
              >
                {lang === 'km' ? 'ថ្ងៃនេះ' : 'Today'}
              </button>
              <button
                className={`office-preset-pill ${(() => {
                  const y = new Date(); y.setDate(y.getDate() - 1);
                  return dateFilter === y.toISOString().substring(0, 10);
                })() ? 'active' : ''}`}
                onClick={handleYesterday}
              >
                {lang === 'km' ? 'ម្សិលមិញ' : 'Yesterday'}
              </button>
              <button
                className={`office-preset-pill ${!dateFilter ? 'active' : ''}`}
                onClick={handleAllDates}
              >
                {lang === 'km' ? 'គ្រប់កាលបរិច្ឆេទ' : 'All Dates'}
              </button>
            </div>
          </div>

          {/* Shift Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
              {lang === 'km' ? 'វេន:' : 'Shift:'}
            </span>
            <button
              className={`tab-btn ${shiftFilter === 'ALL' ? 'active-fuel' : ''}`}
              onClick={() => setShiftFilter('ALL')}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {lang === 'km' ? 'គ្រប់វេន' : 'All'}
            </button>
            <button
              className={`tab-btn ${shiftFilter === 'Morning' ? 'active-fuel' : ''}`}
              onClick={() => setShiftFilter('Morning')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', color: shiftFilter === 'Morning' ? '#fbbf24' : undefined }}
            >
              {lang === 'km' ? 'ព្រឹក' : 'Morning'}
            </button>
            <button
              className={`tab-btn ${shiftFilter === 'Afternoon' ? 'active-fuel' : ''}`}
              onClick={() => setShiftFilter('Afternoon')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', color: shiftFilter === 'Afternoon' ? '#38bdf8' : undefined }}
            >
              {lang === 'km' ? 'រសៀល' : 'Afternoon'}
            </button>
          </div>
        </div>

        {/* ── Toolbar: View Tabs + Filters ── */}
        <div className="toolbar">
          {/* View Mode Tabs */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${viewMode === 'LIVE' ? 'active-fuel' : ''}`}
              onClick={() => setViewMode('LIVE')}
            >
              <Zap size={13} />
              {lang === 'km' ? 'ផ្ទាល់' : 'Live'} ({logs.length})
            </button>
            <button
              className={`tab-btn ${viewMode === 'ARCHIVE' ? 'active-primary' : ''}`}
              onClick={() => setViewMode('ARCHIVE')}
            >
              <Archive size={13} />
              {lang === 'km' ? 'ប័ណ្ណ' : 'Archives'} ({savedArchives.length})
            </button>
            <button
              className={`tab-btn ${viewMode === 'ALL_DATES' ? 'active-primary' : ''}`}
              onClick={() => setViewMode('ALL_DATES')}
            >
              <BarChart2 size={13} />
              {lang === 'km' ? 'សរុប' : 'All Dates'}
            </button>
          </div>

          {/* Filter Controls */}
          <div className="toolbar-right fuel-table-toolbar-right">
            {/* Search */}
            <div className="filter-input-wrap">
              <Search size={13} className="filter-icon" />
              <input
                type="text"
                className="form-control"
                placeholder={lang === 'km' ? 'ផ្លាក / អ្នកបើកបរ / ការពិពណ៌នា...' : 'Plate / driver / desc...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '30px', height: '32px', fontSize: '0.78rem', width: '190px' }}
              />
            </div>

            {/* Station */}
            <select
              className="form-control"
              value={stationFilter}
              onChange={e => setStationFilter(e.target.value)}
              style={{ height: '32px', fontSize: '0.78rem', width: '140px' }}
            >
              <option value="ALL">{lang === 'km' ? 'គ្រប់ស្ថានីយ៍' : 'All Stations'}</option>
              {uniqueStations.map(st => <option key={st} value={st}>{st}</option>)}
            </select>

            {/* Export Excel Button */}
            <button
              onClick={() => {
                const fname = dateFilter ? `Fuel_Logs_${dateFilter}.xlsx` : `Fuel_Logs_Export_${new Date().toISOString().substring(0, 10)}.xlsx`;
                exportFuelLogsToExcel(filteredLogs.length > 0 ? filteredLogs : logs, fname, lang);
              }}
              className="btn btn-success btn-sm"
              style={{ height: '32px', fontSize: '0.76rem', whiteSpace: 'nowrap', background: '#10b981', color: '#ffffff', borderColor: '#059669' }}
              title={lang === 'km' ? 'ទាញយកទិន្នន័យជាឯកសារ Excel (.xlsx)' : 'Export data as Excel (.xlsx) spreadsheet'}
            >
              <FileSpreadsheet size={13} />
              <span>{lang === 'km' ? 'ទាញយក Excel' : 'Export Excel'}</span>
            </button>

            {/* Quick Log Fuel button if passed */}
            {onOpenLogForm && (
              <button
                onClick={() => onOpenLogForm(dateFilter)}
                className="btn btn-fuel btn-sm"
                style={{ height: '32px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={13} /> {lang === 'km' ? 'កត់ត្រា' : 'Log Fuel'}
              </button>
            )}

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={() => { setSearchTerm(''); handleDateChange(''); setShiftFilter('ALL'); setStationFilter('ALL'); }}
                className="btn btn-ghost btn-sm"
                style={{ whiteSpace: 'nowrap' }}
                title={lang === 'km' ? 'សម្អាតតម្រង' : 'Clear filters'}
              >
                <RotateCcw size={12} /> {lang === 'km' ? 'សម្អាត' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        {/* ── Archive Selector (when in ARCHIVE mode) ── */}
        {viewMode === 'ARCHIVE' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            padding: '12px 14px',
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--r-sm)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <Calendar size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)' }}>
              {lang === 'km' ? 'ជ្រើសរើសថ្ងៃ:' : 'Select Archive Date:'}
            </span>
            <select
              className="form-control"
              value={selectedArchiveId}
              onChange={e => setSelectedArchiveId(e.target.value)}
              style={{ flex: 1, minWidth: '200px', height: '34px', fontSize: '0.8rem', maxWidth: '340px' }}
            >
              <option value="">{lang === 'km' ? '— ជ្រើស —' : '— Select Saved Date —'}</option>
              {savedArchives.map(arch => (
                <option key={arch.id} value={arch.id}>
                  {arch.date} ({arch.saved_at}) — {arch.logs.length} {lang === 'km' ? 'ក.' : 'entries'}, {arch.total_liters} L
                </option>
              ))}
            </select>

            {/* Export Archive as Excel Button */}
            <button
              onClick={() => {
                const exportLogs = activeArchive ? activeArchive.logs : (filteredLogs.length > 0 ? filteredLogs : logs);
                const fname = activeArchive ? `Fuel_Archive_${activeArchive.date}.xlsx` : `Fuel_Archive_Export.xlsx`;
                exportFuelLogsToExcel(exportLogs, fname, lang);
              }}
              className="btn btn-success btn-sm"
              style={{ height: '34px', fontSize: '0.78rem', whiteSpace: 'nowrap', background: '#10b981', color: '#ffffff', borderColor: '#059669' }}
              title={lang === 'km' ? 'ទាញយកប័ណ្ណសារដែលជ្រើសរើសជាឯកសារ Excel (.xlsx)' : 'Export selected archive to Excel (.xlsx)'}
            >
              <FileSpreadsheet size={14} />
              <span>{lang === 'km' ? 'ទាញយកប័ណ្ណជា Excel (.xlsx)' : 'Export Archive to Excel (.xlsx)'}</span>
            </button>

            {activeArchive && (
              <button onClick={() => handleDeleteArchive(activeArchive.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}>
                <Trash2 size={13} /> {lang === 'km' ? 'លុប' : 'Delete'}
              </button>
            )}
          </div>
        )}

        {/* ── All-Dates Summary ── */}
        {viewMode === 'ALL_DATES' && Object.keys(groupedByDate).length > 0 && (
          <div style={{
            padding: '13px 15px',
            background: 'var(--success-subtle)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--r-sm)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', marginBottom: '9px' }}>
              <Layers size={14} />
              {lang === 'km' ? 'សេចក្តីសង្ខេបតាមកាលបរិច្ឆេទ:' : 'Volume Breakdown by Date:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {Object.entries(groupedByDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, data]) => (
                <div key={date} style={{
                  padding: '5px 11px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 'var(--r-xs)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.77rem'
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>{date}</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>·</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-{data.total.toLocaleString()} L</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: '5px', fontSize: '0.71rem' }}>({data.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter result info bar ── */}
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
            <Filter size={12} />
            {filteredLogs.length} {lang === 'km' ? 'ក.' : 'entries'} ·{' '}
            -{filteredTotal.toLocaleString()} L
            {searchTerm && <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>"{searchTerm}"</span>}
            {dateFilter && <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{dateFilter}</span>}
            {shiftFilter !== 'ALL' && <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{shiftFilter}</span>}
          </div>
        )}
      </div>

      {/* ── Main Table ── */}
      <div className="data-table-wrapper hide-on-mobile" style={{ border: 'none', borderRadius: '0', borderTop: '1px solid var(--border-subtle)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
              <th>Description</th>
              <th>License Plate</th>
              <th>{lang === 'km' ? 'អ្នកបើកបរ' : 'Driver Name'}</th>
              <th>{lang === 'km' ? 'ប្រេងចេញ (L)' : 'Oil Out (L)'}</th>
              <th>{lang === 'km' ? 'ប្រេងចូល (L)' : 'Oil In (L)'}</th>
              <th>Shift & Time</th>
              <th style={{ textAlign: 'center' }}>Sign</th>
              <th>Logger</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Fuel size={28} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: '0.85rem' }}>{t.noData}</span>
                    {hasFilters && (
                      <button onClick={() => { setSearchTerm(''); setDateFilter(''); setShiftFilter('ALL'); setStationFilter('ALL'); }} className="btn btn-ghost btn-sm" style={{ marginTop: '4px' }}>
                        <RotateCcw size={12} /> {lang === 'km' ? 'សម្អាតតម្រង' : 'Clear filters'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : filteredLogs.map((log, index) => (
              <tr key={log.id}>
                {/* # */}
                <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {index + 1}
                </td>

                {/* Date */}
                <td style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  {log.log_date || log.time_in?.substring(0, 10) || '—'}
                </td>

                {/* Description */}
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-main)' }}>
                    {log.description || 'ឡានចាក់សាំង'}
                  </div>
                  {log.station_name && (
                    <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {log.station_name}
                    </div>
                  )}
                </td>

                {/* License Plate */}
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span className="badge badge-info font-mono" style={{ letterSpacing: '0.6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {log.license_plate || log.vehicle_plate || (log.code_abbr && !log.code_abbr.startsWith('FL-') ? log.code_abbr : '—')}
                  </span>
                </td>

                {/* Driver Name */}
                <td style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                  {log.driver_name || log.driver || log.driverName || '—'}
                </td>

                {/* Oil Out (Refill) */}
                <td>
                  {parseFloat(log.refill_liters) > 0 ? (
                    <span style={{ fontWeight: 700, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>
                      −{log.refill_liters} L
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>0 L</span>
                  )}
                </td>

                {/* Oil In */}
                <td>
                  {parseFloat(log.oil_in) > 0 ? (
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums', fontSize: '0.875rem' }}>
                      +{log.oil_in} L
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>0 L</span>
                  )}
                </td>

                {/* Shift & Time */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                      border: '1px solid',
                      ...shiftStyle(log.shift)
                    }}>
                      {log.shift === 'Day' ? 'Morning' : (log.shift || 'Morning')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {formatTime12h(log.time_in)}
                    </span>
                  </div>
                </td>

                {/* Sign */}
                <td style={{ textAlign: 'center' }}>
                  {log.signature_url ? (
                    <a href={log.signature_url} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <FileSignature size={13} /> Sign
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>

                {/* Logger By */}
                <td style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                  {log.logged_by || 'Phattra'}
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'center' }}>
                  {deleteConfirmId === log.id ? (
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => { onDelete(log.id); setDeleteConfirmId(null); }}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                      >
                        <Check size={11} /> {lang === 'km' ? 'បញ្ជាក់' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        title={lang === 'km' ? 'កែប្រែ' : 'Edit'}
                        onClick={() => setEditingLog({ ...log })}
                        className="btn btn-secondary btn-sm btn-icon"
                        style={{ color: 'var(--fuel-accent)', borderColor: 'var(--fuel-border)', background: 'var(--fuel-subtle)' }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        title={lang === 'km' ? 'លុប' : 'Delete'}
                        onClick={() => setDeleteConfirmId(log.id)}
                        className="btn btn-secondary btn-sm btn-icon"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', background: 'var(--danger-subtle)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Native Cards List (Shown only on Mobile) ── */}
      <div className="mobile-logs-list hide-on-desktop">
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Fuel size={28} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.85rem' }}>{t.noData}</div>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="mobile-log-card">
              <div className="mobile-log-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    {log.code_abbr || 'N/A'}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.station_name || 'Station'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                  <Clock size={11} /> {formatTime12h(log.time_in)}
                </div>
              </div>

              <div className="mobile-log-card-body">
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.driver_name || log.description || (lang === 'km' ? 'ឡានចាក់សាំង' : 'Refuel')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {log.log_date || log.time_in?.substring(0, 10)} · {log.logged_by || 'Phattra'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--fuel-accent)', lineHeight: 1 }}>
                    -{log.refill_liters} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>L</span>
                  </div>
                  {log.shift && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.62rem', marginTop: '3px', display: 'inline-block' }}>
                      {log.shift}
                    </span>
                  )}
                </div>
              </div>

              <div className="mobile-log-card-footer">
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {log.signature_data_url ? (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={11} /> {lang === 'km' ? 'មានហត្ថលេខា' : 'Signed'}
                    </span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingLog({ ...log })}
                    className="mobile-action-btn edit"
                  >
                    <Pencil size={12} color="var(--primary)" />
                    <span>{lang === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(lang === 'km' ? 'លុបការកត់ត្រានេះ?' : 'Delete this log entry?')) {
                        if (onDelete) onDelete(log.id);
                      }
                    }}
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

      {/* Table Footer */}
      {filteredLogs.length > 0 && (
        <div style={{
          padding: '11px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.77rem',
          color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.01)'
        }}>
          <span>
            {filteredLogs.length} {lang === 'km' ? 'ក.' : 'entries'}
            {hasFilters && ` (${lang === 'km' ? 'ត្រងចេញ' : 'filtered'})`}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
            {lang === 'km' ? 'សរុប' : 'Total'}: -{filteredTotal.toLocaleString()} L
          </span>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingLog && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-sm">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: 'var(--fuel-subtle)' }}>
                  <Pencil size={16} color="var(--fuel-accent)" />
                </div>
                <h3 style={{ fontSize: '0.95rem' }}>
                  {lang === 'km' ? 'កែប្រែការប្រើប្រាស់' : 'Edit Fuel Log'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingLog(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid-form-2">
                <div className="form-group">
                  <label className="form-label">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Log Date'}</label>
                  <input type="date" className="form-control"
                    value={editingLog.log_date || editingLog.time_in?.substring(0, 10) || ''}
                    onChange={e => setEditingLog({ ...editingLog, log_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'km' ? 'អ្នកបើកបរ / បុគ្គលិក' : 'Driver / Staff Name'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={lang === 'km' ? 'ហិ.គ. សុខ ជា' : 'e.g. Sok Chea'}
                    value={editingLog.driver_name || ''}
                    onChange={e => setEditingLog({ ...editingLog, driver_name: e.target.value })}
                  />
                  {staff.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
                      {staff.slice(0, 8).map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setEditingLog({ ...editingLog, driver_name: s.name, license_plate: s.license_plate || editingLog.license_plate })}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.7rem', height: 'auto', background: editingLog.driver_name === s.name ? 'var(--primary-subtle)' : undefined, color: editingLog.driver_name === s.name ? 'var(--primary)' : undefined }}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-form-2">
                <div className="form-group">
                  <label className="form-label">{lang === 'km' ? 'ប្រេងចេញ / ចាក់ (L)' : 'Oil Out (L)'}</label>
                  <input type="number" step="any" className="form-control"
                    value={editingLog.refill_liters ?? ''}
                    onChange={e => setEditingLog({ ...editingLog, refill_liters: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'km' ? 'ប្រេងចូល / បំពេញស្តុក (L)' : 'Oil In (L)'}</label>
                  <input type="number" step="any" className="form-control"
                    value={editingLog.oil_in ?? ''}
                    onChange={e => setEditingLog({ ...editingLog, oil_in: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-form-2">
                <div className="form-group">
                  <label className="form-label">{lang === 'km' ? 'ការពិពណ៌នា' : 'Description'}</label>
                  <input type="text" className="form-control"
                    value={editingLog.description ?? ''}
                    onChange={e => setEditingLog({ ...editingLog, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'km' ? 'ផ្លាកលេខ' : 'License Plate'}</label>
                  <AbbrCodeSelector
                    value={editingLog.license_plate || editingLog.code_abbr || ''}
                    onChange={val => setEditingLog({ ...editingLog, license_plate: val, code_abbr: val })}
                    abbrCodes={abbrCodes}
                    onAddAbbrCode={onAddAbbrCode}
                    onDeleteAbbrCode={onDeleteAbbrCode}
                    drivers={drivers}
                    onAddDriver={onAddDriver}
                    onDeleteDriver={onDeleteDriver}
                    lang={lang}
                  />
                </div>
              </div>

              <div className="grid-form-2">
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="datetime-local" className="form-control"
                    value={formatDatetimeForInput(editingLog.time_in)}
                    onChange={e => setEditingLog({ ...editingLog, time_in: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Shift</label>
                  <select className="form-control"
                    value={editingLog.shift || 'Morning'}
                    onChange={e => setEditingLog({ ...editingLog, shift: e.target.value })}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-fuel" style={{ flex: 1 }} onClick={handleEditSave}>
                <Check size={14} /> {lang === 'km' ? 'រក្សាទុក' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingLog(null)}>
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Generate Document Modal ── */}
      <GenerateDocumentModal
        open={showDocModal}
        onClose={() => setShowDocModal(false)}
        logs={filteredLogs}
        stations={stations}
        lang={lang}
      />
    </div>
  );
}
