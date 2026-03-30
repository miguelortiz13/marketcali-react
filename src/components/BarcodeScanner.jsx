import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ onScan, onClose }) => {
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const startScanner = async () => {
      // Create new instance 
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        // Optional bounding box to focus scanning
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
      };

      try {
        await html5QrCode.start(
          { facingMode: "environment" }, // Prefer back camera
          config,
          (decodedText, decodedResult) => {
            if (decodedText) {
              onScan(decodedText);
              // Clean up nicely after scanning a valid code
              html5QrCode.stop().then(() => {
                  html5QrCode.clear();
                  onClose();
              }).catch(console.error);
            }
          },
          (errorMessage) => {
            // This triggers constantly while hunting for barcodes, safely ignore.
          }
        );
      } catch (err) {
        console.error("Error inicializando escáner html5-qrcode:", err);
      }
    };

    startScanner();

    // Cleanup function when component unmounts
    return () => {
      if (html5QrCodeRef.current) {
        try {
            if (html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().then(() => {
                    html5QrCodeRef.current.clear();
                }).catch(err => console.error("Error pausando escáner:", err));
            } else {
                html5QrCodeRef.current.clear();
            }
        } catch (e) {
            console.error("Error clearing scanner instance", e);
        }
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="scanner-viewport">
      {/* Container required by html5-qrcode */}
      <div id="reader"></div>

      {/* Visual scanning overlay */}
      <div className="scanner-overlay">
        <div className="scanner-laser"></div>
      </div>

      <style>{`
        .scanner-viewport {
            position: relative;
            width: 100%;
            height: 300px;
            overflow: hidden;
            background: #000;
            border-radius: 8px;
        }
        #reader {
            width: 100%;
            height: 100%;
        }
        #reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        .scanner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 10;
        }
        .scanner-laser {
            width: 80%;
            height: 2px;
            background: red;
            box-shadow: 0 0 4px red;
            animation: scan 2s infinite;
        }
        /* Hide unnecessary HTML5QrCode UI elements that inject automatically */
        #reader__dashboard_section_csr,
        #reader__dashboard_section_swaplink {
            display: none !important;
        }
        @keyframes scan {
            0% { transform: translateY(-50px); opacity: 0.5; }
            50% { transform: translateY(50px); opacity: 1; }
            100% { transform: translateY(-50px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;