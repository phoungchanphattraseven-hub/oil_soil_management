import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Camera, RefreshCw } from 'lucide-react';

/**
 * ImageUploader component converts file uploads into Base64 Data URLs so images can be stored & displayed directly.
 */
export default function ImageUploader({
  value = '',
  onChange,
  label = 'Upload Image',
  hint = 'PNG, JPG, WEBP up to 5MB',
  compact = false
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    // Limit to 5MB for base64 safety in localStorage / JSON
    if (file.size > 5 * 1024 * 1024) {
      alert('File size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (onChange) {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader-container" style={{ width: '100%' }}>
      {label && (
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Camera size={14} style={{ color: 'var(--primary)' }} />
          <span>{label}</span>
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {value ? (
        /* Preview State */
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--card-bg-elevated)',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: compact ? '48px' : '72px',
            height: compact ? '48px' : '72px',
            borderRadius: 'var(--radius-xs)',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#000',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={value}
              alt="Uploaded Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px 0' }}>
              Image Attached
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Base64 Ready
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-icon"
              title="Change Image"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn-icon"
              title="Remove Image"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px dashed var(--primary)' : '1px dashed var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: compact ? '12px 14px' : '18px',
            background: isDragging ? 'var(--primary-subtle)' : 'var(--bg-card)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: compact ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: compact ? 'flex-start' : 'center',
            gap: compact ? '10px' : '6px'
          }}
        >
          <div style={{
            width: compact ? '32px' : '40px',
            height: compact ? '32px' : '40px',
            borderRadius: '50%',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Upload size={compact ? 16 : 20} />
          </div>

          <div style={{ textAlign: compact ? 'left' : 'center' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Click to upload image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>or drag & drop</span>
            </p>
            {hint && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {hint}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
