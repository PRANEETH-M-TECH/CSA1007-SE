const express = require("express");
const store = require("../data/store");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/weather/:site — FR-04: current conditions. Mirrors TC-13.
router.get("/:site", (req, res) => {
  const weather = store.weatherBySite[req.params.site];
  if (!weather) return res.status(404).json({ error: "Not Found", message: `No weather feed for site ${req.params.site}.` });
  res.json({ site: req.params.site, ...weather });
});

// GET /api/weather/:site/history?start=&end= — Mirrors TC-15.
router.get("/:site/history", (req, res) => {
  const { start, end } = req.query;
  const rows = store.weatherHistory.filter(
    (r) => r.site === req.params.site && (!start || r.date >= start) && (!end || r.date <= end)
  );
  res.json(rows);
});

// POST /api/weather/:site/advisory — simulate a storm advisory (operator/admin
// only). Mirrors TC-14: flags every dashboard and the site's maintenance risk.
router.post("/:site/advisory", requireRole("operator", "administrator"), (req, res) => {
  const weather = store.weatherBySite[req.params.site];
  if (!weather) return res.status(404).json({ error: "Not Found", message: `No weather feed for site ${req.params.site}.` });

  weather.advisory = req.body.advisory || "Storm Advisory";
  weather.updatedAt = new Date().toISOString();
  res.json({ site: req.params.site, ...weather, maintenanceFlag: "weather risk" });
});

module.exports = router;
