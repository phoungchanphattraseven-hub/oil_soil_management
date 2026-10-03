import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallPrompt({ lang = 'km' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || isDismissed || isInstalled) {
    return null;
  }

  const isKm = lang === 'km';

  return (
    <aside
      aria-label="PWA Install Prompt"
      style={{
        position: 'fixed',
        top: '64px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '460px',
        zIndex: 1100,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(79, 125, 245, 0.4)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(79, 125, 245, 0.25)',
        borderRadius: '16px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <img
          src="/pwa-192x192.png"
          alt="App Icon"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            objectFit: 'cover',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Smartphone size={13} color="var(--primary)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isKm ? 'ដំឡើងកម្មវិធីទូរស័ព្ទ (Mini App)' : 'Install Mobile Mini App'}
            </span>
          </div>
          <div style={{
            fontSize: '0.71rem',
            color: 'var(--text-muted)',
            marginTop: '2px',
            lineHeight: 1.2
          }}>
            {isKm ? 'ប្រើប្រាស់លឿនជាងមុន និងដំណើរការក្រៅបណ្តាញ' : 'Fast, native-like offline experience'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, var(--primary), #3b6ae0)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 12px',
            fontSize: '0.76rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79, 125, 245, 0.4)'
          }}
        >
          <Download size={13} />
          <span>{isKm ? 'ដំឡើង' : 'Install'}</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px'
          }}
          title={isKm ? 'បិទ' : 'Dismiss'}
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
