import React, { useState, useMemo } from 'react';
import FuelLogForm from '../components/Fuel/FuelLogForm';
import FuelLogTable from '../components/Fuel/FuelLogTable';
import FuelDateMaster from '../components/Fuel/FuelDateMaster';
import StaffManager from '../components/Fuel/StaffManager';
import FuelFleetManager from '../components/Fuel/FuelFleetManager';
import FuelSopTable from '../components/Fuel/FuelSopTable';
import AddStationModal from '../components/Fuel/AddStationModal';
import GenerateDocumentModal from '../components/Fuel/GenerateDocumentModal';
import StockGauge from '../components/Dashboard/StockGauge';
import AlertBanner from '../components/Dashboard/AlertBanner';
import AbbrCodeModal from '../components/Common/AbbrCodeModal';
import {
  Fuel, Plus, Tag, Trash2, Pencil, Gauge, FileText,
  Calendar, Layers, Users, Zap, Archive, CheckCircle2,
  ShieldCheck, Building2, FileCheck, Landmark, CheckSquare
} from 'lucide-react';
import { translations } from '../data/translations';

const FUEL_SUBTAB_STORAGE_KEY = 'app_fuel_active_subtab';
const FUEL_SUBTABS = ['daily', 'calendar', 'stations', 'fleet', 'sop', 'archives'];

export default function FuelManagement({
  stations = [],
  fuelLogs = [],
  abbrCodes = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  drivers = [],
  onAddDriver,
  onDeleteDriver,
  staff = [],
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onSaveSignature,
  onAddFuelLog,
  onAddStation,
  onEditStation,
  onDeleteStation,
  onDeleteFuelLog,
  onEditFuelLog,
  onClearFuelLogs,
  savedArchives,
  setSavedArchives,
  onSaveArchive,
  onDeleteArchive,
  lang = 'km',
  userRole = 'user',
  assignedStation = { id: '', name: '' }
}) {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    try {
      const saved = localStorage.getItem(FUEL_SUBTAB_STORAGE_KEY);
      return FUEL_SUBTABS.includes(saved) ? saved : 'daily';
    } catch {
      return 'daily';
    }
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [showAddStation, setShowAddStation] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [logFormDate, setLogFormDate] = useState('');
  const [docModalLogs, setDocModalLogs] = useState(null);

  // Redirect regular users if they try to access admin-only tabs
  React.useEffect(() => {
    if (userRole !== 'admin' && ['stations', 'fleet', 'sop', 'archives'].includes(activeSubTab)) {
      setActiveSubTab('daily');
    }
  }, [userRole, activeSubTab]);

  // Return to the same Fuel sub-tab after a refresh.
  React.useEffect(() => {
    try { localStorage.setItem(FUEL_SUBTAB_STORAGE_KEY, activeSubTab); } catch (_) {}
  }, [activeSubTab]);

  const lowStockStations = stations.filter(s => s.current_stock_liters < s.reorder_threshold_liters);
  const t = translations[lang] || translations.km;

  const handleDeleteStationClick = (stId) => {
    const confirmMsg = t.confirmDeleteStation || 'Delete this fuel station?';
    if (window.confirm(confirmMsg)) {
      if (onDeleteStation) onDeleteStation(stId);
    }
  };

  const totalStock = stations.reduce((sum, s) => sum + (s.current_stock_liters || 0), 0);
  const totalCapacity = stations.reduce((sum, s) => sum + (s.target_capacity_liters || 6000), 0);
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayLogs = fuelLogs.filter(l => {
    const d = l.log_date || l.time_in?.substring(0, 10);
    return d === todayStr;
  });
  const todayVolume = todayLogs.reduce((sum, l) => sum + (parseFloat(l.refill_liters) || 0), 0);

  // Unique operational dates
  const uniqueDatesCount = useMemo(() => {
    const dates = new Set(fuelLogs.map(l => l.log_date || l.time_in?.substring(0, 10)).filter(Boolean));
    return dates.size;
  }, [fuelLogs]);

  // Jump from Calendar to Daily View with that specific date
  const handleJumpToDailyWithDate = (dateStr) => {
    setSelectedDate(dateStr);
    setActiveSubTab('daily');
  };

  // Open Document Modal for specific date
  const handleOpenDocForDate = (dateStr, dateLogs) => {
    setDocModalLogs(dateLogs || fuelLogs.filter(l => (l.log_date || l.time_in?.substring(0, 10)) === dateStr));
    setShowDocModal(true);
  };

  // Open Log Fuel Form with specific pre-filled date
  const handleOpenLogFormForDate = (dateStr) => {
    setLogFormDate(dateStr || selectedDate || todayStr);
    setShowLogForm(true);
  };

  return (
    <div className="page-wrapper">
      {/* ── Official Enterprise Header Card ── */}
      <div className="official-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px',
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, var(--fuel-accent), #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            flexShrink: 0
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.5px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                {lang === 'km' ? 'ប្រព័ន្ធការិយាល័យផ្លូវការ' : 'OFFICIAL WORKPLACE SYSTEM'}
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '0.68rem' }}>
                REF: FL-SO-2026-REGISTRY
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {t.fuelPageTitle}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              {lang === 'km' ? 'នាយកដ្ឋានប្រតិបត្តិការ និងភស្តុភារការិយាល័យ — តាមដានកម្រិតស្តុក 6,000L និងកំណត់ត្រាសវនកម្មចាក់សាំង' : 'Operations & Logistics Department — Fuel Station Reserves & Audit Log Control'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="page-header-actions" style={{ flexWrap: 'wrap' }}>
          {stations.length > 0 && (
            <button
              onClick={() => handleOpenLogFormForDate(selectedDate)}
              className="btn btn-fuel"
              style={{ fontWeight: 700, height: '36px' }}
            >
              <Plus size={15} />
              {lang === 'km' ? 'កត់ត្រាការប្រើប្រាស់' : 'Log Fuel'}
            </button>
          )}
          <button
            onClick={() => { setDocModalLogs(null); setShowDocModal(true); }}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px', height: '36px' }}
          >
            <FileText size={14} />
            {lang === 'km' ? 'បង្កើតឯកសារផ្លូវការ' : 'Official Document'}
          </button>
          <button
            onClick={() => setShowAddStation(true)}
            className="btn btn-secondary btn-sm"
            style={{ height: '36px' }}
          >
            <Plus size={14} />
            {lang === 'km' ? 'បន្ថែមស្ថានីយ៍' : 'Add Station'}
          </button>
        </div>
      </div>

      {/* ── Low Stock Alert Banner (Global) ── */}
      <AlertBanner lowStockStations={lowStockStations} lang={lang} />

      {/* ── Modern Office Sub-Tabs Navigation Bar ── */}
      <div className="office-subtabs-nav">
        {/* Tab 1: Daily Operations */}
        <button
          className={`office-subtab-btn ${activeSubTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('daily')}
        >
          <Fuel size={15} />
          <span>{lang === 'km' ? '១. ប្រតិបត្តិការប្រចាំថ្ងៃ' : '1. Daily Operations'}</span>
          <span className="office-subtab-badge">
            {todayLogs.length > 0 ? `${todayLogs.length} ថ្ងៃនេះ` : fuelLogs.length}
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

        {/* Tab 3: Stations & Stock - Admin Only */}
        {userRole === 'admin' && (
          <button
            className={`office-subtab-btn ${activeSubTab === 'stations' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('stations')}
          >
            <Gauge size={15} />
            <span>{lang === 'km' ? '៣. ស្ថានីយ៍ & ស្តុក' : '3. Stations & Stock'}</span>
            <span
              className="office-subtab-badge"
              style={{
                background: lowStockStations.length > 0 ? 'var(--danger-subtle)' : undefined,
                color: lowStockStations.length > 0 ? 'var(--danger)' : undefined
              }}
            >
              {stations.length} {lowStockStations.length > 0 ? `(${lowStockStations.length} !)` : ''}
            </span>
          </button>
        )}

        {/* Tab 4: Staff & Fleet - Admin Only */}
        {userRole === 'admin' && (
          <button
            className={`office-subtab-btn ${activeSubTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('fleet')}
          >
            <Users size={15} />
            <span>{lang === 'km' ? '៤. បុគ្គលិក & ស្ថានីយ៍' : '4. Staff & Fleet'}</span>
            <span className="office-subtab-badge">
              {staff.length} {lang === 'km' ? 'នាក់' : 'staff'}
            </span>
          </button>
        )}

        {/* Tab 5: SOP Compliance Audit Matrix - Admin Only */}
        {userRole === 'admin' && (
          <button
            className={`office-subtab-btn ${activeSubTab === 'sop' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('sop')}
          >
            <ShieldCheck size={15} />
            <span>{lang === 'km' ? '៥. បទដ្ឋាន SOP & សវនកម្ម' : '5. SOP Audit Matrix'}</span>
          </button>
        )}

        {/* Tab 6: Saved Archives & Reports - Admin Only */}
        {userRole === 'admin' && (
          <button
            className={`office-subtab-btn ${activeSubTab === 'archives' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('archives')}
          >
            <Archive size={15} />
            <span>{lang === 'km' ? '៦. ប័ណ្ណរក្សាទុក & ឯកសារ' : '6. Archives & Reports'}</span>
          </button>
        )}
      </div>

      {/* ── Sub-Tab Contents ── */}

      {/* ── SUB-TAB 1: DAILY OPERATIONS & LOG TABLE ── */}
      {activeSubTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Quick KPI Strip */}
          <div className="grid-3">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'ស្តុកសាំងសរុប' : 'Total Stock'}</span>
                <div className="stat-card-icon" style={{ background: 'var(--fuel-subtle)' }}>
                  <Fuel size={16} color="var(--fuel-accent)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--fuel-accent)' }}>
                {totalStock.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>L</span>
              </div>
              <div className="stat-card-sub">
                {lang === 'km' ? 'ចេញពី' : 'of'} {totalCapacity.toLocaleString()} L {lang === 'km' ? 'សមត្ថភាព' : 'capacity'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'ប្រើប្រាស់ថ្ងៃនេះ' : "Today's Spend"}</span>
                <div className="stat-card-icon" style={{ background: 'var(--danger-subtle)' }}>
                  <Gauge size={16} color="var(--danger)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
                -{todayVolume.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>L</span>
              </div>
              <div className="stat-card-sub">
                {todayLogs.length} {lang === 'km' ? 'ប្រតិបត្តិការចាក់ថ្ងៃនេះ' : 'transactions today'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{lang === 'km' ? 'ស្ថានីយ៍ដំណើរការ' : 'Active Stations'}</span>
                <div className="stat-card-icon" style={{ background: 'var(--success-subtle)' }}>
                  <Tag size={16} color="var(--success)" />
                </div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {stations.length}
              </div>
              <div className="stat-card-sub">
                {lowStockStations.length > 0
                  ? `${lowStockStations.length} ${lang === 'km' ? 'ស្ថានីយ៍ស្តុកទាប' : 'below threshold'}`
                  : lang === 'km' ? 'ទាំងអស់ធម្មតា' : 'All levels normal'}
              </div>
            </div>
          </div>

          {/* Master Fuel Log Table with Modern Office Date Navigator */}
          <FuelLogTable
            logs={fuelLogs}
            stations={stations}
            onDelete={onDeleteFuelLog}
            onEdit={onEditFuelLog}
            onClearActiveLogs={onClearFuelLogs}
            abbrCodes={abbrCodes}
            onAddAbbrCode={onAddAbbrCode}
            onDeleteAbbrCode={onDeleteAbbrCode}
            drivers={drivers}
            onAddDriver={onAddDriver}
            onDeleteDriver={onDeleteDriver}
            lang={lang}
            activeDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenLogForm={handleOpenLogFormForDate}
            initialViewMode="LIVE"
            savedArchives={savedArchives}
            setSavedArchives={setSavedArchives}
            onSaveArchive={onSaveArchive}
            onDeleteArchive={onDeleteArchive}
            userRole={userRole}
          />
        </div>
      )}

      {/* ── SUB-TAB 2: DATE MASTER & CALENDAR TIMELINE ── */}
      {activeSubTab === 'calendar' && (
        <FuelDateMaster
          fuelLogs={fuelLogs}
          onSelectDate={handleJumpToDailyWithDate}
          onOpenDocForDate={handleOpenDocForDate}
          onAddLogForDate={handleOpenLogFormForDate}
          lang={lang}
        />
      )}

      {/* ── SUB-TAB 3: STATIONS & STOCK MANAGEMENT ── */}
      {activeSubTab === 'stations' && userRole === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="section-label">
              <Fuel size={14} color="var(--fuel-accent)" />
              {lang === 'km' ? 'បញ្ជីស្ថានីយ៍សាំង & កម្រិតស្តុកជាក់ស្តែង' : 'Fuel Stations & Live Stock Gauges'}
            </div>
            <button onClick={() => setShowAddStation(true)} className="btn btn-fuel btn-sm">
              <Plus size={14} /> {lang === 'km' ? 'បន្ថែមស្ថានីយ៍ថ្មី' : 'Add New Station'}
            </button>
          </div>

          {stations.length === 0 ? (
            <div className="card" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-dim)', marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                <Fuel size={40} />
              </div>
              <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>
                {lang === 'km' ? 'មិនទាន់មានស្ថានីយ៍សាំងឡើយ — ចុចបន្ថែមស្ថានីយ៍ខាងលើ' : 'No fuel stations yet. Click "Add Station" above.'}
              </p>
              <button onClick={() => setShowAddStation(true)} className="btn btn-fuel" style={{ display: 'inline-flex', margin: '0 auto' }}>
                <Plus size={14} /> {lang === 'km' ? 'បន្ថែមស្ថានីយ៍ដំបូង' : 'Add First Station'}
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {stations.map(s => (
                <div key={s.id} className="card card-hover" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '3px' }}>
                        {s.name || s.station_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {lang === 'km' ? 'កម្រិតអប្បបរមា' : 'Reorder Threshold'}: {(s.reorder_threshold_liters || 4000).toLocaleString()} L
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={s.current_stock_liters < (s.reorder_threshold_liters || 4000) ? 'badge badge-danger' : 'badge badge-success'}>
                        {s.current_stock_liters < (s.reorder_threshold_liters || 4000) ? t.reorderNeeded : t.normalStock}
                      </span>
                      <button
                        onClick={() => { setEditingStation(s); setShowAddStation(true); }}
                        title={lang === 'km' ? 'កែប្រែស្ថានីយ៍' : 'Edit station'}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--primary)' }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStationClick(s.id)}
                        title={t.deleteStation || 'Delete'}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-subtle)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <StockGauge
                    currentStock={s.current_stock_liters}
                    targetCapacity={s.target_capacity_liters || 6000}
                    threshold={s.reorder_threshold_liters || 4000}
                    lang={lang}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 4: STAFF & FLEET DIRECTORY ── */}
      {activeSubTab === 'fleet' && userRole === 'admin' && (
        <StaffManager
          staff={staff}
          drivers={drivers}
          onAddStaff={onAddStaff}
          onEditStaff={onEditStaff}
          onDeleteStaff={onDeleteStaff}
          onSaveSignature={onSaveSignature}
          stations={stations}
          fuelLogs={fuelLogs}
          lang={lang}
        />
      )}

      {/* ── SUB-TAB 5: SOP COMPLIANCE AUDIT MATRIX ── */}
      {activeSubTab === 'sop' && userRole === 'admin' && (
        <FuelSopTable
          stations={stations}
          fuelLogs={fuelLogs}
          lang={lang}
        />
      )}

      {/* ── SUB-TAB 6: SAVED ARCHIVES & REPORT CENTER ── */}
      {activeSubTab === 'archives' && userRole === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FuelLogTable
            logs={fuelLogs}
            stations={stations}
            onDelete={onDeleteFuelLog}
            onEdit={onEditFuelLog}
            onClearActiveLogs={onClearFuelLogs}
            abbrCodes={abbrCodes}
            onAddAbbrCode={onAddAbbrCode}
            onDeleteAbbrCode={onDeleteAbbrCode}
            drivers={drivers}
            onAddDriver={onAddDriver}
            onDeleteDriver={onDeleteDriver}
            lang={lang}
            initialViewMode="ARCHIVE"
            savedArchives={savedArchives}
            setSavedArchives={setSavedArchives}
            onSaveArchive={onSaveArchive}
            onDeleteArchive={onDeleteArchive}
            userRole={userRole}
          />
        </div>
      )}

      {/* ── Modals ── */}
      <AddStationModal
        open={showAddStation}
        onClose={() => { setShowAddStation(false); setEditingStation(null); }}
        onAddStation={onAddStation}
        onEditStation={onEditStation}
        station={editingStation}
        lang={lang}
      />

      <FuelLogForm
        stations={stations}
        onAddFuelLog={onAddFuelLog}
        staff={staff}
        lang={lang}
        open={showLogForm}
        onClose={() => setShowLogForm(false)}
        initialDate={logFormDate || selectedDate}
        assignedStation={assignedStation}
      />

      <AbbrCodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        abbrCodes={abbrCodes}
        onAddAbbrCode={onAddAbbrCode}
        onDeleteAbbrCode={onDeleteAbbrCode}
        drivers={drivers}
        onAddDriver={onAddDriver}
        onDeleteDriver={onDeleteDriver}
        lang={lang}
      />

      <GenerateDocumentModal
        open={showDocModal}
        onClose={() => { setShowDocModal(false); setDocModalLogs(null); }}
        logs={docModalLogs || fuelLogs}
        stations={stations}
        lang={lang}
      />
    </div>
  );
}
