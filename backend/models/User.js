const db = require("../config/db");

// Public-safe user shape — never includes password_hash.
function toPublic(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

const User = {
  findByEmail(email) {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  },

  findById(id) {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  },

  // role is intentionally not a parameter here — public registration always creates USER.
  create({ name, email, passwordHash }) {
    const info = db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'USER')")
      .run(name, email, passwordHash);
    return User.findById(info.lastInsertRowid);
  },

  updateProfile(id, { name, phone }) {
    db.prepare(
      "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = datetime('now') WHERE id = ?"
    ).run(name ?? null, phone ?? null, id);
    return User.findById(id);
  },

  listAll({ search } = {}) {
    if (search) {
      const like = `%${search}%`;
      return db
        .prepare("SELECT * FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC")
        .all(like, like);
    }
    return db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  },

  count() {
    return db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  },

  toPublic,
};

module.exports = User;
