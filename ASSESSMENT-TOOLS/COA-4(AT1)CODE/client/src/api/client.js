const BASE = "/api";

async function request(path, { method = "GET", role, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { "x-user-role": role } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  getTurbines: () => request("/turbines"),
  getAlerts: () => request("/alerts"),
  getOptimization: (windSpeed) => request(`/optimization?windSpeed=${windSpeed}`),
  getWeather: (site) => request(`/weather/${site}`),
  getMaintenance: () => request("/maintenance"),
  createMaintenance: (task, role) => request("/maintenance", { method: "POST", role, body: task }),
  transitionMaintenance: (id, status, role) => request(`/maintenance/${id}`, { method: "PATCH", role, body: { status } }),
  getAnalytics: (start, end) => request(`/analytics?start=${start}&end=${end}`),
};
