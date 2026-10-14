import React, { useState, useMemo } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Gauge, Fuel, Users, Search, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddStationModal from '../components/Fuel/AddStationModal';
import StockGauge from '../components/Dashboard/StockGauge';
import { translations } from '../data/translations';

export default function StationsPage({
  stations = [],
  onAddStation,
  onEditStation,
  onDeleteStation,
  staff = [],
  fuelLogs = [],
  lang = 'km',
  userRole = 'user'
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'NORMAL' | 'LOW'

  const t = translations[lang] || translations.km;
  const isKm = lang === 'km';

  // Summary Metrics
  const totalStations = stations.length;
  const totalCapacity = stations.reduce((sum, s) => sum + (Number(s.target_capacity_liters) || 6000), 0);
  const totalCurrentStock = stations.reduce((sum, s) => sum + (Number(s.current_stock_liters) || 0), 0);
  const lowStockCount = stations.filter(s => (s.current_stock_liters || 0) < (s.reorder_threshold_liters || 4000)).length;

  // Filtered stations
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const name = (s.name || s.station_name || '').toLowerCase();
      const loc = (s.location || '').toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || loc.includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      const isLow = (s.current_stock_liters || 0) < (s.reorder_threshold_liters || 4000);
      if (filterStatus === 'NORMAL') return !isLow;
      if (filterStatus === 'LOW') return isLow;
      return true;
    });
  }, [stations, searchTerm, filterStatus]);

  const handleDeleteClick = (stId) => {
    const confirmMsg = t.confirmDeleteStation || (isKm ? 'តើអ្នកពិតជាចង់លុបស្ថានីយ៍សាំងនេះមែនទេ?' : 'Are you sure you want to delete this station?');
    if (window.confirm(confirmMsg)) {
      if (onDeleteStation) onDeleteStation(stId);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── Official Enterprise Header Card ── */}
      <div className="official-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            flexShrink: 0
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.5px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                {isKm ? 'ការគ្រប់គ្រងហេដ្ឋារចនាសម្ព័ន្ធ' : 'INFRASTRUCTURE DIRECTORY'}
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '0.68rem' }}>
                {totalStations} {isKm ? 'ស្ថានីយ៍សកម្ម' : 'STATIONS ACTIVE'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {isKm ? 'ការគ្រប់គ្រងស្ថានីយ៍សាំង' : 'Fuel Stations Management'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              {isKm
                ? 'បញ្ជីស្ថានីយ៍សាំង សមត្ថភាពផ្ទុក (6,000L) ទីតាំងប្រតិបត្តិការ និងបុគ្គលិកប្រចាំការ'
                : 'Fuel station registry, operational storage capacities, locations & assigned operators'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="page-header-actions" style={{ flexWrap: 'wrap' }}>
          <Link
            to="/stock"
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px', height: '36px' }}
          >
            <Gauge size={14} color="var(--fuel-accent)" />
            {isKm ? 'ពិនិត្យស្តុកសាំង' : 'Check Stock'}
          </Link>
          {userRole === 'admin' && (
            <button
              onClick={() => { setEditingStation(null); setShowAddModal(true); }}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, height: '36px', gap: '6px' }}
            >
              <Plus size={15} />
              {isKm ? 'បន្ថែមស្ថានីយ៍ថ្មី' : 'Add Station'}
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'ស្ថានីយ៍សរុប' : 'Total Stations'}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
              <Building2 size={16} color="#3b82f6" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#3b82f6' }}>
            {totalStations}
          </div>
          <div className="stat-card-sub">
            {isKm ? 'ដំណើរការប្រតិបត្តិការ 100%' : '100% operational'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'សមត្ថភាពស្តុកសរុប' : 'Total Storage Capacity'}</span>
            <div className="stat-card-icon" style={{ background: 'var(--fuel-subtle)' }}>
              <Fuel size={16} color="var(--fuel-accent)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--fuel-accent)' }}>
            {totalCapacity.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>L</span>
          </div>
          <div className="stat-card-sub">
            {isKm ? 'ស្តុកបច្ចុប្បន្ន' : 'Current stock'}: {totalCurrentStock.toLocaleString()} L
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'ស្ថានីយ៍ត្រូវសុំសាំង' : 'Threshold Alert Stations'}</span>
            <div className="stat-card-icon" style={{ background: lowStockCount > 0 ? 'var(--danger-subtle)' : 'var(--success-subtle)' }}>
              <AlertTriangle size={16} color={lowStockCount > 0 ? 'var(--danger)' : 'var(--success)'} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {lowStockCount}
          </div>
          <div className="stat-card-sub">
            {lowStockCount > 0
              ? (isKm ? 'ទាបជាងកម្រិត 4,000 L' : 'Stock below 4,000L threshold')
              : (isKm ? 'កម្រិតស្តុកគ្រប់គ្រាន់' : 'All stocks above threshold')}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            className="input-field"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isKm ? 'ស្វែងរកឈ្មោះ ឬ ទីតាំងស្ថានីយ៍...' : 'Search station name or location...'}
            style={{ border: 'none', background: 'transparent', padding: '6px 0', fontSize: '0.85rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {isKm ? 'ទាំងអស់' : 'All'} ({stations.length})
          </button>
          <button
            onClick={() => setFilterStatus('NORMAL')}
            className={`btn btn-sm ${filterStatus === 'NORMAL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {isKm ? 'ស្តុកធម្មតា' : 'Normal'} ({stations.length - lowStockCount})
          </button>
          <button
            onClick={() => setFilterStatus('LOW')}
            className={`btn btn-sm ${filterStatus === 'LOW' ? 'btn-danger' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {isKm ? 'ត្រូវសុំបន្ថែម' : 'Alert'} ({lowStockCount})
          </button>
        </div>
      </div>

      {/* ── Stations Grid ── */}
      {filteredStations.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
            <Building2 size={44} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
            {isKm ? 'រកមិនឃើញស្ថានីយ៍ឡើយ' : 'No Stations Found'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            {searchTerm
              ? (isKm ? 'សូមព្យាយាមស្វែងរកពាក្យផ្សេង' : 'Try a different search term')
              : (isKm ? 'មិនទាន់មានស្ថានីយ៍សាំងឡើយ — ចុចបន្ថែមស្ថានីយ៍ថ្មី' : 'No stations registered yet')}
          </p>
          {userRole === 'admin' && (
            <button
              onClick={() => { setEditingStation(null); setShowAddModal(true); }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', margin: '0 auto', gap: '6px' }}
            >
              <Plus size={15} />
              {isKm ? 'បន្ថែមស្ថានីយ៍ដំបូង' : 'Add First Station'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filteredStations.map(st => {
            const isLow = (st.current_stock_liters || 0) < (st.reorder_threshold_liters || 4000);
            const targetCap = Number(st.target_capacity_liters) || 6000;
            const curStock = Number(st.current_stock_liters) || 0;
            const percent = Math.min(100, Math.round((curStock / targetCap) * 100));

            // Find staff assigned to this station
            const assignedStaff = staff.filter(s => {
              const assigned = s.assigned_station || s.assignedStation;
              return assigned === st.id || assigned === st.name || assigned === st.station_name;
            });

            return (
              <div key={st.id} className="card card-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Station Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: isLow ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isLow ? 'var(--danger)' : '#3b82f6',
                      flexShrink: 0
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {st.name || st.station_name}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {st.location || (isKm ? 'ទីតាំងការដ្ឋាន' : 'Operational Site')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={isLow ? 'badge badge-danger' : 'badge badge-success'} style={{ fontSize: '0.68rem' }}>
                      {isLow ? t.reorderNeeded : t.normalStock}
                    </span>
                    {userRole === 'admin' && (
                      <>
                        <button
                          onClick={() => { setEditingStation(st); setShowAddModal(true); }}
                          title={isKm ? 'កែប្រែ' : 'Edit'}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--primary)', padding: '5px' }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(st.id)}
                          title={isKm ? 'លុប' : 'Delete'}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--text-dim)', padding: '5px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Live Gauge */}
                <div style={{ background: 'var(--surface-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <StockGauge
                    currentStock={curStock}
                    targetCapacity={targetCap}
                    threshold={st.reorder_threshold_liters || 4000}
                    lang={lang}
                  />
                </div>

                {/* Assigned Staff Preview */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={12} />
                      {isKm ? 'បុគ្គលិកប្រចាំការ' : 'Assigned Staff'} ({assignedStaff.length})
                    </span>
                    <Link to="/staff" style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      {isKm ? 'គ្រប់គ្រង' : 'Manage'} →
                    </Link>
                  </div>
                  {assignedStaff.length === 0 ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {isKm ? 'មិនទាន់មានបុគ្គលិកចាត់តាំង' : 'No operators assigned'}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {assignedStaff.slice(0, 4).map(stf => (
                        <span
                          key={stf.id}
                          className="badge badge-neutral"
                          style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px' }}
                        >
                          {stf.name}
                        </span>
                      ))}
                      {assignedStaff.length > 4 && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '3px 6px' }}>
                          +{assignedStaff.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isKm ? 'កម្រិតអប្បបរមា' : 'Threshold'}: {(st.reorder_threshold_liters || 4000).toLocaleString()} L
                  </span>
                  <Link
                    to="/stock"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: 'var(--fuel-accent)', textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem'
                    }}
                  >
                    {isKm ? 'ព័ត៌មានស្តុក' : 'Stock Details'} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      <AddStationModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingStation(null); }}
        onAddStation={onAddStation}
        onEditStation={onEditStation}
        station={editingStation}
        lang={lang}
      />
    </div>
  );
}
