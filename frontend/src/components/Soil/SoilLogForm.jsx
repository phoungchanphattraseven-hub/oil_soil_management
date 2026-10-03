import React, { useState } from 'react';
import { HardHat, CheckCircle } from 'lucide-react';
import { translations } from '../../data/translations';
import AbbrCodeSelector from '../Common/AbbrCodeSelector';
import ImageUploader from '../Common/ImageUploader';

export default function SoilLogForm({ onAddSoilLog, abbrCodes = [], onAddAbbrCode, lang = 'km' }) {
  const [stationName, setStationName] = useState('ស្ថានីយ៍ចាក់ដី ជ្រោយចង្វារ Site 1');
  const [codeAbbr, setCodeAbbr] = useState('');
  const [tripCount, setTripCount] = useState('');
  const [cubicMetersPerTrip, setCubicMetersPerTrip] = useState('');
  const [scrapSalesAmount, setScrapSalesAmount] = useState('');
  const [staffDecisions, setStaffDecisions] = useState('');
  const [issuesDescription, setIssuesDescription] = useState('');
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeStart, setTimeStart] = useState('07:00');
  const [timeEnd, setTimeEnd] = useState('17:30');
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[lang] || translations.km;

  const totalVolume = (parseFloat(tripCount) || 0) * (parseFloat(cubicMetersPerTrip) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationName || !tripCount || !cubicMetersPerTrip) return;

    const newSoilLog = {
      id: `slog-${Date.now()}`,
      station_name: stationName,
      code_abbr: codeAbbr || 'SL-STN-001',
      logged_by: 'Phattra',
      trip_count: parseInt(tripCount, 10),
      cubic_meters_per_trip: parseFloat(cubicMetersPerTrip),
      total_cubic_meters: totalVolume,
      scrap_sales_amount: parseFloat(scrapSalesAmount) || 0,
      staff_decisions: staffDecisions || (lang === 'km' ? 'សម្រេចចិត្តបន្តប្រតិបត្តិការតាមផែនការធម្មតា' : 'Decided to continue standard schedule'),
      issues_description: issuesDescription || '',
      receipt_photo_url: receiptPhotoUrl || '',
      log_date: logDate,
      time_start: timeStart,
      time_end: timeEnd,
      created_at: new Date().toISOString()
    };

    onAddSoilLog(newSoilLog);

    setCodeAbbr('');
    setTripCount('');
    setCubicMetersPerTrip('');
    setScrapSalesAmount('');
    setStaffDecisions('');
    setIssuesDescription('');
    setReceiptPhotoUrl('');

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '6px', background: 'var(--soil-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--soil-accent)', display: 'flex' }}>
          <HardHat size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.soilFormTitle}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            {lang === 'km' ? 'កត់ត្រាចំនួនជើងដឹក មាឌដី និងការសម្រេចចិត្តរបស់បុគ្គលិក' : 'Record earthwork trips, volume, and staff decisions'}
          </p>
        </div>
      </div>

      {isSuccess && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--success-subtle)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#34d399',
          marginBottom: '16px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{t.soilFormSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Row 1: Station, Code, Date */}
        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">{t.stationNameLabel}</label>
            <input
              type="text"
              className="form-control"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.codeAbbr}</label>
            <AbbrCodeSelector
              value={codeAbbr}
              onChange={setCodeAbbr}
              abbrCodes={abbrCodes}
              onAddAbbrCode={onAddAbbrCode}
              lang={lang}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.dateLabel}</label>
            <input
              type="date"
              className="form-control"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 2: Trips, m3/trip, Total m3 */}
        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">{t.tripCountLabel}</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 24"
              value={tripCount}
              onChange={(e) => setTripCount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.m3PerTripLabel}</label>
            <input
              type="number"
              step="any"
              className="form-control"
              placeholder="e.g. 12.5"
              value={cubicMetersPerTrip}
              onChange={(e) => setCubicMetersPerTrip(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.totalVolumeAuto}</label>
            <input
              type="text"
              className="form-control"
              value={`${totalVolume.toLocaleString()} m³`}
              readOnly
              style={{ background: 'var(--soil-subtle)', color: 'var(--soil-accent)', fontWeight: 700 }}
            />
          </div>
        </div>

        {/* Row 3: Time Range, Scrap Sales */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">{t.timeRangeLabel}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="time"
                className="form-control"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
              />
              <input
                type="time"
                className="form-control"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.scrapSalesInputLabel}</label>
            <input
              type="number"
              step="any"
              className="form-control"
              placeholder="e.g. 150.00"
              value={scrapSalesAmount}
              onChange={(e) => setScrapSalesAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Row 4: Staff Decisions */}
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--primary)' }}>
            {t.staffDecisionInputLabel}
          </label>
          <textarea
            rows={2}
            className="form-control"
            placeholder={lang === 'km' ? "ឧ. សម្រេចចិត្តបន្ថែមឡាន ៣គ្រឿង ដើម្បីបង្កើនល្បឿនការងារ..." : "e.g. Decided to add 3 trucks to speed up operations..."}
            value={staffDecisions}
            onChange={(e) => setStaffDecisions(e.target.value)}
          />
        </div>

        {/* Row 5: Issues, Receipt */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">{t.issuesInputLabel}</label>
            <input
              type="text"
              className="form-control"
              placeholder={lang === 'km' ? "ឧ. ស្ទះចរាចរណ៍ ឬ ភ្លៀងធ្លាក់" : "e.g. Traffic delay or heavy rain"}
              value={issuesDescription}
              onChange={(e) => setIssuesDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <ImageUploader
              value={receiptPhotoUrl}
              onChange={setReceiptPhotoUrl}
              label={t.receiptPhotoUrlLabel || (lang === 'km' ? 'រូបថតវិក្កយបត្រ (Upload Receipt)' : 'Receipt Photo')}
              compact
            />
          </div>
        </div>

        <button type="submit" className="btn btn-soil" style={{ width: '100%', padding: '10px', marginTop: '6px' }}>
          <HardHat size={15} />
          <span>{t.saveSoilLog}</span>
        </button>
      </form>
    </div>
  );
}
