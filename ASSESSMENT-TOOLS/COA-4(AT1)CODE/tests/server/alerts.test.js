/**
 * Automates TC-05, TC-06, TC-07 (implicitly), TC-08 (multi-alert case is
 * covered at the route level; the underlying rule is single-turbine here)
 * from Table 5.2 of the Test Case Design Document, plus the full R1-R6
 * decision table from Table 4.3.
 */
const { evaluateTurbineStatus, VIBRATION_ALERT_THRESHOLD } = require("../../server/src/logic/rules");

describe("evaluateTurbineStatus — Table 4.3 decision table", () => {
  test("R1: all normal readings raise no alert", () => {
    const result = evaluateTurbineStatus({ vibration: 2.0, temperature: 42, rpmOutOfRange: false });
    expect(result.level).toBe("NORMAL");
    expect(result.rule).toBe("R1");
  });

  test("R2: high vibration alone raises a vibration warning", () => {
    const result = evaluateTurbineStatus({ vibration: 4.8, temperature: 42, rpmOutOfRange: false });
    expect(result.level).toBe("WARNING");
    expect(result.rule).toBe("R2");
  });

  test("R3: high temperature alone raises a temperature warning", () => {
    const result = evaluateTurbineStatus({ vibration: 2.0, temperature: 65, rpmOutOfRange: false });
    expect(result.level).toBe("WARNING");
    expect(result.rule).toBe("R3");
  });

  test("R4: high vibration + high temperature raises a critical alert", () => {
    const result = evaluateTurbineStatus({ vibration: 4.8, temperature: 65, rpmOutOfRange: false });
    expect(result.level).toBe("CRITICAL");
    expect(result.rule).toBe("R4");
  });

  test("R5: RPM out of range alone raises a critical alert", () => {
    const result = evaluateTurbineStatus({ vibration: 2.0, temperature: 42, rpmOutOfRange: true });
    expect(result.level).toBe("CRITICAL");
    expect(result.rule).toBe("R5");
  });

  test("R6: all three conditions trigger an emergency shutdown", () => {
    const result = evaluateTurbineStatus({ vibration: 4.8, temperature: 65, rpmOutOfRange: true });
    expect(result.level).toBe("EMERGENCY_SHUTDOWN");
    expect(result.rule).toBe("R6");
  });
});

describe("evaluateTurbineStatus — TC-05 / TC-06 boundary (4.5 mm/s)", () => {
  test("TC-05: vibration exactly at the 4.5 mm/s threshold raises a warning", () => {
    const result = evaluateTurbineStatus({ vibration: VIBRATION_ALERT_THRESHOLD, temperature: 42, rpmOutOfRange: false });
    expect(result.level).toBe("WARNING");
  });

  test("TC-06: vibration just below the threshold (4.4 mm/s) stays normal", () => {
    const result = evaluateTurbineStatus({ vibration: 4.4, temperature: 42, rpmOutOfRange: false });
    expect(result.level).toBe("NORMAL");
  });
});
