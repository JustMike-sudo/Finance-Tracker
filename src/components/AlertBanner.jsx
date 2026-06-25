export default function AlertBanner({ message, pillarColor }) {
  return (
    <div className="alert-banner" style={{ borderColor: 'var(--danger)' }}>
      <span className="alert-icon">⚠</span>
      <span className="alert-text">{message}</span>
    </div>
  );
}
