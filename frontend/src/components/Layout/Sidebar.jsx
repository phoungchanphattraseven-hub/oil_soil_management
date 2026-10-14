import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Fuel, HardHat, ShieldCheck, AlertTriangle, X, Settings, Users, Building2, Gauge, UserCheck } from 'lucide-react';
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
        badge: (!isUser && alertCount > 0) ? alertCount : null
      },
      {
        to: '/soil', end: false,
        icon: <HardHat size={18} />,
        label: isUser ? (lang === 'km' ? ' កត់ត្រាដី' : 'Soil Log') : t.session2Soil,
        accent: 'var(--soil-accent)',
      },
      {
        to: '/staff', end: false,
        icon: <Users size={18} />,
        label: t.staffNav || (lang === 'km' ? 'បុគ្គលិក' : 'Staff'),
        accent: '#8b5cf6',
      },
      {
        to: '/attendance', end: false,
        icon: <UserCheck size={18} />,
        label: t.attendanceNav || (lang === 'km' ? 'វត្តមានបុគ្គលិក' : 'Attendance Report'),
        accent: '#06b6d4',
      },
      {
        to: '/stations', end: false,
        icon: <Building2 size={18} />,
        label: t.stationsNav || (lang === 'km' ? 'ស្ថានីយ៍' : 'Stations'),
        accent: '#3b82f6',
      },
      {
        to: '/stock', end: false,
        icon: <Gauge size={18} />,
        label: t.stockNav || (lang === 'km' ? 'ស្តុកសាំង' : 'Stock'),
        accent: 'var(--fuel-accent)',
        badge: alertCount > 0 ? alertCount : null
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
            style={({ isActive }) => {
              const bg = accent === 'var(--fuel-accent)'
                ? 'rgba(245, 158, 11, 0.12)'
                : accent === 'var(--soil-accent)'
                ? 'rgba(16, 185, 129, 0.12)'
                : accent === '#8b5cf6'
                ? 'rgba(139, 92, 246, 0.12)'
                : accent === '#06b6d4'
                ? 'rgba(6, 182, 212, 0.12)'
                : accent === '#3b82f6'
                ? 'rgba(59, 130, 246, 0.12)'
                : 'rgba(99, 102, 241, 0.12)';

              const border = accent === 'var(--fuel-accent)'
                ? '1px solid rgba(245, 158, 11, 0.25)'
                : accent === 'var(--soil-accent)'
                ? '1px solid rgba(16, 185, 129, 0.25)'
                : accent === '#8b5cf6'
                ? '1px solid rgba(139, 92, 246, 0.25)'
                : accent === '#06b6d4'
                ? '1px solid rgba(6, 182, 212, 0.25)'
                : accent === '#3b82f6'
                ? '1px solid rgba(59, 130, 246, 0.25)'
                : '1px solid rgba(99, 102, 241, 0.25)';

              return {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                background: isActive ? bg : 'transparent',
                border: isActive ? border : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                transition: 'all 0.15s ease',
                textDecoration: 'none'
              };
            }}
          >
            {({ isActive }) => {
              const iconBg = isActive
                ? (accent === 'var(--fuel-accent)'
                    ? 'rgba(245, 158, 11, 0.18)'
                    : accent === 'var(--soil-accent)'
                    ? 'rgba(16, 185, 129, 0.18)'
                    : accent === '#8b5cf6'
                    ? 'rgba(139, 92, 246, 0.18)'
                    : accent === '#06b6d4'
                    ? 'rgba(6, 182, 212, 0.18)'
                    : accent === '#3b82f6'
                    ? 'rgba(59, 130, 246, 0.18)'
                    : 'rgba(99, 102, 241, 0.18)')
                : 'var(--surface-subtle, rgba(255,255,255,0.04))';

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: iconBg,
                        color: isActive ? accent : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {icon}
                    </div>
                    <span style={{ color: isActive ? 'var(--text-main)' : 'var(--text-sub)' }}>
                      {label}
                    </span>
                  </div>
                {badge !== null && badge !== undefined && (
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: 'var(--danger)',
                      border: '1px solid rgba(239, 68, 68, 0.25)'
                    }}
                  >
                    {badge}
                  </span>
                )}
              </>
              );
            }}
          </NavLink>
        ))}

        {/* Admin-only section */}
        {navLinks.some(l => l.adminOnly) && (
          <>
            <div className="section-label" style={{ padding: '14px 8px 6px', marginBottom: 0, fontSize: '0.64rem' }}>
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
                  padding: '9px 12px',
                  borderRadius: '8px',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none'
                })}
              >
                {({ isActive }) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'var(--surface-subtle, rgba(255,255,255,0.04))',
                        color: isActive ? accent : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {icon}
                    </div>
                    <span style={{ color: isActive ? 'var(--text-main)' : 'var(--text-sub)' }}>
                      {label}
                    </span>
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
