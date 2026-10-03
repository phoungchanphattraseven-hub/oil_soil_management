import React, { useState, useRef } from 'react';
import {
  FileText, X, Printer, Download, Building2,
  MapPin, Calendar, Clock, User, Briefcase,
  Fuel, CheckSquare, ChevronRight, FileSpreadsheet
} from 'lucide-react';
import { exportFuelLogsToExcel } from '../../utils/excelExport';

/* ─── Print Styles (injected via <style> in the print frame) ──────── */
const PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 12mm 14mm 12mm 14mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%;
    font-family: 'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 9.5pt;
    color: #1e293b;
    line-height: 1.4;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc-root {
    width: 100%;
    min-height: calc(297mm - 26mm);
    box-sizing: border-box;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .doc-top-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .doc-mid-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  .doc-bottom-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: auto;
    padding-top: 8px;
  }

  /* Header */
  .doc-header-wrap {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 8px;
  }
  .doc-header-left {
    flex: 1;
  }
  .doc-company {
    font-size: 9.5pt;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 2px;
  }
  .doc-title {
    font-size: 14pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.25;
    margin-bottom: 3px;
  }
  .doc-subtitle {
    font-size: 8.5pt;
    color: #64748b;
    font-weight: 500;
  }
  .doc-header-right {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .doc-badge {
    display: inline-block;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 2px 7px;
    font-size: 8pt;
    font-weight: 700;
    color: #334155;
    letter-spacing: 0.5px;
  }
  .stamp-box {
    border: 1.5px dashed #94a3b8;
    border-radius: 4px;
    width: 72px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7pt;
    color: #64748b;
    text-align: center;
    line-height: 1.2;
    background: #fafafa;
  }

  /* Meta Card */
  .meta-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 8px 14px;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 6px 24px;
    font-size: 8.8pt;
  }
  .meta-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    line-height: 1.4;
  }
  .meta-label {
    font-weight: 500;
    color: #64748b;
    white-space: nowrap;
    min-width: 95px;
  }
  .meta-val {
    font-weight: 700;
    color: #0f172a;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Table */
  .log-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.8pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .log-table th {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    font-weight: 700;
    text-align: center;
    font-size: 8.5pt;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }
  .log-table th.th-desc {
    text-align: left;
    padding-left: 10px;
  }
  .log-table th.th-vol {
    text-align: right;
    padding-right: 12px;
  }
  .log-table td {
    border: 1px solid #e2e8f0;
    padding: 6px 8px;
    vertical-align: middle;
    color: #1e293b;
  }
  .log-table tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  .log-table .num {
    text-align: center;
    font-weight: 600;
    color: #64748b;
  }
  .log-table .desc {
    text-align: left;
    padding-left: 10px;
    font-weight: 500;
  }
  .log-table .plate {
    text-align: center;
    font-weight: 700;
    font-family: inherit;
    color: #0f172a;
    letter-spacing: 0.3px;
    white-space: nowrap;
    word-break: keep-all;
  }
  .log-table .driver {
    text-align: center;
    font-weight: 500;
    color: #1e293b;
  }
  .log-table .time {
    text-align: center;
    white-space: nowrap;
    font-size: 8.5pt;
    color: #334155;
  }
  .log-table .shift-badge {
    text-align: center;
    font-size: 8.5pt;
    font-weight: 600;
  }
  .log-table .vol {
    text-align: right;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #0f172a;
    padding-right: 12px;
  }
  .log-table tfoot td {
    font-weight: 700;
    background: #f8fafc;
    border-top: 2px solid #0f172a;
    border-bottom: 2px solid #0f172a;
    padding: 6px 8px;
  }

  /* Summary Table (Professional Office Style) */
  .summary-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.8pt;
    page-break-inside: avoid;
  }
  .summary-table th {
    background: #f1f5f9;
    border: 1px solid #94a3b8;
    padding: 5px 8px;
    font-size: 7.8pt;
    font-weight: 700;
    color: #334155;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .summary-table td {
    border: 1px solid #94a3b8;
    padding: 6px 8px;
    text-align: center;
    font-weight: 700;
    font-size: 10pt;
    color: #0f172a;
  }
  .summary-table td span.unit {
    font-size: 8pt;
    font-weight: 500;
    color: #64748b;
  }
  .summary-table td.total-cell {
    background: #f1f5f9;
    font-weight: 800;
    border: 1.5px solid #334155;
  }

  /* Tank Reconciliation Table */
  .tank-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }
  .tank-table-title {
    font-weight: 700;
    font-size: 8.8pt;
    color: #0f172a;
    padding: 5px 10px;
    border: 1px solid #94a3b8;
    border-bottom: none;
    background: #f1f5f9;
    letter-spacing: 0.2px;
  }
  .tank-table th {
    background: #f8fafc;
    border: 1px solid #94a3b8;
    padding: 4px 8px;
    font-size: 7.5pt;
    font-weight: 600;
    color: #475569;
    text-align: center;
  }
  .tank-table td {
    border: 1px solid #94a3b8;
    padding: 6px 8px;
    text-align: center;
    font-weight: 700;
    font-size: 9.5pt;
    color: #0f172a;
  }
  .tank-table td.deduct { color: #b91c1c; }
  .tank-table td.balance { color: #15803d; }
  .tank-table td.manual { color: #64748b; font-weight: 600; }

  /* Operational Checklist */
  .checklist-box {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 6px 12px;
    background: #fff;
    font-size: 8pt;
    page-break-inside: avoid;
  }
  .check-title {
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
    font-size: 8.2pt;
  }
  .check-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 14px;
    color: #475569;
  }
  .check-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .notes-inline {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px dashed #cbd5e1;
    color: #0f172a;
  }

  /* Signature Section */
  .sig-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    margin-top: 6px;
    padding-top: 6px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .sig-col {
    text-align: center;
  }
  .sig-role {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .sig-date-line {
    font-size: 8.2pt;
    color: #64748b;
    margin-bottom: 60px;
  }
  .sig-line {
    border-bottom: 1.5px solid #334155;
    width: 75%;
    max-width: 190px;
    margin: 0 auto 5px;
  }
  .sig-caption {
    font-size: 8pt;
    color: #64748b;
    font-weight: 500;
  }

  /* Footer */
  .doc-footer {
    border-top: 1px solid #cbd5e1;
    padding-top: 5px;
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 7.8pt;
    color: #64748b;
    page-break-inside: avoid;
  }
`;

function formatTime12h(timeStr) {
  if (!timeStr) return '—';
  let hhmm = timeStr;
  if (timeStr.includes('T')) {
    hhmm = timeStr.substring(11, 16);
  } else if (timeStr.includes(':')) {
    hhmm = timeStr.substring(0, 5);
  } else {
    return timeStr;
  }
  const parts = hhmm.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
}

/* ─── Document Content (shared between screen + print) ────────────── */
function DocumentContent({ meta, logs, stations = [], lang }) {
  const isKm = lang === 'km';

  // Normalize shift safely (handles 'Morning', 'Afternoon', 'Day', 'ព្រឹក', 'រសៀល', null)
  const normalizeShift = (val) => {
    if (!val) return 'Morning';
    const s = String(val).trim().toLowerCase();
    if (s === 'afternoon' || s === 'រសៀល') return 'Afternoon';
    return 'Morning';
  };

  const totalOilOut = logs.reduce((s, l) => s + (parseFloat(l.refill_liters) || 0), 0);
  const totalOilIn = logs.reduce((s, l) => s + (parseFloat(l.oil_in) || 0), 0);

  const morningLogs = logs.filter(l => normalizeShift(l.shift) === 'Morning');
  const afternoonLogs = logs.filter(l => normalizeShift(l.shift) === 'Afternoon');
  const morningOut = morningLogs.reduce((s, l) => s + (parseFloat(l.refill_liters) || 0), 0);
  const afternoonOut = afternoonLogs.reduce((s, l) => s + (parseFloat(l.refill_liters) || 0), 0);
  const morningIn = morningLogs.reduce((s, l) => s + (parseFloat(l.oil_in) || 0), 0);
  const afternoonIn = afternoonLogs.reduce((s, l) => s + (parseFloat(l.oil_in) || 0), 0);

  const primaryStation = (stations && stations.length > 0) ? stations[0] : null;
  const currentRemaining = primaryStation ? (primaryStation.current_stock_liters || 0) : 5430;
  
  // Mathematically precise Inventory Reconciliation equation:
  // Closing Stock = Opening Stock + Total Oil In - Total Oil Out
  // => Opening Stock = Closing Stock - Total Oil In + Total Oil Out
  const openingStock = currentRemaining - totalOilIn + totalOilOut;

  const todayFull = new Date().toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const docRef = meta.ref || `FR-${meta.date?.replace(/-/g, '') || new Date().toISOString().substring(0, 10).replace(/-/g, '')}-001`;

  return (
    <div className="doc-root">
      {/* ── 1. TOP BLOCK: Header + Meta Card + Log Table ── */}
      <div className="doc-top-block">
        {/* Official Header */}
        <div className="doc-header-wrap">
          <div className="doc-header-left">
            <div className="doc-company">{meta.companyName || (isKm ? 'ការិយាល័យគ្រប់គ្រងប្រតិបត្តិការ' : 'Operations Management Office')}</div>
            <div className="doc-title">
              {isKm ? 'របាយការណ៍ប្រើប្រាស់ និងបំពេញសាំងប្រចាំថ្ងៃ' : 'DAILY FUEL CONSUMPTION & REFILL REPORT'}
            </div>
            <div className="doc-subtitle">
              {isKm
                ? `${meta.projectName || 'គម្រោងការដ្ឋាន'} — លេខកូដទម្រង់: ${docRef}`
                : `${meta.projectName || 'Site Project'} — Form Ref: ${docRef}`}
            </div>
          </div>

          <div className="doc-header-right">
            <span className="doc-badge">OFFICIAL FORM</span>
            <div className="stamp-box">
              {isKm ? 'ត្រាផ្លូវការ\nOFFICIAL SEAL' : 'OFFICIAL\nSTAMP / SEAL'}
            </div>
          </div>
        </div>

        {/* Balanced Executive Metadata Grid */}
        <div className="meta-card">
          <div className="meta-item">
            <span className="meta-label">{isKm ? 'ឈ្មោះរបាយការណ៍:' : 'Report Title:'}</span>
            <span className="meta-val">{meta.reportName || (isKm ? 'របាយការណ៍ប្រើប្រាស់សាំង' : 'Daily Fuel Log')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{isKm ? 'កាលបរិច្ឆេទ:' : 'Report Date:'}</span>
            <span className="meta-val">{meta.date || ''}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{isKm ? 'ឈ្មោះគម្រោង:' : 'Project Name:'}</span>
            <span className="meta-val">{meta.projectName || (isKm ? 'គម្រោងការដ្ឋានទូទៅ' : 'General Site Project')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{isKm ? 'វេនការងារ:' : 'Work Shift:'}</span>
            <span className="meta-val">
              {meta.shift === 'ALL'
                ? (isKm ? 'ព្រឹក + រសៀល (ពេញមួយថ្ងៃ)' : 'Morning + Afternoon (All Day)')
                : meta.shift === 'Morning'
                  ? (isKm ? 'វេនព្រឹក (Morning)' : 'Morning Shift')
                  : (isKm ? 'វេនរសៀល (Afternoon)' : 'Afternoon Shift')}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{isKm ? 'ទីតាំងការដ្ឋាន:' : 'Site Location:'}</span>
            <span className="meta-val">{meta.location || (isKm ? 'ការដ្ឋានមេ' : 'Main Station Site')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">{isKm ? 'លេខកូដឯកសារ:' : 'Doc Reference:'}</span>
            <span className="meta-val" style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{docRef}</span>
          </div>
        </div>

        {/* Main Data Table */}
        <table className="log-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>#</th>
              <th className="th-desc">{isKm ? 'ការពិពណ៌នា' : 'Description'}</th>
              <th style={{ width: '105px', whiteSpace: 'nowrap' }}>{isKm ? 'ផ្លាកលេខ' : 'License Plate'}</th>
              <th style={{ width: '100px' }}>{isKm ? 'អ្នកបើកបរ' : 'Driver / Staff'}</th>
              <th style={{ width: '75px', whiteSpace: 'nowrap' }}>{isKm ? 'ម៉ោង' : 'Time'}</th>
              <th style={{ width: '55px' }}>{isKm ? 'វេន' : 'Shift'}</th>
              <th className="th-vol" style={{ width: '80px' }}>{isKm ? 'ដកប្រើ (Out L)' : 'Fuel Out (L)'}</th>
              <th className="th-vol" style={{ width: '85px', color: '#15803d' }}>{isKm ? 'បំពេញ (In L)' : 'Oil In (L)'}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  {isKm ? 'គ្មានទិន្នន័យសម្រាប់លក្ខខណ្ឌដែលបានជ្រើសរើស' : 'No records found for the selected filter.'}
                </td>
              </tr>
            ) : (() => {
              // Separate Oil In entries from regular fuel-out entries
              const oilInEntries = logs.filter(l => (parseFloat(l.oil_in) || 0) > 0);
              const fuelOutEntries = logs.filter(l => (parseFloat(l.oil_in) || 0) === 0 || (parseFloat(l.refill_liters) || 0) > 0);
              // For rows that have both oil_in AND refill_liters, show in oil_in section only
              const pureOilIn = logs.filter(l => (parseFloat(l.oil_in) || 0) > 0 && (parseFloat(l.refill_liters) || 0) === 0);
              const mixedOrOut = logs.filter(l => (parseFloat(l.refill_liters) || 0) > 0);

              return (
                <>
                  {/* ── OIL IN BLOCK: always shown first at top ── */}
                  {oilInEntries.length > 0 && (
                    <>
                      {/* Section label row */}
                      <tr>
                        <td colSpan={8} style={{
                          background: '#dcfce7',
                          borderTop: '2px solid #16a34a',
                          borderBottom: '1px solid #bbf7d0',
                          padding: '4px 10px',
                          fontWeight: 800,
                          fontSize: '8pt',
                          color: '#15803d',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>
                          ▼ {isKm ? 'ប្រេងចូល / បំពេញស្តុក (OIL IN — Stock Refill Received Today)' : 'OIL IN — Stock Refill / Fuel Received Today'}
                        </td>
                      </tr>
                      {oilInEntries.map((log, i) => {
                        const rowOut = parseFloat(log.refill_liters || 0);
                        const rowIn = parseFloat(log.oil_in || 0);
                        const currentShift = normalizeShift(log.shift);
                        return (
                          <tr key={`in-${log.id || i}`} style={{ background: '#f0fdf4' }}>
                            <td className="num" style={{ color: '#15803d', fontWeight: 800 }}>{i + 1}</td>
                            <td className="desc">
                              <span style={{ fontWeight: 700, color: '#15803d' }}>
                                {log.description || (isKm ? 'ប្រេងចូលស្តុក' : 'Stock Tank Refill')}
                              </span>
                              <span style={{
                                marginLeft: '6px', fontSize: '7pt',
                                background: '#15803d', color: '#fff',
                                padding: '1px 5px', borderRadius: '3px', fontWeight: 700
                              }}>
                                {isKm ? 'បំពេញស្តុក' : 'STOCK IN'}
                              </span>
                            </td>
                            <td className="plate" style={{ color: '#15803d', whiteSpace: 'nowrap' }}>
                              {log.license_plate || (log.code_abbr && !log.code_abbr.startsWith('FL-') ? log.code_abbr : '—')}
                            </td>
                            <td className="driver" style={{ color: '#15803d' }}>{log.driver_name || log.driver || '—'}</td>
                            <td className="time" style={{ whiteSpace: 'nowrap' }}>
                              {formatTime12h(log.time_in)}
                            </td>
                            <td className="shift-badge">
                              {currentShift === 'Morning' ? (isKm ? 'ព្រឹក' : 'Morning') : (isKm ? 'រសៀល' : 'Afternoon')}
                            </td>
                            <td className="vol" style={{ color: rowOut > 0 ? '#b91c1c' : '#94a3b8' }}>
                              {rowOut > 0 ? rowOut.toLocaleString() : '—'}
                            </td>
                            <td className="vol" style={{ color: '#15803d', fontWeight: 900, fontSize: '10pt' }}>
                              +{rowIn.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Oil In subtotal row */}
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'right', paddingRight: '12px', fontWeight: 700, background: '#f0fdf4', borderBottom: '2px solid #16a34a', color: '#15803d', fontSize: '8pt' }}>
                          {isKm ? 'សរុបប្រេងចូល (TOTAL OIL IN):' : 'TOTAL OIL IN:'}
                        </td>
                        <td className="vol" style={{ fontWeight: 900, color: '#15803d', background: '#f0fdf4', borderBottom: '2px solid #16a34a', fontSize: '10pt' }}>
                          +{totalOilIn.toLocaleString()} L
                        </td>
                      </tr>
                    </>
                  )}

                  {/* ── FUEL OUT BLOCK: vehicle refueling entries ── */}
                  {mixedOrOut.length > 0 && (
                    <>
                      {/* Section label row (only if there were also oil_in entries above) */}
                      {oilInEntries.length > 0 && (
                        <tr>
                          <td colSpan={8} style={{
                            background: '#fef2f2',
                            borderTop: '2px solid #dc2626',
                            borderBottom: '1px solid #fecaca',
                            padding: '4px 10px',
                            fontWeight: 800,
                            fontSize: '8pt',
                            color: '#b91c1c',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                          }}>
                            ▼ {isKm ? 'ប្រេងចេញ / ចាក់ឡាន (FUEL OUT — Vehicle Fuel Dispatched)' : 'FUEL OUT — Vehicle Fuel Dispatched'}
                          </td>
                        </tr>
                      )}
                      {mixedOrOut.map((log, i) => {
                        const rowOut = parseFloat(log.refill_liters || 0);
                        const rowIn = parseFloat(log.oil_in || 0);
                        const currentShift = normalizeShift(log.shift);
                        return (
                          <tr key={`out-${log.id || i}`}>
                            <td className="num">{i + 1}</td>
                            <td className="desc">
                              {log.description || (isKm ? 'ឡានចាក់សាំង' : 'Vehicle Refuel')}
                            </td>
                            <td className="plate" style={{ whiteSpace: 'nowrap' }}>
                              {log.license_plate || (log.code_abbr && !log.code_abbr.startsWith('FL-') ? log.code_abbr : '—')}
                            </td>
                            <td className="driver">{log.driver_name || log.driver || log.driverName || '—'}</td>
                            <td className="time" style={{ whiteSpace: 'nowrap' }}>
                              {formatTime12h(log.time_in)}
                            </td>
                            <td className="shift-badge">
                              {currentShift === 'Morning' ? (isKm ? 'ព្រឹក' : 'Morning') : (isKm ? 'រសៀល' : 'Afternoon')}
                            </td>
                            <td className="vol" style={{ color: '#0f172a' }}>
                              {rowOut > 0 ? rowOut.toLocaleString() : '—'}
                            </td>
                            <td className="vol" style={{ color: rowIn > 0 ? '#15803d' : '#94a3b8', fontWeight: rowIn > 0 ? 800 : 400 }}>
                              {rowIn > 0 ? `+${rowIn.toLocaleString()}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </>
              );
            })()}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} style={{ textAlign: 'right', paddingRight: '12px', letterSpacing: '0.3px', fontWeight: 700 }}>
                {isKm ? 'សរុបរួម (GRAND TOTAL):' : 'GRAND TOTAL:'}
              </td>
              <td className="vol" style={{ fontSize: '9.5pt', color: '#b91c1c', fontWeight: 800 }}>
                -{totalOilOut.toLocaleString()} L
              </td>
              <td className="vol" style={{ fontSize: '9.5pt', color: '#15803d', fontWeight: 800 }}>
                {totalOilIn > 0 ? `+${totalOilIn.toLocaleString()} L` : '0 L'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── 2. MIDDLE BLOCK: Summary Table + Tank Reconciliation ── */}
      <div className="doc-mid-block">
        {/* Fuel Consumption Summary Table */}
        <table className="summary-table">
          <thead>
            <tr>
              <th>{isKm ? 'ប្រតិបត្តិការ' : 'RECORDS'}</th>
              <th>{isKm ? 'វេនព្រឹក (MORNING)' : 'MORNING SHIFT'}</th>
              <th>{isKm ? 'វេនរសៀល (AFTERNOON)' : 'AFTERNOON SHIFT'}</th>
              <th>{isKm ? 'សរុបដកប្រើ (OIL OUT)' : 'TOTAL OUT'}</th>
              <th style={{ color: '#15803d' }}>{isKm ? 'សរុបបំពេញ (OIL IN)' : 'TOTAL IN'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{logs.length} <span className="unit">{isKm ? 'ដង' : 'runs'}</span></td>
              <td>
                <div>{morningOut.toLocaleString()} <span className="unit">L (Out)</span></div>
                {morningIn > 0 && <div style={{ fontSize: '7.5pt', color: '#15803d' }}>+{morningIn.toLocaleString()} L (In)</div>}
              </td>
              <td>
                <div>{afternoonOut.toLocaleString()} <span className="unit">L (Out)</span></div>
                {afternoonIn > 0 && <div style={{ fontSize: '7.5pt', color: '#15803d' }}>+{afternoonIn.toLocaleString()} L (In)</div>}
              </td>
              <td className="total-cell">{totalOilOut.toLocaleString()} <span className="unit">L</span></td>
              <td className="total-cell" style={{ color: '#15803d', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                {totalOilIn > 0 ? `+${totalOilIn.toLocaleString()}` : '0'} <span className="unit">L</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Station Tank Stock Reconciliation */}
        <div>
          <div className="tank-table-title">
            {isKm ? 'តុល្យភាពស្តុកប្រេងក្នុងធុង (Station Tank Stock Reconciliation)' : 'Station Tank Stock Reconciliation'}
          </div>
          <table className="tank-table">
            <thead>
              <tr>
                <th>{isKm ? 'ស្តុកដើមគ្រា (Opening Stock)' : 'Opening Stock'}</th>
                <th style={{ color: '#15803d' }}>{isKm ? '+ បំពេញស្តុក (Oil Refilled In)' : '+ Oil Refilled In'}</th>
                <th style={{ color: '#b91c1c' }}>{isKm ? '- ដកប្រើប្រាស់ (Fuel Spent Out)' : '- Fuel Spent Out'}</th>
                <th>{isKm ? '= តុល្យភាពចុងគ្រា (Closing Balance)' : '= Closing Balance'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{openingStock.toLocaleString()} L</td>
                <td style={{ color: '#15803d', fontWeight: 800 }}>+ {totalOilIn.toLocaleString()} L</td>
                <td className="deduct">- {totalOilOut.toLocaleString()} L</td>
                <td className="balance">{currentRemaining.toLocaleString()} L</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. BOTTOM BLOCK: Pinned Signatures + Official Footer ── */}
      <div className="doc-bottom-block">
        <div className="sig-section">
          <div className="sig-col">
            <div className="sig-role">{isKm ? 'អ្នកផ្ទៀងផ្ទាត់ (Checked By)' : 'Checked By'}</div>
            <div className="sig-date-line">{isKm ? 'កាលបរិច្ឆេទ: ..... / ..... / 202...' : 'Date: ..... / ..... / 202...'}</div>
            <div className="sig-line"></div>
            <div className="sig-caption">{isKm ? 'ឈ្មោះ និងហត្ថលេខា / Name & Signature' : 'Name & Signature'}</div>
            <div style={{ fontSize: '7.6pt', color: '#94a3b8', marginTop: '2px' }}>{isKm ? 'តួនាទី / Title: ....................................' : 'Title: ....................................'}</div>
          </div>

          <div className="sig-col">
            <div className="sig-role">{isKm ? 'អ្នកអនុម័ត (Approved By)' : 'Approved By'}</div>
            <div className="sig-date-line">{isKm ? 'កាលបរិច្ឆេទ: ..... / ..... / 202...' : 'Date: ..... / ..... / 202...'}</div>
            <div className="sig-line"></div>
            <div className="sig-caption">{isKm ? 'ឈ្មោះ និងហត្ថលេខា / Name & Signature' : 'Name & Signature'}</div>
            <div style={{ fontSize: '7.6pt', color: '#94a3b8', marginTop: '2px' }}>{isKm ? 'តួនាទី / Title: ....................................' : 'Title: ....................................'}</div>
          </div>
        </div>

        <div className="doc-footer">
          <span>{isKm ? 'ទម្រង់: FR-FUEL-01 | កំណែ: 1.0' : 'Form: FR-FUEL-01 | Rev: 1.0'}</span>
          <span>{isKm ? 'ឯកសារផ្លូវការរក្សាទុកនៅការដ្ឋាន' : 'Official Site Operations Record'}</span>
          <span>{isKm ? 'កាលបរិច្ឆេទទាញយក: ' : 'Generated: '}{todayFull}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Generate Document Modal ─────────────────────────────────────── */
export default function GenerateDocumentModal({ open, onClose, logs = [], stations = [], lang = 'km' }) {
  const isKm = lang === 'km';
  const today = new Date().toISOString().substring(0, 10);
  const docRef = `FR-${today.replace(/-/g, '')}-001`;

  const [meta, setMeta] = useState({
    reportName:  isKm ? 'របាយការណ៍ប្រើប្រាស់សាំងប្រចាំថ្ងៃ' : 'Daily Fuel Consumption Report',
    projectName: '',
    companyName: 'StationOps Operations Dept.',
    location:    '',
    date:        today,
    shift:       'ALL',
    notes:       '',
    ref:         docRef,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const previewRef = useRef(null);

  const up = (field, val) => setMeta(m => ({ ...m, [field]: val }));

  // Filter logs to print based on date+shift
  const filteredLogs = logs.filter(log => {
    const logDate = log.time_in?.substring(0, 10) || '';
    const matchDate  = !meta.date || logDate === meta.date;
    const matchShift = meta.shift === 'ALL' || (log.shift || 'Morning') === meta.shift;
    return matchDate && matchShift;
  });

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Please allow popups to print.'); return; }
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${meta.reportName || 'Fuel Report'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${PRINT_CSS}
@media screen {
  body { padding: 24px; background: #e2e8f0; }
  .doc-root {
    background: #fff;
    padding: 36px 40px;
    max-width: 820px;
    margin: 0 auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    border-radius: 4px;
  }
}
</style>
</head>
<body>
${previewRef.current?.innerHTML || ''}
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 250);
  }
<\/script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  };

  if (!open) return null;

  const formFields = [
    { key: 'reportName', label: isKm ? 'ឈ្មោះរបាយការណ៍ (Report Name)' : 'Report Name', icon: <FileText size={14} />, placeholder: isKm ? 'ឧ. របាយការណ៍ប្រចាំថ្ងៃ' : 'e.g. Daily Fuel Log', required: true },
    { key: 'companyName', label: isKm ? 'ឈ្មោះក្រុមហ៊ុន / អង្គភាព' : 'Company / Department', icon: <Building2 size={14} />, placeholder: 'StationOps Dept.', required: true },
    { key: 'projectName', label: isKm ? 'ឈ្មោះគម្រោង (Project Plan Name)' : 'Project Plan Name', icon: <Briefcase size={14} />, placeholder: isKm ? 'ឧ. គម្រោងថែទាំផ្លូវ ២០២៦' : 'e.g. Road Maintenance 2026', required: true },
    { key: 'location', label: isKm ? 'ទីតាំង (Location)' : 'Location / Site', icon: <MapPin size={14} />, placeholder: isKm ? 'ឧ. ខេត្តកំពត, ជ្រលង A' : 'e.g. Kampot Province, Site A', required: true },
    { key: 'date', label: isKm ? 'កាលបរិច្ឆេទ (Date)' : 'Report Date', icon: <Calendar size={14} />, type: 'date', required: true },
  ];

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: previewOpen ? '900px' : '620px', transition: 'max-width 0.3s ease' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--primary-subtle)' }}>
              <FileText size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.975rem' }}>
                {isKm ? 'បង្កើតឯកសារផ្លូវការ' : 'Generate Official Document'}
              </h3>
              <p style={{ fontSize: '0.73rem', margin: 0 }}>
                {isKm ? 'ភ្លេចភ្លើងរបាយការណ៍ A4 — PDF-Ready' : 'Professional A4 Fuel Report — Print & PDF Ready'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!previewOpen && (
              <button
                onClick={() => setPreviewOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <ChevronRight size={13} /> {isKm ? 'មើលការពិពណ៌នា' : 'Preview'}
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}><X size={17} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', minHeight: 0 }}>
          {/* ── Form Panel ── */}
          <div style={{
            width: previewOpen ? '320px' : '100%',
            minWidth: previewOpen ? '300px' : 'unset',
            flexShrink: 0,
            borderRight: previewOpen ? '1px solid var(--border-subtle)' : 'none',
            overflowY: 'auto',
            maxHeight: '75vh',
            transition: 'width 0.3s ease'
          }}>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Form Fields */}
              {formFields.map(({ key, label, icon, placeholder, type, required }) => (
                <div className="form-group" key={key}>
                  <label className={`form-label${required ? ' form-label-required' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary)' }}>
                      {icon}
                    </span>
                    {label}
                  </label>
                  <input
                    type={type || 'text'}
                    className="form-control"
                    placeholder={placeholder}
                    value={meta[key]}
                    onChange={e => up(key, e.target.value)}
                  />
                </div>
              ))}

              {/* Shift Filter */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary)' }}>
                    <Clock size={14} />
                  </span>
                  {isKm ? 'វេន (Shift)' : 'Shift to Include'}
                </label>
                <select
                  className="form-control"
                  value={meta.shift}
                  onChange={e => up('shift', e.target.value)}
                >
                  <option value="ALL">{isKm ? 'ទាំងអស់ (Morning + Afternoon)' : 'All Shifts'}</option>
                  <option value="Morning">{isKm ? 'Morning — ព្រឹក' : 'Morning Only'}</option>
                  <option value="Afternoon">{isKm ? 'Afternoon — រសៀល' : 'Afternoon Only'}</option>
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary)' }}>
                    <CheckSquare size={14} />
                  </span>
                  {isKm ? 'កំណត់ចំណាំ (Remarks)' : 'Remarks / Notes'}
                </label>
                <textarea
                  className="form-control"
                  placeholder={isKm ? 'ឧ. ស្ថានភាពពិសេស, ការណែនាំ...' : 'Any special notes or remarks...'}
                  value={meta.notes}
                  rows={3}
                  onChange={e => up('notes', e.target.value)}
                  style={{ resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>

              {/* Data Summary */}
              <div style={{
                padding: '12px 14px',
                background: filteredLogs.length > 0 ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                border: `1px solid ${filteredLogs.length > 0 ? 'var(--success-border)' : 'var(--danger-border)'}`,
                borderRadius: 'var(--r-sm)',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', color: filteredLogs.length > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  <Fuel size={13} style={{ marginRight: '5px', display: 'inline' }} />
                  {isKm ? 'ទិន្នន័យក្នុងឯកសារ:' : 'Data for this document:'}
                </div>
                <div style={{ color: 'var(--text-sub)' }}>
                  {filteredLogs.length} {isKm ? 'ប្រតិបត្តិការ' : 'entries'} ·{' '}
                  {isKm ? 'ដកប្រើ: ' : 'Out: '}
                  <strong>{filteredLogs.reduce((s, l) => s + (parseFloat(l.refill_liters) || 0), 0).toLocaleString()} L</strong>
                  {filteredLogs.reduce((s, l) => s + (parseFloat(l.oil_in) || 0), 0) > 0 && (
                    <span>
                      {' · '}{isKm ? 'បំពេញស្តុក: ' : 'In: '}
                      <strong style={{ color: '#15803d' }}>
                        +{filteredLogs.reduce((s, l) => s + (parseFloat(l.oil_in) || 0), 0).toLocaleString()} L
                      </strong>
                    </span>
                  )}
                  {filteredLogs.length === 0 && (
                    <span style={{ display: 'block', marginTop: '3px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {isKm ? 'ផ្លាស់ប្ដូរកាលបរិច្ឆេទ ឬ វេន ដើម្បីឃើញទិន្នន័យ' : 'Change date or shift to match your log entries'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Preview Panel ── */}
          {previewOpen && (
            <div style={{
              flex: 1, overflowY: 'auto', maxHeight: '75vh',
              background: '#e8e8e8',
              animation: 'fadeIn 0.25s ease'
            }}>
              {/* Preview Toolbar */}
              <div style={{
                padding: '10px 16px',
                background: 'var(--surface-card)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isKm ? 'ការពិពណ៌នា A4' : 'A4 Preview'} — {filteredLogs.length} {isKm ? 'ក.' : 'entries'}
                </span>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <button onClick={() => setPreviewOpen(false)} className="btn btn-secondary btn-sm">
                    {isKm ? 'បិទការពិពណ៌នា' : 'Close Preview'}
                  </button>
                  <button onClick={handlePrint} className="btn btn-primary btn-sm">
                    <Printer size={13} /> {isKm ? 'បោះពុម្ព / PDF' : 'Print / Save PDF'}
                  </button>
                </div>
              </div>

              {/* A4 Preview Sheet */}
              <div style={{ padding: '24px 20px' }}>
                <div
                  ref={previewRef}
                  style={{
                    background: '#fff',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                    padding: '28px 32px',
                    margin: '0 auto',
                    maxWidth: '680px',
                    fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: '11px',
                    color: '#1e293b',
                    lineHeight: '1.4'
                  }}
                >
                  {/* Inline styles for preview */}
                  <style>{PRINT_CSS}</style>
                  <DocumentContent meta={meta} logs={filteredLogs} stations={stations} lang={lang} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: '8px' }}>
          {previewOpen ? (
            <>
              <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1 }}>
                <Printer size={15} />
                {isKm ? 'បោះពុម្ព / រក្សាទុក PDF' : 'Print / Save as PDF'}
              </button>
              <button
                onClick={() => {
                  const filename = meta.docDate ? `Fuel_Log_Document_${meta.docDate}.xlsx` : `Fuel_Log_Document.xlsx`;
                  exportFuelLogsToExcel(filteredLogs, filename, lang);
                }}
                className="btn btn-success"
                style={{ background: '#10b981', color: '#ffffff', borderColor: '#059669' }}
              >
                <FileSpreadsheet size={15} />
                {isKm ? 'ទាញយក Excel' : 'Export Excel'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPreviewOpen(true)} className="btn btn-primary" style={{ flex: 1 }}>
                <ChevronRight size={15} />
                {isKm ? 'មើលឯកសារ + បោះពុម្ព' : 'Preview & Print'}
              </button>
              <button
                onClick={() => {
                  const filename = meta.docDate ? `Fuel_Log_Document_${meta.docDate}.xlsx` : `Fuel_Log_Document.xlsx`;
                  exportFuelLogsToExcel(filteredLogs, filename, lang);
                }}
                className="btn btn-success"
                style={{ background: '#10b981', color: '#ffffff', borderColor: '#059669' }}
              >
                <FileSpreadsheet size={15} />
                {isKm ? 'ទាញយក Excel' : 'Export Excel'}
              </button>
              <button onClick={handlePrint} className="btn btn-secondary">
                <Printer size={14} />
                {isKm ? 'បោះពុម្ព' : 'Print'}
              </button>
            </>
          )}
          <button onClick={onClose} className="btn btn-ghost" style={{ minWidth: '70px' }}>
            {isKm ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
