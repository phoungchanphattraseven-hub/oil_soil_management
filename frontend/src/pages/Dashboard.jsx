import React from 'react';
import AlertBanner from '../components/Dashboard/AlertBanner';
import FuelStationCard from '../components/Dashboard/FuelStationCard';
import SoilStationCard from '../components/Dashboard/SoilStationCard';
import { Fuel, HardHat, AlertTriangle, Box, DollarSign, Plus, Shield, ChevronRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../data/translations';

export default function Dashboard({ fuelStations = [], fuelLogs = [], soilLogs = [], onDeleteStation, lang = 'km', userRole = 'user' }) {
  const lowStockStations = fuelStations.filter(s => s.current_stock_liters < s.reorder_threshold_liters);
  const t = translations[lang] || translations.km;
  const isKm = lang === 'km';

  const totalStock       = fuelStations.reduce((sum, s) => sum + (s.current_stock_liters || 0), 0);
  const totalCapacity    = fuelStations.reduce((sum, s) => sum + (s.target_capacity_liters || 6000), 0);
  const totalSoilVolume  = soilLogs.reduce((sum, s) => sum + (s.total_cubic_meters || 0), 0);
  const totalSoilTrips   = soilLogs.reduce((sum, s) => sum + (s.trip_count || 0), 0);
  const totalScrapSales  = soilLogs.reduce((sum, s) => sum + (s.scrap_sales_amount || 0), 0);

  // ── User reporting view ─────────────────────────────────────
  if (userRole === 'user') {
    const todayStr  = new Date().toISOString().substring(0, 10);
    const todayFuel = fuelLogs.filter(l => (l.log_date || '').substring(0, 10) === todayStr).length;
    const todaySoil = soilLogs.filter(l => (l.log_date || '').substring(0, 10) === todayStr).length;

    return (
      <div className="page-wrapper" style={{ paddingBottom: '80px' }}>

        {/* ── Welcome Hero ─────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79,125,245,0.18) 0%, rgba(16,185,129,0.12) 100%)',
          border: '1px solid rgba(79,125,245,0.15)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 20px 18px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* decorative blobs */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,125,245,0.18) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79,125,245,0.35)'
              }}>
                <ClipboardList size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {isKm ? 'ប្រព័ន្ធកត់ត្រា' : 'Reporting Dashboard'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {isKm ? 'ប្រេងឥន្ធនៈ & ដី · Station Operations' : 'Fuel & Soil · Station Operations'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.5 }}>
              {isKm
                ? 'ចុចកត់ត្រាខាងក្រោមដើម្បីបញ្ចូលរបាយការណ៍ប្រចាំថ្ងៃ'
                : 'Tap a report button below to log today\'s operations'}
            </p>
          </div>
        </div>

        {/* ── Today summary pills ──────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            flex: 1, padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'var(--fuel-subtle)', display: 'flex' }}>
              <Fuel size={16} color="var(--fuel-accent)" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--fuel-accent)', lineHeight: 1 }}>{todayFuel}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isKm ? 'សាំងថ្ងៃនេះ' : 'Fuel today'}
              </div>
            </div>
          </div>
          <div style={{
            flex: 1, padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'var(--soil-subtle)', display: 'flex' }}>
              <HardHat size={16} color="var(--soil-accent)" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--soil-accent)', lineHeight: 1 }}>{todaySoil}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isKm ? 'ដីថ្ងៃនេះ' : 'Soil today'}
              </div>
            </div>
          </div>
          <div style={{
            flex: 1, padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ padding: '7px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex' }}>
              <ClipboardList size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                {fuelLogs.length + soilLogs.length}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isKm ? 'សរុប' : 'Total'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Big Action Cards ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>

          {/* Fuel Card */}
          <Link to="/fuel" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 'var(--r-lg)',
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
              cursor: 'pointer', transition: 'all 0.18s ease',
              position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(245,158,11,0.35)'
              }}>
                <Fuel size={24} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '3px' }}>
                  {isKm ? 'កត់ត្រាប្រេងឥន្ធនៈ' : 'Record Fuel Log'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isKm ? `${fuelLogs.length} ករណីសរុប · ថ្ងៃនេះ ${todayFuel} ករណី` : `${fuelLogs.length} total logs · ${todayFuel} today`}
                </div>
              </div>
              <ChevronRight size={20} color="var(--fuel-accent)" style={{ flexShrink: 0 }} />
            </div>
          </Link>

          {/* Soil Card */}
          <Link to="/soil" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.05) 100%)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 'var(--r-lg)',
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
              cursor: 'pointer', transition: 'all 0.18s ease',
              position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(16,185,129,0.35)'
              }}>
                <HardHat size={24} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '3px' }}>
                  {isKm ? 'កត់ត្រាការចាក់ដី' : 'Record Soil Log'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isKm ? `${soilLogs.length} ករណីសរុប · ថ្ងៃនេះ ${todaySoil} ករណី` : `${soilLogs.length} total logs · ${todaySoil} today`}
                </div>
              </div>
              <ChevronRight size={20} color="var(--soil-accent)" style={{ flexShrink: 0 }} />
            </div>
          </Link>
        </div>

        {/* ── Recent Fuel Logs ─────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Fuel size={14} color="var(--fuel-accent)" />
              {isKm ? 'ការបំពេញសាំងចុងក្រោយ' : 'Recent Fuel Logs'}
            </div>
            <Link to="/fuel" style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              {isKm ? 'មើលទាំងអស់' : 'View all'} →
            </Link>
          </div>
          {fuelLogs.length === 0 ? (
            <div style={{
              padding: '24px', textAlign: 'center', borderRadius: 'var(--r-md)',
              background: 'var(--surface-card)', border: '1px dashed var(--border-subtle)'
            }}>
              <Fuel size={28} style={{ color: 'var(--text-dim)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKm ? 'មិនទាន់មានរបាយការណ៍នៅឡើយ' : 'No fuel logs yet'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fuelLogs.slice(-3).reverse().map(log => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: 'var(--r-md)',
                  background: 'var(--surface-card)', border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                    background: 'var(--fuel-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Fuel size={16} color="var(--fuel-accent)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.station_name || log.description || isKm ? 'ការបំពេញសាំង' : 'Fuel Refill'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {log.log_date || ''} · {log.driver_name || '—'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--fuel-accent)', flexShrink: 0 }}>
                    {log.refill_liters || log.oil_in || 0}L
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Soil Logs ─────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardHat size={14} color="var(--soil-accent)" />
              {isKm ? 'ការចាក់ដីចុងក្រោយ' : 'Recent Soil Logs'}
            </div>
            <Link to="/soil" style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              {isKm ? 'មើលទាំងអស់' : 'View all'} →
            </Link>
          </div>
          {soilLogs.length === 0 ? (
            <div style={{
              padding: '24px', textAlign: 'center', borderRadius: 'var(--r-md)',
              background: 'var(--surface-card)', border: '1px dashed var(--border-subtle)'
            }}>
              <HardHat size={28} style={{ color: 'var(--text-dim)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKm ? 'មិនទាន់មានរបាយការណ៍នៅឡើយ' : 'No soil logs yet'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {soilLogs.slice(-3).reverse().map(log => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: 'var(--r-md)',
                  background: 'var(--surface-card)', border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                    background: 'var(--soil-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <HardHat size={16} color="var(--soil-accent)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.station_name || isKm ? 'ការចាក់ដី' : 'Soil Operation'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {log.log_date || ''} · {log.trip_count || 0} {isKm ? 'ដំណើរ' : 'trips'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--soil-accent)', flexShrink: 0 }}>
                    {(log.total_cubic_meters || 0).toFixed(1)}m³
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ── Admin view (unchanged structure) ───────────────────────
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1 style={{ marginBottom: '5px' }}>{t.dashboard}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {isKm
              ? 'ប្រព័ន្ធតាមដាន និងគ្រប់គ្រងប្រតិបត្តិការស្តុកសាំង និងការចាក់ដី'
              : 'Operational management platform for Fuel inventory and Earthwork logistics'}
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/fuel" className="btn btn-fuel">
            <Plus size={14} />
            <span>{isKm ? 'កត់ត្រាសាំង' : 'Fuel Operations'}</span>
          </Link>
          <Link to="/soil" className="btn btn-soil">
            <Plus size={14} />
            <span>{isKm ? 'កត់ត្រាដី' : 'Soil Operations'}</span>
          </Link>
        </div>
      </div>

      <AlertBanner lowStockStations={lowStockStations} lang={lang} />

      <div className="grid-4 mb-6">
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.totalFuelStock}</span>
            <div style={{ padding: '6px', background: 'var(--fuel-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--fuel-accent)', display: 'flex' }}><Fuel size={16} /></div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{totalStock.toLocaleString()} L</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{t.totalCapacityOf} {totalCapacity.toLocaleString()} L</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.alertsCount}</span>
            <div style={{ padding: '6px', background: lowStockStations.length > 0 ? 'var(--danger-subtle)' : 'var(--success-subtle)', borderRadius: 'var(--radius-xs)', color: lowStockStations.length > 0 ? 'var(--danger)' : 'var(--success)', display: 'flex' }}><AlertTriangle size={16} /></div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: lowStockStations.length > 0 ? 'var(--danger)' : 'var(--success)', letterSpacing: '-0.02em' }}>{lowStockStations.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{lowStockStations.length > 0 ? t.belowThreshold : (isKm ? 'កម្រិតស្តុកគ្រប់គ្រាន់' : 'All stocks normal')}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.totalSoilVolume}</span>
            <div style={{ padding: '6px', background: 'var(--soil-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--soil-accent)', display: 'flex' }}><Box size={16} /></div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--soil-accent)', letterSpacing: '-0.02em' }}>{totalSoilVolume.toLocaleString()} m³</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{t.totalTripsCount?.replace('{trips}', totalSoilTrips)}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.scrapSalesIncome}</span>
            <div style={{ padding: '6px', background: 'rgba(251, 191, 36, 0.12)', borderRadius: 'var(--radius-xs)', color: '#fbbf24', display: 'flex' }}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.02em' }}>${totalScrapSales.toFixed(2)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{t.soilAndScrap}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fuel size={17} color="var(--fuel-accent)" /><span>{t.fuelStationsTitle}</span>
            </h2>
            <span className="badge badge-warning">{t.fuelBadge}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {fuelStations.length === 0 ? (
              <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                <Fuel size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{isKm ? 'មិនទាន់មានស្ថានីយ៍សាំងនៅឡើយទេ' : 'No fuel stations created yet.'}</p>
                <Link to="/fuel" className="btn btn-fuel" style={{ display: 'inline-flex' }}><Plus size={14} /> {isKm ? 'បង្កើតស្ថានីយ៍សាំងថ្មី' : 'Add Fuel Station'}</Link>
              </div>
            ) : fuelStations.map(station => (
              <FuelStationCard key={station.id} station={station} onDeleteStation={onDeleteStation} lang={lang} userRole={userRole} />
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardHat size={17} color="var(--soil-accent)" /><span>{t.soilStationsTitle}</span>
            </h2>
            <span className="badge badge-success">{t.soilBadge}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {soilLogs.length === 0 ? (
              <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                <HardHat size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{isKm ? 'មិនទាន់មានរបាយការណ៍ចាក់ដីនៅឡើយទេ' : 'No soil logs recorded yet.'}</p>
                <Link to="/soil" className="btn btn-soil" style={{ display: 'inline-flex' }}><Plus size={14} /> {isKm ? 'កត់ត្រារបាយការណ៍ចាក់ដី' : 'Record Soil Log'}</Link>
              </div>
            ) : soilLogs.map(log => (
              <SoilStationCard key={log.id} soilLog={log} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
