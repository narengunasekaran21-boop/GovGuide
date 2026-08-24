const db = require("../config/db");

const ActivityLog = {
  log(userId, action, detail = null) {
    // Never pass password/token values into `detail`.
    db.prepare(
      "INSERT INTO activity_logs (user_id, action, detail) VALUES (?, ?, ?)"
    ).run(userId ?? null, action, detail);
  },

  recent(limit = 20) {
    return db
      .prepare(
        `SELECT al.*, u.name as user_name, u.email as user_email
         FROM activity_logs al
         LEFT JOIN users u ON u.id = al.user_id
         ORDER BY al.timestamp DESC
         LIMIT ?`
      )
      .all(limit);
  },
};

module.exports = ActivityLog;
