const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { signToken } = require("../utils/jwt");
const { COOKIE_NAME } = require("../middleware/auth");

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = User.findByEmail(email.toLowerCase().trim());
    if (existing) {
      // Deliberately generic — do not reveal that this specific email is taken
      // in a way that helps enumerate accounts beyond what's necessary.
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Note: role is NEVER read from req.body — public registration always creates USER.
    const user = User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash });

    ActivityLog.log(user.id, "USER_REGISTERED");

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(201).json({ user: User.toPublic(user), token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = User.findByEmail(email.toLowerCase().trim());

    // Generic error message regardless of which check fails — never reveal
    // whether the email exists or the password was wrong.
    const genericError = { message: "Invalid email or password." };

    if (!user) return res.status(401).json(genericError);
    if (user.status !== "ACTIVE") return res.status(401).json(genericError);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json(genericError);

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    if (user.role === "ADMIN") {
      ActivityLog.log(user.id, "ADMIN_LOGIN");
    } else {
      ActivityLog.log(user.id, "USER_LOGIN");
    }

    res.json({ user: User.toPublic(user), token });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out successfully." });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, logout, me };
