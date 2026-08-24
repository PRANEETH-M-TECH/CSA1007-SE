import { useState } from "react";
import { api } from "../api/client.js";

const NEXT_STATUS = {
  Scheduled: "In Progress",
  "In Progress": "Completed",
};

export default function MaintenanceScheduler({ tasks, turbines, role, onChange }) {
  const [form, setForm] = useState({ turbineId: turbines[0]?.id || "", type: "", date: "" });
  const [error, setError] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.createMaintenance(form, role);
      setForm({ ...form, type: "", date: "" });
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function advance(task) {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    try {
      await api.transitionMaintenance(task.id, next, role);
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Maintenance Scheduling</h2>

      <form className="maintenance-form" onSubmit={handleCreate}>
        <select value={form.turbineId} onChange={(e) => setForm({ ...form, turbineId: e.target.value })}>
          {turbines.map((t) => (
            <option key={t.id} value={t.id}>{t.id}</option>
          ))}
        </select>
        <input
          placeholder="Task type (e.g. Bearing Inspection)"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <button type="submit">New Task</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      <p className="muted">Signed in as: <strong>{role}</strong> (change the role selector above to test access control)</p>

      <table className="task-table">
        <thead>
          <tr><th>Turbine</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.turbineId}</td>
              <td>{t.type}</td>
              <td>{t.date}</td>
              <td><span className={`status-pill status-pill--${t.status.replace(" ", "-").toLowerCase()}`}>{t.status}</span></td>
              <td>
                {NEXT_STATUS[t.status] && (
                  <button type="button" onClick={() => advance(t)}>
                    Mark {NEXT_STATUS[t.status]}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
