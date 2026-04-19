export default function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card-dash">
      <div className="stat-card-icon" style={color ? { background: color } : undefined}>
        {icon}
      </div>
      <div>
        <div className="stat-card-num">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
}
