import React, { useState, useEffect, useRef } from 'react';
import { Shield, Clock, Bell, Sun, Moon, Menu, LogOut, Wifi, WifiOff, Download, Upload, Database, Clock3, Settings } from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';
import { translations } from '../../data/translations';

export default function Header({
  activeRole,
  setActiveRole,
  lang,
  setLang,
  theme = 'dark',
  setTheme,
  alertCount = 0,
  isSidebarVisible,
  setSidebarVisible,
  onLogout,
  sessionEmail = '',
  userRole = 'user',
  userName = '',
  onExportData,
  onImportData,
  isOnline = true,
  offlineQueueCount = 0
}) {
  const currentUser = MOCK_USERS[activeRole];
  const t = translations[lang] || translations.km;
  
  // User display information
  const displayName = userName || (sessionEmail ? sessionEmail.split('@')[0].replace(/[._-]/g, ' ') : 'User');
  const roleLabel = userRole === 'admin' ? (lang === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Administrator') : (lang === 'km' ? 'អ្នកប្រើប្រាស់' : 'User');
  const [showDataMenu, setShowDataMenu] = useState(false);
  const dataMenuRef = useRef(null);

  // Close data menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target)) {
        setShowDataMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDate = new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const toggleLanguage = () => {
    setLang(lang === 'km' ? 'en' : 'km');
  };


  const handleImportReplace = async () => {
    if (onImportData) {
      const result = await onImportData('replace');
      if (result.success) {
        alert(lang === 'km' ? 'ទិន្នន័យត្រូវបានជំនួសដោយជោគជ័យ!' : 'Data replaced successfully!');
      } else {
        alert(lang === 'km' ? `បរាជ័យ: ${result.error}` : `Failed: ${result.error}`);
      }
    }
    setShowDataMenu(false);
  };

  const handleImportMerge = async () => {
    if (onImportData) {
      const result = await onImportData('merge');
      if (result.success) {
        alert(lang === 'km' ? 'ទិន្នន័យត្រូវបានបញ្ចូលរួមដោយជោគជ័យ!' : 'Data merged successfully!');
      } else {
        alert(lang === 'km' ? `បរាជ័យ: ${result.error}` : `Failed: ${result.error}`);
      }
    }
    setShowDataMenu(false);
  };

  const handleExport = () => {
    if (onExportData) {
      onExportData();
      alert(lang === 'km' ? 'កំពុងទាញយកទិន្នន័យ...' : 'Downloading data backup...');
    }
    setShowDataMenu(false);
  };

  // Short display name from email
  const emailDisplay = displayName;

  return (
    <header className="app-header">
      {/* Left: Menu & Brand */}
      <div className="header-left">
        {setSidebarVisible && (
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarVisible(!isSidebarVisible)}
            title={lang === 'km' ? 'បិទ/បើក របារចំហៀង' : 'Toggle Sidebar'}
            aria-label="Toggle Navigation"
          >
            <Menu size={19} />
          </button>
        )}

        <div className="mobile-app-brand">
          <div className="mobile-brand-icon">
            <Shield size={15} color="#ffffff" />
          </div>
          <span className="mobile-brand-title">{t.appName}</span>
        </div>

        <div className="desktop-date-display">
          <Clock size={13} color="var(--primary)" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="header-right">
        {/* Data Persistence Status & Actions — hidden on mobile to save space */}
        <div className="data-status-group hide-on-mobile">
          {/* Online/Offline Status */}
          <div 
            className="status-indicator" 
            title={isOnline 
              ? (lang === 'km' ? 'តភ្ជាប់អ៊ីនធឺណិត' : 'Online - Backend Connected') 
              : (lang === 'km' ? 'គ្មានអ៊ីនធឺណិត' : 'Offline - Using Local Storage')}
          >
            {isOnline ? (
              <Wifi size={14} color="var(--success)" />
            ) : (
              <WifiOff size={14} color="var(--warning)" />
            )}
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              color: isOnline ? 'var(--success)' : 'var(--warning)' 
            }}>
              {isOnline ? (lang === 'km' ? 'តភ្ជាប់' : 'ONLINE') : (lang === 'km' ? 'ក្រៅបណ្តាញ' : 'OFFLINE')}
            </span>
          </div>

          {/* Offline Queue Counter */}
          {offlineQueueCount > 0 && (
            <div 
              className="queue-indicator"
              title={lang === 'km' ? `${offlineQueueCount} កំពុងរង់ចាំសម្រប់សម្រួល` : `${offlineQueueCount} items queued for sync`}
            >
              <Clock3 size={13} color="var(--warning)" />
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700,
                color: 'var(--warning)',
                background: 'var(--warning-subtle)',
                padding: '1px 5px',
                borderRadius: '3px'
              }}>
                {offlineQueueCount}
              </span>
            </div>
          )}

          {/* Data Backup/Restore Menu */}
          <div className="data-menu-wrapper" style={{ position: 'relative' }} ref={dataMenuRef}>
            <button
              className="header-icon-btn"
              onClick={() => setShowDataMenu(!showDataMenu)}
              title={lang === 'km' ? 'គ្រប់គ្រងទិន្នន័យ' : 'Data Management'}
            >
              <Database size={15} color="var(--primary)" />
            </button>
            
            {showDataMenu && (
              <div className="data-dropdown-menu" style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--r-sm)',
                boxShadow: 'var(--shadow-modal)',
                minWidth: '200px',
                zIndex: 1000,
                padding: '8px 0'
              }}>
                <button 
                  onClick={handleExport}
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <Download size={14} color="var(--success)" />
                  {lang === 'km' ? 'ទាញយកទិន្នន័យ' : 'Export Data'}
                </button>
                
                <button 
                  onClick={handleImportMerge}
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <Upload size={14} color="var(--primary)" />
                  {lang === 'km' ? 'បញ្ចូលទិន្នន័យ (បន្ថែម)' : 'Import & Merge'}
                </button>
                
                <button 
                  onClick={handleImportReplace}
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: 'var(--warning)'
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--surface-hover)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <Upload size={14} color="var(--warning)" />
                  {lang === 'km' ? 'បញ្ចូលទិន្នន័យ (ជំនួស)' : 'Import & Replace'}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Language Toggle */}
        <button
          className="header-pill-toggle"
          onClick={toggleLanguage}
          title={lang === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
        >
          <span style={{ fontSize: '0.85rem' }}>{lang === 'km' ? '🇰🇭' : '🇬🇧'}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{lang.toUpperCase()}</span>
        </button>

        {/* Theme Toggle (Sun / Moon) */}
        {setTheme && (
          <button
            className="header-icon-btn hide-on-mobile"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Sun size={15} color="var(--fuel-accent)" /> : <Moon size={15} color="var(--primary)" />}
          </button>
        )}


        {/* Alert Bell — admin desktop only */}
        {alertCount > 0 && (
          <div className="header-bell-wrapper hide-on-mobile">
            <div className="header-bell-icon">
              <Bell size={14} />
            </div>
            <div className="header-bell-badge">
              {alertCount}
            </div>
          </div>
        )}

        {/* User Avatar — shows real logged-in email initial */}
        <button
          className="user-profile-btn"
          style={{ gap: '8px', cursor: 'default' }}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '0.75rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)'
          }}>
            {emailDisplay.charAt(0).toUpperCase()}
          </div>
          <div className="user-info-text hide-on-mobile">
            <div className="user-name" style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}>
              {emailDisplay}
            </div>
            <div className="user-role" style={{ fontSize: '0.65rem' }}>
              {roleLabel}
            </div>
          </div>
        </button>

        {/* Admin Panel Button — visible to admins only, desktop only */}
        {userRole === 'admin' && (
          <a
            href="/admin"
            title={lang === 'km' ? 'ការគ្រប់គ្រងប្រព័ន្ធ' : 'Admin Panel'}
            className="hide-on-mobile"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--primary)',
              fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s ease',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            <Settings size={13} />
            <span className="hide-on-mobile">{lang === 'km' ? 'ការគ្រប់គ្រង' : 'Admin'}</span>
          </a>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            id="logout-btn"
            onClick={onLogout}
            title={lang === 'km' ? 'ចាកចេញ' : 'Sign Out'}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px',
              background: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--danger)',
              fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s ease',
              whiteSpace: 'nowrap', flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)'; }}
          >
            <LogOut size={13} />
            <span className="hide-on-mobile">{lang === 'km' ? 'ចាកចេញ' : 'Logout'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
