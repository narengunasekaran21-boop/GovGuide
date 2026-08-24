const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

if (!SECRET) {
  // Fail loudly at startup rather than silently signing with `undefined`.
  throw new Error("JWT_SECRET is not set. Copy .env.example to .env and set a strong secret.");
}

function signToken(user) {
  // Only non-sensitive identity claims go in the token. The server always
  // re-derives the role from the database on protected requests as well —
  // the token's role claim is a convenience, not the source of truth.
  return jwt.sign(
    { sub: user.id, role: user.role },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET); // throws on invalid/expired
}

module.exports = { signToken, verifyToken };
