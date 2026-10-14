import React, { useState, useMemo } from 'react';
import SoilLogForm from '../components/Soil/SoilLogForm';
import SoilLogTable from '../components/Soil/SoilLogTable';
import SoilDateMaster from '../components/Soil/SoilDateMaster';
import {
  HardHat, Box, Truck, Plus, Calendar,
  Layers, ShieldCheck, DollarSign, FileSpreadsheet,
  ChevronDown, ChevronUp, BarChart2, TrendingUp, CheckCircle2
} from 'lucide-react';
import { translations } from '../data/translations';
import { exportSoilLogsToExcel } from '../utils/excelExport';

const SOIL_SUBTAB_STORAGE_KEY = 'app_soil_active_subtab';
const SOIL_SUBTABS = ['daily', 'calendar', 'analytics'];

export default function SoilManagement({
  soilLogs = [],
  stations = [],
  abbrCodes = [],
  staff = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  onAddSoilLog,
  onDeleteSoilLog,
  onEditSoilLog,
  onClearSoilLogs,
  lang = 'km',
  userRole = 'user',
  assignedStation = { id: '', name: '' }
}) {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    try {
      const saved = localStorage.getItem(SOIL_SUBTAB_STORAGE_KEY);
      return SOIL_SUBTABS.includes(saved) ? saved : 'daily';
    } catch {
      return 'daily';
    }
  });

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [showLogForm, setShowLogForm] = useState(false);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().substring(0, 10));

  // Remember active subtab
  React.useEffect(() => {
    try {
      localStorage.setItem(SOIL_SUBTAB_STORAGE_KEY, activeSubTab);
    } catch (_) {}
  }, [activeSubTab]);

  const t = translations[lang] || translations.km;

  // Global KPIs
  const totalVolume = useMemo(() => {
    return soilLogs.reduce((sum, s) => sum + (parseFloat(s.total_cubic_meters) || (parseFloat(s.trip_count) * parseFloat(s.cubic_meters_per_trip)) || 0), 0);
  }, [soilLogs]);

  const totalTrips = useMemo(() => {
    return soilLogs.reduce((sum, s) => sum + (parseInt(s.trip_count, 10) || 0), 0);
  }, [soilLogs]);

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayLogs = useMemo(() => {
    return soilLogs.filter(l => {
      const d = l.log_date || (l.created_at ? l.created_at.substring(0, 10) : '');
      return d === todayStr;
    });
  }, [soilLogs, todayStr]);

  const todayVolume = useMemo(() => {
    return todayLogs.reduce((sum, l) => sum + (parseFloat(l.total_cubic_meters) || (parseFloat(l.trip_count) * parseFloat(l.cubic_meters_per_trip)) || 0), 0);
  }, [todayLogs]);

  // Unique active operating dates
  const uniqueDatesCount = useMemo(() => {
    const dates = new Set();
    soilLogs.forEach(l => {
      const d = l.log_date || (l.created_at ? l.created_at.substring(0, 10) : '');
      if (d) dates.add(d);
    });
    return dates.size;
  }, [soilLogs]);

  // Jump from Calendar to Daily tab with specific date
  const handleJumpToDailyWithDate = (dateStr) => {
    setSelectedDate(dateStr);
    setFormDate(dateStr);
    setActiveSubTab('daily');
  };

  const handleOpenLogFormForDate = (dateStr) => {
    const targetDate = dateStr || selectedDate || todayStr;
    setSelectedDate(targetDate);
    setFormDate(targetDate);
    setShowLogForm(true);
  };

  // Analytics: Breakdown by Plate
  const plateAnalytics = useMemo(() => {
    const map = {};
    soilLogs.forEach(l => {
      const plate = l.code_abbr || 'Unknown';
      if (!map[plate]) {
        map[plate] = { plate, trips: 0, volume: 0, logsCount: 0 };
      }
      const trips = parseInt(l.trip_count, 10) || 0;
      const vol = parseFloat(l.total_cubic_meters) || (trips * (parseFloat(l.cubic_meters_per_trip) || 0));
      map[plate].trips += trips;
      map[plate].volume += vol;
      map[plate].logsCount += 1;
    });
    return Object.values(map).sort((a, b) => b.volume - a.volume);
  }, [soilLogs]);

  // Analytics: Breakdown by Site
  const siteAnalytics = useMemo(() => {
    const map = {};
    soilLogs.forEach(l => {
      const site = l.station_name || 'Main Station';
      if (!map[site]) {
        map[site] = { site, trips: 0, volume: 0, logsCount: 0 };
      }
      const trips = parseInt(l.trip_count, 10) || 0;
      const vol = parseFloat(l.total_cubic_meters) || (trips * (parseFloat(l.cubic_meters_per_trip) || 0));
      map[site].trips += trips;
      map[site].volume += vol;
      map[site].logsCount += 1;
    });
    return Object.values(map).sort((a, b) => b.volume - a.volume);
  }, [soilLogs]);

  return (
    <div className="page-wrapper">
      {/* ── Official Enterprise Header Card ── */}
      <div className="official-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px',
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, var(--soil-accent), #92400e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
            flexShrink: 0
          }}>
            <HardHat size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.5px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                {lang === 'km' ? 'ប្រព័ន្ធការិយាល័យផ្លូវការ' : 'OFFICIAL WORKPLACE SYSTEM'}
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '0.68rem' }}>
                REF: SL-SO-2026-REGISTRY
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {t.soilPageTitle}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              {lang === 'km'
                ? 'នាយកដ្ឋានដឹកជញ្ជូន និងចាក់ដី — តាមដានបរិមាណម៉ែត្រគូប ជើងដឹកជញ្ជូន និងរបាយការណ៍សវនកម្ម'
                : 'Earthwork Operations & Logistics — Hauling Trip Records, Volume (m³) & Audit Logs'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="page-header-actions" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenLogFormForDate(selectedDate)}
            className="btn btn-soil"
            style={{ fontWeight: 700, height: '36px' }}
          >
            <Plus size={15} />
            {lang === 'km' ? 'កត់ត្រាការដឹកដី' : 'Log Soil Entry'}
          </button>



          <button
            onClick={() => exportSoilLogsToExcel(soilLogs, `Soil_Logs_Full_${todayStr}.xlsx`, lang)}
            className="btn btn-success btn-sm"
            style={{ height: '36px', background: '#10b981', color: '#fff', borderColor: '#059669' }}
          >
            <FileSpreadsheet size={14} />
            <span>{lang === 'km' ? 'ទាញយក Excel' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* ── Modern Office Sub-Tabs Navigation Bar ── */}
      <div className="office-subtabs-nav">
        {/* Tab 1: Daily Operations */}
        <button
          className={`office-subtab-btn ${activeSubTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('daily')}
        >
          <HardHat size={15} />
          <span>{lang === 'km' ? '១. ប្រតិបត្តិការប្រចាំថ្ងៃ' : '1. Daily Operations'}</span>
          <span className="office-subtab-badge">
            {todayLogs.length > 0 ? `${todayLogs.length} ${lang === 'km' ? 'ថ្ងៃនេះ' : 'today'}` : soilLogs.length}
          </span>
        </button>

        {/* Tab 2: Date Master & Calendar */}
        <button
          className={`office-subtab-btn ${activeSubTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('calendar')}
        >
          <Calendar size={15} />
          <span>{lang === 'km' ? '២. ប្រតិទិន & តាមដានថ្ងៃ' : '2. Date Master & Calendar'}</span>
          <span className="office-subtab-badge">
            {uniqueDatesCount} {lang === 'km' ? 'ថ្ងៃ' : 'days'}
          </span>
        </button>

        {/* Tab 3: Summary & Analytics */}
        <button
          className={`office-subtab-btn ${activeSubTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('analytics')}
        >
          <BarChart2 size={15} />
          <span>{lang === 'km' ? '៣. សង្ខេប & វិភាគ' : '3. Summary & Analytics'}</span>
          <span className="office-subtab-badge">
            {plateAnalytics.length} {lang === 'km' ? 'រថយន្ត' : 'plates'}
          </span>
        </button>
      </div>

      {/* ── SUB-TAB 1: DAILY OPERATIONS ── */}
      {activeSubTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick KPI Strip */}
          <div className="grid-3" style={{ gap: '12px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{t.totalSoilVolumeStat}</span>
                <div className="stat-card-icon" style={{ background: 'var(--soil-subtle)' }}>
                  <Box size={16} color="var(--soil-accent)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--soil-accent)' }}>
                {totalVolume.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>m³</span>
              </div>
              <div className="stat-card-sub">
                {lang === 'km' ? 'បរិមាណដីសរុបទាំងអស់' : 'All-time earthwork volume'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'ដឹកជញ្ជូនថ្ងៃនេះ' : "Today's Hauling"}</span>
                <div className="stat-card-icon" style={{ background: 'rgba(217, 119, 6, 0.15)' }}>
                  <HardHat size={16} color="var(--soil-accent)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--soil-accent)' }}>
                {todayVolume.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>m³</span>
              </div>
              <div className="stat-card-sub">
                {todayLogs.length} {lang === 'km' ? 'ជើង/កំណត់ត្រាថ្ងៃនេះ' : 'logs recorded today'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{t.totalTripsStat}</span>
                <div className="stat-card-icon" style={{ background: 'var(--primary-subtle)' }}>
                  <Truck size={16} color="var(--primary)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
                {totalTrips.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.tripsUnit}</span>
              </div>
              <div className="stat-card-sub">
                {soilLogs.length} {lang === 'km' ? 'កំណត់ត្រាសរុប' : 'total logs registered'}
              </div>
            </div>
          </div>

          {/* Master Soil Log Table */}
          <SoilLogTable
            logs={soilLogs}
            staff={staff}
            onDelete={onDeleteSoilLog}
            onEdit={onEditSoilLog}
            onClearActiveLogs={onClearSoilLogs}
            abbrCodes={abbrCodes}
            onAddAbbrCode={onAddAbbrCode}
            lang={lang}
            activeDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenLogForm={handleOpenLogFormForDate}
            userRole={userRole}
          />
        </div>
      )}

      {/* ── SUB-TAB 2: DATE MASTER & CALENDAR ── */}
      {activeSubTab === 'calendar' && (
        <SoilDateMaster
          soilLogs={soilLogs}
          onSelectDate={handleJumpToDailyWithDate}
          onAddLogForDate={handleOpenLogFormForDate}
          lang={lang}
        />
      )}

      {/* ── SUB-TAB 3: SUMMARY & ANALYTICS ── */}
      {activeSubTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Performance Overview */}
          <div className="grid-3">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'មធ្យមភាគមាឌដីក្នុងមួយជើង' : 'Avg Volume per Trip'}</span>
                <div className="stat-card-icon" style={{ background: 'var(--soil-subtle)' }}>
                  <Box size={16} color="var(--soil-accent)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--soil-accent)' }}>
                {totalTrips > 0 ? (totalVolume / totalTrips).toFixed(1) : 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>m³</span>
              </div>
              <div className="stat-card-sub">
                {lang === 'km' ? 'ផ្អែកលើជើងដឹកសរុប' : 'Across all hauling logs'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'ចំនួនរថយន្តដំណើរការ' : 'Active Vehicles / Plates'}</span>
                <div className="stat-card-icon" style={{ background: 'var(--primary-subtle)' }}>
                  <Truck size={16} color="var(--primary)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
                {plateAnalytics.length}
              </div>
              <div className="stat-card-sub">
                {lang === 'km' ? 'រថយន្តបានចុះឈ្មោះក្នុងប្រព័ន្ធ' : 'Registered plates with records'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'ចំនួនទីតាំង/ស្ថានីយ៍' : 'Operating Sites'}</span>
                <div className="stat-card-icon" style={{ background: 'var(--success-subtle)' }}>
                  <Layers size={16} color="var(--success)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {siteAnalytics.length}
              </div>
              <div className="stat-card-sub">
                {lang === 'km' ? 'ការដ្ឋានចាក់ដីសកម្ម' : 'Active dumping locations'}
              </div>
            </div>
          </div>

          {/* Vehicle Breakdown Table */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="section-label" style={{ margin: 0 }}>
                <Truck size={15} color="var(--soil-accent)" />
                <span>{lang === 'km' ? 'ស្ថិតិប្រតិបត្តិការតាមផ្លាកលេខរថយន្ត' : 'Vehicle Performance by License Plate'}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {plateAnalytics.length} {lang === 'km' ? 'រថយន្ត' : 'vehicles'}
              </span>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.thCode}</th>
                    <th>{t.thTrips}</th>
                    <th>{t.thTotalM3}</th>
                    <th>{lang === 'km' ? 'មធ្យម m³/ជើង' : 'Avg m³/Trip'}</th>
                    <th>{lang === 'km' ? 'ភាគរយនៃមាឌសរុប' : '% of Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {plateAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>
                        {t.noData}
                      </td>
                    </tr>
                  ) : (
                    plateAnalytics.map(p => {
                      const sharePct = totalVolume > 0 ? ((p.volume / totalVolume) * 100).toFixed(1) : 0;
                      return (
                        <tr key={p.plate}>
                          <td>
                            <span className="badge badge-info font-mono" style={{ fontSize: '0.78rem' }}>
                              {p.plate}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>{p.trips} {t.tripsUnit}</td>
                          <td style={{ fontWeight: 700, color: 'var(--soil-accent)' }}>
                            {p.volume.toLocaleString()} m³
                          </td>
                          <td>
                            {p.trips > 0 ? (p.volume / p.trips).toFixed(1) : 0} m³
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, sharePct)}%`, height: '100%', background: 'var(--soil-accent)' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px' }}>
                                {sharePct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sites Breakdown Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>
              <Layers size={15} color="var(--primary)" />
              <span>{lang === 'km' ? 'ស្ថិតិប្រតិបត្តិការតាមការដ្ឋាន / ស្ថានីយ៍' : 'Site & Location Breakdown'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {siteAnalytics.map(s => (
                <div
                  key={s.site}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-subtle, rgba(255,255,255,0.02))',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                    {s.site}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>{t.thTotalM3}:</span>
                    <strong style={{ color: 'var(--soil-accent)' }}>{s.volume.toLocaleString()} m³</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>{t.thTrips}:</span>
                    <strong>{s.trips} {t.tripsUnit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{lang === 'km' ? 'កំណត់ត្រា:' : 'Log Entries:'}</span>
                    <span>{s.logsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Soil Log Form Modal ── */}
      <SoilLogForm
        open={showLogForm}
        onClose={() => setShowLogForm(false)}
        initialDate={formDate || selectedDate}
        onAddSoilLog={onAddSoilLog}
        stations={stations}
        soilLogs={soilLogs}
        abbrCodes={abbrCodes}
        staff={staff}
        onAddAbbrCode={onAddAbbrCode}
        onDeleteAbbrCode={onDeleteAbbrCode}
        lang={lang}
        assignedStation={assignedStation}
      />

    </div>
  );
}
