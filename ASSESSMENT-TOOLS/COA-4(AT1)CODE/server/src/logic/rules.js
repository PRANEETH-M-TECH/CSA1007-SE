/**
 * Core business rules for the Smart Offshore Wind Farm Management Platform.
 *
 * Kept as pure, dependency-free functions (no Express, no I/O) so they can be
 * unit-tested directly. Each function's header notes which section of the
 * COA-4-AT1 Test Case Design Document it implements, so the design and the
 * code stay traceable to each other.
 */

const VIBRATION_ALERT_THRESHOLD = 4.5; // mm/s
const TEMPERATURE_ALERT_THRESHOLD = 60; // deg C
const WIND_CUT_IN = 3; // m/s
const WIND_CUT_OUT = 25; // m/s
const MAX_PLAUSIBLE_WIND_SPEED = 100; // m/s — anything above this is a sensor fault

/**
 * Table 4.3 — Turbine Alert Decision Table (R1-R6).
 * R7 (vibration+RPM, no temp) and R8 (temp+RPM, no vibration) are not listed
 * as separate rows in the design document; both fall back to the RPM-fault
 * critical path below, consistent with RPM-out-of-range being treated as
 * critical on its own in R5.
 */
function evaluateTurbineStatus({ vibration, temperature, rpmOutOfRange }) {
  const highVibration = vibration >= VIBRATION_ALERT_THRESHOLD;
  const highTemp = temperature >= TEMPERATURE_ALERT_THRESHOLD;

  if (highVibration && highTemp && rpmOutOfRange) {
    return { level: "EMERGENCY_SHUTDOWN", rule: "R6", message: "Emergency Shutdown recommended — Critical Alert, urgent maintenance auto-scheduled." };
  }
  if (rpmOutOfRange) {
    return { level: "CRITICAL", rule: "R5", message: "Critical Alert — RPM fault." };
  }
  if (highVibration && highTemp) {
    return { level: "CRITICAL", rule: "R4", message: "Critical Alert — maintenance auto-suggested." };
  }
  if (highVibration) {
    return { level: "WARNING", rule: "R2", message: "Predictive Warning — vibration." };
  }
  if (highTemp) {
    return { level: "WARNING", rule: "R3", message: "Predictive Warning — temperature." };
  }
  return { level: "NORMAL", rule: "R1", message: "Normal operation — no alert." };
}

/**
 * Table 4.2 — Boundary Value Analysis on the cut-in (3 m/s) and cut-out
 * (25 m/s) wind-speed boundaries. Mirrors TC-10, TC-11, TC-12.
 */
function classifyWindSpeed(speedMs) {
  if (typeof speedMs !== "number" || Number.isNaN(speedMs) || speedMs < 0 || speedMs > MAX_PLAUSIBLE_WIND_SPEED) {
    return { state: "INVALID", message: "Reading flagged as a sensor fault; excluded from optimisation." };
  }
  if (speedMs < WIND_CUT_IN) {
    return { state: "IDLE", message: "Below cut-in speed — turbine idle." };
  }
  if (speedMs >= WIND_CUT_OUT) {
    return { state: "SAFETY_STOP", message: "At/above cut-out speed — safety feathering, generation halted." };
  }
  return { state: "GENERATING", message: "Within operating range — optimisation recommendations active." };
}

/**
 * Table 4.4 — Maintenance task state machine. Mirrors TC-18.
 */
const ALLOWED_TRANSITIONS = {
  Scheduled: ["In Progress", "Cancelled"],
  "In Progress": ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};
function canTransition(currentState, nextState) {
  return (ALLOWED_TRANSITIONS[currentState] || []).includes(nextState);
}

/**
 * Rejects maintenance dates in the past. Mirrors TC-19.
 */
function isFutureOrToday(dateStr, referenceDate = new Date()) {
  const d = new Date(dateStr);
  const ref = new Date(referenceDate.toDateString());
  return d >= ref;
}

/**
 * Same-turbine, same-day scheduling conflict check. Mirrors TC-17.
 */
function hasConflict(existingTasks, turbineId, newTaskDate) {
  return existingTasks.some(
    (t) => t.turbineId === turbineId && t.status !== "Cancelled" && t.date === newTaskDate
  );
}

/**
 * Analytics report date-range validation. Mirrors TC-21, TC-22.
 */
function isValidDateRange(start, end) {
  return new Date(start) <= new Date(end);
}

module.exports = {
  VIBRATION_ALERT_THRESHOLD,
  TEMPERATURE_ALERT_THRESHOLD,
  WIND_CUT_IN,
  WIND_CUT_OUT,
  evaluateTurbineStatus,
  classifyWindSpeed,
  ALLOWED_TRANSITIONS,
  canTransition,
  isFutureOrToday,
  hasConflict,
  isValidDateRange,
};
