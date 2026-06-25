import { useCallback } from 'react';

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

export default function NumPad({ onInput, onBackspace }) {
  const handlePress = useCallback((key) => {
    if (key === '⌫') {
      onBackspace?.();
    } else {
      onInput?.(key);
    }
    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(30);
  }, [onInput, onBackspace]);

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'numpad-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  };

  return (
    <div className="numpad-grid">
      {keys.flat().map((key, i) => (
        <button
          key={i}
          className={`numpad-key ${key === '⌫' ? 'numpad-key--backspace' : ''}`}
          onClick={(e) => { handleRipple(e); handlePress(key); }}
          type="button"
        >
          {key === '⌫' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
              <line x1="18" y1="9" x2="12" y2="15"/>
              <line x1="12" y1="9" x2="18" y2="15"/>
            </svg>
          ) : key}
        </button>
      ))}
    </div>
  );
}
