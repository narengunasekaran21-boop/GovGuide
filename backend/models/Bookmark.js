const db = require("../config/db");

const Bookmark = {
  listForUser(userId) {
    return db
      .prepare(
        `SELECT s.* FROM bookmarks b
         JOIN schemes s ON s.id = b.scheme_id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`
      )
      .all(userId);
  },

  isBookmarked(userId, schemeId) {
    return !!db
      .prepare("SELECT 1 FROM bookmarks WHERE user_id = ? AND scheme_id = ?")
      .get(userId, schemeId);
  },

  add(userId, schemeId) {
    db.prepare(
      "INSERT OR IGNORE INTO bookmarks (user_id, scheme_id) VALUES (?, ?)"
    ).run(userId, schemeId);
  },

  remove(userId, schemeId) {
    const info = db
      .prepare("DELETE FROM bookmarks WHERE user_id = ? AND scheme_id = ?")
      .run(userId, schemeId);
    return info.changes > 0;
  },

  count() {
    return db.prepare("SELECT COUNT(*) AS c FROM bookmarks").get().c;
  },

  countForUser(userId) {
    return db.prepare("SELECT COUNT(*) AS c FROM bookmarks WHERE user_id = ?").get(userId).c;
  },
};

module.exports = Bookmark;
