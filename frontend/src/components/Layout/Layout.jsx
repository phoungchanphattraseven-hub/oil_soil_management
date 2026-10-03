import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, activeRole, setActiveRole, alertCount, lang, setLang, theme, setTheme }) {
  const [isSidebarVisible, setSidebarVisible] = useState(() => {
    try { 
      const stored = localStorage.getItem('app_sidebar_visible');
      return stored !== null ? JSON.parse(stored) : true;
    }
    catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('app_sidebar_visible', JSON.stringify(isSidebarVisible)); }
    catch (e) { console.error(e); }
  }, [isSidebarVisible]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {isSidebarVisible && <Sidebar alertCount={alertCount} lang={lang} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Header activeRole={activeRole} setActiveRole={setActiveRole} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} alertCount={alertCount} isSidebarVisible={isSidebarVisible} setSidebarVisible={setSidebarVisible} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
