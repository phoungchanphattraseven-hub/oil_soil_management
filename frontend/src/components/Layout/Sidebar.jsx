import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Fuel, HardHat, ShieldCheck, AlertTriangle, X, Settings } from 'lucide-react';
import { translations } from '../../data/translations';

export default function Sidebar({ alertCount = 0, lang = 'km', userRole = 'user', onClose }) {
  const t = translations[lang] || translations.km;

  // Define navigation based on user role
  const getNavLinksForRole = (role) => {
    const isUser = role === 'user';

    // Base navigation items
    const baseNavLinks = [
      {
        to: '/', end: true,
        icon: <LayoutDashboard size={18} />,
        label: isUser ? (lang === 'km' ? 'ទំព័រដើម' : 'Home') : t.dashboard,
        accent: 'var(--primary)',
      },
      {
        to: '/fuel', end: false,
        icon: <Fuel size={18} />,
        label: isUser ? (lang === 'km' ? 'កត់ត្រាសាំង' : 'Fuel Log') : t.session1Fuel,
        accent: 'var(--fuel-accent)',
        // Only show alert badge for admins
        badge: (!isUser && alertCount > 0) ? alertCount : null
      },
      {
        to: '/soil', end: false,
        icon: <HardHat size={18} />,
        label: isUser ? (lang === 'km' ? ' កត់ត្រាដី' : 'Soil Log') : t.session2Soil,
        accent: 'var(--soil-accent)',
      }
    ];

    if (role === 'user') return baseNavLinks;

    // Admin gets admin panel link too
    return [
      ...baseNavLinks,
      {
        to: '/admin', end: false,
        icon: <Settings size={18} />,
        label: lang === 'km' ? 'ការគ្រប់គ្រង' : 'Admin Panel',
        accent: 'var(--primary)',
        adminOnly: true
      }
    ];
  };

  const navLinks = getNavLinksForRole(userRole);

  return (
    <aside className="app-sidebar">
      {/* Brand & Mobile Close Button */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, var(--primary), #3b6ae0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(79,125,245,0.3)'
          }}>
            <ShieldCheck size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.1 }}>
              {t.appName}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t.appSub}
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={lang === 'km' ? 'បិទ' : 'Close'}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="section-label" style={{ padding: '0 8px 8px', marginBottom: 0, fontSize: '0.64rem' }}>
          {userRole === 'user' ? (lang === 'km' ? 'កត់ត្រា' : 'REPORTING') : t.mainNav}
        </div>

        {navLinks.filter(l => !l.adminOnly).map(({ to, end, icon, label, accent, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => { if (onClose) onClose(); }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 12px',
              borderRadius: 'var(--r-sm)',
              color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
              background: isActive ? `rgba(${accent === 'var(--primary)' ? '79,125,245' : accent === 'var(--fuel-accent)' ? '245,158,11' : '16,185,129'}, 0.12)` : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.86rem',
              transition: 'var(--transition-fast)',
              borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
              paddingLeft: '10px'
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

        {/* Admin-only section */}
        {navLinks.some(l => l.adminOnly) && (
          <>
            <div className="section-label" style={{ padding: '12px 8px 6px', marginBottom: 0, fontSize: '0.64rem' }}>
              {lang === 'km' ? 'ការគ្រប់គ្រង' : 'Administration'}
            </div>
            {navLinks.filter(l => l.adminOnly).map(({ to, end, icon, label, accent }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => { if (onClose) onClose(); }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 'var(--r-sm)',
                  color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
                  background: isActive ? 'rgba(79,125,245,0.12)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.86rem',
                  transition: 'var(--transition-fast)',
                  borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                  paddingLeft: '10px'
                })}
              >
                {({ isActive }) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: isActive ? accent : 'var(--text-muted)', display: 'flex' }}>
                      {icon}
                    </span>
                    <span>{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer Alert Card — admin only */}
      {alertCount > 0 && userRole !== 'user' && (
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
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>v1.0.0 (PWA)</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Mini App</span>
      </div>
    </aside>
  );
}
