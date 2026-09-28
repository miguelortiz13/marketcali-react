import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FaCamera, FaTimes, FaKeyboard, FaCheck, FaSyncAlt } from 'react-icons/fa';
import { playBarcodeBeep } from '../utils/audio';
import '../css/BarcodeScanner.css';

const BarcodeScanner = ({ onScan, onClose }) => {
  const html5QrCodeRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Iniciando cámara...');

  // Get available video inputs on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if found in device label
          const backCam = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('trasera') ||
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setScannerStatus('No se detectaron cámaras en este dispositivo');
        }
      })
      .catch((err) => {
        console.warn('Error al enumerar cámaras:', err);
        setScannerStatus('Permiso de cámara no concedido');
      });
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (!selectedCameraId) return;

    const html5QrCode = new Html5Qrcode("interactive-scanner-viewport", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE
      ],
      verbose: false
    });
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 15,
      qrbox: { width: 300, height: 160 },
      aspectRatio: 1.5,
      videoConstraints: {
        focusMode: "continuous"
      }
    };

    setScannerStatus('Alinea el código de barras en el recuadro');

    html5QrCode.start(
      selectedCameraId,
      config,
      (decodedText) => {
        if (decodedText) {
          // Play supermarket confirmation beep
          playBarcodeBeep('success');

          // Clean stop
          html5QrCode.stop()
            .then(() => {
              html5QrCode.clear();
              onScan(decodedText);
              if (onClose) onClose();
            })
            .catch(() => {
              onScan(decodedText);
              if (onClose) onClose();
            });
        }
      },
      () => {
        // Continuous search frame, ignore safely
      }
    ).catch((err) => {
      console.error("Error al iniciar cámara:", err);
      setScannerStatus('Error al iniciar transmisión de video');
    });

    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current.clear();
            }).catch(console.error);
          } else {
            html5QrCodeRef.current.clear();
          }
        } catch (e) {
          console.error("Error limpiando cámara:", e);
        }
      }
    };
  }, [selectedCameraId]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      playBarcodeBeep('success');
      onScan(manualCode.trim());
      if (onClose) onClose();
    }
  };

  return (
    <div className="modern-scanner-card">
      {/* Scanner Header */}
      <div className="scanner-top-bar">
        <div className="scanner-header-left">
          <FaCamera className="camera-icon" />
          <span className="scanner-title">Lector Óptico de Código de Barras</span>
        </div>

        <div className="scanner-header-right">
          {cameras.length > 1 && (
            <select
              className="camera-select-dropdown"
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              title="Cambiar Cámara"
            >
              {cameras.map((c, i) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Cámara ${i + 1}`}
                </option>
              ))}
            </select>
          )}

          {onClose && (
            <button className="btn-close-scanner" onClick={onClose} title="Cerrar Lector">
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport with Targeting Overlay */}
      <div className="scanner-camera-window">
        <div id="interactive-scanner-viewport"></div>

        {/* Viewfinder Overlay with Corner Brackets */}
        <div className="viewfinder-overlay">
          <div className="viewfinder-target-box">
            <span className="corner top-left"></span>
            <span className="corner top-right"></span>
            <span className="corner bottom-left"></span>
            <span className="corner bottom-right"></span>
            <div className="laser-scan-line"></div>
          </div>
        </div>

        <div className="scanner-status-pill">
          <span>{scannerStatus}</span>
        </div>
      </div>

      {/* Footer & Fallback manual input */}
      <div className="scanner-bottom-bar">
        <div className="supported-formats-pills">
          <span className="format-badge">EAN-13</span>
          <span className="format-badge">CODE-128</span>
          <span className="format-badge">UPC-A</span>
        </div>

        <button
          type="button"
          className="btn-toggle-manual"
          onClick={() => setShowManualInput(!showManualInput)}
        >
          <FaKeyboard />
          <span>{showManualInput ? 'Ocultar teclado' : 'Ingresar código manual'}</span>
        </button>
      </div>

      {showManualInput && (
        <form onSubmit={handleManualSubmit} className="scanner-manual-input-form">
          <input
            type="text"
            placeholder="Escribe el código de barras numérico..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-confirm-manual" disabled={!manualCode.trim()}>
            <FaCheck /> Confirmar
          </button>
        </form>
      )}
    </div>
  );
};

export default BarcodeScanner;