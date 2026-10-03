import React, { useState } from 'react';
import { HardHat, Image as ImageIcon, UserCheck, Trash2, Pencil, X, Check, FileSpreadsheet } from 'lucide-react';
import { translations } from '../../data/translations';
import AbbrCodeSelector from '../Common/AbbrCodeSelector';
import { exportSoilLogsToExcel } from '../../utils/excelExport';

function formatTimeForInput(val) {
  if (!val) return '07:00';
  return val.substring(0, 5);
}

export default function SoilLogTable({ logs = [], onDelete, onEdit, abbrCodes = [], onAddAbbrCode, lang = 'km' }) {
  const t = translations[lang] || translations.km;
  const [editingLog, setEditingLog] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleEditSave = () => {
    if (!editingLog) return;
    const trips = parseInt(editingLog.trip_count, 10) || 0;
    const m3 = parseFloat(editingLog.cubic_meters_per_trip) || 0;
    const updated = {
      ...editingLog,
      trip_count: trips,
      cubic_meters_per_trip: m3,
      total_cubic_meters: trips * m3,
      scrap_sales_amount: parseFloat(editingLog.scrap_sales_amount) || 0
    };
    onEdit(updated);
    setEditingLog(null);
  };

  return (
    <div className="card" style={{ padding: '20px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'var(--soil-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--soil-accent)', display: 'flex' }}>
            <HardHat size={16} />
          </div>
          <span>{t.soilLogsTitle}</span>
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => exportSoilLogsToExcel(logs, `Soil_Logs_Archive_${new Date().toISOString().substring(0, 10)}.xlsx`, lang)}
            className="btn btn-success btn-sm"
            style={{ height: '32px', fontSize: '0.76rem', background: '#10b981', color: '#ffffff', borderColor: '#059669' }}
            title={lang === 'km' ? 'ទាញយកទិន្នន័យចាក់ដីជាឯកសារ Excel (.xlsx)' : 'Export soil logs as Excel (.xlsx)'}
          >
            <FileSpreadsheet size={13} />
            <span>{lang === 'km' ? 'ទាញយក Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            {logs.length} {lang === 'km' ? 'កំណត់ត្រា' : 'records'}
          </span>
        </div>
      </div>

      {/* Edit Modal for Soil Log */}
      {editingLog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, backdropFilter: 'blur(6px)'
        }}>
          <div className="card" style={{ width: '520px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--soil-accent)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {lang === 'km' ? 'កែប្រែរបាយការណ៍ចាក់ដី' : 'Edit Soil Log'}
                </h3>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">{t.stationNameLabel}</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingLog.station_name || ''}
                  onChange={e => setEditingLog({ ...editingLog, station_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.codeAbbr}</label>
                <AbbrCodeSelector
                  value={editingLog.code_abbr || ''}
                  onChange={val => setEditingLog({ ...editingLog, code_abbr: val })}
                  abbrCodes={abbrCodes}
                  onAddAbbrCode={onAddAbbrCode}
                  lang={lang}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.tripCountLabel}</label>
                <input
                  type="number"
                  className="form-control"
                  value={editingLog.trip_count ?? ''}
                  onChange={e => setEditingLog({ ...editingLog, trip_count: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.m3PerTripLabel}</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={editingLog.cubic_meters_per_trip ?? ''}
                  onChange={e => setEditingLog({ ...editingLog, cubic_meters_per_trip: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.dateLabel}</label>
                <input
                  type="date"
                  className="form-control"
                  value={editingLog.log_date || ''}
                  onChange={e => setEditingLog({ ...editingLog, log_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.scrapSalesInputLabel}</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={editingLog.scrap_sales_amount ?? ''}
                  onChange={e => setEditingLog({ ...editingLog, scrap_sales_amount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '4px' }}>
              <label className="form-label">{t.staffDecisionInputLabel}</label>
              <textarea
                rows={2}
                className="form-control"
                value={editingLog.staff_decisions || ''}
                onChange={e => setEditingLog({ ...editingLog, staff_decisions: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-soil" style={{ flex: 1, padding: '10px' }} onClick={handleEditSave}>
                <Check size={15} /> {lang === 'km' ? 'រក្សាទុក' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setEditingLog(null)}>
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="data-table-wrapper hide-on-mobile">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.thStation}</th>
              <th>{t.thCode}</th>
              <th>{t.thDateRange}</th>
              <th>{t.thTrips}</th>
              <th>{t.thTotalM3}</th>
              <th>{t.thScrapSales}</th>
              <th>{t.thStaffDecision}</th>
              <th>{t.thReceipt}</th>
              <th>{t.thIssues}</th>
              <th style={{ textAlign: 'center' }}>{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>
                  {t.noData}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.station_name}</td>
                  <td>
                    <span className="badge badge-info">{log.code_abbr || 'SL-N/A'}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {log.log_date}<br />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {formatTimeForInput(log.time_start)} - {formatTimeForInput(log.time_end)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.trip_count} {t.tripsUnit}</td>
                  <td style={{ fontWeight: 700, color: 'var(--soil-accent)' }}>
                    {log.total_cubic_meters} m³
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-dim)' }}>
                      ({log.cubic_meters_per_trip} m³/{t.tripsUnit})
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                    ${log.scrap_sales_amount}
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.78rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.7rem', marginBottom: '2px' }}>
                      <UserCheck size={11} /> {log.logged_by || 'Phattra'}:
                    </div>
                    {log.staff_decisions}
                  </td>
                  <td>
                    {log.receipt_photo_url ? (
                      <a href={log.receipt_photo_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}>
                        <ImageIcon size={12} /> {t.receiptLink}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>-</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: log.issues_description ? '#fca5a5' : 'var(--text-dim)' }}>
                    {log.issues_description || '-'}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {deleteConfirmId === log.id ? (
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => { onDelete && onDelete(log.id); setDeleteConfirmId(null); }}
                          style={{ background: '#ef4444', border: 'none', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}
                        >
                          {lang === 'km' ? 'បញ្ជាក់' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{ background: 'var(--border-medium)', border: 'none', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }}
                        >
                          {lang === 'km' ? 'ទេ' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          title={lang === 'km' ? 'កែប្រែ' : 'Edit'}
                          onClick={() => setEditingLog({ ...log })}
                          style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Pencil size={12} /> {lang === 'km' ? 'កែ' : 'Edit'}
                        </button>
                        <button
                          title={lang === 'km' ? 'លុប' : 'Delete'}
                          onClick={() => setDeleteConfirmId(log.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-xs)', padding: '4px 8px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <Trash2 size={12} /> {lang === 'km' ? 'លុប' : 'Del'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Native Cards List (Shown only on Mobile) ── */}
      <div className="mobile-logs-list hide-on-desktop">
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <HardHat size={28} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.85rem' }}>{t.noData}</div>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mobile-log-card">
              <div className="mobile-log-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    {log.code_abbr || 'SL-N/A'}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {log.station_name}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {log.log_date}
                </div>
              </div>

              <div className="mobile-log-card-body">
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.trip_count} {t.tripsUnit} ({log.cubic_meters_per_trip} m³/{t.tripsUnit})
                  </div>
                  {log.staff_decisions && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '3px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{log.logged_by || 'Phattra'}: </span>
                      {log.staff_decisions}
                    </div>
                  )}
                  {log.issues_description && (
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: '2px' }}>
                      ⚠ {log.issues_description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--soil-accent)', lineHeight: 1 }}>
                    {log.total_cubic_meters} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>m³</span>
                  </div>
                  {parseFloat(log.scrap_sales_amount) > 0 && (
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fbbf24', marginTop: '3px' }}>
                      +${log.scrap_sales_amount}
                    </div>
                  )}
                </div>
              </div>

              <div className="mobile-log-card-footer">
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {log.receipt_photo_url && (
                    <a
                      href={log.receipt_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ImageIcon size={11} /> {t.receiptLink}
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingLog({ ...log })}
                    className="mobile-action-btn edit"
                  >
                    <Pencil size={12} color="var(--soil-accent)" />
                    <span>{lang === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(log.id)}
                    className="mobile-action-btn delete"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'km' ? 'លុប' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
