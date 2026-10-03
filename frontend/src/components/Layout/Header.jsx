import React from 'react';
import { Shield, Clock, Bell, Sun, Moon, Menu } from 'lucide-react';
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
  setSidebarVisible
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
        {/* Language Toggle: Single compact button on mobile */}
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

        {/* User Avatar (click to toggle role on mobile) */}
        <button
          className="user-profile-btn"
          onClick={toggleRole}
          title={lang === 'km' ? `តួនាទី៖ ${currentUser.name} (ចុចដើម្បីប្តូរ)` : `Role: ${currentUser.name} (Tap to switch)`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="user-avatar-img"
          />
          <div className="user-info-text hide-on-mobile">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role">
              {lang === 'km' ? currentUser.roleKhmer : (activeRole === 'admin' ? t.adminRole : t.phattraRole)}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
