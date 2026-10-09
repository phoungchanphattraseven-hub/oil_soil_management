import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, RefreshCw, X, User, Car, ShieldCheck, Sparkles, Upload } from 'lucide-react';

// Extract dark ink from uneven paper/camera lighting. Unlike one global cutoff,
// this compares each pixel with its surrounding area and removes small specks
// plus shadows connected to the crop edges.
function cleanSignatureImage(ctx, width, height, transparent = false) {
  const image = ctx.getImageData(0, 0, width, height);
  const total = width * height;
  const gray = new Uint8Array(total);
  const integral = new Uint32Array((width + 1) * (height + 1));

  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const pixel = index * 4;
      // Perceived brightness is more reliable than a plain RGB average.
      const brightness = Math.round(image.data[pixel] * 0.299 + image.data[pixel + 1] * 0.587 + image.data[pixel + 2] * 0.114);
      gray[index] = brightness;
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
      const index = y * width + x;
      // Ink must be clearly darker than its local background and not light gray.
      if (gray[index] < mean - 17 && gray[index] < 205) ink[index] = 1;
    }
  }

  const visited = new Uint8Array(total);
  const keep = new Uint8Array(total);
  const queue = new Int32Array(total);
  const edgeMargin = Math.max(3, Math.round(Math.min(width, height) * 0.02));
  const minimumPixels = Math.max(20, Math.round(total * 0.00003));

  for (let start = 0; start < total; start++) {
    if (!ink[start] || visited[start]) continue;
    let head = 0;
    let tail = 0;
    let touchesEdge = false;
    queue[tail++] = start;
    visited[start] = 1;

    while (head < tail) {
      const current = queue[head++];
      const x = current % width;
      const y = Math.floor(current / width);
      if (x < edgeMargin || x >= width - edgeMargin || y < edgeMargin || y >= height - edgeMargin) touchesEdge = true;
      const neighbours = [current - 1, current + 1, current - width, current + width];
      for (const next of neighbours) {
        if (next < 0 || next >= total) continue;
        const nextX = next % width;
        if (Math.abs(nextX - x) > 1) continue; // Prevent wrapping across rows.
        if (ink[next] && !visited[next]) {
          visited[next] = 1;
          queue[tail++] = next;
        }
      }
    }

    if (!touchesEdge && tail >= minimumPixels) {
      for (let i = 0; i < tail; i++) keep[queue[i]] = 1;
    }
  }

  for (let i = 0; i < total; i++) {
    const pixel = i * 4;
    if (keep[i]) {
      image.data[pixel] = 15; image.data[pixel + 1] = 23; image.data[pixel + 2] = 42;
      image.data[pixel + 3] = 255;
    } else if (transparent) {
      image.data[pixel] = 0; image.data[pixel + 1] = 0; image.data[pixel + 2] = 0;
      image.data[pixel + 3] = 0;
    } else {
      image.data[pixel] = 255; image.data[pixel + 1] = 255; image.data[pixel + 2] = 255;
      image.data[pixel + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

export default function SignatureScannerModal({
  isOpen,
  onClose,
  staff = [],
  drivers = [],
  onSaveSignature,
  lang = 'km'
}) {
  const isKm = lang === 'km';
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scannerViewportRef = useRef(null);
  const scanGuideRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const [selectedType, setSelectedType] = useState('staff'); // 'staff' | 'driver'
  const [selectedTargetId, setSelectedTargetId] = useState('');

  // Auto select first available staff or driver
  useEffect(() => {
    if (staff.length > 0 && !selectedTargetId) {
      setSelectedTargetId(staff[0].id);
    }
  }, [staff]);

  // Start Camera Stream
  useEffect(() => {
    if (isOpen && !scannedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, scannedImage]);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Play Success Sound using Web Audio API Synthesizer
  const playSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: C5 (523.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Note 2: E5 (659.25Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);

      // Note 3: G5 (783.99Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.25);
      gain3.gain.setValueAtTime(0.3, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.25);
      osc3.stop(now + 0.6);
    } catch (e) {
      console.log('Sound playback error:', e);
    }
  };

  // Perform Scan Capture
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const sourceWidth = video.videoWidth || 640;
    const sourceHeight = video.videoHeight || 480;
    const viewportRect = scannerViewportRef.current?.getBoundingClientRect();
    const guideRect = scanGuideRef.current?.getBoundingClientRect();

    // The guide is drawn over a `cover` video feed. Convert its on-screen
    // rectangle back to camera pixels, so only the boxed signature is saved.
    let cropX = 0;
    let cropY = 0;
    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;
    if (viewportRect && guideRect) {
      const scale = Math.max(viewportRect.width / sourceWidth, viewportRect.height / sourceHeight);
      const renderedWidth = sourceWidth * scale;
      const renderedHeight = sourceHeight * scale;
      const offsetX = (viewportRect.width - renderedWidth) / 2;
      const offsetY = (viewportRect.height - renderedHeight) / 2;
      cropX = Math.max(0, (guideRect.left - viewportRect.left - offsetX) / scale);
      cropY = Math.max(0, (guideRect.top - viewportRect.top - offsetY) / scale);
      cropWidth = Math.min(sourceWidth - cropX, guideRect.width / scale);
      cropHeight = Math.min(sourceHeight - cropY, guideRect.height / scale);
    }

    canvas.width = Math.max(1, Math.round(cropWidth));
    canvas.height = Math.max(1, Math.round(cropHeight));
    ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

    cleanSignatureImage(ctx, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');

    setTimeout(() => {
      setIsScanning(false);
      setScannedImage(dataUrl);
      setScanSuccess(true);
      playSuccessSound();
      stopCamera();
    }, 600);
  };

  // Handle File Upload Fallback — auto-removes background for transparent PNG
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const offCtx = offscreen.getContext('2d');
        offCtx.drawImage(img, 0, 0);
        cleanSignatureImage(offCtx, img.width, img.height, true);
        const transparentDataUrl = offscreen.toDataURL('image/png');
        setScannedImage(transparentDataUrl);
        setScanSuccess(true);
        playSuccessSound();
        stopCamera();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setScannedImage(null);
    setScanSuccess(false);
    startCamera();
  };

  const handleSave = () => {
    if (!scannedImage || !selectedTargetId) return;
    onSaveSignature(selectedTargetId, scannedImage, selectedType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box scanner-modal" style={{
        maxWidth: '520px',
        background: 'var(--surface-card)',
        border: '1.5px solid var(--primary-border)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div className="modal-header" style={{
          background: 'var(--surface-subtle)'
        }}>
          <div className="modal-title-group">
            <div className="modal-icon" style={{
              background: 'var(--primary-subtle, rgba(59, 130, 246, 0.15))',
              color: 'var(--primary, #3b82f6)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {isKm ? 'ស្កេនហត្ថលេខាឌីជីថល' : 'Digital Signature Scanner'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {isKm ? 'ស្កេន និងរក្សាទុកហត្ថលេខាសម្រាប់បុគ្គលិក / រថយន្ត' : 'Scan and assign signature to staff or fleet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="modal-body scanner-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Assignment Selector */}
          <div className="scanner-targets" style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '4px' }}>
                {isKm ? 'ប្រភេទតម្រូវការ:' : 'Assign Target:'}
              </label>
              <select
                className="form-control"
                value={selectedType}
                onChange={e => {
                  setSelectedType(e.target.value);
                  if (e.target.value === 'staff' && staff.length > 0) setSelectedTargetId(staff[0].id);
                  if (e.target.value === 'driver' && drivers.length > 0) setSelectedTargetId(drivers[0].id || drivers[0].name);
                }}
                style={{ fontSize: '16px', height: '42px', lineHeight: 1.2 }}
              >
                <option value="staff">{isKm ? 'បុគ្គលិក (Staff)' : 'Staff Member'}</option>
                <option value="driver">{isKm ? 'អ្នកបើកបរ / រថយន្ត (Fleet/Driver)' : 'Fleet Driver'}</option>
              </select>
            </div>

            <div style={{ flex: 1.5 }}>
              <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '4px' }}>
                {isKm ? 'ជ្រើសរើសឈ្មោះ:' : 'Select Member:'}
              </label>
              <select
                className="form-control"
                value={selectedTargetId}
                onChange={e => setSelectedTargetId(e.target.value)}
                style={{ fontSize: '16px', height: '42px', lineHeight: 1.2 }}
              >
                {selectedType === 'staff' ? (
                  staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.license_plate ? `(${s.license_plate})` : ''}</option>
                  ))
                ) : (
                  drivers.map((d, i) => (
                    <option key={d.id || i} value={d.id || d.name}>{d.name} {d.license_plate ? `(${d.license_plate})` : ''}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Scanner View / Captured Preview */}
          <div ref={scannerViewportRef} className="scanner-viewport" style={{
            position: 'relative',
            width: '100%', height: '240px',
            borderRadius: '12px', overflow: 'hidden',
            background: cameraError ? 'var(--surface-subtle)' : '#0f172a',
            border: '2px dashed var(--primary-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {!scannedImage ? (
              !cameraError ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Bounding Box Format & Laser Beam */}
                  <div ref={scanGuideRef} className="scanner-guide" style={{
                    position: 'absolute', width: '78%', height: '52%',
                    border: '2px solid var(--primary, #3b82f6)',
                    borderRadius: '8px',
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                    pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {/* Corners */}
                    <div style={{ position: 'absolute', top: -4, left: -4, width: 16, height: 16, borderTop: '4px solid #38bdf8', borderLeft: '4px solid #38bdf8' }} />
                    <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderTop: '4px solid #38bdf8', borderRight: '4px solid #38bdf8' }} />
                    <div style={{ position: 'absolute', bottom: -4, left: -4, width: 16, height: 16, borderBottom: '4px solid #38bdf8', borderLeft: '4px solid #38bdf8' }} />
                    <div style={{ position: 'absolute', bottom: -4, right: -4, width: 16, height: 16, borderBottom: '4px solid #38bdf8', borderRight: '4px solid #38bdf8' }} />

                    {/* Animated Scanning Beam */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                      background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                      boxShadow: '0 0 12px #38bdf8',
                      animation: 'scanAnimation 2s infinite ease-in-out'
                    }} />

                    <span style={{ fontSize: '0.72rem', color: '#e2e8f0', background: 'rgba(15,23,42,0.78)', padding: '4px 9px', borderRadius: '999px', fontWeight: 600 }}>
                      {isKm ? 'ដាក់ហត្ថលេខាក្នុងប្រអប់' : 'Place signature inside box'}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
                  <Camera size={36} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: '0.82rem' }}>
                    {isKm ? 'មិនអាចបើកកាមេរ៉ាបានទេ (Camera restricted)' : 'Camera access unavailable'}
                  </span>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', marginTop: '4px' }}>
                    <Upload size={14} /> {isKm ? 'ជ្រើសរើសរូបភាពហត្ថលេខា' : 'Upload Signature Image'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              )
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <img src={scannedImage} alt="Scanned Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                
                {scanSuccess && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: '#10b981', color: '#fff', padding: '4px 10px',
                    borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '5px',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    animation: 'bounceIn 0.3s ease'
                  }}>
                    <CheckCircle2 size={14} />
                    {isKm ? 'ស្កេនជោគជ័យ!' : 'Scan Success!'}
                  </div>
                )}
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Action Buttons */}
          <div className="scanner-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            {!scannedImage ? (
              <>
                <label className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Upload size={14} /> {isKm ? 'ផ្ទុកឡើងរូប' : 'Upload File'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <button
                  onClick={handleCapture}
                  disabled={isScanning || cameraError}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    fontWeight: 700, letterSpacing: '0.3px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      {isKm ? 'កំពុងស្កេន...' : 'Scanning...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      {isKm ? 'ស្កេនហត្ថលេខា' : 'Scan Signature'}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button onClick={handleRetake} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} />
                  {isKm ? 'ស្កេនឡើងវិញ' : 'Scan Again'}
                </button>

                <button
                  onClick={handleSave}
                  className="btn btn-success btn-sm"
                  style={{
                    padding: '8px 24px', background: '#10b981', color: '#fff',
                    border: 'none', borderRadius: '8px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  {isKm ? 'រក្សាទុកហត្ថលេខា' : 'Save Signature'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanAnimation {
          0% { top: 10%; opacity: 0.8; }
          50% { top: 85%; opacity: 1; }
          100% { top: 10%; opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
