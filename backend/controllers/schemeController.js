const Scheme = require("../models/Scheme");
const Bookmark = require("../models/Bookmark");
const ActivityLog = require("../models/ActivityLog");
const db = require("../config/db");

// GET /api/schemes  (public)
function list(req, res, next) {
  try {
    const { q, category, governmentLevel, state, sort } = req.query;
    const schemes = Scheme.search({ q, category, governmentLevel, state, sort, status: "ACTIVE" });

    let bookmarkedIds = new Set();
    if (req.user) {
      bookmarkedIds = new Set(Bookmark.listForUser(req.user.id).map((s) => s.id));
    }

    const withFlags = schemes.map((s) => ({ ...s, isBookmarked: bookmarkedIds.has(s.id) }));
    res.json({ schemes: withFlags, count: withFlags.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/schemes/:id  (public)
function getById(req, res, next) {
  try {
    const scheme = Scheme.findById(req.params.id);
    if (!scheme || scheme.status !== "ACTIVE") {
      // Admins may still view non-active schemes (draft/archived) for management.
      if (!scheme || !(req.user && req.user.role === "ADMIN")) {
        return res.status(404).json({ message: "Scheme not found." });
      }
    }

    if (req.user) {
      db.prepare("INSERT INTO recently_viewed (user_id, scheme_id) VALUES (?, ?)").run(
        req.user.id,
        scheme.id
      );
      scheme.isBookmarked = Bookmark.isBookmarked(req.user.id, scheme.id);
    }

    res.json({ scheme });
  } catch (err) {
    next(err);
  }
}

// GET /api/schemes/categories  (public)
function categories(req, res, next) {
  try {
    res.json({ categories: Scheme.listByCategory() });
  } catch (err) {
    next(err);
  }
}

// POST /api/schemes  (ADMIN only)
function create(req, res, next) {
  try {
    const scheme = Scheme.create(req.body);
    ActivityLog.log(req.user.id, "SCHEME_CREATED", `id=${scheme.id} name=${scheme.name}`);
    res.status(201).json({ scheme });
  } catch (err) {
    next(err);
  }
}

// PUT /api/schemes/:id  (ADMIN only)
function update(req, res, next) {
  try {
    const scheme = Scheme.update(req.params.id, req.body);
    if (!scheme) return res.status(404).json({ message: "Scheme not found." });
    ActivityLog.log(req.user.id, "SCHEME_UPDATED", `id=${scheme.id} name=${scheme.name}`);
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/schemes/:id  (ADMIN only)
function remove(req, res, next) {
  try {
    const scheme = Scheme.findById(req.params.id);
    const ok = Scheme.delete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Scheme not found." });
    ActivityLog.log(req.user.id, "SCHEME_DELETED", `id=${req.params.id} name=${scheme?.name || ""}`);
    res.json({ message: "Scheme deleted." });
  } catch (err) {
    next(err);
  }
}

// POST /api/schemes/eligibility-check  (public) — simple rule-based matcher
function eligibilityCheck(req, res, next) {
  try {
    const { age, annualIncome, occupation, gender, state } = req.body;
    const all = Scheme.search({ status: "ACTIVE" });

    const results = all.map((s) => {
      const reasons = [];
      let eligible = true;

      if (typeof age === "number") {
        if (s.min_age !== null && age < s.min_age) {
          eligible = false;
          reasons.push(`Minimum age is ${s.min_age}.`);
        }
        if (s.max_age !== null && age > s.max_age) {
          eligible = false;
          reasons.push(`Maximum age is ${s.max_age}.`);
        }
      }
      if (typeof annualIncome === "number" && s.max_income !== null && annualIncome > s.max_income) {
        eligible = false;
        reasons.push(`Household income must be below \u20b9${s.max_income.toLocaleString("en-IN")}.`);
      }
      if (s.gender && s.gender !== "ANY" && gender && s.gender !== gender) {
        eligible = false;
        reasons.push(`This scheme is limited to a specific gender group.`);
      }
      if (state && s.state && s.state !== "All India" && s.state !== state) {
        eligible = false;
        reasons.push(`This scheme is only available in ${s.state}.`);
      }
      if (occupation && s.occupation_tags && s.occupation_tags.length && !s.occupation_tags.includes("any")) {
        if (!s.occupation_tags.includes(occupation)) {
          eligible = false;
          reasons.push(`This scheme targets specific occupation groups.`);
        }
      }

      return { scheme: s, eligible, reasons };
    });

    const eligibleSchemes = results.filter((r) => r.eligible).map((r) => r.scheme);
    const ineligibleSchemes = results.filter((r) => !r.eligible);

    if (req.user) {
      ActivityLog.log(req.user.id, "ELIGIBILITY_CHECK_RUN");
    }

    res.json({
      eligibleCount: eligibleSchemes.length,
      eligibleSchemes,
      ineligibleSchemes,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, categories, create, update, remove, eligibilityCheck };
