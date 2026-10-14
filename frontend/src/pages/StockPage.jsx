import React, { useState } from 'react';
import { Gauge, Fuel, AlertTriangle, Plus, Building2, Droplets, ArrowRight, ShieldCheck, RefreshCw, Pencil, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockGauge from '../components/Dashboard/StockGauge';
import AlertBanner from '../components/Dashboard/AlertBanner';
import FuelLogForm from '../components/Fuel/FuelLogForm';
import AddStationModal from '../components/Fuel/AddStationModal';
import { translations } from '../data/translations';

export default function StockPage({
  stations = [],
  fuelLogs = [],
  staff = [],
  onAddFuelLog,
  onAddStation,
  onEditStation,
  onDeleteStation,
  lang = 'km',
  userRole = 'user',
  assignedStation = { id: '', name: '' }
}) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [showAddStation, setShowAddStation] = useState(false);
  const [editingStation, setEditingStation] = useState(null);

  const t = translations[lang] || translations.km;
  const isKm = lang === 'km';

  // Metrics calculation
  const totalStock = stations.reduce((sum, s) => sum + (Number(s.current_stock_liters) || 0), 0);
  const totalCapacity = stations.reduce((sum, s) => sum + (Number(s.target_capacity_liters) || 6000), 0);
  const overallPercentage = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;
  const lowStockStations = stations.filter(s => (s.current_stock_liters || 0) < (s.reorder_threshold_liters || 4000));

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayLogs = fuelLogs.filter(l => (l.log_date || l.time_in?.substring(0, 10)) === todayStr);
  const todayVolumeSpent = todayLogs.reduce((sum, l) => sum + (parseFloat(l.refill_liters) || 0), 0);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── Official Enterprise Header Card ── */}
      <div className="official-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, var(--fuel-accent), #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            flexShrink: 0
          }}>
            <Gauge size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.5px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                {isKm ? 'ការគ្រប់គ្រងស្តុក & សន្និធិ' : 'LIVE INVENTORY CONTROL'}
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '0.68rem' }}>
                {overallPercentage}% {isKm ? 'នៃសមត្ថភាពសរុប' : 'OF TOTAL CAPACITY'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {isKm ? 'ការគ្រប់គ្រងស្តុកសាំង & កម្រិតស្តុក' : 'Fuel Stock & Live Gauges'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              {isKm
                ? 'តាមដានកម្រិតស្តុកជាក់ស្តែង (Live Gauges) កម្រិតអប្បបរមា 4,000L និងសមត្ថភាព 6,000L'
                : 'Real-time fuel reserve levels, 4,000L minimum threshold alerts & capacity optimization'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="page-header-actions" style={{ flexWrap: 'wrap' }}>
          <Link
            to="/stations"
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px', height: '36px' }}
          >
            <Building2 size={14} />
            {isKm ? 'ស្ថានីយ៍ទាំងអស់' : 'All Stations'}
          </Link>
          <button
            onClick={() => setShowLogForm(true)}
            className="btn btn-fuel btn-sm"
            style={{ fontWeight: 700, height: '36px', gap: '6px' }}
          >
            <Plus size={15} />
            {isKm ? 'កត់ត្រាសាំង' : 'Log Refill'}
          </button>
        </div>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      <AlertBanner lowStockStations={lowStockStations} lang={lang} />

      {/* ── Inventory KPI Strip ── */}
      <div className="grid-3">
        {/* Total Stock */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'ស្តុកសាំងសរុបបច្ចុប្បន្ន' : 'Current Total Stock'}</span>
            <div className="stat-card-icon" style={{ background: 'var(--fuel-subtle)' }}>
              <Fuel size={16} color="var(--fuel-accent)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--fuel-accent)' }}>
            {totalStock.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>L</span>
          </div>
          <div className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{isKm ? 'នៃសមត្ថភាពសរុប' : 'of total'} {totalCapacity.toLocaleString()} L</span>
            <span style={{ fontWeight: 700, color: overallPercentage > 65 ? 'var(--success)' : 'var(--danger)' }}>
              {overallPercentage}%
            </span>
          </div>
          {/* Progress bar */}
          <div style={{
            width: '100%', height: '6px', borderRadius: '3px',
            background: 'var(--surface-subtle)', marginTop: '8px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${overallPercentage}%`, height: '100%',
              borderRadius: '3px',
              background: overallPercentage < 50 ? 'var(--danger)' : 'var(--fuel-accent)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Today's Spend */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'ប្រើប្រាស់ថ្ងៃនេះ' : "Today's Consumption"}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
              <Droplets size={16} color="var(--danger)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
            {todayVolumeSpent.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>L</span>
          </div>
          <div className="stat-card-sub">
            {todayLogs.length} {isKm ? 'កំណត់ត្រាបានកត់ត្រាថ្ងៃនេះ' : 'fuel logs recorded today'}
          </div>
        </div>

        {/* Stations Needing Fuel */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'ស្ថានីយ៍ត្រូវសុំបន្ថែម' : 'Reorder Needed'}</span>
            <div className="stat-card-icon" style={{ background: lowStockStations.length > 0 ? 'var(--danger-subtle)' : 'var(--success-subtle)' }}>
              <AlertTriangle size={16} color={lowStockStations.length > 0 ? 'var(--danger)' : 'var(--success)'} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: lowStockStations.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {lowStockStations.length}
          </div>
          <div className="stat-card-sub">
            {lowStockStations.length > 0
              ? (isKm ? 'ត្រូវការបន្ថែមឲ្យដល់ 6,000L បន្ទាន់' : 'Need replenishment to 6,000L urgently')
              : (isKm ? 'គ្រប់ស្ថានីយ៍ស្ថិតក្នុងកម្រិតធម្មតា' : 'All fuel reserves above 4,000L')}
          </div>
        </div>
      </div>

      {/* ── Section: Live Stock Gauges ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="section-label" style={{ margin: 0 }}>
            <Gauge size={15} color="var(--fuel-accent)" />
            {isKm ? 'កម្រិតស្តុកជាក់ស្តែងតាមស្ថានីយ៍នីមួយៗ (Live Stock Gauges)' : 'Live Station Gauges & Capacity Monitoring'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {isKm ? 'គោលដៅស្តុក: 6,000L | អប្បបរមា: 4,000L' : 'Target: 6,000L | Threshold: 4,000L'}
            </span>
          </div>
        </div>

        {stations.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-dim)', marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
              <Fuel size={44} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              {isKm ? 'មិនទាន់មានស្ថានីយ៍សាំងឡើយ' : 'No Stations Registered'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {isKm ? 'សូមបន្ថែមស្ថានីយ៍សាំងដើម្បីចាប់ផ្តើមតាមដានស្តុក' : 'Add stations to monitor live stock gauges'}
            </p>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddStation(true)}
                className="btn btn-fuel"
                style={{ display: 'inline-flex', margin: '0 auto', gap: '6px' }}
              >
                <Plus size={15} />
                {isKm ? 'បន្ថែមស្ថានីយ៍ដំបូង' : 'Add First Station'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {stations.map(s => {
              const curStock = Number(s.current_stock_liters) || 0;
              const targetCap = Number(s.target_capacity_liters) || 6000;
              const threshold = Number(s.reorder_threshold_liters) || 4000;
              const isLow = curStock < threshold;

              return (
                <div key={s.id} className="card card-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem', marginBottom: '3px', color: 'var(--text-main)' }}>
                        {s.name || s.station_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {isKm ? 'កម្រិតអប្បបរមា' : 'Reorder Threshold'}: {threshold.toLocaleString()} L
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={isLow ? 'badge badge-danger' : 'badge badge-success'} style={{ fontSize: '0.68rem' }}>
                        {isLow ? t.reorderNeeded : t.normalStock}
                      </span>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => { setEditingStation(s); setShowAddStation(true); }}
                          title={isKm ? 'កែប្រែ' : 'Edit'}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--primary)', padding: '5px' }}
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <StockGauge
                    currentStock={curStock}
                    targetCapacity={targetCap}
                    threshold={threshold}
                    lang={lang}
                  />

                  <div style={{
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.74rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {isKm ? 'ខ្វះ' : 'Deficit'}: {Math.max(0, targetCap - curStock).toLocaleString()} L
                    </span>
                    <button
                      onClick={() => setShowLogForm(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--fuel-accent)', padding: '3px 8px', fontSize: '0.74rem', fontWeight: 700 }}
                    >
                      <Plus size={13} style={{ marginRight: '3px' }} />
                      {isKm ? 'ចាក់បំពេញ' : 'Refill'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detailed Breakdown Table ── */}
      {stations.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fuel size={16} color="var(--fuel-accent)" />
              {isKm ? 'តារាងសង្ខេបស្តុកគ្រប់ស្ថានីយ៍' : 'Station Inventory Ledger'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {stations.length} {isKm ? 'ស្ថានីយ៍' : 'stations'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>{isKm ? 'ឈ្មោះស្ថានីយ៍' : 'Station'}</th>
                  <th>{isKm ? 'ទីតាំង' : 'Location'}</th>
                  <th style={{ textAlign: 'right' }}>{isKm ? 'ស្តុកជាក់ស្តែង (L)' : 'Current Stock (L)'}</th>
                  <th style={{ textAlign: 'right' }}>{isKm ? 'សមត្ថភាព (L)' : 'Capacity (L)'}</th>
                  <th style={{ textAlign: 'right' }}>{isKm ? 'កម្រិតត្រូវសុំ (L)' : 'Threshold (L)'}</th>
                  <th>{isKm ? 'ភាគរយស្តុក' : 'Level %'}</th>
                  <th>{isKm ? 'ស្ថានភាព' : 'Status'}</th>
                  <th style={{ textAlign: 'center' }}>{isKm ? 'សកម្មភាព' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {stations.map(st => {
                  const curStock = Number(st.current_stock_liters) || 0;
                  const targetCap = Number(st.target_capacity_liters) || 6000;
                  const threshold = Number(st.reorder_threshold_liters) || 4000;
                  const percent = Math.min(100, Math.round((curStock / targetCap) * 100));
                  const isLow = curStock < threshold;

                  return (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {st.name || st.station_name}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {st.location || '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: isLow ? 'var(--danger)' : 'var(--fuel-accent)' }}>
                        {curStock.toLocaleString()} L
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        {targetCap.toLocaleString()} L
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                        {threshold.toLocaleString()} L
                      </td>
                      <td style={{ width: '140px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            flex: 1, height: '6px', borderRadius: '3px',
                            background: 'var(--surface-subtle)', overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${percent}%`, height: '100%',
                              borderRadius: '3px',
                              background: isLow ? 'var(--danger)' : 'var(--fuel-accent)'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, minWidth: '32px', textAlign: 'right' }}>
                            {percent}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={isLow ? 'badge badge-danger' : 'badge badge-success'} style={{ fontSize: '0.68rem' }}>
                          {isLow ? t.reorderNeeded : t.normalStock}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setShowLogForm(true)}
                          className="btn btn-fuel btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                        >
                          {isKm ? 'កត់ត្រា' : 'Log'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <FuelLogForm
        stations={stations}
        onAddFuelLog={onAddFuelLog}
        staff={staff}
        lang={lang}
        open={showLogForm}
        onClose={() => setShowLogForm(false)}
        assignedStation={assignedStation}
      />

      <AddStationModal
        open={showAddStation}
        onClose={() => { setShowAddStation(false); setEditingStation(null); }}
        onAddStation={onAddStation}
        onEditStation={onEditStation}
        station={editingStation}
        lang={lang}
      />
    </div>
  );
}
