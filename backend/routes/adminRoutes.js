const express = require("express");
const User = require("../models/User");
const Scheme = require("../models/Scheme");
const Bookmark = require("../models/Bookmark");
const ActivityLog = require("../models/ActivityLog");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Every route below requires an authenticated ADMIN. requireAuth runs first
// so req.user is populated from the database before requireRole checks it.
router.use(requireAuth, requireRole("ADMIN"));

// GET /api/admin/dashboard — aggregate stats for the admin overview page
router.get("/dashboard", (req, res, next) => {
  try {
    res.json({
      totalUsers: User.count(),
      totalSchemes: Scheme.count(),
      totalBookmarks: Bookmark.count(),
      schemesByCategory: Scheme.listByCategory(),
      recentActivity: ActivityLog.recent(10),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users — list/search all users (no password hashes returned)
router.get("/users", (req, res, next) => {
  try {
    const users = User.listAll({ search: req.query.search }).map(User.toPublic);
    res.json({ users, count: users.length });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/status — enable/disable a user account
router.patch("/users/:id/status", (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["ACTIVE", "DISABLED"].includes(status)) {
      return res.status(400).json({ message: "Status must be ACTIVE or DISABLED." });
    }
    // An admin may not disable their own account through this endpoint —
    // prevents accidental self-lockout.
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "You cannot change the status of your own account." });
    }
    const target = User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });

    db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
      status,
      req.params.id
    );
    ActivityLog.log(req.user.id, "USER_STATUS_CHANGED", `user_id=${req.params.id} status=${status}`);
    res.json({ user: User.toPublic(User.findById(req.params.id)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/schemes — list ALL schemes regardless of status (draft/archived included)
router.get("/schemes", (req, res, next) => {
  try {
    const schemes = Scheme.search({ status: undefined, sort: "recent" });
    res.json({ schemes, count: schemes.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/activity-logs
router.get("/activity-logs", (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    res.json({ logs: ActivityLog.recent(limit) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
