const express = require("express");
const { classifyWindSpeed } = require("../logic/rules");

const router = express.Router();

// GET /api/optimization?windSpeed=12 — FR-03: energy-generation optimisation.
// Mirrors TC-09 (normal), TC-10/TC-11 (cut-in/cut-out boundaries), TC-12 (invalid).
router.get("/", (req, res) => {
  const windSpeed = Number(req.query.windSpeed);
  const classification = classifyWindSpeed(windSpeed);

  let recommendation = null;
  if (classification.state === "GENERATING") {
    // Simple illustrative pitch/yaw recommendation, not a real aerodynamic model.
    const pitch = Math.max(0, Math.min(25, 20 - windSpeed)).toFixed(1);
    recommendation = { bladePitchDeg: Number(pitch), yawAdjustment: "aligned to prevailing direction" };
  }

  res.json({ windSpeed, ...classification, recommendation });
});

module.exports = router;
