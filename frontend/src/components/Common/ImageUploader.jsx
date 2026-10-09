import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Camera, RefreshCw } from 'lucide-react';

/**
 * Remove paper/background from a signature image, keeping only ink strokes
 * on a fully transparent canvas. Uses adaptive (local-mean) thresholding
 * so it works even with uneven lighting or camera shadows.
 */
function removeSignatureBackground(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const total = width * height;
      const gray = new Uint8Array(total);
      const integral = new Uint32Array((width + 1) * (height + 1));

      for (let y = 0; y < height; y++) {
        let rowSum = 0;
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const px = idx * 4;
          const brightness = Math.round(imageData.data[px] * 0.299 + imageData.data[px + 1] * 0.587 + imageData.data[px + 2] * 0.114);
          gray[idx] = brightness;
          rowSum += brightness;
          integral[(y + 1) * (width + 1) + x + 1] = integral[y * (width + 1) + x + 1] + rowSum;
        }
      }

      const ink = new Uint8Array(total);
      const radius = Math.max(12, Math.round(Math.min(width, height) * 0.045));
      for (let y = 0; y < height; y++) {
        const top = Math.max(0, y - radius);
        const bottom = Math.min(height - 1, y + radius);
        for (let x = 0; x < width; x++) {
          const left = Math.max(0, x - radius);
          const right = Math.min(width - 1, x + radius);
          const stride = width + 1;
          const sum = integral[(bottom + 1) * stride + right + 1] - integral[top * stride + right + 1] - integral[(bottom + 1) * stride + left] + integral[top * stride + left];
          const mean = sum / ((right - left + 1) * (bottom - top + 1));
          const idx = y * width + x;
          if (gray[idx] < mean - 17 && gray[idx] < 205) ink[idx] = 1;
        }
      }

      const visited = new Uint8Array(total);
      const keep = new Uint8Array(total);
      const queue = new Int32Array(total);
      const edgeMargin = Math.max(3, Math.round(Math.min(width, height) * 0.02));
      const minimumPixels = Math.max(20, Math.round(total * 0.00003));

      for (let start = 0; start < total; start++) {
        if (!ink[start] || visited[start]) continue;
        let head = 0, tail = 0;
        let touchesEdge = false;
        queue[tail++] = start;
        visited[start] = 1;
        while (head < tail) {
          const current = queue[head++];
          const cx = current % width;
          const cy = Math.floor(current / width);
          if (cx < edgeMargin || cx >= width - edgeMargin || cy < edgeMargin || cy >= height - edgeMargin) touchesEdge = true;
          for (const next of [current - 1, current + 1, current - width, current + width]) {
            if (next < 0 || next >= total) continue;
            if (Math.abs((next % width) - cx) > 1) continue;
            if (ink[next] && !visited[next]) { visited[next] = 1; queue[tail++] = next; }
          }
        }
        if (!touchesEdge && tail >= minimumPixels) {
          for (let i = 0; i < tail; i++) keep[queue[i]] = 1;
        }
      }

      for (let i = 0; i < total; i++) {
        const px = i * 4;
        if (keep[i]) {
          imageData.data[px] = 15; imageData.data[px + 1] = 23; imageData.data[px + 2] = 42;
          imageData.data[px + 3] = 255;
        } else {
          imageData.data[px] = 0; imageData.data[px + 1] = 0; imageData.data[px + 2] = 0;
          imageData.data[px + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

/**
 * ImageUploader component converts file uploads into Base64 Data URLs so images can be stored & displayed directly.
 */
export default function ImageUploader({
  value = '',
  onChange,
  label = 'Upload Image',
  hint = 'PNG, JPG, WEBP up to 5MB',
  compact = false,
  removeBackground = false
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
    reader.onload = async (event) => {
      let result = event.target.result;
      if (removeBackground) {
        result = await removeSignatureBackground(result);
      }
      if (onChange) {
        onChange(result);
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
