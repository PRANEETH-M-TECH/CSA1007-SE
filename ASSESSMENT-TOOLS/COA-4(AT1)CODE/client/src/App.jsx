import { useEffect, useState, useCallback } from "react";
import { api } from "./api/client.js";
import TurbineCard from "./components/TurbineCard.jsx";
import AlertsPanel from "./components/AlertsPanel.jsx";
import WeatherPanel from "./components/WeatherPanel.jsx";
import MaintenanceScheduler from "./components/MaintenanceScheduler.jsx";
import AnalyticsChart from "./components/AnalyticsChart.jsx";

const SITE = "Block-B";

export default function App() {
  const [turbines, setTurbines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [t, a, w, m] = await Promise.all([
      api.getTurbines(),
      api.getAlerts(),
      api.getWeather(SITE),
      api.getMaintenance(),
    ]);
    setTurbines(t);
    setAlerts(a);
    setWeather(w);
    setTasks(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // NFR-02: refresh within 5s
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Smart Offshore Wind Farm Management Platform</h1>
          <p className="muted">Problem Statement 11 · CSA1007 Software Engineering</p>
        </div>
        <label className="role-select">
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="operator">Operator</option>
            <option value="administrator">Administrator</option>
          </select>
        </label>
      </header>

      {loading ? (
        <p className="muted">Loading dashboard…</p>
      ) : (
        <main className="app-grid">
          <section className="turbine-grid">
            {turbines.map((t) => (
              <TurbineCard key={t.id} turbine={t} />
            ))}
          </section>

          <AlertsPanel alerts={alerts} />
          <WeatherPanel site={SITE} weather={weather} />
          <MaintenanceScheduler tasks={tasks} turbines={turbines} role={role} onChange={refresh} />
          <AnalyticsChart />
        </main>
      )}
    </div>
  );
}
