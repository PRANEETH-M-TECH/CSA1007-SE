const express = require("express");
const store = require("../data/store");
const { requireRole } = require("../middleware/auth");
const { isFutureOrToday, hasConflict, canTransition } = require("../logic/rules");

const router = express.Router();

// GET /api/maintenance — list all tasks.
router.get("/", (req, res) => {
  res.json(store.getMaintenanceTasks());
});

// POST /api/maintenance — FR-05: create a task (operator/administrator only, FR-08).
// TC-16 (normal), TC-17 (conflict), TC-19 (past date).
router.post("/", requireRole("operator", "administrator"), (req, res) => {
  const { turbineId, type, date } = req.body;

  if (!turbineId || !type || !date) {
    return res.status(400).json({ error: "Bad Request", message: "turbineId, type and date are required." });
  }
  if (!isFutureOrToday(date)) {
    return res.status(422).json({ error: "Validation Error", message: "Date cannot be in the past." });
  }
  if (hasConflict(store.getMaintenanceTasks(), turbineId, date)) {
    return res.status(409).json({ error: "Conflict", message: `Turbine ${turbineId} already has a task scheduled on ${date}.` });
  }

  const task = store.addMaintenanceTask({ turbineId, type, date, createdBy: req.userRole });
  res.status(201).json(task);
});

// PATCH /api/maintenance/:id — transition a task's status (TC-18) or have an
// administrator approve a pending change (TC-24/TC-25).
router.patch("/:id", requireRole("operator", "administrator"), (req, res) => {
  const id = Number(req.params.id);
  const task = store.getMaintenanceTasks().find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Not Found", message: `Task ${id} not found.` });

  const { status } = req.body;
  if (!canTransition(task.status, status)) {
    return res.status(422).json({
      error: "Invalid Transition",
      message: `Cannot move task ${id} from '${task.status}' to '${status}'.`,
    });
  }

  const updates = { status };
  if (status === "Completed") updates.completedAt = new Date().toISOString();
  const updated = store.updateMaintenanceTask(id, updates);
  res.json(updated);
});

// POST /api/maintenance/:id/approve — administrator-only approval action.
// TC-24 (administrator succeeds) / TC-25 (viewer is rejected by requireRole
// before this handler ever runs).
router.post("/:id/approve", requireRole("administrator"), (req, res) => {
  const id = Number(req.params.id);
  const task = store.getMaintenanceTasks().find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Not Found", message: `Task ${id} not found.` });

  const updated = store.updateMaintenanceTask(id, { approvedBy: req.userRole, approvedAt: new Date().toISOString() });
  res.json(updated);
});

module.exports = router;
