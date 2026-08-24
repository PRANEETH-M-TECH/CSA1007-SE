/**
 * In-memory data store.
 *
 * This is intentionally not a real database — it keeps the demo runnable
 * with zero setup (no credentials, no migrations). Swapping this module for
 * a PostgreSQL-backed repository is the natural next step flagged in
 * docs/architecture.md; every route only talks to the functions exported
 * here, so that swap would not touch route or logic code.
 */

const turbines = [
  { id: "WT-009", site: "Block-B", status: "online", rpm: 14.1, power: 1.9, vibration: 2.0, temperature: 41, lastContact: new Date().toISOString() },
  { id: "WT-014", site: "Block-B", status: "online", rpm: 15.2, power: 2.1, vibration: 0.8, temperature: 42, lastContact: new Date().toISOString() },
  { id: "WT-021", site: "Block-A", status: "online", rpm: 13.8, power: 1.8, vibration: 1.1, temperature: 39, lastContact: new Date().toISOString() },
  { id: "WT-030", site: "Block-A", status: "online", rpm: 14.9, power: 2.0, vibration: 2.1, temperature: 38, lastContact: new Date().toISOString() },
  { id: "WT-045", site: "Block-C", status: "online", rpm: 15.5, power: 2.2, vibration: 1.4, temperature: 40, lastContact: new Date().toISOString() },
];

const alerts = []; // populated as telemetry is ingested — see routes/alerts.js

const weatherBySite = {
  "Block-A": { windSpeed: 11, waveHeight: 1.4, visibility: "Good", temperature: 19, advisory: null, updatedAt: new Date().toISOString() },
  "Block-B": { windSpeed: 12, waveHeight: 1.6, visibility: "Good", temperature: 18, advisory: null, updatedAt: new Date().toISOString() },
  "Block-C": { windSpeed: 9, waveHeight: 1.1, visibility: "Moderate", temperature: 20, advisory: null, updatedAt: new Date().toISOString() },
};

const weatherHistory = []; // { site, date, windSpeed, waveHeight }

let maintenanceTasks = [
  { id: 1, turbineId: "WT-014", type: "Bearing Inspection", date: "2026-09-05", status: "Scheduled", createdBy: "operator" },
];
let nextTaskId = 2;

const analyticsLog = [
  // { turbineId, date, downtimeHours, outputMWh }
];

module.exports = {
  turbines,
  alerts,
  weatherBySite,
  weatherHistory,
  getMaintenanceTasks: () => maintenanceTasks,
  addMaintenanceTask: (task) => {
    const newTask = { id: nextTaskId++, status: "Scheduled", ...task };
    maintenanceTasks.push(newTask);
    return newTask;
  },
  updateMaintenanceTask: (id, updates) => {
    const idx = maintenanceTasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    maintenanceTasks[idx] = { ...maintenanceTasks[idx], ...updates };
    return maintenanceTasks[idx];
  },
  analyticsLog,
};
