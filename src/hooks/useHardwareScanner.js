import { useEffect, useRef } from 'react';
import { playBarcodeBeep } from '../utils/audio';

/**
 * Custom hook to listen for hardware USB/Bluetooth HID barcode scanners.
 * Physical scanners emit keystrokes at very high speed (< 50ms per key) followed by Enter.
 * 
 * @param {Object} options
 * @param {Function} options.onScan - Callback invoked when a valid barcode is received: (barcode: string) => void
 * @param {boolean} options.enabled - Whether listening is enabled (default: true)
 * @param {number} options.maxDelayMs - Max time between keystrokes to classify as scanner (default: 60ms)
 * @param {number} options.minBarcodeLength - Minimum characters for a barcode (default: 3)
 */
export const useHardwareScanner = ({
    onScan,
    enabled = true,
    maxDelayMs = 60,
    minBarcodeLength = 3
}) => {
    const bufferRef = useRef('');
    const lastTimeRef = useRef(0);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            // Ignore modifiers
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
                return;
            }

            const now = Date.now();
            const timeDiff = now - lastTimeRef.current;
            lastTimeRef.current = now;

            // If user took too long, reset the buffer (human typing vs hardware scanner)
            // Exception: first character
            if (bufferRef.current.length > 0 && timeDiff > maxDelayMs) {
                bufferRef.current = '';
            }

            if (e.key === 'Enter') {
                const barcode = bufferRef.current.trim();
                if (barcode.length >= minBarcodeLength) {
                    // Prevent form submissions if inside a form
                    e.preventDefault();
                    e.stopPropagation();

                    // Play supermarket audio beep
                    playBarcodeBeep('success');

                    // Trigger callback
                    if (onScan) {
                        onScan(barcode);
                    }
                }
                bufferRef.current = '';
                return;
            }

            // Only capture printable characters (letters, numbers, basic symbols)
            if (e.key.length === 1) {
                // If focus is currently on an active input/textarea and the user is typing slowly, don't interfere
                const activeTag = document.activeElement?.tagName?.toLowerCase();
                const isInputActive = activeTag === 'input' || activeTag === 'textarea';

                if (isInputActive && timeDiff > maxDelayMs && bufferRef.current.length === 0) {
                    // Normal human typing inside an input, do not buffer
                    return;
                }

                bufferRef.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [onScan, enabled, maxDelayMs, minBarcodeLength]);
};

export default useHardwareScanner;
