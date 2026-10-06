/**
 * dataBackup.js
 * Comprehensive export / import utility for all application data.
 * Covers: fuel stations, fuel logs, soil logs, staff, license plates,
 *         drivers, saved archives, and offline queue.
 */

const BACKUP_VERSION = '1.0';

const STORAGE_KEYS = {
  fuelStations:  'app_fuel_stations',
  fuelLogs:      'app_fuel_logs',
  soilLogs:      'app_soil_logs',
  staff:         'app_staff',
  licensePlates: 'app_license_plates',
  drivers:       'app_drivers',
  archives:      'saved_fuel_table_archives',
  offlineQueue:  'app_offline_queue',
};

/* ─── helpers ─────────────────────────────────────────── */
function readKey(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to write ${key}:`, e);
    return false;
  }
}

/* ─── EXPORT ──────────────────────────────────────────── */
/**
 * Collects every data collection from localStorage and returns
 * a single backup object that can be serialised to JSON.
 */
export function buildBackupPayload() {
  const now = new Date();
  return {
    version:     BACKUP_VERSION,
    exportedAt:  now.toISOString(),
    exportedAtReadable: now.toLocaleString(),
    data: {
      fuelStations:  readKey(STORAGE_KEYS.fuelStations)  ?? [],
      fuelLogs:      readKey(STORAGE_KEYS.fuelLogs)      ?? [],
      soilLogs:      readKey(STORAGE_KEYS.soilLogs)      ?? [],
      staff:         readKey(STORAGE_KEYS.staff)         ?? [],
      licensePlates: readKey(STORAGE_KEYS.licensePlates) ?? [],
      drivers:       readKey(STORAGE_KEYS.drivers)       ?? [],
      archives:      readKey(STORAGE_KEYS.archives)      ?? [],
      offlineQueue:  readKey(STORAGE_KEYS.offlineQueue)  ?? [],
    },
  };
}

/**
 * Triggers a browser download of all app data as a JSON file.
 * @param {string} lang - 'km' | 'en'  (affects filename)
 */
export function exportAllData(lang = 'km') {
  const payload  = buildBackupPayload();
  const blob     = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const date     = new Date().toISOString().substring(0, 10);
  const filename = lang === 'km'
    ? `ទិន្នន័យទាំងអស់_${date}.json`
    : `app_backup_${date}.json`;

  const a  = document.createElement('a');
  a.href   = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Data exported:', {
    fuelStations:  payload.data.fuelStations.length,
    fuelLogs:      payload.data.fuelLogs.length,
    soilLogs:      payload.data.soilLogs.length,
    staff:         payload.data.staff.length,
    archives:      payload.data.archives.length,
  });

  return payload;
}

/* ─── IMPORT ──────────────────────────────────────────── */
/**
 * Validates a parsed backup object before writing to localStorage.
 */
export function validateBackup(parsed) {
  if (!parsed || typeof parsed !== 'object')      return { valid: false, error: 'Invalid file format' };
  if (!parsed.version)                            return { valid: false, error: 'Missing backup version' };
  if (!parsed.data || typeof parsed.data !== 'object') return { valid: false, error: 'Missing data section' };

  const required = ['fuelStations', 'fuelLogs', 'soilLogs', 'staff'];
  for (const key of required) {
    if (!Array.isArray(parsed.data[key])) {
      return { valid: false, error: `Missing or invalid field: ${key}` };
    }
  }
  return { valid: true };
}

/**
 * Writes a validated backup payload back to localStorage and
 * returns state-setter-friendly objects for React.
 * @param {object} payload - parsed backup JSON
 * @param {'replace'|'merge'} mode
 *   replace – overwrites everything with backup data
 *   merge   – keeps existing items unless backup has same id
 */
export function importBackupData(payload, mode = 'replace') {
  const { valid, error } = validateBackup(payload);
  if (!valid) throw new Error(`Invalid backup file: ${error}`);

  const src = payload.data;

  const mergeArrays = (existing, incoming) => {
    if (mode === 'replace') return incoming;
    const ids = new Set(incoming.map(r => r.id).filter(Boolean));
    const uniqueExisting = (existing ?? []).filter(r => !ids.has(r.id));
    return [...incoming, ...uniqueExisting];
  };

  const currentStations  = readKey(STORAGE_KEYS.fuelStations)  ?? [];
  const currentFuelLogs  = readKey(STORAGE_KEYS.fuelLogs)      ?? [];
  const currentSoilLogs  = readKey(STORAGE_KEYS.soilLogs)      ?? [];
  const currentStaff     = readKey(STORAGE_KEYS.staff)         ?? [];
  const currentPlates    = readKey(STORAGE_KEYS.licensePlates) ?? [];
  const currentDrivers   = readKey(STORAGE_KEYS.drivers)       ?? [];
  const currentArchives  = readKey(STORAGE_KEYS.archives)      ?? [];

  const result = {
    fuelStations:  mergeArrays(currentStations, src.fuelStations  ?? []),
    fuelLogs:      mergeArrays(currentFuelLogs, src.fuelLogs      ?? []),
    soilLogs:      mergeArrays(currentSoilLogs, src.soilLogs      ?? []),
    staff:         mergeArrays(currentStaff,    src.staff         ?? []),
    licensePlates: mode === 'replace'
      ? (src.licensePlates ?? currentPlates)
      : [...new Set([...currentPlates, ...(src.licensePlates ?? [])])],
    drivers: mode === 'replace'
      ? (src.drivers ?? currentDrivers)
      : [...new Set([...currentDrivers, ...(src.drivers ?? [])])],
    archives:      mergeArrays(currentArchives, src.archives ?? []),
  };

  // Persist everything back to localStorage
  writeKey(STORAGE_KEYS.fuelStations,  result.fuelStations);
  writeKey(STORAGE_KEYS.fuelLogs,      result.fuelLogs);
  writeKey(STORAGE_KEYS.soilLogs,      result.soilLogs);
  writeKey(STORAGE_KEYS.staff,         result.staff);
  writeKey(STORAGE_KEYS.licensePlates, result.licensePlates);
  writeKey(STORAGE_KEYS.drivers,       result.drivers);
  writeKey(STORAGE_KEYS.archives,      result.archives);

  console.log('Data imported:', {
    fuelStations:  result.fuelStations.length,
    fuelLogs:      result.fuelLogs.length,
    soilLogs:      result.soilLogs.length,
    staff:         result.staff.length,
    archives:      result.archives.length,
    mode,
  });

  return result;
}

/**
 * Opens a file-picker, reads the chosen JSON file, validates it,
 * imports it and returns the resulting data collections.
 * @returns {Promise<{result: object, meta: object}>}
 */
export function importFromFile(mode = 'replace') {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json,application/json';

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return reject(new Error('No file selected'));

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          const result = importBackupData(parsed, mode);
          resolve({
            result,
            meta: {
              exportedAt: parsed.exportedAt,
              version:    parsed.version,
              filename:   file.name,
            },
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}

/* ─── CLEAR ───────────────────────────────────────────── */
/**
 * Wipes all application data from localStorage.
 * Use with caution — intended for dev / reset flows.
 */
export function clearAllLocalData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  console.warn('All local application data has been cleared.');
}

/* ─── SUMMARY ─────────────────────────────────────────── */
/**
 * Returns a quick summary of what is currently stored in localStorage.
 */
export function getLocalDataSummary() {
  return {
    fuelStations:  (readKey(STORAGE_KEYS.fuelStations)  ?? []).length,
    fuelLogs:      (readKey(STORAGE_KEYS.fuelLogs)      ?? []).length,
    soilLogs:      (readKey(STORAGE_KEYS.soilLogs)      ?? []).length,
    staff:         (readKey(STORAGE_KEYS.staff)         ?? []).length,
    licensePlates: (readKey(STORAGE_KEYS.licensePlates) ?? []).length,
    drivers:       (readKey(STORAGE_KEYS.drivers)       ?? []).length,
    archives:      (readKey(STORAGE_KEYS.archives)      ?? []).length,
    offlineQueue:  (readKey(STORAGE_KEYS.offlineQueue)  ?? []).length,
  };
}
