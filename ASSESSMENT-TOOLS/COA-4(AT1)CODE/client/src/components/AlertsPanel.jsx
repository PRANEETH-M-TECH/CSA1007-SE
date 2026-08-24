const LEVEL_LABELS = {
  WARNING: "Predictive Warning",
  CRITICAL: "Critical Alert",
  EMERGENCY_SHUTDOWN: "Emergency Shutdown",
};

export default function AlertsPanel({ alerts }) {
  return (
    <div className="card">
      <h2>Alerts</h2>
      {alerts.length === 0 ? (
        <p className="muted">No active alerts.</p>
      ) : (
        <ul className="alert-list">
          {alerts.map((a) => (
            <li key={a.id} className={`alert alert--${a.level.toLowerCase()}`}>
              <span className="alert__level">{LEVEL_LABELS[a.level] || a.level}</span>
              <span className="alert__turbine">{a.turbineId}</span>
              <span className="alert__message">{a.message}</span>
              <span className="alert__time">{new Date(a.raisedAt).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
