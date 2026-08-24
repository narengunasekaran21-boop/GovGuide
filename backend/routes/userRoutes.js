const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(requireAuth);

// GET /api/users/me/profile — current user's own profile only
router.get("/me/profile", (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/users/me/profile — a user may only ever update their OWN name/phone.
// Note: role and email are intentionally not editable here, and there is no
// userId param that could be swapped to target someone else's account.
router.put(
  "/me/profile",
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
    body("phone").optional().trim(),
  ],
  validate,
  (req, res, next) => {
    try {
      const updated = User.updateProfile(req.user.id, req.body);
      res.json({ user: User.toPublic(updated) });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/users/me/recently-viewed
router.get("/me/recently-viewed", (req, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT s.*, rv.viewed_at FROM recently_viewed rv
         JOIN schemes s ON s.id = rv.scheme_id
         WHERE rv.user_id = ?
         ORDER BY rv.viewed_at DESC
         LIMIT 10`
      )
      .all(req.user.id);
    res.json({ schemes: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
