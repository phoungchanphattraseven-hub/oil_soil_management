import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import FuelManagement from './pages/FuelManagement';
import SoilManagement from './pages/SoilManagement';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UserFuelPage from './pages/UserFuelPage';
import UserSoilPage from './pages/UserSoilPage';
import { MOCK_USERS, DEFAULT_FUEL_STATIONS, INITIAL_FUEL_LOGS, INITIAL_SOIL_LOGS, DEFAULT_ABBR_CODES, DEFAULT_DRIVERS } from './data/mockData';
import { exportAllData, importFromFile } from './utils/dataBackup';
import './utils/testValidation'; // Load test utilities into window object
import './utils/authTest'; // Load authentication test utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

function getStoredFuelStations() {
  try {
    const raw = localStorage.getItem('app_fuel_stations');
    return raw ? JSON.parse(raw) : DEFAULT_FUEL_STATIONS;
  } catch { return DEFAULT_FUEL_STATIONS; }
}

function getStoredOfflineQueue() {
  try {
    const raw = localStorage.getItem('app_offline_queue');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getStoredSoilLogs() {
  try {
    const raw = localStorage.getItem('app_soil_logs');
    return raw ? JSON.parse(raw) : INITIAL_SOIL_LOGS;
  } catch { return INITIAL_SOIL_LOGS; }
}

function getStoredFuelLogs() {
  try {
    const raw = localStorage.getItem('app_fuel_logs');
    return raw ? JSON.parse(raw) : INITIAL_FUEL_LOGS;
  } catch { return INITIAL_FUEL_LOGS; }
}

function getStoredAbbrCodes() {
  try {
    const raw = localStorage.getItem('app_license_plates');
    return raw ? JSON.parse(raw) : DEFAULT_ABBR_CODES;
  } catch { return DEFAULT_ABBR_CODES; }
}

function getStoredDrivers() {
  try {
    const raw = localStorage.getItem('app_drivers');
    return raw ? JSON.parse(raw) : DEFAULT_DRIVERS;
  } catch { return DEFAULT_DRIVERS; }
}

function getStoredStaff() {
  try {
    const raw = localStorage.getItem('app_staff');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getStoredArchives() {
  try {
    const raw = localStorage.getItem('saved_fuel_table_archives');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function isSessionValid() {
  try {
    const token   = localStorage.getItem('app_session_token');
    const expiry  = parseInt(localStorage.getItem('app_session_expiry') || '0', 10);
    return !!(token && expiry && Date.now() < expiry);
  } catch { return false; }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(isSessionValid);
  const [sessionEmail, setSessionEmail] = useState(() => {
    try { return localStorage.getItem('app_session_email') || ''; } catch { return ''; }
  });
  const [userRole, setUserRole] = useState(() => {
    try { return localStorage.getItem('app_user_role') || 'admin'; } catch { return 'admin'; }
  });
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem('app_user_name') || ''; } catch { return ''; }
  });
  const [userAssignedStation, setUserAssignedStation] = useState(() => {
    try {
      return {
        id: localStorage.getItem('app_user_station_id') || '',
        name: localStorage.getItem('app_user_station_name') || ''
      };
    } catch { return { id: '', name: '' }; }
  });
  const [activeRole, setActiveRole] = useState('admin');
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('app_lang') || 'km'; }
    catch { return 'km'; }
  }); // Language state: 'km' | 'en'
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('app_theme') || 'dark'; }
    catch { return 'dark'; }
  });
  const [fuelStations, setFuelStations] = useState(getStoredFuelStations);
  const [fuelLogs, setFuelLogs] = useState(getStoredFuelLogs);
  const [soilLogs, setSoilLogs] = useState(getStoredSoilLogs);
  const [abbrCodes, setAbbrCodes] = useState(getStoredAbbrCodes);
  const [drivers, setDrivers] = useState(getStoredDrivers);
  const [staff, setStaff] = useState(getStoredStaff);
  const [savedArchives, setSavedArchives] = useState(getStoredArchives);
  const [offlineQueue, setOfflineQueue] = useState(getStoredOfflineQueue);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleLoginSuccess = (email, userData) => {
    setSessionEmail(email);
    if (userData) {
      setUserRole(userData.role || 'user');
      setUserName(userData.name || '');
      localStorage.setItem('app_user_role', userData.role || 'user');
      localStorage.setItem('app_user_name', userData.name || '');

      // Look up station assignment from locally managed users
      const stationId   = userData.assigned_station_id   || '';
      const stationName = userData.assigned_station_name || '';

      // If not in userData directly, try finding in app_managed_users
      if (!stationId) {
        try {
          const managed = JSON.parse(localStorage.getItem('app_managed_users') || '[]');
          const match = managed.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (match) {
            localStorage.setItem('app_user_station_id',   match.assigned_station_id   || '');
            localStorage.setItem('app_user_station_name', match.assigned_station_name || '');
            setUserAssignedStation({
              id:   match.assigned_station_id   || '',
              name: match.assigned_station_name || ''
            });
          }
        } catch (_) {}
      } else {
        localStorage.setItem('app_user_station_id',   stationId);
        localStorage.setItem('app_user_station_name', stationName);
        setUserAssignedStation({ id: stationId, name: stationName });
      }
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('app_session_token');
      localStorage.removeItem('app_session_email');
      localStorage.removeItem('app_session_expiry');
      localStorage.removeItem('app_user_role');
      localStorage.removeItem('app_user_name');
      localStorage.removeItem('app_user_station_id');
      localStorage.removeItem('app_user_station_name');
    } catch {}
    setIsAuthenticated(false);
    setSessionEmail('');
    setUserRole('user');
    setUserName('');
    setUserAssignedStation({ id: '', name: '' });
  };

  // Auth guard — set but NOT early-returned here (hooks must run first)
  const needsLogin = !isAuthenticated;

  // Sync savedArchives to localStorage
  useEffect(() => {
    try { localStorage.setItem('saved_fuel_table_archives', JSON.stringify(savedArchives)); }
    catch (e) { console.error(e); }
  }, [savedArchives]);

  // Sync theme to document element and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    try { localStorage.setItem('app_theme', theme); }
    catch (e) { console.error(e); }
  }, [theme]);

  // Sync language to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_lang', lang); }
    catch (e) { console.error(e); }
  }, [lang]);

  // Sync license plates to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_license_plates', JSON.stringify(abbrCodes)); }
    catch (e) { console.error(e); }
  }, [abbrCodes]);

  // Sync drivers to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_drivers', JSON.stringify(drivers)); }
    catch (e) { console.error(e); }
  }, [drivers]);

  // Sync staff to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_staff', JSON.stringify(staff)); }
    catch (e) { console.error(e); }
  }, [staff]);

  // Sync fuel logs to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_fuel_logs', JSON.stringify(fuelLogs)); }
    catch (e) { console.error('Failed to save fuel logs to localStorage:', e); }
  }, [fuelLogs]);

  // Sync soil logs to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_soil_logs', JSON.stringify(soilLogs)); }
    catch (e) { console.error('Failed to save soil logs to localStorage:', e); }
  }, [soilLogs]);

  // Sync fuel stations to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_fuel_stations', JSON.stringify(fuelStations)); }
    catch (e) { console.error('Failed to save fuel stations to localStorage:', e); }
  }, [fuelStations]);

  // Sync offline queue to localStorage
  useEffect(() => {
    try { localStorage.setItem('app_offline_queue', JSON.stringify(offlineQueue)); }
    catch (e) { console.error('Failed to save offline queue to localStorage:', e); }
  }, [offlineQueue]);

  // Online/Offline status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Network connection restored - processing offline queue');
      processOfflineQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Network connection lost - enabling offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process offline queue when connection is restored  
  const processOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    console.log(`Processing ${offlineQueue.length} queued requests...`);
    const processedIds = [];

    for (const queueItem of offlineQueue) {
      try {
        const response = await fetch(queueItem.url, {
          method: queueItem.method,
          headers: queueItem.headers,
          body: queueItem.body
        });

        if (response.ok) {
          console.log(`Successfully synced queued ${queueItem.type}:`, queueItem.id);
          processedIds.push(queueItem.id);
        } else {
          console.warn(`Failed to sync queued ${queueItem.type}:`, response.status);
        }
      } catch (error) {
        console.error(`Error syncing queued ${queueItem.type}:`, error);
      }
    }

    // Remove successfully processed items from queue
    if (processedIds.length > 0) {
      setOfflineQueue(prev => prev.filter(item => !processedIds.includes(item.id)));
    }
  };

  // Helper function to add API request to offline queue
  const addToOfflineQueue = (type, url, method, headers, body, data) => {
    const queueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      url,
      method,
      headers,
      body,
      data,
      timestamp: new Date().toISOString()
    };

    setOfflineQueue(prev => [...prev, queueItem]);
    console.log(`Added ${type} to offline queue:`, queueItem.id);
    return queueItem.id;
  };

  // Enhanced API call wrapper with offline support
  const makeApiCall = async (type, url, method = 'POST', data = null, onSuccess = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const body = data ? JSON.stringify(data) : null;

    try {
      const response = await fetch(url, { method, headers, body });
      
      if (response.ok) {
        const result = await response.json();
        if (onSuccess) onSuccess(result);
        return { success: true, data: result };
      } else {
        throw new Error(`API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`API call failed for ${type}, adding to offline queue:`, error.message);
      
      // Add to offline queue if we're offline or API call failed
      if (!isOnline || error.message.includes('fetch')) {
        addToOfflineQueue(type, url, method, headers, body, data);
        return { success: false, queued: true, error: error.message };
      }
      
      return { success: false, queued: false, error: error.message };
    }
  };

  // Handlers: Manage license plates (abbr codes)
  const handleAddAbbrCode = (code) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed && !abbrCodes.includes(trimmed)) {
      setAbbrCodes(prev => [...prev, trimmed]);
    }
  };

  const handleDeleteAbbrCode = (code) => {
    setAbbrCodes(prev => prev.filter(c => c !== code));
  };

  // Handlers: Manage driver names
  const handleAddDriver = (name) => {
    const trimmed = name.trim();
    if (trimmed && !drivers.includes(trimmed)) {
      setDrivers(prev => [...prev, trimmed]);
    }
  };

  const handleDeleteDriver = (name) => {
    setDrivers(prev => prev.filter(d => d !== name));
  };

  // Handlers: Manage staff — synced with backend API
  const toStaffApiData = (member) => ({
    name: member.name,
    staff_id: member.staff_id || '',
    gender: member.gender || 'Male',
    station_name: member.working_at || member.station_name || '',
    license_plate: member.license_plate || '',
    phone: member.phone || '',
    role: member.role || '',
    photo_url: member.photo_url || '',
    signature_url: member.signature_url || '',
  });

  const handleAddStaff = async (member) => {
    // Optimistic update
    setStaff(prev => [member, ...prev]);

    const apiData = toStaffApiData(member);

    const result = await makeApiCall(
      'staff',
      `${API_BASE_URL}/staff`,
      'POST',
      apiData,
      (resData) => {
        if (resData.data && resData.data[0]) {
          // Replace local temp id with real Supabase UUID
          // Map station_name back to working_at for UI compatibility
          const created = resData.data[0];
          const normalized = { ...created, working_at: created.station_name || created.working_at || '' };
          setStaff(prev => prev.map(s => s.id === member.id ? normalized : s));
        }
      }
    );

    if (result.queued) {
      console.log('Staff member saved locally and queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to save staff member:', result.error);
    }
    return result;
  };

  const handleEditStaff = async (updated) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));

    const apiData = toStaffApiData(updated);
    const isSupabaseRecord = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(updated.id || '');
    const method = isSupabaseRecord ? 'PUT' : 'POST';
    const url = isSupabaseRecord ? `${API_BASE_URL}/staff/${updated.id}` : `${API_BASE_URL}/staff`;

    const result = await makeApiCall(
      isSupabaseRecord ? 'edit_staff' : 'staff',
      url,
      method,
      apiData,
      (resData) => {
        if (resData.data && resData.data[0]) {
          const saved = resData.data[0];
          const normalized = { ...saved, working_at: saved.station_name || saved.working_at || '' };
          setStaff(prev => prev.map(s => s.id === updated.id ? normalized : s));
        }
      }
    );

    if (result.queued) {
      console.log('Staff edit queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to edit staff member:', result.error);
    }
    return result;
  };

  const handleDeleteStaff = async (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));

    const result = await makeApiCall(
      'delete_staff',
      `${API_BASE_URL}/staff/${id}`,
      'DELETE',
      null
    );

    if (result.queued) {
      console.log('Staff deletion queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to delete staff member:', result.error);
    }
  };

  // Handler: Save scanned digital signature for Staff or Fleet/Driver
  const handleSaveSignature = (targetId, signatureDataUrl, type = 'staff') => {
    if (type === 'staff') {
      const existing = staff.find(s => s.id === targetId);
      if (existing) {
        handleEditStaff({ ...existing, signature_url: signatureDataUrl });
      }
    } else {
      // Driver / Fleet signature update
      setDrivers(prev => prev.map(d => {
        if (typeof d === 'string') {
          return d === targetId ? { name: d, signature_url: signatureDataUrl } : d;
        } else if (d && (d.id === targetId || d.name === targetId)) {
          return { ...d, signature_url: signatureDataUrl };
        }
        return d;
      }));
    }
  };

  // Data initialization and recovery on app startup
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing application data from backend...');
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`, { cache: 'no-store' });
        const data = await response.json();

        console.log('Backend connected — loading fresh data');

        if (data.stations && Array.isArray(data.stations) && data.stations.length > 0) {
          const mapped = data.stations.map(s => ({
            ...s,
            name: s.name || s.station_name || 'Station',
            status: s.current_stock_liters < s.reorder_threshold_liters ? 'Reorder Needed' : 'Normal'
          }));
          setFuelStations(mapped);
        }
        if (data.fuel_logs && Array.isArray(data.fuel_logs) && data.fuel_logs.length > 0) {
          setFuelLogs(data.fuel_logs);
        }
        if (data.soil_logs && Array.isArray(data.soil_logs) && data.soil_logs.length > 0) {
          setSoilLogs(data.soil_logs);
        }
        if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
          // Normalize: map station_name → working_at for UI compatibility
          const normalized = data.staff.map(s => ({ ...s, working_at: s.station_name || s.working_at || '' }));
          setStaff(normalized);
        }
        if (data.archives && Array.isArray(data.archives) && data.archives.length > 0) {
          const normalizedArchives = data.archives.map(a => ({
            id: a.id || a.archive_ref,
            date: a.archive_date || a.date,
            saved_at: a.saved_at || '',
            total_liters: parseFloat(a.total_liters) || 0,
            logs: Array.isArray(a.logs) ? a.logs : []
          }));
          setSavedArchives(normalizedArchives);
        }

        setIsOnline(true);
        // Flush any offline queue items that accumulated while offline
        setTimeout(() => processOfflineQueue(), 1500);

      } catch (err) {
        console.warn('Backend unavailable — recovering all data from localStorage:', err.message);

        // Restore every data type from localStorage backup
        const localStations  = getStoredFuelStations();
        const localFuelLogs  = getStoredFuelLogs();
        const localSoilLogs  = getStoredSoilLogs();
        const localStaff     = getStoredStaff();

        if (localStations.length > 0)  setFuelStations(localStations);
        if (localFuelLogs.length > 0)  setFuelLogs(localFuelLogs);
        if (localSoilLogs.length > 0)  setSoilLogs(localSoilLogs);
        if (localStaff.length > 0)     setStaff(localStaff);

        setIsOnline(false);
        console.log('Recovered from localStorage —', {
          stations: localStations.length,
          fuelLogs: localFuelLogs.length,
          soilLogs: localSoilLogs.length,
          staff: localStaff.length
        });

        // Retry backend every 30 s (stop after 10 min)
        let attempts = 0;
        const retryId = setInterval(async () => {
          attempts++;
          try {
            const retryRes = await fetch(`${API_BASE_URL}/dashboard/summary`, { cache: 'no-store' });
            if (retryRes.ok) {
              clearInterval(retryId);
              setIsOnline(true);
              console.log('Backend restored after', attempts, 'retry attempt(s)');
              initializeData(); // full re-sync now that backend is back
            }
          } catch (_) {
            if (attempts >= 20) clearInterval(retryId); // give up after ~10 min
          }
        }, 30000);
      }
    };

    initializeData();
  }, []);

  // Frequent dashboard sync lets reports submitted by other users appear without a refresh.
  useEffect(() => {
    if (!isOnline) return;

    let syncInProgress = false;
    const syncDashboard = async () => {
      if (syncInProgress) return;
      syncInProgress = true;
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Dashboard sync failed: ${res.status}`);
        const data = await res.json();

        // Merge: prefer backend records but keep any local-only entries
        const mergeById = (backendArr, localArr) => {
          if (!backendArr?.length) return localArr;
          const ids = new Set(backendArr.map(r => r.id));
          const localOnly = localArr.filter(r => !ids.has(r.id));
          return [...backendArr, ...localOnly];
        };

        if (data.stations?.length > 0) {
          setFuelStations(mergeById(data.stations, []).map(s => ({
            ...s,
            name: s.name || s.station_name || 'Station',
            status: s.current_stock_liters < s.reorder_threshold_liters ? 'Reorder Needed' : 'Normal'
          })));
        }
        if (data.fuel_logs?.length > 0) {
          setFuelLogs(prev => mergeById(data.fuel_logs, prev)
            .sort((a, b) => new Date(b.created_at || b.time_in) - new Date(a.created_at || a.time_in)));
        }
        if (data.soil_logs?.length > 0) {
          setSoilLogs(prev => mergeById(data.soil_logs, prev)
            .sort((a, b) => new Date(b.created_at || b.log_date) - new Date(a.created_at || a.log_date)));
        }
        if (data.staff?.length > 0) {
          const normalized = data.staff.map(s => ({ ...s, working_at: s.station_name || s.working_at || '' }));
          setStaff(prev => mergeById(normalized, prev));
        }

        await processOfflineQueue();
      } catch (e) {
        console.warn('Periodic sync failed:', e.message);
        setIsOnline(false);
      } finally {
        syncInProgress = false;
      }
    };

    const syncWhenActive = () => {
      if (document.visibilityState === 'visible') syncDashboard();
    };

    const syncId = setInterval(syncDashboard, 10000); // every 10 seconds while open
    window.addEventListener('focus', syncDashboard);
    document.addEventListener('visibilitychange', syncWhenActive);

    return () => {
      clearInterval(syncId);
      window.removeEventListener('focus', syncDashboard);
      document.removeEventListener('visibilitychange', syncWhenActive);
    };
  }, [isOnline]);

  // Reorder threshold low stock stations count (< 4,000 L)
  const alertCount = fuelStations.filter(s => s.current_stock_liters < s.reorder_threshold_liters).length;

  // Handler: Add new station
  const handleAddStation = async (newStation) => {
    setFuelStations(prev => [...prev, newStation]);

    const apiData = {
      name: newStation.name,
      location: newStation.location,
      current_stock_liters: newStation.current_stock_liters,
      target_capacity_liters: newStation.target_capacity_liters,
      reorder_threshold_liters: newStation.reorder_threshold_liters
    };

    const result = await makeApiCall(
      'fuel_station',
      `${API_BASE_URL}/fuel/station`,
      'POST',
      apiData,
      (resData) => {
        if (resData.data && resData.data[0]) {
          const created = {
            ...resData.data[0],
            name: resData.data[0].station_name || newStation.name
          };
          setFuelStations(prev => [...prev.filter(s => s.id !== newStation.id), created]);
        }
      }
    );

    if (result.queued) {
      console.log('Fuel station saved locally and queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to save fuel station:', result.error);
    }
  };

  const handleEditStation = async (updatedStation) => {
    setFuelStations(prev => prev.map(station => station.id === updatedStation.id ? updatedStation : station));
    const apiData = {
      name: updatedStation.name || updatedStation.station_name,
      location: updatedStation.location || '',
      current_stock_liters: Number(updatedStation.current_stock_liters) || 0,
      target_capacity_liters: Number(updatedStation.target_capacity_liters) || 0,
      reorder_threshold_liters: Number(updatedStation.reorder_threshold_liters) || 0
    };
    const result = await makeApiCall(
      'edit_station',
      `${API_BASE_URL}/fuel/station/${updatedStation.id}`,
      'PUT',
      apiData,
      (resData) => {
        if (resData.data?.[0]) {
          const saved = { ...resData.data[0], name: resData.data[0].station_name || apiData.name };
          setFuelStations(prev => prev.map(station => station.id === updatedStation.id ? saved : station));
        }
      }
    );
    if (!result.success && !result.queued) console.error('Failed to update station:', result.error);
    return result;
  };

  // Handler: Delete a station
  const handleDeleteStation = async (stationId) => {
    setFuelStations(prev => prev.filter(s => s.id !== stationId));

    const result = await makeApiCall(
      'delete_station',
      `${API_BASE_URL}/fuel/station/${stationId}`,
      'DELETE',
      null,
      (resData) => {
        console.log('Station deleted successfully:', resData);
      }
    );

    if (result.queued) {
      console.log('Station deletion queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to delete station:', result.error);
    }
  };

  // Helper to match station by ID (string/number) or station_name flexibly
  const isSameStation = (station, targetId, targetName) => {
    if (!station) return false;
    if (targetId && (station.id === targetId || String(station.id) === String(targetId))) return true;
    if (targetName) {
      const sName = String(station.name || station.station_name || '').trim().toLowerCase();
      const tName = String(targetName).trim().toLowerCase();
      if (sName && tName && sName === tName) return true;
    }
    return false;
  };

  // Handler: Add new fuel log and update station stock in real time
  const handleAddFuelLog = async (newLog) => {
    setFuelLogs(prev => [newLog, ...prev]);

    const oilOut = parseFloat(newLog.refill_liters) || 0;
    const oilIn  = parseFloat(newLog.oil_in) || 0;

    // Deduct oil spent (refill_liters) and add oil received (oil_in) to station stock
    setFuelStations(prevStations => {
      let matched = false;
      const updated = prevStations.map(station => {
        if (isSameStation(station, newLog.station_id, newLog.station_name)) {
          matched = true;
          const current = parseFloat(station.current_stock_liters) || 0;
          const updatedStock = Math.max(0, current - oilOut + oilIn);
          return {
            ...station,
            current_stock_liters: updatedStock,
            status: updatedStock < (station.reorder_threshold_liters || 4000) ? 'Reorder Needed' : 'Normal',
            last_refill: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return station;
      });

      // If no station matched explicitly, update the first station by default
      if (!matched && prevStations.length > 0) {
        return prevStations.map((st, idx) => {
          if (idx === 0) {
            const current = parseFloat(st.current_stock_liters) || 0;
            const updatedStock = Math.max(0, current - oilOut + oilIn);
            return {
              ...st,
              current_stock_liters: updatedStock,
              status: updatedStock < (st.reorder_threshold_liters || 4000) ? 'Reorder Needed' : 'Normal'
            };
          }
          return st;
        });
      }
      return updated;
    });

    // Send log to backend API with offline queue support
    const apiData = {
      station_id: newLog.station_id,
      station_name: newLog.station_name,
      logged_by: activeRole === 'admin' ? 'user-admin-01' : 'user-phattra-02',
      log_date: newLog.log_date,
      description: newLog.description,
      driver_name: newLog.driver_name,
      license_plate: newLog.license_plate,
      refill_liters: newLog.refill_liters,
      oil_in: newLog.oil_in,
      time_in: newLog.time_in,
      time_out: newLog.time_out,
      shift: newLog.shift,
      code_abbr: newLog.code_abbr,
      photo_url: newLog.photo_url,
      signature_url: newLog.signature_url
    };

    const result = await makeApiCall(
      'fuel_log',
      `${API_BASE_URL}/fuel/log`,
      'POST',
      apiData,
      (resData) => {
        if (resData.data && resData.data[0]) {
          const createdLog = {
            ...newLog,
            ...resData.data[0]
          };
          setFuelLogs(prev => [...prev.filter(l => l.id !== newLog.id), createdLog]);
        }
      }
    );

    if (result.queued) {
      console.log('Fuel log saved locally and queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to save fuel log:', result.error);
    }
    return result;
  };

  // Handler: Delete a fuel log and restore stock in real time
  const handleDeleteFuelLog = (logId) => {
    const log = fuelLogs.find(l => l.id === logId);
    if (!log) return;
    setFuelLogs(prev => prev.filter(l => l.id !== logId));

    const oilOut = parseFloat(log.refill_liters) || 0;
    const oilIn  = parseFloat(log.oil_in) || 0;

    setFuelStations(prev => {
      let matched = false;
      const updated = prev.map(s => {
        if (isSameStation(s, log.station_id, log.station_name)) {
          matched = true;
          const current = parseFloat(s.current_stock_liters) || 0;
          const restored = Math.max(0, current + oilOut - oilIn);
          return { ...s, current_stock_liters: restored, status: restored < (s.reorder_threshold_liters || 4000) ? 'Reorder Needed' : 'Normal' };
        }
        return s;
      });
      if (!matched && prev.length > 0) {
        return prev.map((s, idx) => {
          if (idx === 0) {
            const current = parseFloat(s.current_stock_liters) || 0;
            const restored = Math.max(0, current + oilOut - oilIn);
            return { ...s, current_stock_liters: restored };
          }
          return s;
        });
      }
      return updated;
    });

    // Delete from Supabase via backend API
    fetch(`${API_BASE_URL}/fuel/log/${logId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(resData => console.log('Fuel log deleted from Supabase:', resData))
      .catch(e => console.log('Backend sync offline, removed locally.'));
  };

  // Handler: Edit a fuel log (replaces old, adjusts stock delta in real time)
  const handleEditFuelLog = (updatedLog) => {
    const old = fuelLogs.find(l => l.id === updatedLog.id);
    if (!old) return;
    setFuelLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));

    const oldOut = parseFloat(old.refill_liters) || 0;
    const oldIn  = parseFloat(old.oil_in) || 0;
    const newOut = parseFloat(updatedLog.refill_liters) || 0;
    const newIn  = parseFloat(updatedLog.oil_in) || 0;
    const delta  = (oldOut - oldIn) - (newOut - newIn); // net change to restore

    setFuelStations(prev => {
      let matched = false;
      const updated = prev.map(s => {
        if (isSameStation(s, updatedLog.station_id, updatedLog.station_name)) {
          matched = true;
          const current = parseFloat(s.current_stock_liters) || 0;
          const adjusted = Math.max(0, current + delta);
          return { ...s, current_stock_liters: adjusted, status: adjusted < (s.reorder_threshold_liters || 4000) ? 'Reorder Needed' : 'Normal' };
        }
        return s;
      });
      if (!matched && prev.length > 0) {
        return prev.map((s, idx) => {
          if (idx === 0) {
            const current = parseFloat(s.current_stock_liters) || 0;
            const adjusted = Math.max(0, current + delta);
            return { ...s, current_stock_liters: adjusted };
          }
          return s;
        });
      }
      return updated;
    });

    // Persist edit to backend (Supabase via API)
    fetch(`${API_BASE_URL}/fuel/log/${updatedLog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: updatedLog.station_id,
        station_name: updatedLog.station_name,
        log_date: updatedLog.log_date,
        description: updatedLog.description,
        driver_name: updatedLog.driver_name,
        license_plate: updatedLog.license_plate,
        refill_liters: updatedLog.refill_liters,
        oil_in: updatedLog.oil_in,
        time_in: updatedLog.time_in,
        shift: updatedLog.shift,
        code_abbr: updatedLog.code_abbr,
      })
    })
      .then(res => res.json())
      .catch(e => console.log('Backend edit sync offline, updated locally.'));
  };

  // Handler: Save fuel table archive to backend / Supabase
  const handleSaveArchive = async (newArchive) => {
    setSavedArchives(prev => [newArchive, ...prev]);

    const apiPayload = {
      archive_ref: newArchive.id,
      date: newArchive.date,
      saved_at: newArchive.saved_at,
      total_liters: newArchive.total_liters,
      logs: newArchive.logs
    };

    const result = await makeApiCall(
      'save_archive',
      `${API_BASE_URL}/fuel/archives`,
      'POST',
      apiPayload,
      (resData) => {
        if (resData.data && resData.data[0]) {
          const saved = resData.data[0];
          const normalized = {
            id: saved.id || newArchive.id,
            date: saved.archive_date || newArchive.date,
            saved_at: saved.saved_at || newArchive.saved_at,
            total_liters: parseFloat(saved.total_liters) || newArchive.total_liters,
            logs: saved.logs || newArchive.logs
          };
          setSavedArchives(prev => prev.map(a => a.id === newArchive.id ? normalized : a));
        }
      }
    );
    return result;
  };

  const handleDeleteArchive = async (archId) => {
    setSavedArchives(prev => prev.filter(a => a.id !== archId));
    await makeApiCall(
      'delete_archive',
      `${API_BASE_URL}/fuel/archives/${archId}`,
      'DELETE',
      null
    );
  };

  // Handler: Clear active fuel logs (archives live table and clears backend)
  const handleClearFuelLogs = () => {
    setFuelLogs([]);
    fetch(`${API_BASE_URL}/fuel/logs/clear`, { method: 'DELETE' })
      .catch(e => console.log('Backend clear API offline, cleared locally.'));
  };

  // Handler: Add new soil log
  const handleAddSoilLog = async (newLog) => {
    setSoilLogs(prev => [newLog, ...prev]);

    // Send log to backend API with offline queue support
    const apiData = {
      station_name: newLog.station_name,
      code_abbr: newLog.code_abbr,
      logged_by: activeRole === 'admin' ? 'user-admin-01' : 'user-phattra-02',
      trip_count: newLog.trip_count,
      cubic_meters_per_trip: newLog.cubic_meters_per_trip,
      scrap_sales_amount: newLog.scrap_sales_amount,
      staff_decisions: newLog.staff_decisions,
      issues_description: newLog.issues_description,
      receipt_photo_url: newLog.receipt_photo_url,
      time_start: newLog.time_start,
      time_end: newLog.time_end
    };

    const result = await makeApiCall(
      'soil_log',
      `${API_BASE_URL}/soil/log`,
      'POST',
      apiData,
      (resData) => {
        if (resData.data && resData.data[0]) {
          const createdLog = {
            ...newLog,
            ...resData.data[0]
          };
          setSoilLogs(prev => [...prev.filter(l => l.id !== newLog.id), createdLog]);
        }
      }
    );

    if (result.queued) {
      console.log('Soil log saved locally and queued for sync when online');
    } else if (!result.success) {
      console.error('Failed to save soil log:', result.error);
    }
    return result;
  };

  // Handler: Delete a soil log
  const handleDeleteSoilLog = (logId) => {
    setSoilLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Handler: Edit a soil log
  const handleEditSoilLog = (updatedLog) => {
    setSoilLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  // ── Data Export / Import handlers ──────────────────────────
  const handleExportData = () => {
    exportAllData(lang);
  };

  const handleImportData = async (mode = 'merge') => {
    try {
      const { result, meta } = await importFromFile(mode);

      // Push imported data into React state so UI updates immediately
      if (result.fuelStations.length > 0)
        setFuelStations(result.fuelStations.map(s => ({
          ...s,
          name: s.name || s.station_name || 'Station',
          status: s.current_stock_liters < (s.reorder_threshold_liters || 4000) ? 'Reorder Needed' : 'Normal'
        })));
      if (result.fuelLogs.length > 0)
        setFuelLogs(result.fuelLogs);
      if (result.soilLogs.length > 0)
        setSoilLogs(result.soilLogs);
      if (result.staff.length > 0)
        setStaff(result.staff);
      if (result.licensePlates.length > 0)
        setAbbrCodes(result.licensePlates);
      if (result.drivers.length > 0)
        setDrivers(result.drivers);
      if (result.archives.length > 0)
        setSavedArchives(result.archives);

      console.log('Import complete from file:', meta.filename, '| exported at:', meta.exportedAt);
      return { success: true, meta };
    } catch (err) {
      console.error('Import failed:', err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <>
      {needsLogin ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
    <Router>
      <Layout 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        alertCount={alertCount} 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
        onLogout={handleLogout} 
        sessionEmail={sessionEmail} 
        userRole={userRole}
        userName={userName}
        onExportData={handleExportData} 
        onImportData={handleImportData} 
        isOnline={isOnline} 
        offlineQueueCount={offlineQueue.length}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                fuelStations={fuelStations}
                fuelLogs={fuelLogs}
                soilLogs={soilLogs}
                onDeleteStation={handleDeleteStation}
                lang={lang}
                userRole={userRole}
              />
            }
          />
          <Route
            path="/fuel"
            element={
              userRole === 'user' ? (
                <UserFuelPage
                  stations={fuelStations}
                  fuelLogs={fuelLogs}
                  staff={staff}
                  onAddFuelLog={handleAddFuelLog}
                  onEditFuelLog={handleEditFuelLog}
                  onDeleteFuelLog={handleDeleteFuelLog}
                  lang={lang}
                  assignedStation={userAssignedStation}
                />
              ) : (
                <FuelManagement
                  stations={fuelStations}
                  fuelLogs={fuelLogs}
                  abbrCodes={abbrCodes}
                  onAddAbbrCode={handleAddAbbrCode}
                  onDeleteAbbrCode={handleDeleteAbbrCode}
                  drivers={drivers}
                  onAddDriver={handleAddDriver}
                  onDeleteDriver={handleDeleteDriver}
                  staff={staff}
                  onAddStaff={handleAddStaff}
                  onEditStaff={handleEditStaff}
                  onDeleteStaff={handleDeleteStaff}
                  onSaveSignature={handleSaveSignature}
                  onAddFuelLog={handleAddFuelLog}
                  onAddStation={handleAddStation}
                  onEditStation={handleEditStation}
                  onDeleteStation={handleDeleteStation}
                  onDeleteFuelLog={handleDeleteFuelLog}
                  onEditFuelLog={handleEditFuelLog}
                  onClearFuelLogs={handleClearFuelLogs}
                  savedArchives={savedArchives}
                  setSavedArchives={setSavedArchives}
                  onSaveArchive={handleSaveArchive}
                  onDeleteArchive={handleDeleteArchive}
                  lang={lang}
                  userRole={userRole}
                  assignedStation={userAssignedStation}
                />
              )
            }
          />
          <Route
            path="/soil"
            element={
              userRole === 'user' ? (
                <UserSoilPage
                  soilLogs={soilLogs}
                  abbrCodes={abbrCodes}
                  onAddAbbrCode={handleAddAbbrCode}
                  onAddSoilLog={handleAddSoilLog}
                  lang={lang}
                  assignedStation={userAssignedStation}
                />
              ) : (
                <SoilManagement
                  soilLogs={soilLogs}
                  abbrCodes={abbrCodes}
                  onAddAbbrCode={handleAddAbbrCode}
                  onAddSoilLog={handleAddSoilLog}
                  onDeleteSoilLog={handleDeleteSoilLog}
                  onEditSoilLog={handleEditSoilLog}
                  lang={lang}
                  userRole={userRole}
                  assignedStation={userAssignedStation}
                />
              )
            }
          />
          <Route
            path="/admin"
            element={
              <AdminPage
                lang={lang}
                userRole={userRole}
                stations={fuelStations}
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
      )}
    </>
  );
}
