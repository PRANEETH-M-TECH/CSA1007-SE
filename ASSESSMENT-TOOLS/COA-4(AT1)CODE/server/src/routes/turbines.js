const express = require("express");
const store = require("../data/store");
const { evaluateTurbineStatus } = require("../logic/rules");

const router = express.Router();

// GET /api/turbines — FR-01: real-time performance monitoring (TC-01)
router.get("/", (req, res) => {
  res.json(store.turbines);
});

// GET /api/turbines/:id — TC-03 (offline handling happens client-side via lastContact)
router.get("/:id", (req, res) => {
  const turbine = store.turbines.find((t) => t.id === req.params.id);
  if (!turbine) return res.status(404).json({ error: "Not Found", message: `Turbine ${req.params.id} not found.` });
  res.json(turbine);
});

// POST /api/turbines/:id/telemetry — ingest a sensor reading, refresh state,
// and evaluate the Section 4.3 decision table. Mirrors TC-01, TC-02, TC-04,
// TC-05 through TC-08.
router.post("/:id/telemetry", (req, res) => {
  const turbine = store.turbines.find((t) => t.id === req.params.id);
  if (!turbine) return res.status(404).json({ error: "Not Found", message: `Turbine ${req.params.id} not found.` });

  const { rpm, power, vibration, temperature } = req.body;

  // TC-04: reject an implausible/corrupt reading and keep the last valid value.
  const rpmValid = typeof rpm === "number" && rpm >= 0 && rpm < 40;
  if (!rpmValid) {
    return res.status(422).json({
      error: "Invalid Telemetry",
      message: "RPM reading is out of plausible range; last valid value retained.",
      turbine,
    });
  }

  turbine.rpm = rpm;
  turbine.power = power ?? turbine.power;
  turbine.vibration = vibration ?? turbine.vibration;
  turbine.temperature = temperature ?? turbine.temperature;
  turbine.lastContact = new Date().toISOString();
  turbine.status = "online";

  const rpmOutOfRange = rpm > 22; // simple upper operating bound for demo purposes
  const evaluation = evaluateTurbineStatus({ vibration: turbine.vibration, temperature: turbine.temperature, rpmOutOfRange });

  if (evaluation.level !== "NORMAL") {
    store.alerts.unshift({
      id: `${turbine.id}-${Date.now()}`,
      turbineId: turbine.id,
      level: evaluation.level,
      rule: evaluation.rule,
      message: evaluation.message,
      raisedAt: new Date().toISOString(),
    });
  }

  res.json({ turbine, evaluation });
});

module.exports = router;
