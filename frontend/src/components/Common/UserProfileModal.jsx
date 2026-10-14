import React, { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Shield, MapPin, Camera, Trash2, X, Check,
  Edit2, Loader2
} from 'lucide-react';

/**
 * Resize and compress image to fit within mobile localStorage quota (~50-100KB)
 */
function compressProfileImage(file, maxWidth = 320, maxHeight = 320, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try JPEG with quality first, fallback to PNG if transparent
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function getActiveUserStorageKey(sessionEmail) {
  const email = sessionEmail || localStorage.getItem('app_session_email') || '';
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const userName = localStorage.getItem('app_user_name') || '';
  const cleanName = userName ? userName.trim().toLowerCase() : '';
  return cleanEmail || cleanName || 'current_user';
}

function getStoredUserPhoto(userKey) {
  try {
    return localStorage.getItem(`app_user_photo_${userKey}`) 
      || localStorage.getItem('app_current_user_photo') 
      || '';
  } catch {
    return '';
  }
}

function saveUserPhotoToStorage(userKey, base64) {
  try {
    localStorage.setItem(`app_user_photo_${userKey}`, base64);
    localStorage.setItem('app_current_user_photo', base64);

    // Also update locally managed user record if present
    const managedRaw = localStorage.getItem('app_managed_users');
    if (managedRaw) {
      const list = JSON.parse(managedRaw);
      const email = localStorage.getItem('app_session_email') || '';
      const updated = list.map(u => {
        if (email && u.email && u.email.toLowerCase() === email.toLowerCase()) {
          return { ...u, photo_url: base64 };
        }
        return u;
      });
      localStorage.setItem('app_managed_users', JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to save profile photo into storage:', err);
  }
}

function removeUserPhotoFromStorage(userKey) {
  try {
    localStorage.removeItem(`app_user_photo_${userKey}`);
    localStorage.removeItem('app_current_user_photo');

    const managedRaw = localStorage.getItem('app_managed_users');
    if (managedRaw) {
      const list = JSON.parse(managedRaw);
      const email = localStorage.getItem('app_session_email') || '';
      const updated = list.map(u => {
        if (email && u.email && u.email.toLowerCase() === email.toLowerCase()) {
          const { photo_url, ...rest } = u;
          return rest;
        }
        return u;
      });
      localStorage.setItem('app_managed_users', JSON.stringify(updated));
    }
  } catch (err) {}
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userName = '',
  sessionEmail = '',
  userRole = 'user',
  userAssignedStation = null,
  lang = 'km',
  onUpdateProfile
}) {
  const isKm = lang === 'km';
  const fileInputRef = useRef(null);

  const userKey = getActiveUserStorageKey(sessionEmail);
  const storageNameKey = `app_user_custom_name_${userKey}`;

  const [avatarUrl, setAvatarUrl] = useState(() => getStoredUserPhoto(userKey));

  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(storageNameKey) || userName || localStorage.getItem('app_user_name') || (sessionEmail ? sessionEmail.split('@')[0].replace(/[._-]/g, ' ') : 'User');
    } catch {
      return userName || 'User';
    }
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lock background scroll completely when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      try {
        const key = getActiveUserStorageKey(sessionEmail);
        const savedPhoto = getStoredUserPhoto(key);
        const savedName = localStorage.getItem(`app_user_custom_name_${key}`) || userName || localStorage.getItem('app_user_name') || (sessionEmail ? sessionEmail.split('@')[0].replace(/[._-]/g, ' ') : 'User');
        setAvatarUrl(savedPhoto);
        setName(savedName);
        setEditedName(savedName);
      } catch {}
    }
  }, [isOpen, sessionEmail, userName]);

  if (!isOpen) return null;

  const displayName = name || (sessionEmail ? sessionEmail.split('@')[0].replace(/[._-]/g, ' ') : 'User');
  const roleLabel = userRole === 'admin' 
    ? (isKm ? 'អ្នកគ្រប់គ្រង' : 'Administrator') 
    : (isKm ? 'អ្នកប្រើប្រាស់' : 'Standard User');

  const initialLetter = (displayName || 'U').charAt(0).toUpperCase();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isKm ? 'សូមជ្រើសរើសឯកសាររូបភាព!' : 'Please select an image file!');
      return;
    }

    try {
      setIsProcessing(true);
      // Compress the image down to ~50-80KB to prevent mobile browser storage quota exceeded error
      const compressedBase64 = await compressProfileImage(file, 320, 320, 0.85);
      
      setAvatarUrl(compressedBase64);
      saveUserPhotoToStorage(userKey, compressedBase64);

      window.dispatchEvent(new Event('app_user_profile_updated'));
      if (onUpdateProfile) {
        onUpdateProfile({ avatarUrl: compressedBase64, name });
      }
      triggerSuccessFeedback();
    } catch (err) {
      console.error('Error processing photo:', err);
      alert(isKm ? 'មិនអាចរក្សាទុករូបភាពបានទេ សូមព្យាយាមម្តងទៀត' : 'Could not process photo, please try again');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    removeUserPhotoFromStorage(userKey);
    window.dispatchEvent(new Event('app_user_profile_updated'));
    if (onUpdateProfile) {
      onUpdateProfile({ avatarUrl: '', name });
    }
    triggerSuccessFeedback();
  };

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (!trimmed) return;
    setName(trimmed);
    setIsEditingName(false);
    try {
      localStorage.setItem(storageNameKey, trimmed);
      localStorage.setItem('app_user_name', trimmed);
      window.dispatchEvent(new Event('app_user_profile_updated'));
      if (onUpdateProfile) {
        onUpdateProfile({ avatarUrl, name: trimmed });
      }
    } catch {}
    triggerSuccessFeedback();
  };

  const triggerSuccessFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const stationName = userAssignedStation?.name || (isKm ? 'គ្រប់ស្ថានីយ៍ទាំងអស់' : 'All Stations');

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        zIndex: 1200,
        overscrollBehavior: 'contain'
      }}
    >
      <div
        className="modal-box modal-box-sm"
        style={{
          maxWidth: '440px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header — Consistent with application design system */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {isKm ? 'គណនីផ្ទាល់ខ្លួន' : 'User Profile'}
              </h3>
              <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>
                {isKm ? 'ព័ត៌មានលម្អិត និងរូបតំណាង' : 'Account details and avatar'}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body with internal scrolling */}
        <div
          className="modal-body"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Notification Toast */}
          {saveSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--success-subtle)',
                border: '1px solid var(--success-border)',
                color: 'var(--success)',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <Check size={14} />
              <span>{isKm ? 'បានរក្សាទុកការផ្លាស់ប្តូរ!' : 'Changes saved successfully!'}</span>
            </div>
          )}

          {/* Profile Photo Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)'
            }}
          >
            {/* Avatar Display */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--border-medium)',
                    display: 'block'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    border: '1px solid var(--primary-border)'
                  }}
                >
                  {initialLetter}
                </div>
              )}
            </div>

            {/* Photo Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {isKm ? 'រូបថតគណនី' : 'Profile Picture'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isKm ? 'JPG, PNG ឬ WebP (អតិបរមា 5MB)' : 'JPG, PNG or WebP (max 5MB)'}
              </span>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-sm"
                  disabled={isProcessing}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? 'wait' : 'pointer'
                  }}
                >
                  {isProcessing ? <Loader2 size={13} className="spin" /> : <Camera size={13} />}
                  <span>{isProcessing ? (isKm ? 'កំពុងដំណើរការ...' : 'Compressing...') : (isKm ? 'ប្តូររូប' : 'Upload')}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn btn-sm"
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      background: 'var(--danger-subtle)',
                      border: '1px solid var(--danger-border)',
                      color: 'var(--danger)'
                    }}
                    title={isKm ? 'លុបរូប' : 'Remove'}
                  >
                    <Trash2 size={13} />
                    <span>{isKm ? 'លុប' : 'Remove'}</span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* User Display Name Section */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-sub)',
                marginBottom: '6px'
              }}
            >
              {isKm ? 'ឈ្មោះបង្ហាញ' : 'Display Name'}
            </label>
            {isEditingName ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="form-control"
                  style={{
                    flex: 1,
                    fontSize: '0.85rem',
                    padding: '8px 12px'
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 14px' }}
                >
                  <Check size={14} />
                  <span>{isKm ? 'រក្សាទុក' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedName(name);
                    setIsEditingName(false);
                  }}
                  className="btn btn-sm"
                  style={{
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)'
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditedName(name);
                    setIsEditingName(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 6px'
                  }}
                >
                  <Edit2 size={13} />
                  <span>{isKm ? 'កែប្រែ' : 'Edit'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Account Details Form Rows */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden'
            }}
          >
            {/* Email Field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '11px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Mail size={14} />
                <span>{isKm ? 'អ៊ីមែល' : 'Email'}</span>
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {sessionEmail || 'N/A'}
              </div>
            </div>

            {/* Role Field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '11px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Shield size={14} />
                <span>{isKm ? 'តួនាទី' : 'Role'}</span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--r-xs)',
                    background: userRole === 'admin' ? 'var(--warning-subtle)' : 'var(--primary-subtle)',
                    color: userRole === 'admin' ? 'var(--warning)' : 'var(--primary)',
                    border: `1px solid ${userRole === 'admin' ? 'var(--warning-border)' : 'var(--primary-border)'}`
                  }}
                >
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Assigned Station Field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '11px 14px',
                background: 'var(--surface-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <MapPin size={14} />
                <span>{isKm ? 'ស្ថានីយ៍' : 'Station'}</span>
              </div>
              <div style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {stationName}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            style={{
              padding: '7px 18px',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-main)'
            }}
          >
            {isKm ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
