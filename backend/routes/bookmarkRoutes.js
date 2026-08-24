const express = require("express");
const Bookmark = require("../models/Bookmark");
const Scheme = require("../models/Scheme");
const ActivityLog = require("../models/ActivityLog");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// All bookmark routes require a logged-in user, and only ever touch req.user.id —
// there is no way for a user to view/add/remove another user's bookmarks.
router.use(requireAuth);

router.get("/", (req, res, next) => {
  try {
    const schemes = Bookmark.listForUser(req.user.id);
    res.json({ schemes });
  } catch (err) {
    next(err);
  }
});

router.post("/:schemeId", (req, res, next) => {
  try {
    const scheme = Scheme.findById(req.params.schemeId);
    if (!scheme) return res.status(404).json({ message: "Scheme not found." });
    Bookmark.add(req.user.id, req.params.schemeId);
    ActivityLog.log(req.user.id, "SCHEME_BOOKMARKED", `scheme_id=${req.params.schemeId}`);
    res.status(201).json({ message: "Scheme bookmarked." });
  } catch (err) {
    next(err);
  }
});

router.delete("/:schemeId", (req, res, next) => {
  try {
    const removed = Bookmark.remove(req.user.id, req.params.schemeId);
    if (!removed) return res.status(404).json({ message: "Bookmark not found." });
    res.json({ message: "Bookmark removed." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
