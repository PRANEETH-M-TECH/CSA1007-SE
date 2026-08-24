/**
 * Automates TC-09, TC-10, TC-11, TC-12 from Table 5.3 of the Test Case
 * Design Document.
 */
const { classifyWindSpeed } = require("../../server/src/logic/rules");

describe("classifyWindSpeed — Table 4.2 boundary values", () => {
  test("TC-09: a normal mid-range wind speed is classified as generating", () => {
    expect(classifyWindSpeed(12).state).toBe("GENERATING");
  });

  test("cut-in boundary — just below (2.9 m/s) is idle", () => {
    expect(classifyWindSpeed(2.9).state).toBe("IDLE");
  });

  test("TC-10: cut-in boundary — at 3.0 m/s the turbine starts generating", () => {
    expect(classifyWindSpeed(3.0).state).toBe("GENERATING");
  });

  test("cut-out boundary — just below (24.9 m/s) still generating", () => {
    expect(classifyWindSpeed(24.9).state).toBe("GENERATING");
  });

  test("TC-11: cut-out boundary — at 25.0 m/s the turbine safety-stops", () => {
    expect(classifyWindSpeed(25.0).state).toBe("SAFETY_STOP");
  });

  test("TC-12: an implausible reading (150 m/s) is flagged invalid", () => {
    expect(classifyWindSpeed(150).state).toBe("INVALID");
  });

  test("a negative reading is flagged invalid", () => {
    expect(classifyWindSpeed(-5).state).toBe("INVALID");
  });
});
