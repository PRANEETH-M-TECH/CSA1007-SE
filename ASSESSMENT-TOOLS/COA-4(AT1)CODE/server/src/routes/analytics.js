const express = require("express");
const store = require("../data/store");
const { isValidDateRange } = require("../logic/rules");

const router = express.Router();

// GET /api/analytics?start=YYYY-MM-DD&end=YYYY-MM-DD — FR-06.
// TC-20 (normal range), TC-21 (single-day range), TC-22 (end before start).
router.get("/", (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Bad Request", message: "start and end query parameters are required." });
  }
  if (!isValidDateRange(start, end)) {
    return res.status(422).json({ error: "Validation Error", message: "End date must be after start date." });
  }

  const tasksInRange = store.getMaintenanceTasks().filter((t) => t.date >= start && t.date <= end);

  const perTurbine = store.turbines.map((t) => ({
    turbineId: t.id,
    downtimeHours: 0, // populated from real telemetry history in a production build
    output: t.power,
    maintenanceCount: tasksInRange.filter((task) => task.turbineId === t.id).length,
  }));

  res.json({ start, end, generatedAt: new Date().toISOString(), turbines: perTurbine });
});

module.exports = router;
