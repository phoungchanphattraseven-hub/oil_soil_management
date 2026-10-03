import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Droplets,
  FileText, Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
  TrendingDown, TrendingUp, Users, Car, CheckCircle2, AlertCircle
} from 'lucide-react';

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const KHMER_DAYS = [
  'ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ',
  'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'
];

export function formatDateKhmer(dateStr) {
  if (!dateStr || dateStr.length < 10) return dateStr || 'N/A';
  try {
    const parts = dateStr.substring(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    const dayOfWeek = KHMER_DAYS[dateObj.getDay()];
    const monthName = KHMER_MONTHS[month];
    return `${dayOfWeek}, ${String(day).padStart(2, '0')} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDateEnglish(dateStr) {
  if (!dateStr || dateStr.length < 10) return dateStr || 'N/A';
  try {
    const parts = dateStr.substring(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function FuelDateMaster({
  fuelLogs = [],
  onSelectDate,
  onOpenDocForDate,
  onAddLogForDate,
  lang = 'km'
}) {
  const [searchDate, setSearchDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterShift, setFilterShift] = useState('ALL');

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Group logs by date
  const dateSummaries = useMemo(() => {
    const map = {};

    fuelLogs.forEach(log => {
      const d = log.log_date || log.time_in?.substring(0, 10) || 'Unknown';
      if (!map[d]) {
        map[d] = {
          date: d,
          totalOilOut: 0,
          totalOilIn: 0,
          count: 0,
          morningCount: 0,
          afternoonCount: 0,
          plates: new Set(),
          drivers: new Set(),
          stations: new Set(),
          logs: []
        };
      }

      const out = parseFloat(log.refill_liters) || 0;
      const inVal = parseFloat(log.oil_in) || 0;
      map[d].totalOilOut += out;
      map[d].totalOilIn += inVal;
      map[d].count += 1;
      if (log.shift === 'Afternoon') map[d].afternoonCount += 1;
      else map[d].morningCount += 1;

      if (log.license_plate || log.code_abbr) map[d].plates.add(log.license_plate || log.code_abbr);
      if (log.driver_name) map[d].drivers.add(log.driver_name);
      if (log.station_name) map[d].stations.add(log.station_name);
      map[d].logs.push(log);
    });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [fuelLogs]);

  // Filtered by selected month / search
  const filteredSummaries = useMemo(() => {
    return dateSummaries.filter(summary => {
      if (searchDate) {
        return summary.date.includes(searchDate);
      }
      if (selectedMonth) {
        return summary.date.startsWith(selectedMonth);
      }
      return true;
    });
  }, [dateSummaries, searchDate, selectedMonth]);

  // Aggregated totals for the current view
  const aggregateStats = useMemo(() => {
    const totalOut = filteredSummaries.reduce((sum, d) => sum + d.totalOilOut, 0);
    const totalIn = filteredSummaries.reduce((sum, d) => sum + d.totalOilIn, 0);
    const totalLogs = filteredSummaries.reduce((sum, d) => sum + d.count, 0);
    const avgDailyOut = filteredSummaries.length > 0 ? (totalOut / filteredSummaries.length).toFixed(1) : 0;
    const peakDay = filteredSummaries.reduce((max, d) => d.totalOilOut > (max?.totalOilOut || 0) ? d : max, null);

    return { totalOut, totalIn, totalLogs, avgDailyOut, peakDay, activeDays: filteredSummaries.length };
  }, [filteredSummaries]);

  const [selYear, selMonthNum] = selectedMonth.split('-').map(Number);
  const monthDisplayName = lang === 'km'
    ? `${KHMER_MONTHS[selMonthNum - 1]} ឆ្នាំ ${selYear}`
    : new Date(selYear, selMonthNum - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Top Date Filter & Month Jumper ── */}
      <div className="office-date-ctrl-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              onClick={handlePrevMonth}
              className="office-date-btn"
              title={lang === 'km' ? 'ខែមុន' : 'Previous Month'}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="office-date-display" style={{ minWidth: '170px', justifyContent: 'center' }}>
              <Calendar size={15} color="var(--fuel-accent)" />
              <span>{monthDisplayName}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="office-date-btn"
              title={lang === 'km' ? 'ខែបន្ទាប់' : 'Next Month'}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleCurrentMonth}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', height: '32px' }}
            >
              {lang === 'km' ? 'ខែបច្ចុប្បន្ន' : 'This Month'}
            </button>
          </div>
        </div>

        {/* Date search or jump */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="filter-input-wrap">
            <Search size={14} className="filter-icon" />
            <input
              type="date"
              className="form-control"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{ width: '160px', height: '32px', fontSize: '0.78rem' }}
            />
          </div>
          {searchDate && (
            <button
              onClick={() => setSearchDate('')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.74rem' }}
            >
              {lang === 'km' ? 'សម្អាត' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* ── Monthly Overview KPI Strip ── */}
      <div className="office-kpi-grid">
        {/* Total Out */}
        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'km' ? 'ប្រេងចេញសរុបក្នុងខែ' : 'Total Oil Out (Month)'}
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--r-xs)', background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
              <TrendingDown size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)', letterSpacing: '-0.02em' }}>
            -{aggregateStats.totalOut.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>L</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {lang === 'km' ? 'មធ្យមភាគ' : 'Avg'}: {aggregateStats.avgDailyOut} L / {lang === 'km' ? 'ថ្ងៃ' : 'day'}
          </div>
        </div>

        {/* Total In */}
        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'km' ? 'ប្រេងចូលបំពេញស្តុក' : 'Total Oil In / Refill'}
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--r-xs)', background: 'var(--success-subtle)', color: 'var(--success)' }}>
              <TrendingUp size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em' }}>
            +{aggregateStats.totalIn.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>L</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {aggregateStats.totalIn > 0 ? (lang === 'km' ? 'មានការបំពេញបន្ថែម' : 'Stock replenished') : (lang === 'km' ? 'គ្មានការបំពេញ' : 'No top-ups')}
          </div>
        </div>

        {/* Operational Days */}
        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--fuel-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'km' ? 'ថ្ងៃមានប្រតិបត្តិការ' : 'Active Logged Days'}
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--r-xs)', background: 'var(--fuel-subtle)', color: 'var(--fuel-accent)' }}>
              <Calendar size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {aggregateStats.activeDays} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{lang === 'km' ? 'ថ្ងៃ' : 'days'}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {aggregateStats.totalLogs} {lang === 'km' ? 'កំណត់ត្រាទាំងអស់' : 'total log records'}
          </div>
        </div>

        {/* Peak Day */}
        <div className="office-kpi-card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'km' ? 'ថ្ងៃប្រើប្រាស់ច្រើនបំផុត' : 'Peak Spending Day'}
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--r-xs)', background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <Droplets size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {aggregateStats.peakDay ? aggregateStats.peakDay.date : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {aggregateStats.peakDay ? `-${aggregateStats.peakDay.totalOilOut.toLocaleString()} L (${aggregateStats.peakDay.count} logs)` : (lang === 'km' ? 'គ្មានទិន្នន័យ' : 'No data')}
          </div>
        </div>
      </div>

      {/* ── Date Master Cards Grid ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--fuel-accent)" />
          {lang === 'km' ? 'បញ្ជីតាមដានតាមកាលបរិច្ឆេទ' : 'Daily Fuel Log Timeline'}
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {filteredSummaries.length} {lang === 'km' ? 'ថ្ងៃ' : 'days'}
          </span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {lang === 'km' ? 'ចុចលើថ្ងៃណាមួយដើម្បីគ្រប់គ្រងទិន្នន័យផ្ទាល់' : 'Click any date to manage records or print report'}
        </span>
      </div>

      {filteredSummaries.length === 0 ? (
        <div className="card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.88rem', marginBottom: '14px' }}>
            {lang === 'km' ? `មិនមានកំណត់ត្រាប្រើប្រាស់សាំងក្នុងខែ ${monthDisplayName} ឡើយ` : `No fuel logs found for ${monthDisplayName}.`}
          </p>
          <button
            onClick={() => onAddLogForDate && onAddLogForDate(`${selectedMonth}-01`)}
            className="btn btn-fuel"
            style={{ display: 'inline-flex', margin: '0 auto' }}
          >
            <Plus size={14} /> {lang === 'km' ? 'កត់ត្រាសាំងសម្រាប់ខែនេះ' : 'Log Fuel in this Period'}
          </button>
        </div>
      ) : (
        <div className="date-master-grid">
          {filteredSummaries.map((summary) => {
            const todayStr = new Date().toISOString().substring(0, 10);
            const isToday = summary.date === todayStr;
            const formattedKhmer = formatDateKhmer(summary.date);
            const formattedEng = formatDateEnglish(summary.date);

            return (
              <div
                key={summary.date}
                className={`date-master-card ${isToday ? 'active-day' : ''}`}
              >
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{summary.date}</span>
                        {isToday && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {lang === 'km' ? 'ថ្ងៃនេះ' : 'Today'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {lang === 'km' ? formattedKhmer : formattedEng}
                      </div>
                    </div>

                    <span className="badge badge-neutral font-mono" style={{ fontSize: '0.7rem' }}>
                      {summary.count} {lang === 'km' ? 'ក.' : 'logs'}
                    </span>
                  </div>

                  {/* Volume Highlights */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: summary.totalOilIn > 0 ? '1fr 1fr' : '1fr',
                    gap: '8px',
                    padding: '10px',
                    background: 'var(--surface-input)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {lang === 'km' ? 'ប្រេងចេញ' : 'Oil Out'}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
                        -{summary.totalOilOut.toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>L</span>
                      </div>
                    </div>
                    {summary.totalOilIn > 0 && (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {lang === 'km' ? 'ប្រេងចូល' : 'Oil In'}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                          +{summary.totalOilIn.toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>L</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shift & Details breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem', color: 'var(--text-sub)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        {lang === 'km' ? 'វេនប្រតិបត្តិការ' : 'Shifts'}:
                      </span>
                      <span>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>{summary.morningCount} {lang === 'km' ? 'ព្រឹក' : 'Morn'}</span>
                        {' · '}
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{summary.afternoonCount} {lang === 'km' ? 'រសៀល' : 'Aft'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Car size={12} color="var(--text-muted)" />
                        {lang === 'km' ? 'ឡានចាក់' : 'Vehicles'}:
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {summary.plates.size} {lang === 'km' ? 'គ្រឿង' : 'vehicles'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={12} color="var(--text-muted)" />
                        {lang === 'km' ? 'អ្នកបើកបរ' : 'Drivers'}:
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {summary.drivers.size} {lang === 'km' ? 'នាក់' : 'drivers'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <button
                    onClick={() => onSelectDate && onSelectDate(summary.date)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.74rem', justifyContent: 'center', gap: '4px' }}
                    title={lang === 'km' ? 'មើល និងកែប្រែក្នុងតារាងផ្ទាល់' : 'Open in Daily Operations'}
                  >
                    <ArrowUpRight size={13} color="var(--fuel-accent)" />
                    {lang === 'km' ? 'គ្រប់គ្រង' : 'Manage'}
                  </button>

                  <button
                    onClick={() => onOpenDocForDate && onOpenDocForDate(summary.date, summary.logs)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.74rem', justifyContent: 'center', gap: '4px' }}
                    title={lang === 'km' ? 'បង្កើតឯកសារផ្លូវការ' : 'Generate Document'}
                  >
                    <FileText size={13} />
                    {lang === 'km' ? 'ឯកសារ' : 'Report'}
                  </button>

                  <button
                    onClick={() => onAddLogForDate && onAddLogForDate(summary.date)}
                    className="btn btn-fuel btn-sm btn-icon"
                    title={lang === 'km' ? 'បន្ថែមការចាក់សាំងថ្ងៃនេះ' : 'Add log for this date'}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
