import { CURRENCY } from '../utils/constants';

export default function WeeklyGauge({ spent, threshold, weekNum }) {
  const ratio = threshold > 0 ? Math.min(spent / threshold, 1.5) : 0;
  const cappedRatio = Math.min(ratio, 1);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - cappedRatio * 0.75);
  
  let color = 'var(--accent-survival)';
  if (ratio > 0.75) color = 'var(--accent-culture)';
  if (ratio > 1) color = 'var(--danger)';

  return (
    <div className="weekly-gauge">
      <svg viewBox="0 0 120 120" className="gauge-svg">
        {/* Background arc */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform="rotate(135 60 60)"
        />
        {/* Progress arc */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(135 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="gauge-inner">
        <span className="gauge-label">WEEK {weekNum}</span>
        <span className="gauge-value">{CURRENCY}{spent.toLocaleString()}</span>
        <span className="gauge-sublabel">of {CURRENCY}{threshold.toLocaleString()}</span>
      </div>
    </div>
  );
}
