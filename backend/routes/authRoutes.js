const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Rate limit auth endpoints to slow brute-force / credential-stuffing attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name cannot be empty."),
    body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
    body("password")
      .matches(PASSWORD_REGEX)
      .withMessage(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").trim().isEmail().withMessage("Please enter a valid email address."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  authController.login
);

router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
