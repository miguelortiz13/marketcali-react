import { useEffect, useRef } from 'react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const QuaggaRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let stream = null;

    const initializeScanner = async () => {
      try {
        // 1. Primero intentamos con la API nativa
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_128']
          });

          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });

          const video = document.createElement('video');
          videoRef.current = video;
          video.srcObject = stream;
          video.autoplay = true;
          video.playsInline = true;
          scannerRef.current.appendChild(video);

          const detectBarcode = async () => {
            if (!videoRef.current) return;

            try {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes.length > 0) {
                onScan(barcodes[0].rawValue);
                onClose();
              }
            } catch (err) {
              console.error('Error en detección:', err);
            }

            animationFrameRef.current = requestAnimationFrame(detectBarcode);
          };

          animationFrameRef.current = requestAnimationFrame(detectBarcode);
          return;
        }

        // 2. Fallback a Quagga.js
        const Quagga = await import('quagga').then(module => module.default);
        QuaggaRef.current = Quagga;

        await Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: 1280,
              height: 720,
              facingMode: "environment"
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: 2,
          frequency: 10,
          decoder: {
            readers: ["ean_reader", "code_128_reader", "ean_8_reader", "code_39_reader", "upc_reader"],
          },
          locate: true
        }, function (err) {
          if (err) {
            console.error('Error al inicializar Quagga:', err);
            return;
          }
          Quagga.start();
        });

        Quagga.onDetected((result) => {
          if (result?.codeResult?.code) {
            onScan(result.codeResult.code);
            onClose();
          }
        });
      } catch (err) {
        console.error('Error al inicializar escáner:', err);
        onClose();
      }
    };

    initializeScanner();

    return () => {
      // Limpieza para API nativa
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }

      // Limpieza para Quagga
      if (QuaggaRef.current) {
        try {
          QuaggaRef.current.offDetected();
          QuaggaRef.current.stop();
        } catch (e) {
          console.log('Error limpiando Quagga:', e);
        }
      }
    };
  }, [onScan, onClose]);

  return (
    <div ref={scannerRef} className="scanner-viewport">
      {/* Helper visual para el usuario */}
      <div className="scanner-overlay">
        <div className="scanner-laser"></div>
      </div>
      <style>{`
            .scanner-viewport {
                position: relative;
                width: 100%;
                height: 300px;
                overflow: hidden;
            }
            .scanner-viewport video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .scanner-viewport canvas {
                display: none;
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