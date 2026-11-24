import { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

let audioCtx = null;
/** Short beep using the Web Audio API (simulates the Arduino piezo buzzer). */
export function beep(freq = 1760, ms = 140) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + ms / 1000);
  } catch { /* audio not available — silently ignore */ }
}

/**
 * Software simulation of the Arduino feedback: red LED while away from the
 * optimum, amber when close, green + buzzer beep exactly at the maximum.
 * The website never needs real hardware for this.
 */
export default function FeedbackIndicator({ percent, isMax, sound, onToggleSound, compact = false }) {
  const was = useRef(isMax);
  useEffect(() => {
    if (isMax && !was.current && sound) beep();
    was.current = isMax;
  }, [isMax, sound]);

  const near = !isMax && percent >= 97;
  return (
    <div className={`feedback${compact ? ' compact' : ''}`}>
      <div className="leds" aria-label={isMax ? 'Green LED on: maximum' : near ? 'Amber LED on: close to maximum' : 'Red LED on'}>
        <span className={`led red${!isMax && !near ? ' on' : ''}`} />
        <span className={`led amber${near ? ' on' : ''}`} />
        <span className={`led green${isMax ? ' on' : ''}`} />
      </div>
      <div className="feedback-text">
        <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>SIMULATED ARDUINO FEEDBACK</div>
        <div style={{ fontWeight: 600 }}>{isMax ? 'Maximum reached — buzzer beeps' : near ? 'Very close to the maximum' : 'Not yet at the maximum'}</div>
      </div>
      <button className="btn btn-sm" onClick={onToggleSound} aria-pressed={sound} title="Toggle buzzer sound">
        {sound ? <Volume2 size={15} /> : <VolumeX size={15} />} {sound ? 'Buzzer on' : 'Buzzer off'}
      </button>
    </div>
  );
}
