import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, Fuel, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccess(true);
        // Store session token in localStorage
        localStorage.setItem('app_session_token', data.token || 'authenticated');
        localStorage.setItem('app_session_email', email.trim());
        localStorage.setItem('app_session_expiry', String(Date.now() + 24 * 60 * 60 * 1000)); // 24h
        setTimeout(() => onLoginSuccess(email.trim()), 900);
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      // Fallback: if backend is unreachable, check cached session from env
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          animation: 'pulse 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
          animation: 'pulse 10s ease-in-out infinite 2s'
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          animation: 'pulse 12s ease-in-out infinite 4s'
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Login Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', zIndex: 1
      }}>

        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(245,158,11,0.2) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '32px 32px 28px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Logo ring */}
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--primary), var(--fuel-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4), 0 0 0 6px rgba(99,102,241,0.12)',
            animation: 'fadeIn 0.6s ease 0.2s backwards'
          }}>
            <Fuel size={30} color="#fff" />
          </div>

          <h1 style={{
            fontSize: '1.4rem', fontWeight: 800,
            color: 'var(--text-main)', margin: '0 0 6px',
            letterSpacing: '-0.03em'
          }}>
            Station Management
          </h1>
          <p style={{
            fontSize: '0.78rem', color: 'var(--text-muted)',
            margin: 0, lineHeight: 1.5
          }}>
            ប្រព័ន្ធគ្រប់គ្រងប្រតិបត្តិការ · Secure Access Portal
          </p>

          {/* Official badge */}
          <div style={{
            marginTop: '12px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '20px',
            padding: '3px 12px',
            fontSize: '0.68rem', fontWeight: 700,
            color: 'var(--success)', letterSpacing: '0.05em'
          }}>
            <Shield size={11} />
            OFFICIAL · SECURE LOGIN
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px 32px 32px' }}>

          {/* Success state */}
          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--success-subtle)',
              border: '1px solid var(--success-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              animation: 'fadeIn 0.3s ease'
            }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                Login successful! Redirecting...
              </span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              animation: 'shake 0.4s ease'
            }}>
              <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{
                fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--text-sub)', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <Mail size={13} color="var(--primary)" />
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading || success}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px 11px 40px',
                    background: 'var(--bg-input, var(--bg-elevated))',
                    border: `1.5px solid ${error ? 'var(--danger-border)' : 'var(--border-medium)'}`,
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'var(--danger-border)' : 'var(--border-medium)'; e.target.style.boxShadow = 'none'; }}
                />
                <Mail size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{
                fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--text-sub)', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <Lock size={13} color="var(--fuel-accent)" />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading || success}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 42px 11px 40px',
                    background: 'var(--bg-input, var(--bg-elevated))',
                    border: `1.5px solid ${error ? 'var(--danger-border)' : 'var(--border-medium)'}`,
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--fuel-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'var(--danger-border)' : 'var(--border-medium)'; e.target.style.boxShadow = 'none'; }}
                />
                <Lock size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: 'var(--text-dim)', display: 'flex', alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading || success}
              style={{
                width: '100%',
                padding: '13px',
                background: loading || success
                  ? 'var(--border-medium)'
                  : 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: loading || success ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: loading || success ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                letterSpacing: '0.02em',
                marginTop: '4px'
              }}
              onMouseEnter={e => { if (!loading && !success) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading || success ? 'none' : '0 4px 16px rgba(99,102,241,0.35)'; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Verifying...
                </>
              ) : success ? (
                <><CheckCircle2 size={16} /> Authenticated!</>
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
              🔒 Secured access — authorized personnel only<br />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.67rem' }}>
                Session expires in 24 hours
              </span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
