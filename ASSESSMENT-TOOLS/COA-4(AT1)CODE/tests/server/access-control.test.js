/**
 * Automates TC-24 and TC-25 from Table 5.8 of the Test Case Design Document
 * by unit-testing the requireRole middleware directly (the actual FR-08 /
 * NFR-04 authorization logic) against mock req/res objects — no HTTP server
 * needed.
 */
const { requireRole, currentRole } = require("../../server/src/middleware/auth");

function mockReq(role) {
  return { header: (name) => (name.toLowerCase() === "x-user-role" ? role : undefined) };
}
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("currentRole", () => {
  test("defaults to viewer when no x-user-role header is present", () => {
    expect(currentRole(mockReq(undefined))).toBe("viewer");
  });

  test("falls back to viewer for an unrecognised role value", () => {
    expect(currentRole(mockReq("superadmin"))).toBe("viewer");
  });

  test("accepts a valid role case-insensitively", () => {
    expect(currentRole(mockReq("Administrator"))).toBe("administrator");
  });
});

describe("requireRole — FR-08 / NFR-04", () => {
  test("TC-25: a Viewer is rejected (403) from an operator/administrator-only action", () => {
    const req = mockReq("viewer");
    const res = mockRes();
    const next = jest.fn();

    requireRole("operator", "administrator")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("TC-16: an Operator is allowed through to create a maintenance task", () => {
    const req = mockReq("operator");
    const res = mockRes();
    const next = jest.fn();

    requireRole("operator", "administrator")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("TC-24: an Administrator is allowed through an administrator-only approval action", () => {
    const req = mockReq("administrator");
    const res = mockRes();
    const next = jest.fn();

    requireRole("administrator")(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("TC-25: an Operator (not Administrator) is rejected from an administrator-only action", () => {
    const req = mockReq("operator");
    const res = mockRes();
    const next = jest.fn();

    requireRole("administrator")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
