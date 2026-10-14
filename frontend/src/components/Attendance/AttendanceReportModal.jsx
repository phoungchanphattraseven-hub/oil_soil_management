import React, { useState, useRef, useMemo } from 'react';
import {
  FileText, X, Printer, Download, Building2,
  Calendar, Clock, User, Check, Edit3, Settings, Type,
  PenTool, Eye, EyeOff, ZoomIn, ZoomOut
} from 'lucide-react';
import * as XLSX from 'xlsx';

/* ─── Canonical Staff Ordering (1 to 18) based on Y7-TL Document ─── */
export const OFFICIAL_STAFF_ORDER = [
  'ស៊ុន ឡាច',
  'ថុង សុធី',
  'នី ប៊ុនថៃ',
  'តុំ សៅ',
  'ម៉ម នៅ',
  'ឃុត បូរី',
  'ហ៊ឹម ពៅ',
  'ទៀង មិនា',
  'អ៊ូច វណ្ណៈ',
  'ម៉ៅ ភិនណារី',
  'ចាន់ មករា',
  'ប៉ុន ប៊ុនថា',
  'សៀង ធួក',
  'អ៊ីវ សុភ័ក្រ',
  'យ៉ុន ណារិន',
  'ភួង ច័ន្ទផាត់ត្រា',
  'អឿន ភាស់',
  'ខាត់ វណ្ណថន'
];

/**
 * Clean and normalize Khmer string for accurate name matching
 */
export function cleanKhmerName(str) {
  return (str || '').replace(/[\s\u200b\u00a0]+/g, '').trim().toLowerCase();
}

/**
 * Get official ordering index (0-based) for a staff member
 */
export function getStaffOfficialRank(st) {
  if (!st) return 999;
  const cname = cleanKhmerName(st.name);
  for (let i = 0; i < OFFICIAL_STAFF_ORDER.length; i++) {
    const o = cleanKhmerName(OFFICIAL_STAFF_ORDER[i]);
    if (o === cname || o.includes(cname) || cname.includes(o)) {
      return i;
    }
  }
  return 999;
}

/**
 * Sort staff list according to the official handwritten sheet order (1 to 18)
 */
export function sortStaffByOfficialOrder(staffList = []) {
  return [...staffList].sort((a, b) => {
    const rankA = getStaffOfficialRank(a);
    const rankB = getStaffOfficialRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return (a.name || '').localeCompare(b.name || '');
  });
}

/* ─── Font Theme Options ────────────────────────────────────────────── */
const FONT_OPTIONS = {
  moul_kantumruy: {
    id: 'moul_kantumruy',
    label: 'Moul + Kantumruy Pro (ផ្លូវការ / Official)',
    titleFont: "'Moul', 'Kantumruy Pro', serif",
    bodyFont: "'Kantumruy Pro', 'Inter', sans-serif",
    monoFont: "'JetBrains Mono', 'Inter', monospace",
  },
  kantumruy_pure: {
    id: 'kantumruy_pure',
    label: 'Kantumruy Pro (ទាន់សម័យ / Modern)',
    titleFont: "'Kantumruy Pro', 'Inter', sans-serif",
    bodyFont: "'Kantumruy Pro', 'Inter', sans-serif",
    monoFont: "'JetBrains Mono', 'Inter', monospace",
  },
  siemreap: {
    id: 'siemreap',
    label: 'Siemreap (បុរាណ / Classic)',
    titleFont: "'Siemreap', 'Kantumruy Pro', sans-serif",
    bodyFont: "'Siemreap', 'Kantumruy Pro', sans-serif",
    monoFont: "'JetBrains Mono', 'Inter', monospace",
  }
};

/* ─── High-Definition A4 Print CSS for Y7-TL Document ──────── */
function buildPrintCss(fontTheme) {
  const selectedTheme = FONT_OPTIONS[fontTheme] || FONT_OPTIONS.moul_kantumruy;

  return `
  @page {
    size: A4 portrait;
    margin: 8mm 10mm 8mm 10mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    width: 100%;
    font-family: ${selectedTheme.bodyFont};
    font-size: 8.8pt;
    color: #0f172a;
    line-height: 1.35;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  .doc-container {
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .doc-top-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 3px;
  }
  .doc-code-badge {
    font-size: 11.5pt;
    font-weight: 800;
    font-family: ${selectedTheme.monoFont};
    color: #0f172a;
    letter-spacing: 0.8px;
  }
  .doc-title-box {
    text-align: center;
    border: 1.5px solid #0f172a;
    padding: 7px 12px;
    margin-bottom: 8px;
    background: #f8fafc;
    border-radius: 3px;
  }
  .doc-title-text {
    font-family: ${selectedTheme.titleFont};
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.6;
    letter-spacing: 0.2px;
  }
  .doc-date-dots {
    display: inline-block;
    border-bottom: 1.2px dotted #0f172a;
    min-width: 34px;
    padding: 0 5px;
    font-family: ${selectedTheme.bodyFont};
    font-weight: 700;
    font-size: 9.5pt;
  }
  .doc-table {
    width: 100%;
    border-collapse: collapse;
    border: 1.5px solid #0f172a;
  }
  .doc-table th {
    background-color: #1e3a5f !important;
    color: #ffffff !important;
    font-family: ${selectedTheme.bodyFont};
    font-size: 8.8pt;
    font-weight: 700;
    padding: 6px 4px;
    border: 1px solid #0f172a;
    text-align: center;
    white-space: nowrap;
    letter-spacing: 0.2px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc-table td {
    border: 1px solid #334155;
    padding: 3.5px 6px;
    font-family: ${selectedTheme.bodyFont};
    font-size: 8.6pt;
    height: 26px;
    vertical-align: middle;
    color: #0f172a;
  }
  .doc-table tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .font-mono {
    font-family: ${selectedTheme.monoFont};
    font-size: 8.6pt;
  }
  .sig-img {
    max-height: 22px;
    max-width: 80px;
    object-fit: contain;
    display: block;
    margin: 0 auto;
  }
  .sig-blank-line {
    display: block;
    width: 70px;
    margin: 10px auto 2px;
    border-bottom: 1px dotted #94a3b8;
  }
`;
}

/**
 * Convert standard YYYY-MM-DD to Khmer day, month, year strings
 */
function parseKhmerDate(dateStr) {
  if (!dateStr) return { day: '....', month: '....', year: '........', shortDate: '' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = String(parseInt(parts[1], 10));
      const day = String(parseInt(parts[2], 10));
      const shortYear = year.slice(-2);
      const shortDate = `${parts[2]}.${parts[1]}.${year}`;
      const shortDate2Digit = `${parts[2]}.${parts[1]}.${shortYear}`;
      return { day, month, year, shortDate, shortDate2Digit };
    }
  } catch (e) {
    console.error('Date parsing error', e);
  }
  return { day: '....', month: '....', year: '........', shortDate: dateStr, shortDate2Digit: dateStr };
}

export default function AttendanceReportModal({
  open,
  onClose,
  selectedDate,
  staff = [],
  dayAttendance = {},
  stations = [],
  stationFilter = 'ALL',
  lang = 'km'
}) {
  const isKm = lang === 'km';
  const previewRef = useRef(null);

  // Document configurable metadata matching photo
  const [docCode, setDocCode] = useState('Y7-TL');
  const [siteTitle, setSiteTitle] = useState('នៅរោយសម្រួល');
  const [totalRows, setTotalRows] = useState(23); // Paper form has 23 rows
  const [fontTheme, setFontTheme] = useState('moul_kantumruy');
  const [showConfig, setShowConfig] = useState(false);

  // No Sign Mode (Default true: All data display, signature column is blank/clean for manual pen signing)
  const [noSign, setNoSign] = useState(true);

  // Preview Zoom percentage
  const [zoom, setZoom] = useState(100);

  // Date parsing
  const dateInfo = parseKhmerDate(selectedDate);

  const currentTheme = FONT_OPTIONS[fontTheme] || FONT_OPTIONS.moul_kantumruy;

  // ALL DATA ARE DISPLAYED in official 1-to-18 sheet order (filtered by station if specified)
  const displayStaff = useMemo(() => {
    const list = staff.filter(s => {
      if (stationFilter !== 'ALL') {
        const assigned = s.assigned_station || s.assignedStation || s.working_at;
        if (assigned !== stationFilter) return false;
      }
      return true; // All staff data display!
    });
    return sortStaffByOfficialOrder(list);
  }, [staff, stationFilter]);

  // Calculate rows to render (fill up to totalRows with blank lines)
  const renderedStaffCount = displayStaff.length;
  const blankRowsCount = Math.max(0, totalRows - renderedStaffCount);
  const blankRows = Array.from({ length: blankRowsCount }, (_, i) => renderedStaffCount + i + 1);

  // Early return if modal is closed (placed strictly after all Hooks)
  if (!open) return null;

  // Trigger A4 Print
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=950,height=800');
    if (!win) {
      alert(isKm ? 'សូមអនុញ្ញាតបើកផ្ទាំង Pop-up ក្នុង Browser ដើម្បីបោះពុម្ព' : 'Please allow pop-ups to print the document.');
      return;
    }

    const printCss = buildPrintCss(fontTheme);

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>បញ្ជីវត្តមានបុគ្គលិក_${docCode}_${selectedDate}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Kantumruy+Pro:ital,wght@0,300..700;1,300..700&family=Moul&family=Siemreap&display=swap" rel="stylesheet">
<style>
${printCss}
@media screen {
  body { padding: 20px; background: #cbd5e1; }
  .doc-container {
    background: #fff;
    padding: 24px 28px;
    max-width: 840px;
    margin: 0 auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border-radius: 4px;
  }
}
</style>
</head>
<body>
${previewRef.current ? previewRef.current.innerHTML : ''}
<script>
  window.onload = function() {
    setTimeout(function() {
      window.print();
    }, 250);
  };
<\/script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
  };

  // Export to Excel in the exact Y7-TL layout
  const handleExportExcel = () => {
    const titleText = `បញ្ជីវត្តមានបុគ្គលិក${siteTitle} ប្រចាំថ្ងៃសម្រាប់ ថ្ងៃទី ${dateInfo.day} ខែ ${dateInfo.month} ឆ្នាំ ${dateInfo.year}`;

    // Worksheet data array
    const wsData = [
      ['', '', '', '', '', '', '', docCode, ''],
      [titleText, '', '', '', '', '', '', '', ''],
      [], // blank line
      ['ល.រ', 'អត្តលេខ', 'ឈ្មោះ', 'តួនាទី', 'ថ្ងៃធ្វើការ', 'ម៉ោងចូល', 'ម៉ោងចេញ', 'ហត្ថលេខាបុគ្គលិក', 'ផ្សេងៗ']
    ];

    displayStaff.forEach((st, idx) => {
      const rec = dayAttendance[st.id] || {};
      const staffCode = st.staff_id || (st.id && !st.id.startsWith('staff-') && st.id.length < 8 ? st.id : '') || String(idx + 1).padStart(4, '0');
      const cleanNotes = (rec.notes === 'ចុះវត្តមានទូទៅ' || rec.notes === 'មានសកម្មភាពក្នុងកំណត់ត្រា' || rec.notes === 'Marked present' || rec.notes === 'Active in operational logs') ? '' : (rec.notes || '');

      const sigText = noSign ? '' : (st.signature_url ? 'បានចុះហត្ថលេខា' : '');

      wsData.push([
        idx + 1,
        staffCode,
        st.name || '',
        st.role || '',
        dateInfo.shortDate,
        rec.timeIn || '7:00',
        rec.timeOut || '5:00',
        sigText,
        cleanNotes
      ]);
    });

    // Add empty rows up to totalRows
    for (let i = 0; i < blankRowsCount; i++) {
      wsData.push([renderedStaffCount + i + 1, '', '', '', '', '', '', '', '']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title row
    worksheet['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
    ];

    // Column widths
    worksheet['!cols'] = [
      { wch: 6 },  // ល.រ
      { wch: 12 }, // អត្តលេខ
      { wch: 22 }, // ឈ្មោះ
      { wch: 20 }, // តួនាទី
      { wch: 14 }, // ថ្ងៃធ្វើការ
      { wch: 10 }, // ម៉ោងចូល
      { wch: 10 }, // ម៉ោងចេញ
      { wch: 18 }, // ហត្ថលេខាបុគ្គលិក
      { wch: 20 }  // ផ្សេងៗ
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance_Y7_TL');
    XLSX.writeFile(workbook, `Attendance_Report_${docCode}_${selectedDate}.xlsx`);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--surface-overlay, rgba(15, 23, 42, 0.7))',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-box"
        style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-card)',
          color: 'var(--text-main)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-modal, 0 25px 60px rgba(0,0,0,0.3))',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              {docCode}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {isKm ? 'ទម្រង់របាយការណ៍វត្តមានផ្លូវការ' : 'Official Attendance Sheet'}
                </h3>
                <span className="badge badge-info font-mono" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                  {docCode}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {isKm ? `កាលបរិច្ឆេទ៖ ${selectedDate} | បុគ្គលិកសរុប៖ ${displayStaff.length} នាក់ (បង្ហាញទិន្នន័យទាំងអស់)` : `Date: ${selectedDate} | Staff: ${displayStaff.length} (All data displayed)`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setZoom(z => Math.max(70, z - 10))}
                className="btn btn-ghost btn-icon btn-xs"
                title={isKm ? 'បង្រួម' : 'Zoom out'}
                style={{ height: '26px', width: '26px', color: 'var(--text-sub)' }}
              >
                <ZoomOut size={13} />
              </button>
              <span style={{ fontSize: '0.72rem', padding: '0 6px', fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 600 }}>
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(130, z + 10))}
                className="btn btn-ghost btn-icon btn-xs"
                title={isKm ? 'ពង្រីក' : 'Zoom in'}
                style={{ height: '26px', width: '26px', color: 'var(--text-sub)' }}
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <button
              onClick={() => setShowConfig(c => !c)}
              className={`btn btn-sm ${showConfig ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem', gap: '5px', height: '32px' }}
              title={isKm ? 'កំណត់ពុម្ពអក្សរ & ប៉ារ៉ាម៉ែត្រ' : 'Font & Layout Settings'}
            >
              <Type size={14} />
              <span className="hide-mobile">{isKm ? 'ពុម្ពអក្សរ' : 'Fonts'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', gap: '6px', height: '32px' }}
            >
              <Download size={14} />
              <span>Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                gap: '6px',
                height: '32px',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                border: 'none',
                color: '#fff',
                padding: '0 14px',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
              }}
            >
              <Printer size={15} />
              <span>{isKm ? 'បោះពុម្ព (Print A4)' : 'Print A4'}</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ color: 'var(--text-muted)' }}
              title={isKm ? 'បិទ' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Document Control Bar (No Sign Toggle & Row Count) ── */}
        <div
          style={{
            padding: '8px 20px',
            background: 'var(--surface-raised)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* "No Sign" mode toggle button: Displays ALL data, but leaves signature column blank for hand signing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setNoSign(prev => !prev)}
              className={`btn btn-xs ${noSign ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                border: noSign ? 'none' : '1px solid var(--border-subtle)'
              }}
              title={isKm ? 'បង្ហាញទិន្នន័យទាំងអស់ ដោយមិនដាក់រូបហត្ថលេខា (ទុកចុះហត្ថលេខាដោយដៃ)' : 'Show all data without signature images (ready for pen signing)'}
            >
              <PenTool size={13} />
              <span>
                {noSign
                  ? (isKm ? '✓ គ្មានហត្ថលេខា (No Sign - ទុកចុះដោយដៃ)' : '✓ No Sign (Blank for Pen Sign)')
                  : (isKm ? 'បង្ហាញរូបហត្ថលេខា (Show Signatures)' : 'Show Signatures')}
              </span>
            </button>

            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {noSign
                ? (isKm ? 'បង្ហាញទិន្នន័យបុគ្គលិកទាំងអស់ ដោយទុកក្រឡាហត្ថលេខាទំនេរសម្រាប់ស៊ីញ៉េផ្ទាល់' : 'All staff data displayed with blank signature column')
                : (isKm ? 'បង្ហាញទិន្នន័យទាំងអស់ រួមទាំងរូបហត្ថលេខាឌីជីថល' : 'All staff data displayed with digital signatures')}
            </span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>
            {isKm ? `បង្ហាញបុគ្គលិក ${displayStaff.length} នាក់ / សរុប ${totalRows} ជួរ` : `Showing all ${displayStaff.length} staff / ${totalRows} rows`}
          </div>
        </div>

        {/* Configuration Bar (collapsible) */}
        {showConfig && (
          <div
            style={{
              padding: '10px 20px',
              background: 'var(--surface-card)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            {/* Font Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isKm ? 'ពុម្ពអក្សរ (Font):' : 'Font Theme:'}
              </label>
              <select
                value={fontTheme}
                onChange={e => setFontTheme(e.target.value)}
                className="input-field"
                style={{ height: '28px', fontSize: '0.78rem', padding: '0 8px', minWidth: '180px' }}
              >
                {Object.values(FONT_OPTIONS).map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isKm ? 'កូដទម្រង់៖' : 'Doc Code:'}
              </label>
              <input
                type="text"
                value={docCode}
                onChange={e => setDocCode(e.target.value)}
                className="input-field"
                style={{ width: '85px', height: '28px', fontSize: '0.78rem', padding: '0 8px', fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isKm ? 'ទីតាំងការដ្ឋាន៖' : 'Site / Location:'}
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={e => setSiteTitle(e.target.value)}
                placeholder="ឧ. នៅរោយសម្រួល"
                className="input-field"
                style={{ flex: 1, height: '28px', fontSize: '0.78rem', padding: '0 8px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isKm ? 'ចំនួនជួរក្រឡាសរុប៖' : 'Total Rows:'}
              </label>
              <input
                type="number"
                min="10"
                max="50"
                value={totalRows}
                onChange={e => setTotalRows(Number(e.target.value) || 23)}
                className="input-field"
                style={{ width: '65px', height: '28px', fontSize: '0.78rem', padding: '0 8px' }}
              />
            </div>
          </div>
        )}

        {/* ── Live Document Preview Area (Proper Theme-Aware Background) ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 16px',
            background: 'var(--surface-raised, #f1f5f9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          {/* Realistic A4 Paper Sheet Frame */}
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              maxWidth: '840px',
              width: '100%'
            }}
          >
            {/* The Authentic Paper Sheet */}
            <div
              ref={previewRef}
              className="doc-container"
              style={{
                width: '100%',
                minHeight: '1120px',
                background: '#ffffff',
                color: '#0f172a',
                padding: '28px 32px 36px',
                borderRadius: '2px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.15)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                fontFamily: currentTheme.bodyFont,
                WebkitFontSmoothing: 'antialiased',
                boxSizing: 'border-box'
              }}
            >
              {/* Top Right Code Badge */}
              <div className="doc-top-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                <span
                  className="doc-code-badge"
                  style={{
                    fontSize: '11.5pt',
                    fontWeight: 800,
                    fontFamily: currentTheme.monoFont,
                    letterSpacing: '0.8px',
                    color: '#0f172a'
                  }}
                >
                  {docCode}
                </span>
              </div>

              {/* Title Box matching original sheet */}
              <div
                className="doc-title-box"
                style={{
                  border: '1.5px solid #0f172a',
                  padding: '7px 12px',
                  textAlign: 'center',
                  marginBottom: '10px',
                  background: '#f8fafc',
                  borderRadius: '3px'
                }}
              >
                <div
                  className="doc-title-text"
                  style={{
                    fontFamily: currentTheme.titleFont,
                    fontSize: fontTheme === 'moul_kantumruy' ? '11.5pt' : '11pt',
                    fontWeight: 700,
                    lineHeight: 1.6,
                    color: '#0f172a',
                    letterSpacing: '0.2px'
                  }}
                >
                  បញ្ជីវត្តមានបុគ្គលិក{siteTitle} ប្រចាំថ្ងៃសម្រាប់ ថ្ងៃទី{' '}
                  <span
                    className="doc-date-dots"
                    style={{
                      borderBottom: '1.2px dotted #0f172a',
                      padding: '0 8px',
                      fontFamily: currentTheme.bodyFont,
                      fontWeight: 700,
                      fontSize: '9.5pt'
                    }}
                  >
                    {dateInfo.day}
                  </span>{' '}
                  ខែ{' '}
                  <span
                    className="doc-date-dots"
                    style={{
                      borderBottom: '1.2px dotted #0f172a',
                      padding: '0 8px',
                      fontFamily: currentTheme.bodyFont,
                      fontWeight: 700,
                      fontSize: '9.5pt'
                    }}
                  >
                    {dateInfo.month}
                  </span>{' '}
                  ឆ្នាំ{' '}
                  <span
                    className="doc-date-dots"
                    style={{
                      borderBottom: '1.2px dotted #0f172a',
                      padding: '0 8px',
                      fontFamily: currentTheme.bodyFont,
                      fontWeight: 700,
                      fontSize: '9.5pt'
                    }}
                  >
                    {dateInfo.year}
                  </span>
                </div>
              </div>

              {/* Main 9-Column Table */}
              <table
                className="doc-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1.5px solid #0f172a',
                  fontSize: '8.6pt'
                }}
              >
                <thead>
                  <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '38px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ល.រ
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '75px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      អត្តលេខ
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 6px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ឈ្មោះ
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 6px', width: '115px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      តួនាទី
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '85px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ថ្ងៃធ្វើការ
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '68px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ម៉ោងចូល
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '68px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ម៉ោងចេញ
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '105px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ហត្ថលេខាបុគ្គលិក
                    </th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px 4px', width: '110px', textAlign: 'center', background: '#1e3a5f', color: '#fff', fontFamily: currentTheme.bodyFont }}>
                      ផ្សេងៗ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Active staff rows — ALL DATA DISPLAYED */}
                  {displayStaff.map((st, idx) => {
                    const rec = dayAttendance[st.id] || {};
                    // Clean staff code
                    const staffCode = st.staff_id || (st.id && !st.id.startsWith('staff-') && st.id.length <= 6 ? st.id : '') || (400 + idx + 1);

                    return (
                      <tr key={st.id || idx} style={{ height: '26px' }}>
                        <td style={{ border: '1px solid #334155', textAlign: 'center', fontWeight: 700, padding: '2px 4px', fontFamily: currentTheme.monoFont, fontSize: '8.4pt' }}>
                          {idx + 1}
                        </td>
                        <td style={{ border: '1px solid #334155', textAlign: 'center', fontFamily: currentTheme.monoFont, fontWeight: 700, padding: '2px 4px', letterSpacing: '0.4px', fontSize: '8.6pt' }}>
                          {staffCode}
                        </td>
                        <td style={{ border: '1px solid #334155', padding: '2px 6px', fontWeight: 600, fontFamily: currentTheme.bodyFont, fontSize: '8.8pt', letterSpacing: '0.1px' }}>
                          {st.name}
                        </td>
                        <td style={{ border: '1px solid #334155', padding: '2px 6px', fontSize: '8.2pt', fontFamily: currentTheme.bodyFont }}>
                          {st.role || '—'}
                        </td>
                        <td style={{ border: '1px solid #334155', textAlign: 'center', fontSize: '8.2pt', fontFamily: currentTheme.monoFont, padding: '2px 4px' }}>
                          {dateInfo.shortDate2Digit || dateInfo.shortDate}
                        </td>
                        <td style={{ border: '1px solid #334155', textAlign: 'center', fontFamily: currentTheme.monoFont, padding: '2px 4px', fontWeight: 500, fontSize: '8.4pt' }}>
                          {rec.timeIn ? rec.timeIn.replace(/^0/, '') : '7:00'}
                        </td>
                        <td style={{ border: '1px solid #334155', textAlign: 'center', fontFamily: currentTheme.monoFont, padding: '2px 4px', fontWeight: 500, fontSize: '8.4pt' }}>
                          {rec.timeOut ? (
                            // If 24h format like 17:00, show 5:00 to match the physical paper
                            rec.timeOut.startsWith('17:') ? '5:00' :
                            rec.timeOut.startsWith('18:') ? '6:00' :
                            rec.timeOut.startsWith('19:') ? '7:00' :
                            rec.timeOut.replace(/^0/, '')
                          ) : '5:00'}
                        </td>
                        <td style={{ border: '1px solid #334155', textAlign: 'center', padding: '2px 4px' }}>
                          {!noSign && st.signature_url ? (
                            <img
                              src={st.signature_url}
                              alt="sig"
                              className="sig-img"
                              style={{ maxHeight: '22px', maxWidth: '80px', objectFit: 'contain', margin: '0 auto' }}
                            />
                          ) : (
                            <div className="sig-blank-line" style={{ width: '65px', margin: '11px auto 1px', borderBottom: '1px dotted #94a3b8' }} />
                          )}
                        </td>
                        <td style={{ border: '1px solid #334155', padding: '2px 6px', fontSize: '8pt', fontFamily: currentTheme.bodyFont }}>
                          {(rec.notes === 'ចុះវត្តមានទូទៅ' || rec.notes === 'មានសកម្មភាពក្នុងកំណត់ត្រា' || rec.notes === 'Marked present' || rec.notes === 'Active in operational logs') ? '' : (rec.notes || '')}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Blank rows up to totalRows to match physical pre-printed sheet */}
                  {blankRows.map(rowNum => (
                    <tr key={`blank-${rowNum}`} style={{ height: '26px' }}>
                      <td style={{ border: '1px solid #334155', textAlign: 'center', fontWeight: 600, padding: '2px 4px', fontFamily: currentTheme.monoFont, fontSize: '8.4pt' }}>
                        {rowNum}
                      </td>
                      <td style={{ border: '1px solid #334155' }}></td>
                      <td style={{ border: '1px solid #334155' }}></td>
                      <td style={{ border: '1px solid #334155' }}></td>
                      <td style={{ border: '1px solid #334155' }}></td>
                      <td style={{ border: '1px solid #334155' }}></td>
                      <td style={{ border: '1px solid #334155' }}></td>
                      <td style={{ border: '1px solid #334155' }}>
                        <div className="sig-blank-line" style={{ width: '65px', margin: '11px auto 1px', borderBottom: '1px dotted #94a3b8' }} />
                      </td>
                      <td style={{ border: '1px solid #334155' }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
