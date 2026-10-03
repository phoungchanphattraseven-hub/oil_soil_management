import React from 'react';
import { Shield, Clock, Bell, Sun, Moon, Menu, LogOut } from 'lucide-react';
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
  sessionEmail = ''
}) {
  const currentUser = MOCK_USERS[activeRole];
  const t = translations[lang] || translations.km;

  const currentDate = new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const toggleLanguage = () => {
    setLang(lang === 'km' ? 'en' : 'km');
  };

  const toggleRole = () => {
    setActiveRole(activeRole === 'admin' ? 'phattra' : 'admin');
  };

  // Short display name from email
  const emailDisplay = sessionEmail
    ? sessionEmail.split('@')[0].replace(/[._-]/g, ' ')
    : (currentUser?.name || 'Admin');

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
            className="header-icon-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Sun size={15} color="var(--fuel-accent)" /> : <Moon size={15} color="var(--primary)" />}
          </button>
        )}

        {/* Desktop Role Switcher */}
        <div className="header-pill-group hide-on-mobile">
          {['admin', 'phattra'].map((key) => (
            <button
              key={key}
              onClick={() => setActiveRole(key)}
              className={`pill-btn ${activeRole === key ? 'active' : ''}`}
            >
              <span>{key === 'admin' ? t.admin : t.phattra}</span>
            </button>
          ))}
        </div>

        {/* Alert Bell */}
        {alertCount > 0 && (
          <div className="header-bell-wrapper">
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
          onClick={toggleRole}
          title={lang === 'km' ? `ចុចដើម្បីប្តូរតួនាទី` : `Tap to switch role`}
          style={{ gap: '8px' }}
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
              {lang === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Administrator'}
            </div>
          </div>
        </button>

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
