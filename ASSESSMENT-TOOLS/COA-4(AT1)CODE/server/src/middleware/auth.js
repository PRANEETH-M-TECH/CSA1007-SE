/**
 * Minimal role-based access control (FR-08, NFR-04).
 *
 * There is no login system in this demo — the caller supplies their role via
 * an `x-user-role` header (operator | administrator | viewer), defaulting to
 * "viewer" (the least-privileged role) when the header is absent. This keeps
 * TC-24/TC-25 easy to exercise with a plain curl/Postman request while
 * documenting exactly where a real auth layer (e.g. JWT + a users table)
 * would plug in later.
 */

const ROLES = ["viewer", "operator", "administrator"];

function currentRole(req) {
  const role = (req.header("x-user-role") || "viewer").toLowerCase();
  return ROLES.includes(role) ? role : "viewer";
}

function requireRole(...allowed) {
  return (req, res, next) => {
    const role = currentRole(req);
    req.userRole = role;
    if (!allowed.includes(role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${role}' is not permitted to perform this action.`,
      });
    }
    next();
  };
}

module.exports = { requireRole, currentRole, ROLES };
