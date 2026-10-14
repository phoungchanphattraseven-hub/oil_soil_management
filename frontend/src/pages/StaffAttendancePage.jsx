import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck, Calendar, Clock, CheckCircle2, AlertCircle, XCircle,
  HelpCircle, Search, Filter, Download, Printer, Users, Building2,
  ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, FileSpreadsheet, Check, FileText
} from 'lucide-react';
import { translations } from '../data/translations';
import AttendanceReportModal, { sortStaffByOfficialOrder } from '../components/Attendance/AttendanceReportModal';

const ATTENDANCE_STORAGE_KEY = 'app_staff_attendance';

function getStoredAttendance() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function StaffAttendancePage({
  staff = [],
  stations = [],
  fuelLogs = [],
  soilLogs = [],
  lang = 'km',
  userRole = 'user'
}) {
  const isKm = lang === 'km';
  const t = translations[lang] || translations.km;

  // Selected Date (default: today YYYY-MM-DD)
  const todayStr = new Date().toISOString().substring(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // View Mode: 'DAILY' | 'MONTHLY'
  const [viewMode, setViewMode] = useState('DAILY');

  // Selected Month for monthly view (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => todayStr.substring(0, 7));

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Official Y7-TL Document Modal state
  const [showReportModal, setShowReportModal] = useState(false);

  // Attendance Records: { [dateStr]: { [staffId]: { status, shift, timeIn, timeOut, notes } } }
  const [attendanceData, setAttendanceData] = useState(() => {
    const raw = getStoredAttendance();
    // Clean up any legacy auto-filled notes like 'ចុះវត្តមានទូទៅ'
    let cleaned = false;
    const sanitized = { ...raw };
    Object.keys(sanitized).forEach(d => {
      const day = { ...sanitized[d] };
      Object.keys(day).forEach(sId => {
        const r = day[sId];
        if (r && (r.notes === 'ចុះវត្តមានទូទៅ' || r.notes === 'មានសកម្មភាពក្នុងកំណត់ត្រា' || r.notes === 'Marked present' || r.notes === 'Active in operational logs')) {
          day[sId] = { ...r, notes: '' };
          cleaned = true;
        }
      });
      sanitized[d] = day;
    });
    return sanitized;
  });

  // Save to localStorage whenever attendanceData changes
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceData));
    } catch (e) {
      console.error('Failed to save attendance', e);
    }
  }, [attendanceData]);

  // Map of activity per staff on selected date from fuelLogs & soilLogs
  const staffActivityOnDate = useMemo(() => {
    const map = {};
    fuelLogs.forEach(l => {
      const d = l.log_date || l.time_in?.substring(0, 10);
      if (d === selectedDate && l.staff_id) {
        map[l.staff_id] = (map[l.staff_id] || 0) + 1;
      }
    });
    soilLogs.forEach(l => {
      const d = l.date || l.log_date;
      if (d === selectedDate && (l.driver_id || l.driver_name)) {
        const id = l.driver_id || l.driver_name;
        map[id] = (map[id] || 0) + 1;
      }
    });
    return map;
  }, [fuelLogs, soilLogs, selectedDate]);

  // Current day records
  const dayAttendance = attendanceData[selectedDate] || {};

  // Update a single staff attendance record
  const updateStaffStatus = (staffId, updates) => {
    setAttendanceData(prev => {
      const currentDay = prev[selectedDate] || {};
      const staffRecord = currentDay[staffId] || {
        status: 'present',
        shift: 'Full Day',
        timeIn: '07:00',
        timeOut: '17:00',
        notes: ''
      };

      return {
        ...prev,
        [selectedDate]: {
          ...currentDay,
          [staffId]: {
            ...staffRecord,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  };

  // Mark all staff present
  const markAllPresent = () => {
    setAttendanceData(prev => {
      const currentDay = { ...(prev[selectedDate] || {}) };
      staff.forEach(s => {
        if (!currentDay[s.id] || currentDay[s.id].status === 'unmarked') {
          currentDay[s.id] = {
            status: 'present',
            shift: 'Full Day',
            timeIn: '07:00',
            timeOut: '17:00',
            notes: ''
          };
        }
      });
      return {
        ...prev,
        [selectedDate]: currentDay
      };
    });
  };

  // Get effective record for a staff on selected date
  const getRecordForStaff = (sId) => {
    if (dayAttendance[sId]) {
      const r = dayAttendance[sId];
      if (r.notes === 'ចុះវត្តមានទូទៅ' || r.notes === 'មានសកម្មភាពក្នុងកំណត់ត្រា' || r.notes === 'Marked present' || r.notes === 'Active in operational logs') {
        return { ...r, notes: '' };
      }
      return r;
    }
    return {
      status: 'present',
      shift: 'Full Day',
      timeIn: '07:00',
      timeOut: '17:00',
      notes: ''
    };
  };

  // Filtered staff list (sorted in official 1-to-18 order)
  const filteredStaff = useMemo(() => {
    const list = staff.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (s.name || '').toLowerCase().includes(q) ||
                          (s.phone || '').includes(q) ||
                          (s.license_plate || '').toLowerCase().includes(q);
      if (!matchSearch) return false;

      const station = s.assigned_station || s.assignedStation || '';
      if (stationFilter !== 'ALL' && station !== stationFilter) return false;

      if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;

      const rec = getRecordForStaff(s.id);
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;

      return true;
    });
    return sortStaffByOfficialOrder(list);
  }, [staff, searchQuery, stationFilter, roleFilter, statusFilter, dayAttendance, staffActivityOnDate]);

  // Statistics calculation for selected date
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let leave = 0;
    let absent = 0;

    staff.forEach(s => {
      const rec = getRecordForStaff(s.id);
      if (rec.status === 'present') present++;
      else if (rec.status === 'late') late++;
      else if (rec.status === 'leave') leave++;
      else if (rec.status === 'absent') absent++;
      else present++; // default
    });

    const total = staff.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { total, present, late, leave, absent, rate };
  }, [staff, dayAttendance, staffActivityOnDate]);

  // Roles available
  const availableRoles = useMemo(() => {
    const set = new Set(staff.map(s => s.role).filter(Boolean));
    return Array.from(set);
  }, [staff]);

  // Export Daily Attendance to CSV
  const handleExportCSV = () => {
    const headers = [
      isKm ? 'លេខសម្គាល់' : 'ID',
      isKm ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name',
      isKm ? 'តួនាទី' : 'Role',
      isKm ? 'ស្ថានីយ៍ប្រចាំការ' : 'Station',
      isKm ? 'កាលបរិច្ឆេទ' : 'Date',
      isKm ? 'ស្ថានភាព' : 'Status',
      isKm ? 'វេនការងារ' : 'Shift',
      isKm ? 'ម៉ោងចូល' : 'Time In',
      isKm ? 'ម៉ោងចេញ' : 'Time Out',
      isKm ? 'កំណត់សម្គាល់' : 'Notes'
    ];

    const rows = staff.map(s => {
      const rec = getRecordForStaff(s.id);
      return [
        s.id,
        `"${s.name || ''}"`,
        `"${s.role || ''}"`,
        `"${s.assigned_station || s.assignedStation || ''}"`,
        selectedDate,
        rec.status,
        rec.shift || 'Full Day',
        rec.timeIn || '',
        rec.timeOut || '',
        `"${rec.notes || ''}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Staff_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate days array for monthly timesheet matrix
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const numDays = new Date(year, month, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const dateStr = `${selectedMonth}-${dayStr}`;
      const dateObj = new Date(year, month - 1, dayNum);
      const dayOfWeek = dateObj.toLocaleDateString(isKm ? 'km-KH' : 'en-US', { weekday: 'narrow' });
      const isSunday = dateObj.getDay() === 0;
      return { dayNum, dateStr, dayOfWeek, isSunday };
    });
  }, [selectedMonth, isKm]);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── Official Enterprise Header Card ── */}
      <div className="official-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
            flexShrink: 0
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.5px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                {isKm ? 'ការិយាល័យធនធានមនុស្ស & វត្តមាន' : 'HUMAN RESOURCES & ATTENDANCE'}
              </span>
              <span className="badge badge-neutral font-mono" style={{ fontSize: '0.68rem' }}>
                {stats.rate}% {isKm ? 'អត្រាវត្តមាន' : 'ATTENDANCE RATE'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {isKm ? 'របាយការណ៍វត្តមានបុគ្គលិក & កាលវិភាគ' : 'Staff Attendance & Timesheet Report'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              {isKm
                ? 'តាមដានការចុះវត្តមានប្រចាំថ្ងៃ ស្ថានភាពវត្តមាន (វត្តមាន/អវត្តមាន/ច្បាប់) និងរបាយការណ៍សង្ខេបប្រចាំខែ'
                : 'Personnel daily attendance registry, shift compliance, leaves & monthly audit log'}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="page-header-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
          {viewMode === 'DAILY' && (
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ height: '36px', fontSize: '0.82rem', padding: '0 10px', width: 'auto' }}
            />
          )}

          {viewMode === 'MONTHLY' && (
            <input
              type="month"
              className="input-field"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ height: '36px', fontSize: '0.82rem', padding: '0 10px', width: 'auto' }}
            />
          )}

          {userRole === 'admin' && viewMode === 'DAILY' && (
            <button
              onClick={markAllPresent}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, height: '36px', gap: '6px' }}
            >
              <Check size={14} />
              {isKm ? 'វត្តមានទាំងអស់' : 'Mark All Present'}
            </button>
          )}

          <button
            onClick={() => setShowReportModal(true)}
            className="btn btn-primary btn-sm"
            style={{
              height: '36px',
              fontWeight: 700,
              gap: '6px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
            }}
            title={isKm ? 'បើកមើល និងបោះពុម្ពទម្រង់វត្តមាន Y7-TL' : 'Preview & Print Official Y7-TL Document'}
          >
            <Printer size={15} />
            <span>{isKm ? 'ទម្រង់ផ្លូវការ (Y7-TL)' : 'Official Doc (Y7-TL)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            style={{ height: '36px', gap: '6px' }}
          >
            <Download size={14} />
            {isKm ? 'ទាញយក Excel' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {/* Total Staff */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'បុគ្គលិកសរុប' : 'Total Staff'}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(6, 182, 212, 0.12)' }}>
              <Users size={16} color="#06b6d4" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#06b6d4' }}>
            {stats.total} <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{isKm ? 'នាក់' : 'people'}</span>
          </div>
          <div className="stat-card-sub">
            {isKm ? 'បញ្ជីឈ្មោះសកម្ម' : 'Active roster'}
          </div>
        </div>

        {/* Present */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'វត្តមានថ្ងៃនេះ' : 'Present Today'}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
              <CheckCircle2 size={16} color="var(--success)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>
            {stats.present}
          </div>
          <div className="stat-card-sub" style={{ color: 'var(--success)' }}>
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% {isKm ? 'នៃបុគ្គលិក' : 'of workforce'}
          </div>
        </div>

        {/* Late / Half day */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'មកយឺត / កន្លះថ្ងៃ' : 'Late / Partial'}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
              <Clock size={16} color="var(--warning)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>
            {stats.late}
          </div>
          <div className="stat-card-sub">
            {isKm ? 'ត្រូវកត់ត្រាម៉ោង' : 'Times logged'}
          </div>
        </div>

        {/* Leave / Permission */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'សុំច្បាប់ (Leave)' : 'Permission / Leave'}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
              <HelpCircle size={16} color="#3b82f6" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#3b82f6' }}>
            {stats.leave}
          </div>
          <div className="stat-card-sub">
            {isKm ? 'មានការអនុញ្ញាត' : 'Authorized leave'}
          </div>
        </div>

        {/* Absent */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">{isKm ? 'អវត្តមាន' : 'Absent'}</span>
            <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
              <XCircle size={16} color="var(--danger)" />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
            {stats.absent}
          </div>
          <div className="stat-card-sub">
            {stats.absent > 0 ? (isKm ? 'គ្មានច្បាប់' : 'Unexcused') : (isKm ? 'គ្មានអវត្តមាន' : 'Zero absences')}
          </div>
        </div>
      </div>

      {/* ── View Mode Switcher & Filter Controls ── */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'inline-flex', padding: '3px', background: 'var(--surface-subtle)', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('DAILY')}
              className={`btn btn-sm ${viewMode === 'DAILY' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '6px', fontSize: '0.78rem', padding: '6px 14px' }}
            >
              <Calendar size={14} style={{ marginRight: '5px' }} />
              {isKm ? 'តារាងប្រចាំថ្ងៃ' : 'Daily Sheet'} ({selectedDate})
            </button>
            <button
              onClick={() => setViewMode('MONTHLY')}
              className={`btn btn-sm ${viewMode === 'MONTHLY' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '6px', fontSize: '0.78rem', padding: '6px 14px' }}
            >
              <FileSpreadsheet size={14} style={{ marginRight: '5px' }} />
              {isKm ? 'ម៉ាទ្រីសប្រចាំខែ' : 'Monthly Timesheet'} ({selectedMonth})
            </button>
          </div>

          {/* Quick Date Switcher for Daily */}
          {viewMode === 'DAILY' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().substring(0, 10));
                }}
                className="btn btn-ghost btn-icon btn-sm"
                title={isKm ? 'ថ្ងៃមុន' : 'Previous day'}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`btn btn-sm ${selectedDate === todayStr ? 'btn-secondary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                {isKm ? 'ថ្ងៃនេះ' : 'Today'}
              </button>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().substring(0, 10));
                }}
                className="btn btn-ghost btn-icon btn-sm"
                title={isKm ? 'ថ្ងៃបន្ទាប់' : 'Next day'}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px', background: 'var(--surface-subtle)', padding: '6px 12px', borderRadius: '8px' }}>
            <Search size={15} color="var(--text-dim)" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKm ? 'ស្វែងរកឈ្មោះ, លេខទូរស័ព្ទ, ផ្លាកលេខ...' : 'Search staff name, phone, plate...'}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.82rem', color: 'var(--text-main)' }}
            />
          </div>

          {/* Station Filter */}
          <select
            value={stationFilter}
            onChange={e => setStationFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '150px', fontSize: '0.78rem', height: '36px' }}
          >
            <option value="ALL">{isKm ? 'ស្ថានីយ៍ទាំងអស់' : 'All Stations'}</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name || st.station_name}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '150px', fontSize: '0.78rem', height: '36px' }}
          >
            <option value="ALL">{isKm ? 'តួនាទីទាំងអស់' : 'All Roles'}</option>
            {availableRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Status Filter for Daily View */}
          {viewMode === 'DAILY' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ width: 'auto', minWidth: '130px', fontSize: '0.78rem', height: '36px' }}
            >
              <option value="ALL">{isKm ? 'ស្ថានភាពទាំងអស់' : 'All Statuses'}</option>
              <option value="present">{isKm ? 'វត្តមាន (Present)' : 'Present'}</option>
              <option value="late">{isKm ? 'មកយឺត (Late)' : 'Late'}</option>
              <option value="leave">{isKm ? 'ច្បាប់ (Leave)' : 'Leave'}</option>
              <option value="absent">{isKm ? 'អវត្តមាន (Absent)' : 'Absent'}</option>
            </select>
          )}
        </div>
      </div>

      {/* ── VIEW 1: DAILY ATTENDANCE SHEET ── */}
      {viewMode === 'DAILY' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#06b6d4" />
                {isKm ? `បញ្ជីវត្តមានប្រចាំថ្ងៃ៖ ${selectedDate}` : `Daily Attendance Sheet: ${selectedDate}`}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                {isKm ? `បង្ហាញបុគ្គលិក ${filteredStaff.length} នាក់ នៃចំនួនសរុប ${staff.length} នាក់` : `Showing ${filteredStaff.length} of ${staff.length} staff members`}
              </p>
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <Users size={36} style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.85rem' }}>{isKm ? 'រកមិនឃើញបុគ្គលិកតាមលក្ខខណ្ឌតម្រងឡើយ' : 'No staff matched current filters'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '42px', textAlign: 'center' }}>{isKm ? 'ល.រ' : 'No.'}</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>{isKm ? 'អត្តលេខ' : 'Staff ID'}</th>
                    <th>{isKm ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name'}</th>
                    <th>{isKm ? 'តួនាទី & ស្ថានីយ៍' : 'Role & Station'}</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>{isKm ? 'ថ្ងៃធ្វើការ' : 'Work Date'}</th>
                    <th style={{ width: '115px', textAlign: 'center' }}>{isKm ? 'ម៉ោងចូល' : 'Time In'}</th>
                    <th style={{ width: '115px', textAlign: 'center' }}>{isKm ? 'ម៉ោងចេញ' : 'Time Out'}</th>
                    <th style={{ width: '210px' }}>{isKm ? 'ស្ថានភាព & ហត្ថលេខា' : 'Status & Sig'}</th>
                    <th>{isKm ? 'ផ្សេងៗ' : 'Notes / Remarks'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((st, idx) => {
                    const rec = getRecordForStaff(st.id);
                    const hasActivity = !!staffActivityOnDate[st.id];
                    const staffCode = st.staff_id || (st.id && !st.id.startsWith('staff-') && st.id.length <= 6 ? st.id : '') || (400 + idx + 1);

                    return (
                      <tr key={st.id}>
                        {/* 1. No. (ល.រ) */}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>

                        {/* 2. Staff ID (អត្តលេខ) */}
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="badge badge-neutral font-mono"
                            style={{ fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px' }}
                          >
                            {staffCode}
                          </span>
                        </td>

                        {/* 3. Name (ឈ្មោះ) */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'var(--surface-subtle)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary)',
                              overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-subtle)'
                            }}>
                              {st.photo_url ? (
                                <img src={st.photo_url} alt={st.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                (st.name || 'ST').substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{st.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {st.phone || st.license_plate || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4. Role & Station (តួនាទី) */}
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginBottom: '2px', display: 'inline-block' }}>
                            {st.role || (isKm ? 'បុគ្គលិក' : 'Staff')}
                          </span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Building2 size={10} />
                            {(() => {
                              const assigned = st.assigned_station || st.assignedStation || st.working_at;
                              const matched = stations.find(s => s.id === assigned || s.name === assigned);
                              return matched ? (matched.name || matched.station_name) : (assigned || '—');
                            })()}
                          </div>
                        </td>

                        {/* 5. Work Date (ថ្ងៃធ្វើការ) */}
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {selectedDate.split('-').reverse().join('.')}
                        </td>

                        {/* 6. Time In (ម៉ោងចូល) */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="time"
                            value={rec.timeIn || '07:00'}
                            onChange={e => updateStaffStatus(st.id, { timeIn: e.target.value })}
                            className="input-field"
                            style={{ fontSize: '0.76rem', padding: '2px 4px', height: '28px', width: '106px', textAlign: 'center' }}
                          />
                        </td>

                        {/* 7. Time Out (ម៉ោងចេញ) */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="time"
                            value={rec.timeOut || '17:00'}
                            onChange={e => updateStaffStatus(st.id, { timeOut: e.target.value })}
                            className="input-field"
                            style={{ fontSize: '0.76rem', padding: '2px 4px', height: '28px', width: '106px', textAlign: 'center' }}
                          />
                        </td>

                        {/* 8. Status & Signature (ស្ថានភាព & ហត្ថលេខា) */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}>
                              <button
                                type="button"
                                onClick={() => updateStaffStatus(st.id, { status: 'present' })}
                                className={`btn btn-xs ${rec.status === 'present' ? 'btn-success' : 'btn-ghost'}`}
                                style={{ fontSize: '0.66rem', padding: '2px 5px', borderRadius: '4px' }}
                                title={isKm ? 'វត្តមាន' : 'Present'}
                              >
                                {isKm ? 'វត្តមាន' : 'Present'}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStaffStatus(st.id, { status: 'late' })}
                                className={`btn btn-xs ${rec.status === 'late' ? 'btn-warning' : 'btn-ghost'}`}
                                style={{ fontSize: '0.66rem', padding: '2px 5px', borderRadius: '4px' }}
                                title={isKm ? 'មកយឺត' : 'Late'}
                              >
                                {isKm ? 'យឺត' : 'Late'}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStaffStatus(st.id, { status: 'leave' })}
                                className={`btn btn-xs ${rec.status === 'leave' ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ fontSize: '0.66rem', padding: '2px 5px', borderRadius: '4px' }}
                                title={isKm ? 'សុំច្បាប់' : 'Leave'}
                              >
                                {isKm ? 'ច្បាប់' : 'Leave'}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStaffStatus(st.id, { status: 'absent' })}
                                className={`btn btn-xs ${rec.status === 'absent' ? 'btn-danger' : 'btn-ghost'}`}
                                style={{ fontSize: '0.66rem', padding: '2px 5px', borderRadius: '4px' }}
                                title={isKm ? 'អវត្តមាន' : 'Absent'}
                              >
                                {isKm ? 'អវត្ត' : 'Absent'}
                              </button>
                            </div>

                            {st.signature_url ? (
                              <img
                                src={st.signature_url}
                                alt="sig"
                                style={{ height: '20px', maxWidth: '42px', objectFit: 'contain', borderRadius: '2px', background: '#fff', padding: '1px' }}
                                title={isKm ? 'មានហត្ថលេខា' : 'Has Signature'}
                              />
                            ) : null}
                          </div>
                        </td>

                        {/* 9. Notes / Remarks (ផ្សេងៗ) */}
                        <td>
                          <input
                            type="text"
                            value={rec.notes || ''}
                            onChange={e => updateStaffStatus(st.id, { notes: e.target.value })}
                            placeholder={isKm ? 'ឧ. ស៊ីថ្លៃបាយ ២ម៉ឺន...' : 'Notes...'}
                            className="input-field"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', height: '28px', minWidth: '120px' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: MONTHLY TIMESHEET MATRIX ── */}
      {viewMode === 'MONTHLY' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={16} color="#06b6d4" />
                {isKm ? `ម៉ាទ្រីសវត្តមានប្រចាំខែ៖ ${selectedMonth}` : `Monthly Timesheet Matrix: ${selectedMonth}`}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                {isKm ? 'ចុចលើប្រអប់ដើម្បីកែប្រែស្ថានភាពវត្តមានប្រចាំថ្ងៃ' : 'Overview of daily attendance records for the selected month'}
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                {isKm ? 'P = វត្តមាន' : 'P = Present'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }} />
                {isKm ? 'L = យឺត' : 'L = Late'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                {isKm ? 'V = ច្បាប់' : 'V = Leave'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }} />
                {isKm ? 'A = អវត្តមាន' : 'A = Absent'}
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 2, background: 'var(--surface-card)', minWidth: '150px' }}>
                    {isKm ? 'បុគ្គលិក' : 'Staff'}
                  </th>
                  {daysInMonth.map(d => (
                    <th
                      key={d.dayNum}
                      style={{
                        textAlign: 'center',
                        padding: '4px 3px',
                        minWidth: '28px',
                        background: d.isSunday ? 'var(--surface-subtle)' : undefined,
                        color: d.isSunday ? 'var(--danger)' : undefined
                      }}
                      title={d.dateStr}
                    >
                      <div>{d.dayNum}</div>
                      <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>{d.dayOfWeek}</div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', minWidth: '40px', background: 'rgba(16, 185, 129, 0.08)' }}>P</th>
                  <th style={{ textAlign: 'center', minWidth: '40px', background: 'rgba(245, 158, 11, 0.08)' }}>L</th>
                  <th style={{ textAlign: 'center', minWidth: '40px', background: 'rgba(59, 130, 246, 0.08)' }}>V</th>
                  <th style={{ textAlign: 'center', minWidth: '40px', background: 'rgba(239, 68, 68, 0.08)' }}>A</th>
                  <th style={{ textAlign: 'center', minWidth: '50px' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(st => {
                  let pCount = 0;
                  let lCount = 0;
                  let vCount = 0;
                  let aCount = 0;

                  return (
                    <tr key={st.id}>
                      <td style={{ position: 'sticky', left: 0, zIndex: 1, background: 'var(--surface-card)', fontWeight: 700 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          {st.name}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{st.role}</div>
                      </td>

                      {daysInMonth.map(d => {
                        const dayRec = (attendanceData[d.dateStr] || {})[st.id];
                        let status = dayRec?.status;

                        // Default weekdays to present if not explicitly marked
                        if (!status && !d.isSunday) {
                          status = 'present';
                        }

                        if (status === 'present') pCount++;
                        else if (status === 'late') lCount++;
                        else if (status === 'leave') vCount++;
                        else if (status === 'absent') aCount++;

                        const color = status === 'present' ? 'var(--success)' :
                                      status === 'late' ? 'var(--warning)' :
                                      status === 'leave' ? '#3b82f6' :
                                      status === 'absent' ? 'var(--danger)' : 'var(--text-dim)';

                        const letter = status === 'present' ? 'P' :
                                       status === 'late' ? 'L' :
                                       status === 'leave' ? 'V' :
                                       status === 'absent' ? 'A' : '—';

                        return (
                          <td
                            key={d.dayNum}
                            style={{
                              textAlign: 'center',
                              padding: '4px 2px',
                              background: d.isSunday ? 'var(--surface-subtle)' : undefined,
                              cursor: 'pointer'
                            }}
                            title={`${st.name} - ${d.dateStr}: ${status || 'unmarked'}`}
                            onClick={() => {
                              // Cycle status: present -> late -> leave -> absent
                              const nextStatus = status === 'present' ? 'late' :
                                                 status === 'late' ? 'leave' :
                                                 status === 'leave' ? 'absent' : 'present';
                              setAttendanceData(prev => ({
                                ...prev,
                                [d.dateStr]: {
                                  ...(prev[d.dateStr] || {}),
                                  [st.id]: {
                                    status: nextStatus,
                                    shift: 'Full Day'
                                  }
                                }
                              }));
                            }}
                          >
                            <span style={{
                              display: 'inline-block',
                              width: '20px',
                              height: '20px',
                              lineHeight: '20px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#fff',
                              background: color
                            }}>
                              {letter}
                            </span>
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
                        {pCount}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
                        {lCount}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                        {vCount}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        {aCount}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>
                        {daysInMonth.length > 0 ? Math.round(((pCount + lCount) / daysInMonth.length) * 100) : 0}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Official Y7-TL Attendance Document Print & Export Modal ── */}
      <AttendanceReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        selectedDate={selectedDate}
        staff={staff}
        dayAttendance={dayAttendance}
        stations={stations}
        stationFilter={stationFilter}
        lang={lang}
      />
    </div>
  );
}
