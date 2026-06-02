export default function StatCard({ title, value, icon, color = 'blue' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-title">{title}</div>
    </div>
  );
}
