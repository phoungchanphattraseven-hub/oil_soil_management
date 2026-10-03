import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import FuelManagement from './pages/FuelManagement';
import SoilManagement from './pages/SoilManagement';
import { MOCK_USERS, DEFAULT_FUEL_STATIONS, INITIAL_FUEL_LOGS, INITIAL_SOIL_LOGS, DEFAULT_ABBR_CODES, DEFAULT_DRIVERS } from './data/mockData';

const API_BASE_URL = 'http://localhost:8000/api';

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

export default function App() {
  const [activeRole, setActiveRole] = useState('admin');
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('app_lang') || 'km'; }
    catch { return 'km'; }
  }); // Language state: 'km' | 'en'
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('app_theme') || 'dark'; }
    catch { return 'dark'; }
  });
  const [fuelStations, setFuelStations] = useState(DEFAULT_FUEL_STATIONS);
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  const [soilLogs, setSoilLogs] = useState(INITIAL_SOIL_LOGS);
  const [abbrCodes, setAbbrCodes] = useState(getStoredAbbrCodes);
  const [drivers, setDrivers] = useState(getStoredDrivers);
  const [staff, setStaff] = useState(getStoredStaff);

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
  const handleAddStaff = (member) => {
    // Optimistic update
    setStaff(prev => [member, ...prev]);

    fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: member.name,
        gender: member.gender,
        station_name: member.station_name,
        license_plate: member.license_plate,
        phone: member.phone,
        role: member.role,
        photo_url: member.photo_url || '',
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.data && resData.data[0]) {
          // Replace local temp id with real Supabase UUID
          const created = resData.data[0];
          setStaff(prev => prev.map(s => s.id === member.id ? { ...created } : s));
        }
      })
      .catch(e => console.log('Staff API offline, stored locally.'));
  };

  const handleEditStaff = (updated) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));

    fetch(`${API_BASE_URL}/staff/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updated.name,
        gender: updated.gender,
        station_name: updated.station_name,
        license_plate: updated.license_plate,
        phone: updated.phone,
        role: updated.role,
        photo_url: updated.photo_url || '',
      })
    })
      .then(res => res.json())
      .catch(e => console.log('Staff edit API offline, updated locally.'));
  };

  const handleDeleteStaff = (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));

    fetch(`${API_BASE_URL}/staff/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .catch(e => console.log('Staff delete API offline, removed locally.'));
  };

  // Fetch live data from backend API if available
  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/summary`)
      .then(res => res.json())
      .then(data => {
        if (data.stations && Array.isArray(data.stations)) {
          const mapped = data.stations.map(s => ({
            ...s,
            name: s.name || s.station_name || 'Station'
          }));
          setFuelStations(mapped);
        }
        if (data.fuel_logs && Array.isArray(data.fuel_logs)) {
          setFuelLogs(data.fuel_logs);
        }
        if (data.soil_logs && Array.isArray(data.soil_logs)) {
          setSoilLogs(data.soil_logs);
        }
        if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
          setStaff(data.staff);
        }
      })
      .catch(err => {
        console.log('Backend API offline, initialized with empty state.');
      });
  }, []);

  // Reorder threshold low stock stations count (< 4,000 L)
  const alertCount = fuelStations.filter(s => s.current_stock_liters < s.reorder_threshold_liters).length;

  // Handler: Add new station
  const handleAddStation = (newStation) => {
    setFuelStations(prev => [...prev, newStation]);

    fetch(`${API_BASE_URL}/fuel/station`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newStation.name,
        location: newStation.location,
        current_stock_liters: newStation.current_stock_liters,
        target_capacity_liters: newStation.target_capacity_liters,
        reorder_threshold_liters: newStation.reorder_threshold_liters
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.data && resData.data[0]) {
          const created = {
            ...resData.data[0],
            name: resData.data[0].station_name || newStation.name
          };
          setFuelStations(prev => [...prev.filter(s => s.id !== newStation.id), created]);
        }
      })
      .catch(e => console.log('Backend sync offline, stored locally.'));
  };

  // Handler: Delete a station
  const handleDeleteStation = (stationId) => {
    setFuelStations(prev => prev.filter(s => s.id !== stationId));

    fetch(`${API_BASE_URL}/fuel/station/${stationId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(resData => console.log('Station deleted successfully:', resData))
      .catch(e => console.log('Backend sync offline, removed locally.'));
  };

  // Handler: Add new fuel log and update station stock
  const handleAddFuelLog = (newLog) => {
    setFuelLogs(prev => [newLog, ...prev]);

    // Deduct oil spent (refill_liters) and add oil received (oil_in) to station stock
    setFuelStations(prevStations =>
      prevStations.map(station => {
        if (station.id === newLog.station_id) {
          const oilOut = parseFloat(newLog.refill_liters) || 0;
          const oilIn  = parseFloat(newLog.oil_in) || 0;
          const updatedStock = Math.max(0, station.current_stock_liters - oilOut + oilIn);
          return {
            ...station,
            current_stock_liters: updatedStock,
            status: updatedStock < station.reorder_threshold_liters ? 'Reorder Needed' : 'Normal',
            last_refill: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return station;
      })
    );

    // Send log to backend API
    fetch(`${API_BASE_URL}/fuel/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.data && resData.data[0]) {
          const createdLog = {
            ...newLog,
            ...resData.data[0]
          };
          setFuelLogs(prev => [...prev.filter(l => l.id !== newLog.id), createdLog]);
        }
      })
      .catch(e => console.log('Backend sync offline, stored locally.'));
  };

  // Handler: Delete a fuel log and restore stock
  const handleDeleteFuelLog = (logId) => {
    const log = fuelLogs.find(l => l.id === logId);
    if (!log) return;
    setFuelLogs(prev => prev.filter(l => l.id !== logId));
    // Reverse the effect: restore oil_out to stock, remove oil_in from stock
    const oilOut = parseFloat(log.refill_liters) || 0;
    const oilIn  = parseFloat(log.oil_in) || 0;
    setFuelStations(prev => prev.map(s => {
      if (s.id === log.station_id) {
        const restored = Math.max(0, s.current_stock_liters + oilOut - oilIn);
        return { ...s, current_stock_liters: restored, status: restored < s.reorder_threshold_liters ? 'Reorder Needed' : 'Normal' };
      }
      return s;
    }));

    // Delete from Supabase via backend API
    fetch(`${API_BASE_URL}/fuel/log/${logId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(resData => console.log('Fuel log deleted from Supabase:', resData))
      .catch(e => console.log('Backend sync offline, removed locally.'));
  };

  // Handler: Edit a fuel log (replaces old, adjusts stock delta)
  const handleEditFuelLog = (updatedLog) => {
    const old = fuelLogs.find(l => l.id === updatedLog.id);
    if (!old) return;
    setFuelLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    // Adjust stock: reverse old effect (old.oil_out deducted, old.oil_in added)
    //               then apply new effect (new.oil_out deduct, new.oil_in add)
    const oldOut = parseFloat(old.refill_liters) || 0;
    const oldIn  = parseFloat(old.oil_in) || 0;
    const newOut = parseFloat(updatedLog.refill_liters) || 0;
    const newIn  = parseFloat(updatedLog.oil_in) || 0;
    const delta  = (oldOut - oldIn) - (newOut - newIn); // net change to add back
    setFuelStations(prev => prev.map(s => {
      if (s.id === updatedLog.station_id) {
        const adjusted = Math.max(0, s.current_stock_liters + delta);
        return { ...s, current_stock_liters: adjusted, status: adjusted < s.reorder_threshold_liters ? 'Reorder Needed' : 'Normal' };
      }
      return s;
    }));
  };

  // Handler: Clear active fuel logs
  const handleClearFuelLogs = () => {
    setFuelLogs([]);
  };

  // Handler: Add new soil log
  const handleAddSoilLog = (newLog) => {
    setSoilLogs(prev => [newLog, ...prev]);

    // Send log to backend API
    fetch(`${API_BASE_URL}/soil/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.data && resData.data[0]) {
          const createdLog = {
            ...newLog,
            ...resData.data[0]
          };
          setSoilLogs(prev => [...prev.filter(l => l.id !== newLog.id), createdLog]);
        }
      })
      .catch(e => console.log('Backend sync offline, stored locally.'));
  };

  // Handler: Delete a soil log
  const handleDeleteSoilLog = (logId) => {
    setSoilLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Handler: Edit a soil log
  const handleEditSoilLog = (updatedLog) => {
    setSoilLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  return (
    <Router>
      <Layout activeRole={activeRole} setActiveRole={setActiveRole} alertCount={alertCount} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}>
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
              />
            }
          />
          <Route
            path="/fuel"
            element={
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
                onAddFuelLog={handleAddFuelLog}
                onAddStation={handleAddStation}
                onDeleteStation={handleDeleteStation}
                onDeleteFuelLog={handleDeleteFuelLog}
                onEditFuelLog={handleEditFuelLog}
                onClearFuelLogs={handleClearFuelLogs}
                lang={lang}
              />
            }
          />
          <Route
            path="/soil"
            element={
              <SoilManagement
                soilLogs={soilLogs}
                abbrCodes={abbrCodes}
                onAddAbbrCode={handleAddAbbrCode}
                onAddSoilLog={handleAddSoilLog}
                onDeleteSoilLog={handleDeleteSoilLog}
                onEditSoilLog={handleEditSoilLog}
                lang={lang}
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
