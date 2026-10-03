import React from 'react';
import { translations } from '../../data/translations';

export default function SummaryTable({ lang = 'km' }) {
  const t = translations[lang] || translations.km;

  const summaryRows = lang === 'km' ? [
    {
      section: "ស្ថានីយ៍ចាក់សាំង (Session 1)",
      indicator: "បរិមាណស្តុកពេញ (Stock Capacity)",
      standard: "6,000 L (លីត្រ)",
      status: "កំណត់ជាស្តង់ដារ"
    },
    {
      section: "ស្ថានីយ៍ចាក់សាំង (Session 1)",
      indicator: "កម្រិតត្រូវសុំបន្ថែម (Reorder Threshold)",
      standard: "តិចជាង 4,000 L (លីត្រ)",
      status: "តម្រូវឲ្យរាយការណ៍ភ្លាមៗ"
    },
    {
      section: "ស្ថានីយ៍ចាក់សាំង (Session 1)",
      indicator: "ទិន្នន័យត្រូវកត់ត្រា (Refueling Requirements)",
      standard: "Date, Time In/Out, Volume (L), Sign, មធ្យោបាយ, រូបភាព, អក្សរកាត់/កូដ",
      status: "កត់ត្រាម៉ត់ចត់"
    },
    {
      section: "ស្ថានីយ៍ចាក់ដី (Session 2)",
      indicator: "សូចនាករតាមដាន (Tracking Metrics)",
      standard: "ចំនួនជើងដឹក, បរិមាណម៉ែត្រគូបក្នុងមួយជើង ($m^3$/trip)",
      status: "គណនាយ៉ាងម៉ត់ចត់"
    },
    {
      section: "ស្ថានីយ៍ចាក់ដី (Session 2)",
      indicator: "របាយការណ៍ប្រតិបត្តិការ (Daily Report & Decision)",
      standard: "Date, Time, Amount, m³/per, សកម្មភាពលក់សឡាក់, បញ្ហា, ការសម្រេចចិត្តរបស់បុគ្គលិក",
      status: "របាយការណ៍ប្រចាំថ្ងៃ"
    },
    {
      section: "ស្ថានីយ៍ចាក់ដី (Session 2)",
      indicator: "ការគ្រប់គ្រងឯកសារ និងវិក្កយបត្រ",
      standard: "ប្រមូល និងរក្សាទុកវិក្កយបត្រ (kept the receipt) គ្រប់ករណីនីមួយៗ",
      status: "រក្សាទុកឯកសារ"
    }
  ] : [
    {
      section: "Fuel Station (Session 1)",
      indicator: "Stock Capacity Target",
      standard: "6,000 L (Liters)",
      status: "Standard Capacity"
    },
    {
      section: "Fuel Station (Session 1)",
      indicator: "Reorder Threshold",
      standard: "Below 4,000 L (Liters)",
      status: "Immediate Alert"
    },
    {
      section: "Fuel Station (Session 1)",
      indicator: "Logging Requirements",
      standard: "Date, Time In/Out, Volume (L), Sign, Vehicle Type, Photos, Abbr Codes",
      status: "Mandatory Audit"
    },
    {
      section: "Soil Station (Session 2)",
      indicator: "Tracking Metrics",
      standard: "Trips count completed, Volume capacity per trip ($m^3$/trip)",
      status: "Calculated Daily"
    },
    {
      section: "Soil Station (Session 2)",
      indicator: "Daily Operational Report",
      standard: "Date, Time range, Amount, m³/per, Scrap sales, Issues, Staff Decisions",
      status: "Shift Logging"
    },
    {
      section: "Soil Station (Session 2)",
      indicator: "Receipt Management",
      standard: "Collect and store physical receipt photos (kept receipt) for all transactions",
      status: "Document Audit"
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '18px', marginTop: '20px' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
        {t.sopTitle}
      </h3>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.thSection}</th>
              <th>{t.thIndicator}</th>
              <th>{t.thStandard}</th>
              <th>{t.thStatus}</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, color: row.section.includes('Session 1') || row.section.includes('ចាក់សាំង') ? 'var(--fuel-accent)' : 'var(--soil-accent)' }}>
                  {row.section}
                </td>
                <td style={{ fontWeight: 600, color: '#f8fafc' }}>{row.indicator}</td>
                <td style={{ color: '#cbd5e1' }}>{row.standard}</td>
                <td>
                  <span className="badge badge-info">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
