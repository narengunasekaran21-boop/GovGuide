const express = require("express");
const { body } = require("express-validator");
const schemeController = require("../controllers/schemeController");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const schemeValidation = [
  body("name").trim().notEmpty().withMessage("Scheme name is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("benefits").isArray({ min: 1 }).withMessage("At least one benefit is required."),
  body("eligibility").isArray({ min: 1 }).withMessage("At least one eligibility criterion is required."),
  body("documents").isArray({ min: 1 }).withMessage("At least one required document is required."),
  body("application_steps").isArray({ min: 1 }).withMessage("At least one application step is required."),
  body("government_level").isIn(["CENTRAL", "STATE"]).withMessage("Government level must be CENTRAL or STATE."),
];

// Public endpoints (optionalAuth attaches req.user if logged in, for bookmark flags)
router.get("/categories", schemeController.categories);
router.post("/eligibility-check", optionalAuth, schemeController.eligibilityCheck);
router.get("/:id", optionalAuth, schemeController.getById);
router.get("/", optionalAuth, schemeController.list);

// Admin-only write endpoints — requireAuth THEN requireRole, in that order.
router.post("/", requireAuth, requireRole("ADMIN"), schemeValidation, validate, schemeController.create);
router.put("/:id", requireAuth, requireRole("ADMIN"), schemeValidation, validate, schemeController.update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), schemeController.remove);

module.exports = router;
