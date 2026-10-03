import React from 'react';
import { User, Shield, Clock, Bell, Sun, Moon, Menu } from 'lucide-react';
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

  return (
    <header className="app-header">
      {/* Left: Menu & Brand/Date */}
      <div className="header-left">
        {setSidebarVisible && (
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarVisible(!isSidebarVisible)}
            title={lang === 'km' ? 'បិទ/បើក របារចំហៀង' : 'Toggle Sidebar'}
          >
            <Menu size={20} />
          </button>
        )}

        <div className="mobile-app-brand">
          <div className="mobile-brand-icon">
            <Shield size={16} color="#ffffff" />
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
        {/* Theme Toggle */}
        {setTheme && (
          <button
            className="header-icon-btn theme-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Sun size={15} color="var(--fuel-accent)" /> : <Moon size={15} color="var(--primary)" />}
            <span className="hide-on-mobile">{theme === 'light' ? (lang === 'km' ? 'ពន្លឺ' : 'Light') : (lang === 'km' ? 'ងងឹត' : 'Dark')}</span>
          </button>
        )}

        {/* Language Toggle */}
        <div className="header-pill-group">
          {['km', 'en'].map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`pill-btn ${lang === l ? 'active' : ''}`}
            >
              {l === 'km' ? '🇰🇭' : '🇬🇧'} <span className="hide-on-mobile">{l === 'km' ? 'KM' : 'EN'}</span>
            </button>
          ))}
        </div>

        {/* Role Toggle (Desktop) */}
        <div className="header-pill-group hide-on-mobile">
          {[
            { key: 'admin', icon: <Shield size={11} color="var(--primary)" />, label: t.admin },
            { key: 'phattra', icon: <User size={11} color="var(--fuel-accent)" />, label: t.phattra }
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveRole(key)}
              className={`pill-btn ${activeRole === key ? 'active' : ''}`}
            >
              {icon} <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Bell */}
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

        {/* Separator Desktop */}
        <div className="header-divider hide-on-mobile" />

        {/* User Avatar (clickable on mobile to toggle role) */}
        <button
          className="user-profile-btn"
          onClick={() => setActiveRole(activeRole === 'admin' ? 'phattra' : 'admin')}
          title={lang === 'km' ? 'ចុចដើម្បីប្តូរតួនាទី' : 'Click to switch role'}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="user-avatar-img"
          />
          <div className="user-info-text hide-on-mobile">
            <div className="user-name">
              {currentUser.name}
            </div>
            <div className="user-role">
              {lang === 'km' ? currentUser.roleKhmer : (activeRole === 'admin' ? t.adminRole : t.phattraRole)}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
