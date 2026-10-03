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
    <div
      className="pwa-install-toast"
      aria-label="PWA Install Prompt"
      style={{
        position: 'fixed',
        bottom: 'calc(68px + env(safe-area-inset-bottom, 10px))',
        left: '12px',
        right: '12px',
        maxWidth: '440px',
        margin: '0 auto',
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(79, 125, 245, 0.35)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(79, 125, 245, 0.2)',
        borderRadius: '14px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        animation: 'slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
        <img
          src="/pwa-192x192.png"
          alt="App Icon"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Smartphone size={13} color="var(--primary)" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isKm ? 'ដំឡើងកម្មវិធី Mini App' : 'Install Mini App'}
            </span>
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            marginTop: '1px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isKm ? 'បន្ថែមទៅលើអេក្រង់ដើមទូរស័ព្ទ' : 'Add to home screen'}
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
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(79, 125, 245, 0.35)'
          }}
        >
          <Download size={12} />
          <span>{isKm ? 'ដំឡើង' : 'Install'}</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px'
          }}
          title={isKm ? 'បិទ' : 'Dismiss'}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
