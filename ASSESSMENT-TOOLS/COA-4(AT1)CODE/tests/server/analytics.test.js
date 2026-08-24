/**
 * Automates TC-20, TC-21, TC-22 from Table 5.6 of the Test Case Design
 * Document.
 */
const { isValidDateRange } = require("../../server/src/logic/rules");

describe("isValidDateRange", () => {
  test("TC-20: a normal multi-day range is valid", () => {
    expect(isValidDateRange("2026-07-01", "2026-07-31")).toBe(true);
  });

  test("TC-21: a single-day range (start === end) is valid", () => {
    expect(isValidDateRange("2026-08-15", "2026-08-15")).toBe(true);
  });

  test("TC-22: end date before start date is invalid", () => {
    expect(isValidDateRange("2026-08-20", "2026-08-10")).toBe(false);
  });
});
