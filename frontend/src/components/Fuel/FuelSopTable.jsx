import React from 'react';
import { ShieldCheck, FileCheck, AlertCircle, CheckCircle2, Clock, Droplets, UserCheck, FileText } from 'lucide-react';

export default function FuelSopTable({ stations = [], fuelLogs = [], lang = 'km' }) {
  const lowStockCount = stations.filter(s => s.current_stock_liters < s.reorder_threshold_liters).length;
  const signedLogsCount = fuelLogs.filter(l => l.signature_url).length;

  const sopItems = [
    {
      id: 'SOP-01',
      section: lang === 'km' ? '១. បទដ្ឋានកម្រិតស្តុក' : '1. Inventory Safety Threshold',
      indicator: lang === 'km' ? 'កម្រិត Reorder Threshold (4,000 L)' : 'Reorder Threshold (4,000 L)',
      standard: lang === 'km' ? 'ស្តុកសរុប target 6,000 L។ ប្រសិនស្តុកទាបជាង 4,000 L ត្រូវរាយការណ៍សុំសាំងបន្ថែមភ្លាមៗ។' : 'Target capacity 6,000 L. If below 4,000 L, immediately report for replenishment.',
      status: lowStockCount > 0 ? (lang === 'km' ? 'មានស្ថានីយ៍ត្រូវសុំសាំង' : 'Action Required') : (lang === 'km' ? 'បទដ្ឋានធម្មតា' : 'Fully Compliant'),
      badgeClass: lowStockCount > 0 ? 'badge-danger' : 'badge-success'
    },
    {
      id: 'SOP-02',
      section: lang === 'km' ? '២. ការផ្ទៀងផ្ទាត់ផ្លាកលេខ និងហត្ថលេខា' : '2. Vehicle Plate & Digital Sign Verification',
      indicator: lang === 'km' ? 'ផ្លាកលេខ + អ្នកបើកបរ + ហត្ថលេខា' : 'Plate + Driver + Digital Sign',
      standard: lang === 'km' ? 'រាល់ប្រតិបត្តិការចាក់សាំងត្រូវមានផ្លាកលេខ ឈ្មោះអ្នកបើកបរ និងរូបភាពហត្ថលេខាឌីជីថលជាចាំបាច់។' : 'All refueling logs must contain license plate, driver name, and digital signature.',
      status: `${signedLogsCount}/${fuelLogs.length} ${lang === 'km' ? 'មានហត្ថលេខា' : 'signed'}`,
      badgeClass: 'badge-info'
    },
    {
      id: 'SOP-03',
      section: lang === 'km' ? '៣. ម៉ោងប្រតិបត្តិការ និងការបែងចែកវេន' : '3. Shift Allocation & Log Precision',
      indicator: lang === 'km' ? 'វេនព្រឹក & វេនរសៀល' : 'Morning & Afternoon Shifts',
      standard: lang === 'km' ? 'វេនព្រឹក (07:00-12:00) និង វេនរសៀល (13:00-18:00) ត្រូវកត់ត្រាម៉ោង Time-In ឲ្យបានច្បាស់លាស់។' : 'Morning (07:00-12:00) and Afternoon (13:00-18:00) with precise timestamp logging.',
      status: lang === 'km' ? 'អនុវត្តបានត្រឹមត្រូវ' : 'Standard Operational',
      badgeClass: 'badge-success'
    },
    {
      id: 'SOP-04',
      section: lang === 'km' ? '៤. ការរក្សាទុកប័ណ្ណ និងចេញឯកសារ' : '4. Official Document & Audit Archive',
      indicator: lang === 'km' ? 'ឯកសារបោះពុម្ព A4 ផ្លូវការ' : 'Official Printable A4 Document',
      standard: lang === 'km' ? 'តារាងប្រចាំថ្ងៃត្រូវរក្សាទុកក្នុងប័ណ្ណ Archive និងអាចទាញយកជាឯកសារ A4 មានត្រា និងហត្ថលេខាផ្លូវការ។' : 'Daily tables saved to archive ledger and exportable to official A4 PDF reports.',
      status: lang === 'km' ? 'រួចរាល់' : 'Active System',
      badgeClass: 'badge-success'
    }
  ];

  return (
    <div className="card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'var(--primary-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--primary)', display: 'flex' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
              {lang === 'km' ? 'តារាងសង្ខេបបទដ្ឋានប្រតិបត្តិការសវនកម្ម (SOP Section 4 Summary Table)' : 'Standard Operational Summary & Audit Matrix (SOP Section 4)'}
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
              {lang === 'km' ? 'បទដ្ឋានបច្ចេកទេសផ្លូវការសម្រាប់ប្រតិបត្តិការចាក់សាំង និងសវនកម្មស្តុក' : 'Official enterprise standards for refueling operations & audit compliance'}
            </p>
          </div>
        </div>

        <span className="badge badge-info" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
          REF: SOP-STATION-2026
        </span>
      </div>

      {/* Table */}
      <div className="data-table-wrapper" style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--r-sm)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>{lang === 'km' ? 'ផ្នែក / ប្រធានបទ' : 'Section / Topic'}</th>
              <th>{lang === 'km' ? 'សូចនាករ / ព័ត៌មានសំខាន់' : 'Indicator / Key Spec'}</th>
              <th>{lang === 'km' ? 'បទដ្ឋាន និងសកម្មភាពត្រូវអនុវត្ត' : 'Standard & Action SOP'}</th>
              <th style={{ width: '150px', textAlign: 'center' }}>{lang === 'km' ? 'ស្ថានភាពអនុវត្ត' : 'Audit Status'}</th>
            </tr>
          </thead>
          <tbody>
            {sopItems.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--primary)' }} className="font-mono">
                  {item.id}
                </td>
                <td style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                  {item.section}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                  {item.indicator}
                </td>
                <td style={{ fontSize: '0.79rem', color: 'var(--text-sub)' }}>
                  {item.standard}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
