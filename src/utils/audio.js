// Web Audio API beep generator for supermarket checkout experience
let audioCtx = null;

export const playBarcodeBeep = (type = 'success') => {
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }

        if (!audioCtx) return;

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'success') {
            // Crisp, pleasant high retail beep (1850Hz, 70ms)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1850, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'error') {
            // Low double error buzz (250Hz)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(250, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.warn('AudioContext not allowed or not supported:', e);
    }
};
