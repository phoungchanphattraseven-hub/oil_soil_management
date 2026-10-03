import React from 'react';
import AlertBanner from '../components/Dashboard/AlertBanner';
import FuelStationCard from '../components/Dashboard/FuelStationCard';
import SoilStationCard from '../components/Dashboard/SoilStationCard';
import { Fuel, HardHat, AlertTriangle, Box, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../data/translations';

export default function Dashboard({ fuelStations = [], fuelLogs = [], soilLogs = [], onDeleteStation, lang = 'km' }) {
  const lowStockStations = fuelStations.filter(s => s.current_stock_liters < s.reorder_threshold_liters);
  const t = translations[lang] || translations.km;

  // Stats calculation
  const totalStock = fuelStations.reduce((sum, s) => sum + (s.current_stock_liters || 0), 0);
  const totalCapacity = fuelStations.reduce((sum, s) => sum + (s.target_capacity_liters || 6000), 0);
  const totalSoilVolume = soilLogs.reduce((sum, s) => sum + (s.total_cubic_meters || 0), 0);
  const totalSoilTrips = soilLogs.reduce((sum, s) => sum + (s.trip_count || 0), 0);
  const totalScrapSales = soilLogs.reduce((sum, s) => sum + (s.scrap_sales_amount || 0), 0);

  return (
    <div className="page-wrapper">
      {/* Page Title & Quick Actions */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 style={{ marginBottom: '5px' }}>{t.dashboard}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {lang === 'km'
              ? 'ប្រព័ន្ធតាមដាន និងគ្រប់គ្រងប្រតិបត្តិការស្តុកសាំង និងការចាក់ដី'
              : 'Operational management platform for Fuel inventory and Earthwork logistics'}
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/fuel" className="btn btn-fuel">
            <Plus size={14} />
            <span>{lang === 'km' ? 'កត់ត្រាសាំង' : 'Fuel Operations'}</span>
          </Link>
          <Link to="/soil" className="btn btn-soil">
            <Plus size={14} />
            <span>{lang === 'km' ? 'កត់ត្រាដី' : 'Soil Operations'}</span>
          </Link>
        </div>
      </div>

      {/* Threshold Alert Banner if stock < 4000L */}
      <AlertBanner lowStockStations={lowStockStations} lang={lang} />

      {/* KPI Cards Grid */}
      <div className="grid-4 mb-6">
        {/* Total Stock Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {t.totalFuelStock}
            </span>
            <div style={{ padding: '6px', background: 'var(--fuel-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--fuel-accent)', display: 'flex' }}>
              <Fuel size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {totalStock.toLocaleString()} L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {t.totalCapacityOf} {totalCapacity.toLocaleString()} L
          </div>
        </div>

        {/* Reorder Alerts Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {t.alertsCount}
            </span>
            <div style={{ padding: '6px', background: lowStockStations.length > 0 ? 'var(--danger-subtle)' : 'var(--success-subtle)', borderRadius: 'var(--radius-xs)', color: lowStockStations.length > 0 ? 'var(--danger)' : 'var(--success)', display: 'flex' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: lowStockStations.length > 0 ? 'var(--danger)' : 'var(--success)', letterSpacing: '-0.02em' }}>
            {lowStockStations.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {lowStockStations.length > 0 ? t.belowThreshold : (lang === 'km' ? 'កម្រិតស្តុកគ្រប់គ្រាន់' : 'All stocks normal')}
          </div>
        </div>

        {/* Soil Trips & Volume Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {t.totalSoilVolume}
            </span>
            <div style={{ padding: '6px', background: 'var(--soil-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--soil-accent)', display: 'flex' }}>
              <Box size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--soil-accent)', letterSpacing: '-0.02em' }}>
            {totalSoilVolume.toLocaleString()} m³
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {t.totalTripsCount.replace('{trips}', totalSoilTrips)}
          </div>
        </div>

        {/* Scrap Sales Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {t.scrapSalesIncome}
            </span>
            <div style={{ padding: '6px', background: 'rgba(251, 191, 36, 0.12)', borderRadius: 'var(--radius-xs)', color: '#fbbf24', display: 'flex' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.02em' }}>
            ${totalScrapSales.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {t.soilAndScrap}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid-2">
        {/* Session 1 Fuel Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fuel size={17} color="var(--fuel-accent)" />
              <span>{t.fuelStationsTitle}</span>
            </h2>
            <span className="badge badge-warning">{t.fuelBadge}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {fuelStations.length === 0 ? (
              <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                <Fuel size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  {lang === 'km' ? 'មិនទាន់មានស្ថានីយ៍សាំងនៅឡើយទេ' : 'No fuel stations created yet.'}
                </p>
                <Link to="/fuel" className="btn btn-fuel" style={{ display: 'inline-flex' }}>
                  <Plus size={14} /> {lang === 'km' ? 'បង្កើតស្ថានីយ៍សាំងថ្មី' : 'Add Fuel Station'}
                </Link>
              </div>
            ) : (
              fuelStations.map(station => (
                <FuelStationCard key={station.id} station={station} onDeleteStation={onDeleteStation} lang={lang} />
              ))
            )}
          </div>
        </div>

        {/* Session 2 Soil Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardHat size={17} color="var(--soil-accent)" />
              <span>{t.soilStationsTitle}</span>
            </h2>
            <span className="badge badge-success">{t.soilBadge}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {soilLogs.length === 0 ? (
              <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                <HardHat size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  {lang === 'km' ? 'មិនទាន់មានរបាយការណ៍ចាក់ដីនៅឡើយទេ' : 'No soil logs recorded yet.'}
                </p>
                <Link to="/soil" className="btn btn-soil" style={{ display: 'inline-flex' }}>
                  <Plus size={14} /> {lang === 'km' ? 'កត់ត្រារបាយការណ៍ចាក់ដី' : 'Record Soil Log'}
                </Link>
              </div>
            ) : (
              soilLogs.map(log => (
                <SoilStationCard key={log.id} soilLog={log} lang={lang} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
