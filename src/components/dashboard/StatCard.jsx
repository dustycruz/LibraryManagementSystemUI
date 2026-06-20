export default function StatCard({ title, value, color }) {
    return (
      <div className="stat-card-flat">
        <div
          className="stat-icon-flat"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {/* optional icon slot if you still use emoji inside title */}
        </div>
  
        <div className="stat-content">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    );
  }