const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

const COOKIE_NAME = "govguide_token";

function getTokenFromRequest(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

/**
 * requireAuth — verifies the JWT, then re-loads the user from the database
 * so `req.user.role` always reflects current DB state (not a stale/forged claim).
 */
function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: "You need to log in to continue." });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }

  const user = User.findById(payload.sub);
  if (!user || user.status !== "ACTIVE") {
    return res.status(401).json({ message: "You need to log in to continue." });
  }

  req.user = User.toPublic(user); // role comes from the DB record, not the token payload
  next();
}

/**
 * requireRole("ADMIN") — must run AFTER requireAuth. Rejects with 403 if the
 * authenticated user's DB-sourced role doesn't match.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You need to log in to continue." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      ActivityLog.log(
        req.user.id,
        "UNAUTHORIZED_ACCESS_ATTEMPT",
        `${req.method} ${req.originalUrl}`
      );
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  };
}

/**
 * optionalAuth — attaches req.user if a valid token is present, but never
 * blocks the request. Useful for public endpoints with slightly different
 * behaviour for logged-in users.
 */
function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = User.findById(payload.sub);
    if (user && user.status === "ACTIVE") {
      req.user = User.toPublic(user);
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth, COOKIE_NAME };
