import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Fuel, HardHat, Users } from 'lucide-react';
import { translations } from '../../data/translations';

export default function BottomNav({ alertCount = 0, lang = 'km', onOpenStaff }) {
  const t = translations[lang] || translations.km;

  const navItems = [
    {
      to: '/',
      end: true,
      icon: <LayoutDashboard size={20} />,
      label: lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard',
      color: 'var(--primary)'
    },
    {
      to: '/fuel',
      end: false,
      icon: <Fuel size={20} />,
      label: lang === 'km' ? 'ប្រេងឥន្ធនៈ' : 'Fuel',
      color: 'var(--fuel-accent)',
      badge: alertCount > 0 ? alertCount : null
    },
    {
      to: '/soil',
      end: false,
      icon: <HardHat size={20} />,
      label: lang === 'km' ? 'ដឹកដី' : 'Soil',
      color: 'var(--soil-accent)'
    }
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'var(--bg-bottomnav, rgba(15, 23, 42, 0.92))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '6px 8px calc(6px + env(safe-area-inset-bottom, 8px))',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.35)'
      }}
    >
      {navItems.map(({ to, end, icon, label, color, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '6px 4px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: isActive ? color : 'var(--text-muted)',
            position: 'relative',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            background: isActive ? `rgba(${color === 'var(--primary)' ? '79,125,245' : color === 'var(--fuel-accent)' ? '245,158,11' : '16,185,129'}, 0.12)` : 'transparent'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  display: 'flex',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}>
                  {icon}
                </span>
                {badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-8px',
                      background: 'var(--danger)',
                      color: '#ffffff',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      minWidth: '15px',
                      height: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      border: '2px solid var(--bg-app)'
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
                lineHeight: 1
              }}>
                {label}
              </span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    width: '16px',
                    height: '3px',
                    borderRadius: '2px',
                    background: color
                  }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* Quick Staff Button if onOpenStaff provided */}
      {onOpenStaff && (
        <button
          onClick={onOpenStaff}
          className="mobile-nav-item"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '6px 4px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ display: 'flex' }}>
              <Users size={20} />
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            lineHeight: 1
          }}>
            {lang === 'km' ? 'បុគ្គលិក' : 'Staff'}
          </span>
        </button>
      )}
    </nav>
  );
}
