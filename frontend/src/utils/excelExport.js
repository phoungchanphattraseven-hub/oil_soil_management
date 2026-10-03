import * as XLSX from 'xlsx';

/**
 * Export Fuel Logs array to a native .xlsx Excel spreadsheet workbook
 */
export function exportFuelLogsToExcel(logs = [], filename = 'Fuel_Logs_Archive.xlsx', lang = 'km') {
  const isKm = lang === 'km';
  
  if (!logs || logs.length === 0) {
    alert(isKm ? 'គ្មានទិន្នន័យសម្រាប់ទាញយកជា Excel ទេ' : 'No data available to export to Excel.');
    return;
  }

function formatTime12h(timeStr) {
  if (!timeStr) return '';
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

  // Format rows for Excel
  const data = logs.map((log, index) => ({
    [isKm ? 'ល.រ' : 'No.']: index + 1,
    [isKm ? 'កាលបរិច្ឆេទ' : 'Date']: log.log_date || (log.time_in ? log.time_in.substring(0, 10) : ''),
    [isKm ? 'ស្ថានីយ៍សាំង' : 'Station Name']: log.station_name || 'ស្ថានីយ៍សាំង',
    [isKm ? 'ផ្លាកលេខ' : 'License Plate']: log.license_plate || log.code_abbr || '',
    [isKm ? 'អ្នកបើកបរ' : 'Driver Name']: log.driver_name || log.driver || '',
    [isKm ? 'ការពិពណ៌នា' : 'Description']: log.description || 'ឡានចាក់សាំង',
    [isKm ? 'ប្រេងចេញ (L)' : 'Refill Liters (L)']: parseFloat(log.refill_liters) || 0,
    [isKm ? 'ប្រេងចូល (L)' : 'Oil In (L)']: parseFloat(log.oil_in) || 0,
    [isKm ? 'វេន' : 'Shift']: log.shift || 'Morning',
    [isKm ? 'ម៉ោងចូល' : 'Time In']: formatTime12h(log.time_in),
    [isKm ? 'អ្នកកត់ត្រា' : 'Logged By']: log.logged_by || 'Phattra',
    [isKm ? 'ស្ថានភាព' : 'Status']: log.status || 'Completed'
  }));

  // Create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-fit column widths
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length * 2, 16)
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isKm ? 'របាយការណ៍សាំង' : 'Fuel Logs');

  // Trigger browser download of .xlsx
  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
}

/**
 * Export Soil Logs array to a native .xlsx Excel spreadsheet workbook
 */
export function exportSoilLogsToExcel(logs = [], filename = 'Soil_Logs_Archive.xlsx', lang = 'km') {
  const isKm = lang === 'km';

  if (!logs || logs.length === 0) {
    alert(isKm ? 'គ្មានទិន្នន័យសម្រាប់ទាញយកជា Excel ទេ' : 'No data available to export to Excel.');
    return;
  }

  const data = logs.map((log, index) => ({
    [isKm ? 'ល.រ' : 'No.']: index + 1,
    [isKm ? 'កាលបរិច្ឆេទ' : 'Date']: log.log_date || '',
    [isKm ? 'ស្ថានីយ៍ចាក់ដី' : 'Soil Station']: log.station_name || '',
    [isKm ? 'ផ្លាកលេខ' : 'Code/Plate']: log.code_abbr || '',
    [isKm ? 'ចំនួនជើង' : 'Trip Count']: parseInt(log.trip_count, 10) || 0,
    [isKm ? 'មាឌដី១ជើង (m³)' : 'm³ Per Trip']: parseFloat(log.cubic_meters_per_trip) || 0,
    [isKm ? 'មាឌដីសរុប (m³)' : 'Total Volume (m³)']: parseFloat(log.total_cubic_meters) || 0,
    [isKm ? 'លក់សឡាក់ ($)' : 'Scrap Sales ($)']: parseFloat(log.scrap_sales_amount) || 0,
    [isKm ? 'ការសម្រេចចិត្តបុគ្គលិក' : 'Staff Decision']: log.staff_decisions || '',
    [isKm ? 'បញ្ហាជួបប្រទះ' : 'Issues']: log.issues_description || '',
    [isKm ? 'អ្នកកត់ត្រា' : 'Logged By']: log.logged_by || 'Phattra'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, isKm ? 'របាយការណ៍ដី' : 'Soil Logs');
  
  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
}
