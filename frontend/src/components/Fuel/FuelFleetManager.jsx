import React, { useState, useMemo } from 'react';
import {
  Tag, User, Plus, Trash2, Search, Check, X,
  Car, Shield, Award, Droplets, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function FuelFleetManager({
  abbrCodes = [],
  onAddAbbrCode,
  onDeleteAbbrCode,
  drivers = [],
  onAddDriver,
  onDeleteDriver,
  fuelLogs = [],
  lang = 'km'
}) {
  const [newPlate, setNewPlate] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [confirmDeletePlate, setConfirmDeletePlate] = useState(null);
  const [confirmDeleteDriver, setConfirmDeleteDriver] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const triggerToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Compute live consumption stats per vehicle plate
  const plateStats = useMemo(() => {
    const stats = {};
    fuelLogs.forEach(log => {
      const p = log.license_plate || log.code_abbr || log.vehicle_plate;
      if (p) {
        if (!stats[p]) stats[p] = { count: 0, totalLiters: 0, lastDate: '' };
        stats[p].count += 1;
        stats[p].totalLiters += parseFloat(log.refill_liters) || 0;
        const d = log.log_date || log.time_in?.substring(0, 10);
        if (d && (!stats[p].lastDate || d > stats[p].lastDate)) stats[p].lastDate = d;
      }
    });
    return stats;
  }, [fuelLogs]);

  // Compute live consumption stats per driver
  const driverStats = useMemo(() => {
    const stats = {};
    fuelLogs.forEach(log => {
      const d = log.driver_name;
      if (d) {
        if (!stats[d]) stats[d] = { count: 0, totalLiters: 0, lastDate: '' };
        stats[d].count += 1;
        stats[d].totalLiters += parseFloat(log.refill_liters) || 0;
        const dt = log.log_date || log.time_in?.substring(0, 10);
        if (dt && (!stats[d].lastDate || dt > stats[d].lastDate)) stats[d].lastDate = dt;
      }
    });
    return stats;
  }, [fuelLogs]);

  // Handlers
  const handleAddPlateSubmit = (e) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    const cleanPlate = newPlate.trim().toUpperCase();
    if (onAddAbbrCode) onAddAbbrCode(cleanPlate);
    setNewPlate('');
    triggerToast(lang === 'km' ? `បានបន្ថែមផ្លាកលេខ «${cleanPlate}» ជោគជ័យ!` : `Added plate "${cleanPlate}"!`);
  };

  const handleAddDriverSubmit = (e) => {
    e.preventDefault();
    if (!newDriver.trim()) return;
    const cleanDriver = newDriver.trim();
    if (onAddDriver) onAddDriver(cleanDriver);
    setNewDriver('');
    triggerToast(lang === 'km' ? `បានបន្ថែមអ្នកបើកបរ «${cleanDriver}» ជោគជ័យ!` : `Added driver "${cleanDriver}"!`);
  };

  const handleDeletePlate = (plate) => {
    if (onDeleteAbbrCode) onDeleteAbbrCode(plate);
    setConfirmDeletePlate(null);
    triggerToast(lang === 'km' ? `បានលុបផ្លាកលេខ «${plate}»` : `Deleted plate "${plate}"`);
  };

  const handleDeleteDriver = (driver) => {
    if (onDeleteDriver) onDeleteDriver(driver);
    setConfirmDeleteDriver(null);
    triggerToast(lang === 'km' ? `បានលុបអ្នកបើកបរ «${driver}»` : `Deleted driver "${driver}"`);
  };

  // Filter lists
  const filteredPlates = abbrCodes.filter(p =>
    p.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d =>
    d.toLowerCase().includes(searchDriver.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
      {successMessage && (
        <div className="alert alert-success" style={{ animation: 'fadeIn 0.2s ease' }}>
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Fleet KPIs */}
      <div className="office-kpi-grid">
        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'km' ? 'ផ្លាកលេខចុះបញ្ជី' : 'Registered Plates'}
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--r-xs)', background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <Car size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {abbrCodes.length} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{lang === 'km' ? 'គ្រឿង' : 'vehicles'}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {Object.keys(plateStats).length} {lang === 'km' ? 'មានប្រតិបត្តិការចាក់' : 'active refuelers'}
          </div>
        </div>

        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--fuel-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'km' ? 'អ្នកបើកបរចុះបញ្ជី' : 'Registered Drivers'}
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--r-xs)', background: 'var(--fuel-subtle)', color: 'var(--fuel-accent)' }}>
              <User size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {drivers.length} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{lang === 'km' ? 'នាក់' : 'drivers'}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {Object.keys(driverStats).length} {lang === 'km' ? 'បានបើកបរចាក់សាំង' : 'active in logs'}
          </div>
        </div>
      </div>

      {/* ── Main Dual Fleet Grid ── */}
      <div className="office-fleet-grid">
        {/* ── Column 1: License Plates Manager ── */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '7px', background: 'var(--primary-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--primary)', display: 'flex' }}>
                <Car size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                  {lang === 'km' ? 'គ្រប់គ្រងផ្លាកលេខឡាន' : 'Manage License Plates'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {abbrCodes.length} {lang === 'km' ? 'ផ្លាកលេខក្នុងប្រព័ន្ធ' : 'plates in registry'}
                </span>
              </div>
            </div>
          </div>

          {/* Add Plate Form */}
          <form onSubmit={handleAddPlateSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'km' ? 'វាយបញ្ចូលផ្លាកលេខ (ឧ. 2A-8899)...' : 'License Plate (e.g. 2A-8899)...'}
              value={newPlate}
              onChange={e => setNewPlate(e.target.value)}
              style={{ fontSize: '0.82rem', height: '36px' }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!newPlate.trim()}
              style={{ whiteSpace: 'nowrap', height: '36px', padding: '0 14px' }}
            >
              <Plus size={14} /> {lang === 'km' ? 'បន្ថែម' : 'Add Plate'}
            </button>
          </form>

          {/* Search Plates */}
          <div className="filter-input-wrap" style={{ marginBottom: '12px' }}>
            <Search size={13} className="filter-icon" />
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'km' ? 'ស្វែងរកផ្លាកលេខ...' : 'Search plate...'}
              value={searchPlate}
              onChange={e => setSearchPlate(e.target.value)}
              style={{ height: '32px', fontSize: '0.78rem' }}
            />
          </div>

          {/* Plates List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredPlates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {lang === 'km' ? 'គ្មានផ្លាកលេខត្រូវនឹងការស្វែងរក' : 'No plates found'}
              </div>
            ) : (
              filteredPlates.map(plate => {
                const stat = plateStats[plate] || { count: 0, totalLiters: 0 };
                const isConfirming = confirmDeletePlate === plate;

                return (
                  <div
                    key={plate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      background: 'var(--surface-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--r-sm)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-info font-mono" style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {plate}
                      </span>
                      {stat.count > 0 && (
                        <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>
                          {stat.count} {lang === 'km' ? 'ដង' : 'refuels'} · -{stat.totalLiters.toLocaleString()} L
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {isConfirming ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleDeletePlate(plate)}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                        >
                          <Check size={11} /> {lang === 'km' ? 'លុប' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeletePlate(null)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeletePlate(plate)}
                        className="btn btn-ghost btn-sm btn-icon"
                        title={lang === 'km' ? 'លុបផ្លាកលេខ' : 'Delete plate'}
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Column 2: Drivers Manager ── */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '7px', background: 'var(--fuel-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--fuel-accent)', display: 'flex' }}>
                <User size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                  {lang === 'km' ? 'គ្រប់គ្រងអ្នកបើកបរ' : 'Manage Drivers'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {drivers.length} {lang === 'km' ? 'អ្នកបើកបរក្នុងប្រព័ន្ធ' : 'drivers registered'}
                </span>
              </div>
            </div>
          </div>

          {/* Add Driver Form */}
          <form onSubmit={handleAddDriverSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'km' ? 'ឈ្មោះអ្នកបើកបរថ្មី...' : 'Driver name...'}
              value={newDriver}
              onChange={e => setNewDriver(e.target.value)}
              style={{ fontSize: '0.82rem', height: '36px' }}
            />
            <button
              type="submit"
              className="btn btn-fuel btn-sm"
              disabled={!newDriver.trim()}
              style={{ whiteSpace: 'nowrap', height: '36px', padding: '0 14px' }}
            >
              <Plus size={14} /> {lang === 'km' ? 'បន្ថែម' : 'Add Driver'}
            </button>
          </form>

          {/* Search Drivers */}
          <div className="filter-input-wrap" style={{ marginBottom: '12px' }}>
            <Search size={13} className="filter-icon" />
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'km' ? 'ស្វែងរកអ្នកបើកបរ...' : 'Search driver...'}
              value={searchDriver}
              onChange={e => setSearchDriver(e.target.value)}
              style={{ height: '32px', fontSize: '0.78rem' }}
            />
          </div>

          {/* Drivers List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredDrivers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {lang === 'km' ? 'គ្មានឈ្មោះអ្នកបើកបរត្រូវនឹងការស្វែងរក' : 'No drivers found'}
              </div>
            ) : (
              filteredDrivers.map(driver => {
                const stat = driverStats[driver] || { count: 0, totalLiters: 0 };
                const isConfirming = confirmDeleteDriver === driver;

                return (
                  <div
                    key={driver}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      background: 'var(--surface-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--r-sm)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: 'var(--r-full)',
                        background: 'var(--fuel-subtle)', color: 'var(--fuel-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 700
                      }}>
                        {driver.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {driver}
                        </div>
                        {stat.count > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {stat.count} {lang === 'km' ? 'លើក' : 'logs'} · -{stat.totalLiters.toLocaleString()} L
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isConfirming ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                        >
                          <Check size={11} /> {lang === 'km' ? 'លុប' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteDriver(null)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteDriver(driver)}
                        className="btn btn-ghost btn-sm btn-icon"
                        title={lang === 'km' ? 'លុបឈ្មោះអ្នកបើកបរ' : 'Delete driver'}
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
