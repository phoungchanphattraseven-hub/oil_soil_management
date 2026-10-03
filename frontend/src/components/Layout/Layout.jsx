import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import PwaInstallPrompt from './PwaInstallPrompt';

export default function Layout({
  children,
  activeRole,
  setActiveRole,
  alertCount,
  lang,
  setLang,
  theme,
  setTheme,
  onLogout,
  sessionEmail
}) {
  const [isSidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  // Track window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    // Initialize state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      {/* PWA Mobile Install Prompt */}
      <PwaInstallPrompt lang={lang} />

      {/* Mobile Drawer Backdrop */}
      {isMobile && isSidebarVisible && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar: Desktop fixed or Mobile slide-over drawer */}
      {(!isMobile ? isSidebarVisible : true) && (
        <div className={`sidebar-wrapper ${isMobile ? (isSidebarVisible ? 'drawer-open' : 'drawer-closed') : ''}`}>
          <Sidebar
            alertCount={alertCount}
            lang={lang}
            onClose={isMobile ? () => setSidebarVisible(false) : undefined}
          />
        </div>
      )}

      {/* Main Viewport */}
      <div className="main-viewport">
        <Header
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          alertCount={alertCount}
          isSidebarVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
          onLogout={onLogout}
          sessionEmail={sessionEmail}
        />

        <main className="app-main-content">
          {children}
        </main>

        {/* Mobile Bottom Mini App Navigation Bar */}
        <BottomNav
          alertCount={alertCount}
          lang={lang}
        />
      </div>
    </div>
  );
}
