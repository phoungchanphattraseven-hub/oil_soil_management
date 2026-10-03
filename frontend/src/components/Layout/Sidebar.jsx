import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Fuel, HardHat, ShieldCheck, AlertTriangle } from 'lucide-react';
import { translations } from '../../data/translations';

export default function Sidebar({ alertCount = 0, lang = 'km' }) {
  const t = translations[lang] || translations.km;

  const navLinks = [
    {
      to: '/', end: true,
      icon: <LayoutDashboard size={16} />,
      label: t.dashboard,
      accent: 'var(--primary)',
      activeClass: 'active-primary'
    },
    {
      to: '/fuel', end: false,
      icon: <Fuel size={16} />,
      label: t.session1Fuel,
      accent: 'var(--fuel-accent)',
      activeClass: 'active-fuel',
      badge: alertCount > 0 ? alertCount : null
    },
    {
      to: '/soil', end: false,
      icon: <HardHat size={16} />,
      label: t.session2Soil,
      accent: 'var(--soil-accent)',
      activeClass: 'active-soil'
    }
  ];

  return (
    <aside style={{
      width: '230px',
      minWidth: '230px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand */}
      <div style={{
        padding: '18px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '11px'
      }}>
        <div style={{
          width: '34px', height: '34px',
          borderRadius: 'var(--r-sm)',
          background: 'linear-gradient(135deg, var(--primary), #3b6ae0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(79,125,245,0.3)'
        }}>
          <ShieldCheck size={18} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.1 }}>
            {t.appName}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t.appSub}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div className="section-label" style={{ padding: '0 8px 8px', marginBottom: 0, fontSize: '0.64rem' }}>
          {t.mainNav}
        </div>

        {navLinks.map(({ to, end, icon, label, accent, activeClass, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 11px',
              borderRadius: 'var(--r-sm)',
              color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
              background: isActive ? `rgba(${accent === 'var(--primary)' ? '79,125,245' : accent === 'var(--fuel-accent)' ? '245,158,11' : '16,185,129'}, 0.1)` : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.845rem',
              transition: 'var(--transition-fast)',
              borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
              marginLeft: '0',
              paddingLeft: '9px'
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? accent : 'var(--text-muted)', display: 'flex' }}>
                    {icon}
                  </span>
                  <span>{label}</span>
                </div>
                {badge !== null && badge !== undefined && (
                  <span className="badge badge-warning" style={{ fontSize: '0.63rem', padding: '2px 6px' }}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Alert Card */}
      {alertCount > 0 && (
        <div style={{ padding: '12px 10px 16px' }}>
          <div style={{
            background: 'var(--warning-subtle)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--r-sm)',
            padding: '11px 13px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
              <AlertTriangle size={13} color="var(--warning)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fuel-accent)' }}>
                {t.thresholdAlertNav}
              </span>
            </div>
            <p style={{ fontSize: '0.69rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              {t.thresholdAlertDesc}
            </p>
          </div>
        </div>
      )}

      {/* Version */}
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>v1.0.0</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>OpsMgr</span>
      </div>
    </aside>
  );
}
