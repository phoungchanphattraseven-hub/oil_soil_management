import React from 'react';
import { User, Shield, Clock, Bell, Sun, Moon, Menu } from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';
import { translations } from '../../data/translations';

export default function Header({ activeRole, setActiveRole, lang, setLang, theme = 'dark', setTheme, alertCount = 0, isSidebarVisible, setSidebarVisible }) {
  const currentUser = MOCK_USERS[activeRole];
  const t = translations[lang] || translations.km;

  const currentDate = new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <header style={{
      height: '54px',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Left: Date & Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {setSidebarVisible && (
          <button
            onClick={() => setSidebarVisible(!isSidebarVisible)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: 'var(--r-sm)',
              transition: 'var(--transition-fast)'
            }}
            title={lang === 'km' ? 'បិទ/បើក របារចំហៀង' : 'Toggle Sidebar'}
          >
            <Menu size={18} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.77rem' }}>
          <Clock size={13} color="var(--primary)" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Theme Toggle (Sun / Moon) */}
        {setTheme && (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--surface-input)',
            padding: '2px', borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px',
                borderRadius: 'calc(var(--r-sm) - 1px)',
                background: 'transparent',
                color: theme === 'light' ? 'var(--fuel-accent)' : 'var(--primary)',
                fontSize: '0.72rem', fontWeight: 700,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Sun size={13} color="var(--fuel-accent)" /> : <Moon size={13} color="var(--primary)" />}
              <span>{theme === 'light' ? (lang === 'km' ? 'ពន្លឺ' : 'Light') : (lang === 'km' ? 'ងងឹត' : 'Dark')}</span>
            </button>
          </div>
        )}

        {/* Language Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--surface-input)',
          padding: '2px', borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          {['km', 'en'].map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '4px 9px',
                borderRadius: 'calc(var(--r-sm) - 1px)',
                background: lang === l ? 'var(--primary)' : 'transparent',
                color: lang === l ? '#fff' : 'var(--text-muted)',
                fontSize: '0.7rem', fontWeight: 700,
                transition: 'var(--transition-fast)'
              }}
            >
              {l === 'km' ? '🇰🇭 KM' : '🇬🇧 EN'}
            </button>
          ))}
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--surface-input)',
          padding: '2px', borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { key: 'admin', icon: <Shield size={11} color="var(--primary)" />, label: t.admin },
            { key: 'phattra', icon: <User size={11} color="var(--fuel-accent)" />, label: t.phattra }
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveRole(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px',
                borderRadius: 'calc(var(--r-sm) - 1px)',
                background: activeRole === key ? 'var(--surface-raised)' : 'transparent',
                color: activeRole === key ? 'var(--text-main)' : 'var(--text-muted)',
                fontSize: '0.72rem', fontWeight: 600,
                border: activeRole === key ? '1px solid var(--border-medium)' : '1px solid transparent',
                transition: 'var(--transition-fast)'
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Bell */}
        {alertCount > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--r-sm)',
              background: 'var(--warning-subtle)',
              border: '1px solid var(--warning-border)',
              color: 'var(--fuel-accent)'
            }}>
              <Bell size={14} />
            </div>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '14px', height: '14px',
              background: 'var(--danger)', borderRadius: 'var(--r-full)',
              fontSize: '0.6rem', fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {alertCount}
            </div>
          </div>
        )}

        {/* Separator */}
        <div style={{ width: '1px', height: '22px', background: 'var(--border-subtle)' }} />

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{
              width: '30px', height: '30px',
              borderRadius: 'var(--r-full)',
              objectFit: 'cover',
              border: '2px solid var(--border-medium)'
            }}
          />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
              {lang === 'km' ? currentUser.roleKhmer : (activeRole === 'admin' ? t.adminRole : t.phattraRole)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
