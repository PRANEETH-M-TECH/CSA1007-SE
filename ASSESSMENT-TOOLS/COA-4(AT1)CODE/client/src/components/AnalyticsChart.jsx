import { useState } from "react";
import { api } from "../api/client.js";

export default function AnalyticsChart() {
  const [range, setRange] = useState({ start: "2026-07-01", end: "2026-07-31" });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function generate(e) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.getAnalytics(range.start, range.end);
      setReport(data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    }
  }

  const maxOutput = report ? Math.max(...report.turbines.map((t) => t.output), 1) : 1;

  return (
    <div className="card">
      <h2>Operational Analytics</h2>
      <form className="maintenance-form" onSubmit={generate}>
        <input type="date" value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })} />
        <input type="date" value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })} />
        <button type="submit">Generate Report</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {report && (
        <div className="analytics-bars">
          {report.turbines.map((t) => (
            <div className="analytics-bar-row" key={t.turbineId}>
              <span className="analytics-bar-label">{t.turbineId}</span>
              <div className="analytics-bar-track">
                <div className="analytics-bar-fill" style={{ width: `${(t.output / maxOutput) * 100}%` }} />
              </div>
              <span className="analytics-bar-value">{t.output} MW · {t.maintenanceCount} task(s)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
