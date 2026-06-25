export default function PillarCard({ pillar, selected, onClick, spent, budget }) {
  const isSelected = selected === pillar.id;
  
  return (
    <button
      className={`pillar-card ${isSelected ? 'pillar-card--selected' : ''}`}
      onClick={() => onClick(pillar.id)}
      style={{
        '--pillar-color': pillar.color,
        borderColor: isSelected ? pillar.color : 'var(--border)',
        boxShadow: isSelected ? `0 0 20px ${pillar.color}25, inset 0 0 20px ${pillar.color}10` : 'none',
      }}
      type="button"
    >
      <span className="pillar-icon">{pillar.icon}</span>
      <span className="pillar-label">{pillar.label.toUpperCase()}</span>
      {budget !== undefined && (
        <span className="pillar-progress" style={{ color: spent > budget ? 'var(--danger)' : pillar.color }}>
          {Math.round((spent / (budget || 1)) * 100)}%
        </span>
      )}
    </button>
  );
}
