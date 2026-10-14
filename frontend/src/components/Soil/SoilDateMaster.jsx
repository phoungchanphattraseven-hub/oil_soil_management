import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Box,
  Plus, Search, Filter, Truck, CheckCircle2, AlertCircle,
  FileSpreadsheet, ArrowUpRight, DollarSign, Image as ImageIcon
} from 'lucide-react';

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const KHMER_DAYS = [
  'ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ',
  'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'
];

export function formatSoilDateKhmer(dateStr) {
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

export function formatSoilDateEnglish(dateStr) {
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

export default function SoilDateMaster({
  soilLogs = [],
  onSelectDate,
  onAddLogForDate,
  lang = 'km'
}) {
  const [searchDate, setSearchDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

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

  // Group soil logs by date
  const dateSummaries = useMemo(() => {
    const map = {};

    soilLogs.forEach(log => {
      const d = log.log_date || log.created_at?.substring(0, 10) || 'Unknown';
      if (!map[d]) {
        map[d] = {
          date: d,
          totalM3: 0,
          totalTrips: 0,
          count: 0,
          plates: new Set(),
          stations: new Set(),
          hasIssuesCount: 0,
          hasReceiptsCount: 0,
          logs: []
        };
      }

      const m3 = parseFloat(log.total_cubic_meters) || (parseFloat(log.trip_count) * parseFloat(log.cubic_meters_per_trip)) || 0;
      const trips = parseInt(log.trip_count, 10) || 0;
      map[d].totalM3 += m3;
      map[d].totalTrips += trips;
      map[d].count += 1;

      if (log.code_abbr) map[d].plates.add(log.code_abbr);
      if (log.station_name) map[d].stations.add(log.station_name);
      if (log.issues_description && log.issues_description.trim()) map[d].hasIssuesCount += 1;
      if (log.receipt_photo_url) map[d].hasReceiptsCount += 1;

      map[d].logs.push(log);
    });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [soilLogs]);

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

  // Aggregated totals
  const aggregateStats = useMemo(() => {
    const totalM3 = filteredSummaries.reduce((sum, d) => sum + d.totalM3, 0);
    const totalTrips = filteredSummaries.reduce((sum, d) => sum + d.totalTrips, 0);
    const totalLogs = filteredSummaries.reduce((sum, d) => sum + d.count, 0);
    const peakDay = filteredSummaries.reduce((max, d) => d.totalM3 > (max?.totalM3 || 0) ? d : max, null);

    return {
      totalM3,
      totalTrips,
      totalLogs,
      peakDay,
      activeDays: filteredSummaries.length
    };
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
              <Calendar size={15} color="var(--soil-accent)" />
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
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', height: '32px' }}
            >
              {lang === 'km' ? 'សម្អាត' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* ── Monthly Summary KPI Cards ── */}
      <div className="grid-3" style={{ gap: '12px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{lang === 'km' ? 'បរិមាណដីសរុបខែនេះ' : 'Total Soil Volume'}</span>
            <div className="stat-card-icon" style={{ background: 'var(--soil-subtle)' }}>
              <Box size={16} color="var(--soil-accent)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--soil-accent)' }}>
            {aggregateStats.totalM3.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>m³</span>
          </div>
          <div className="stat-card-sub">
            {aggregateStats.activeDays} {lang === 'km' ? 'ថ្ងៃប្រតិបត្តិការ' : 'active days'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{lang === 'km' ? 'ជើងដឹកសរុបខែនេះ' : 'Total Hauling Trips'}</span>
            <div className="stat-card-icon" style={{ background: 'var(--primary-subtle)' }}>
              <Truck size={16} color="var(--primary)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
            {aggregateStats.totalTrips.toLocaleString()}
          </div>
          <div className="stat-card-sub">
            {aggregateStats.totalLogs} {lang === 'km' ? 'កំណត់ត្រាទាំងអស់' : 'total log entries'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{lang === 'km' ? 'ថ្ងៃដឹកច្រើនជាងគេ' : 'Peak Hauling Day'}</span>
            <div className="stat-card-icon" style={{ background: 'var(--fuel-subtle)' }}>
              <ArrowUpRight size={16} color="var(--fuel-accent)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
            {aggregateStats.peakDay ? `${aggregateStats.peakDay.totalM3.toLocaleString()} m³` : '—'}
          </div>
          <div className="stat-card-sub">
            {aggregateStats.peakDay ? aggregateStats.peakDay.date : (lang === 'km' ? 'គ្មានទិន្នន័យ' : 'No activity')}
          </div>
        </div>
      </div>

      {/* ── Daily Summaries List ── */}
      {filteredSummaries.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {lang === 'km' ? `គ្មានកំណត់ត្រាសម្រាប់ការជ្រើសរើស ${monthDisplayName} ទេ` : `No soil records found for ${monthDisplayName}`}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {lang === 'km' ? 'សូមជ្រើសរើសខែផ្សេង ឬចុច "កត់ត្រាការដឹកដី" ដើម្បីចាប់ផ្តើម' : 'Select a different month or create a new soil entry'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
          {filteredSummaries.map(item => {
            const isToday = item.date === new Date().toISOString().substring(0, 10);
            const dateLabelKhmer = formatSoilDateKhmer(item.date);
            const dateLabelEnglish = formatSoilDateEnglish(item.date);

            return (
              <div
                key={item.date}
                className="card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: isToday ? '1px solid var(--soil-accent)' : undefined,
                  boxShadow: isToday ? '0 0 0 1px rgba(180, 83, 9, 0.2)' : undefined
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {lang === 'km' ? dateLabelKhmer : dateLabelEnglish}
                      </span>
                      {isToday && (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {lang === 'km' ? 'ថ្ងៃនេះ' : 'TODAY'}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      {item.date}
                    </span>
                  </div>

                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--soil-subtle)',
                    color: 'var(--soil-accent)',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}>
                    {item.totalM3.toLocaleString()} m³
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  background: 'var(--bg-subtle, rgba(255,255,255,0.02))',
                  padding: '10px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {lang === 'km' ? 'ជើងដឹកសរុប' : 'Trips'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                      {item.totalTrips} {lang === 'km' ? 'ជើង' : ''}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {lang === 'km' ? 'កំណត់ត្រា' : 'Logs'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                      {item.count}
                    </div>
                  </div>

                  </div>

                {/* Additional Details (Plates & Flags) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <Truck size={13} color="var(--text-dim)" />
                    <span>
                      {Array.from(item.plates).slice(0, 3).join(', ')}
                      {item.plates.size > 3 ? ` +${item.plates.size - 3}` : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.hasReceiptsCount > 0 && (
                      <span title={lang === 'km' ? 'មានរូបថតវិក្កយបត្រ' : 'Receipts attached'} style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--soil-accent)' }}>
                        <ImageIcon size={12} />
                        <span>{item.hasReceiptsCount}</span>
                      </span>
                    )}
                    {item.hasIssuesCount > 0 && (
                      <span title={lang === 'km' ? 'មានបញ្ហាក្នុងប្រតិបត្តិការ' : 'Issues reported'} style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--warning)' }}>
                        <AlertCircle size={12} />
                        <span>{item.hasIssuesCount}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => onSelectDate && onSelectDate(item.date)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, height: '30px', fontSize: '0.74rem' }}
                  >
                    <Calendar size={13} />
                    <span>{lang === 'km' ? 'មើលកំណត់ត្រាថ្ងៃនេះ' : 'View Daily Logs'}</span>
                  </button>

                  <button
                    onClick={() => onAddLogForDate && onAddLogForDate(item.date)}
                    className="btn btn-soil btn-sm"
                    style={{ height: '30px', fontSize: '0.74rem' }}
                    title={lang === 'km' ? 'កត់ត្រាការដឹកដីសម្រាប់ថ្ងៃនេះ' : 'Add log for this date'}
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
