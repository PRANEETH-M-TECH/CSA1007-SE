/**
 * Automates TC-17, TC-18, TC-19 from Table 5.5 of the Test Case Design
 * Document, and the state machine in Table 4.4.
 */
const { isFutureOrToday, hasConflict, canTransition, ALLOWED_TRANSITIONS } = require("../../server/src/logic/rules");

describe("isFutureOrToday — TC-19", () => {
  test("rejects a date in the past", () => {
    expect(isFutureOrToday("2025-01-01", new Date("2026-08-24"))).toBe(false);
  });

  test("accepts today", () => {
    const today = new Date("2026-08-24");
    expect(isFutureOrToday("2026-08-24", today)).toBe(true);
  });

  test("accepts a future date", () => {
    expect(isFutureOrToday("2026-09-05", new Date("2026-08-24"))).toBe(true);
  });
});

describe("hasConflict — TC-17", () => {
  const existing = [
    { turbineId: "WT-014", date: "2026-09-05", status: "Scheduled" },
    { turbineId: "WT-014", date: "2026-09-10", status: "Cancelled" },
  ];

  test("detects an overlapping active task on the same turbine and date", () => {
    expect(hasConflict(existing, "WT-014", "2026-09-05")).toBe(true);
  });

  test("does not flag a conflict against a cancelled task", () => {
    expect(hasConflict(existing, "WT-014", "2026-09-10")).toBe(false);
  });

  test("does not flag a conflict on a different turbine", () => {
    expect(hasConflict(existing, "WT-021", "2026-09-05")).toBe(false);
  });
});

describe("canTransition — TC-18 state machine (Table 4.4)", () => {
  test("Scheduled -> In Progress is allowed", () => {
    expect(canTransition("Scheduled", "In Progress")).toBe(true);
  });

  test("In Progress -> Completed is allowed", () => {
    expect(canTransition("In Progress", "Completed")).toBe(true);
  });

  test("In Progress -> Cancelled is allowed", () => {
    expect(canTransition("In Progress", "Cancelled")).toBe(true);
  });

  test("Completed is a terminal state", () => {
    expect(ALLOWED_TRANSITIONS.Completed).toHaveLength(0);
    expect(canTransition("Completed", "In Progress")).toBe(false);
  });

  test("Cancelled is a terminal state", () => {
    expect(canTransition("Cancelled", "Scheduled")).toBe(false);
  });

  test("Scheduled -> Completed directly is not allowed (must pass through In Progress)", () => {
    expect(canTransition("Scheduled", "Completed")).toBe(false);
  });
});
