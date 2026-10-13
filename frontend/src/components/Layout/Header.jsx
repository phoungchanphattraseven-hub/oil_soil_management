import React, { useState, useEffect } from 'react';
import { Shield, Clock, Sun, Moon, Menu, LogOut, Settings, User } from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';
import { translations } from '../../data/translations';
import UserProfileModal from '../Common/UserProfileModal';

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
  userAssignedStation = null,
  onExportData,
  onImportData,
  isOnline = true,
  offlineQueueCount = 0
}) {
  const currentUser = MOCK_USERS[activeRole];
  const t = translations[lang] || translations.km;
  
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Storage key for user profile avatar and metadata
  const userKey = sessionEmail || 'default_user';
  const storagePhotoKey = `app_user_photo_${userKey.toLowerCase()}`;
  const storageNameKey = `app_user_custom_name_${userKey.toLowerCase()}`;

  const [userPhoto, setUserPhoto] = useState(() => {
    try {
      return localStorage.getItem(storagePhotoKey) || '';
    } catch {
      return '';
    }
  });

  const [customName, setCustomName] = useState(() => {
    try {
      return localStorage.getItem(storageNameKey) || userName || '';
    } catch {
      return userName || '';
    }
  });

  // Keep in sync with user profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const photo = localStorage.getItem(storagePhotoKey) || '';
        const name = localStorage.getItem(storageNameKey) || userName || '';
        setUserPhoto(photo);
        setCustomName(name);
      } catch {}
    };

    window.addEventListener('app_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('app_user_profile_updated', handleProfileUpdate);
  }, [storagePhotoKey, storageNameKey, userName]);

  // User display information
  const displayName = customName || userName || (sessionEmail ? sessionEmail.split('@')[0].replace(/[._-]/g, ' ') : 'User');
  const roleLabel = userRole === 'admin' ? (lang === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Administrator') : (lang === 'km' ? 'អ្នកប្រើប្រាស់' : 'User');

  const currentDate = new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const toggleLanguage = () => {
    setLang(lang === 'km' ? 'en' : 'km');
  };

  const emailDisplay = displayName;

  return (
    <>
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
          <div className="mobile-date-display" title={currentDate}>
            <span>{new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric' })}</span>
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
              className="header-icon-btn mobile-theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Sun size={15} color="var(--fuel-accent)" /> : <Moon size={15} color="var(--primary)" />}
            </button>
          )}

          {/* User Profile Button — Clickable to open Profile & Avatar Modal */}
          <button
            className="user-profile-btn"
            onClick={() => setShowProfileModal(true)}
            title={lang === 'km' ? 'មើលព័ត៌មាន និងរូបថតគណនី' : 'View Profile & Info'}
            style={{
              gap: '8px',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '24px',
              padding: '3px 8px 3px 3px',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-hover, rgba(255,255,255,0.08))';
              e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(255,255,255,0.12))';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={emailDisplay}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1.5px solid var(--primary, #6366f1)',
                  boxShadow: '0 2px 6px rgba(99,102,241,0.35)'
                }}
              />
            ) : (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '0.8rem', fontWeight: 800, color: '#fff',
                boxShadow: '0 2px 8px rgba(99,102,241,0.35)'
              }}>
                {emailDisplay.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-info-text hide-on-mobile" style={{ textAlign: 'left' }}>
              <div className="user-name" style={{ fontSize: '0.78rem', textTransform: 'capitalize', fontWeight: 600 }}>
                {emailDisplay}
              </div>
              <div className="user-role" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
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

      {/* User Profile & Avatar Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userName={displayName}
        sessionEmail={sessionEmail}
        userRole={userRole}
        userAssignedStation={userAssignedStation}
        lang={lang}
        onUpdateProfile={(updated) => {
          if (updated.avatarUrl !== undefined) setUserPhoto(updated.avatarUrl);
          if (updated.name) setCustomName(updated.name);
        }}
      />
    </>
  );
}
