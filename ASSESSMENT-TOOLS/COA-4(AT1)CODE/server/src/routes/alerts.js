const express = require("express");
const store = require("../data/store");

const router = express.Router();

// GET /api/alerts — FR-02/FR-07: predictive failure alerts.
// TC-08 (multiple simultaneous alerts): every alert raised by
// POST /api/turbines/:id/telemetry is kept, each tagged with its own
// turbine ID, so concurrent breaches never overwrite one another (NFR-05).
router.get("/", (req, res) => {
  res.json(store.alerts);
});

module.exports = router;
