const path = require("path");
const fs = require("fs");

// Suppress the "SQLite is an experimental feature" console warning — it's
// just noise for this project; the API surface we use (prepare/run/get/all,
// exec) has been stable across Node 22-24.
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  const type = typeof args[0] === "string" ? args[0] : args[0]?.type;
  if (type === "ExperimentalWarning" && String(warning).includes("SQLite")) return;
  return originalEmitWarning.call(process, warning, ...args);
};

const { DatabaseSync } = require("node:sqlite");

// Uses Node's built-in SQLite module (available without any npm install or
// native compilation step since Node 22.5+). This avoids the very common
// "better-sqlite3 needs Visual Studio / node-gyp to build" problem on
// Windows machines that don't have C++ build tools installed.
const dbPath = path.resolve(
  __dirname,
  "..",
  process.env.DATABASE_PATH ? process.env.DATABASE_PATH.replace(/^\.\//, "") : "database/govguide.db"
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

module.exports = db;
