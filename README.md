# GovGuide

A full-stack demo web app for discovering Indian government welfare schemes, built around
**role-based access control (RBAC)** as the core security concept for the *23CY506 – Web
Exploitation and Defence* coursework module.

Citizens can search schemes, check eligibility, and bookmark results. Admins get a separate
console to manage the scheme catalogue and users — every admin action is enforced **on the
server**, not just hidden in the UI.

---

## Stack

| Layer     | Tech                                                                 |
|-----------|-----------------------------------------------------------------------|
| Frontend  | React 19 + Vite + Tailwind CSS v4 + React Router                     |
| Backend   | Node.js + Express                                                     |
| Database  | SQLite via Node's built-in `node:sqlite` module — zero-config, single file, **no npm package or native build step required** |
| Auth      | JWT (httpOnly cookie, with a bearer-token fallback) + bcrypt password hashing |

`node:sqlite` (built into Node.js since v22.5) was used instead of the popular
`better-sqlite3` package specifically to avoid a common setup failure: `better-sqlite3` is a
native addon that needs compiling on install, and on machines without Visual Studio Build
Tools (Windows) or a C++ toolchain (Linux/Mac), or on very new Node versions without a
published prebuilt binary yet, that install step fails outright. `node:sqlite` ships inside
Node itself, so `npm install` never touches a compiler. The trade-off is that it's still
labelled a "release candidate" (not yet marked fully stable) as of recent Node versions —
fine for this coursework demo, but worth knowing if you extend this into something long-lived.
Requires **Node.js 22.5 or later**.

---

## Project structure

```
govguide/
├── backend/
│   ├── config/db.js            # SQLite connection
│   ├── controllers/            # Route handler logic
│   ├── database/
│   │   ├── schema.sql          # Table definitions
│   │   └── seed.js             # Demo data + admin account seeder
│   ├── middleware/
│   │   ├── auth.js             # JWT verification + requireRole() RBAC guard
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── models/                 # User, Scheme, Bookmark, ActivityLog
│   ├── routes/                 # auth, schemes, bookmarks, users, admin
│   ├── utils/jwt.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                 # axios client + endpoint calls
    │   ├── context/AuthContext.jsx
    │   ├── components/          # Navbar, Footer, SchemeCard, route guards
    │   ├── layouts/              # RootLayout, AdminLayout
    │   └── pages/                # Home, Schemes, SchemeDetail, Eligibility,
    │                              # Bookmarks, Profile, Login, Register,
    │                              # admin/ (Dashboard, Schemes, Users, Activity)
    └── vite.config.js            # proxies /api → localhost:5000 in dev
```

---

## Getting started

**Requirements:** Node.js 22.5+ (developed on Node 22; also tested on Node 24). `node -v` to check.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # defaults work out of the box for local dev
npm run seed               # creates the SQLite DB, 12 demo schemes, and a seeded admin account
npm run dev                 # starts the API on http://localhost:5000
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` requests to the backend,
so no extra CORS setup is needed in development.

### Demo accounts

| Role  | Email                  | Password       |
|-------|-------------------------|----------------|
| Admin | admin@govguide.demo     | Admin@12345    |
| User  | *(register your own)*   | —              |

> The admin account is seeded from `.env` (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) purely
> for coursework demonstration. Change or remove it before any real deployment — see
> **Security notes** below.

---

## RBAC design (the core security mechanic)

- **Roles**: `USER` and `ADMIN`, stored on the `users` table. Public registration
  (`POST /api/auth/register`) *always* creates a `USER` — the request body's `role` field, if
  sent, is ignored server-side (`models/User.js` hardcodes the role at creation).
- **Token vs. database as source of truth**: the JWT carries the user's id and role as a
  convenience claim, but `middleware/auth.js`'s `requireAuth` re-loads the user from the
  database on every request, so a stale or forged claim in an old token can't grant access
  a disabled or downgraded account no longer has.
- **Enforcement order**: protected routes always run `requireAuth` before `requireRole(...)`,
  so role checks only ever run against a verified, DB-backed identity.
- **Defense in depth**: the React route guards (`components/RouteGuards.jsx`) hide admin UI
  and redirect on the client, but that's a UX nicety only — every admin write endpoint
  (`routes/adminRoutes.js`, the write half of `routes/schemeRoutes.js`) independently checks
  the role again on the server, since client-side checks can always be bypassed.
- **Audit trail**: `activity_logs` records logins, scheme CRUD, user status changes, and
  **blocked unauthorized access attempts** (403s), viewable in Admin → Activity log.

This can be demonstrated directly: log in as a normal user and call
`PUT /api/schemes/1` or `GET /api/admin/dashboard` with that user's token — both return
`403 Forbidden`, and the attempt is written to the activity log.

---

## Other security measures implemented

- Passwords hashed with `bcryptjs` (cost factor 12), never stored or logged in plaintext.
- Password policy enforced both client-side (live checklist) and server-side
  (`express-validator` regex) — min 8 chars, upper/lower/number/special character.
- Generic "Invalid email or password" error on login regardless of which check failed, to
  avoid user enumeration.
- `helmet` for standard security headers; CORS restricted to the configured frontend origin
  with credentials enabled (not a wildcard).
- Rate limiting on `/api/auth/*` (20 requests / 15 min) and globally (300 requests / 15 min)
  to slow brute-force and credential-stuffing attempts.
- Centralized error handler that never leaks stack traces or internal details to the client.
- A user can only ever read/update their **own** profile and bookmarks — there is no `userId`
  route parameter on those endpoints for a user's own data, so there's nothing to tamper with
  to reach someone else's records.
- An admin cannot disable their own account (prevents accidental self-lockout).
- SQL is parameterized throughout (`better-sqlite3` prepared statements) — no string-built
  queries, so user input can't alter query structure.

---

---

## Troubleshooting

**`No such built-in module: node:sqlite`** — your Node version predates 22.5. Update Node
(check with `node -v`) — no other change needed.

**Windows: an old `npm install` log shows `better-sqlite3` / `node-gyp` / "install Visual
Studio" errors** — that was from an earlier version of this project; the current code no
longer depends on `better-sqlite3` at all, so a fresh `npm install` in `backend/` shouldn't
hit this. If you still see it, delete `backend/node_modules` and `backend/package-lock.json`
and reinstall.

**Port already in use** — change `PORT` in `backend/.env`, or find and stop whatever's using
5000/5173.

---

## Known limitations (demo scope)

- No email verification or password-reset flow.
- No refresh-token rotation — sessions simply expire after 1 day (`JWT_EXPIRES_IN`).
- SQLite is fine for a coursework demo but isn't intended for concurrent production traffic;
  swap `config/db.js` for a real Postgres/MySQL client for that.
- The seeded admin account and its password are for demonstration only and are visible in
  `.env.example` / the login page — remove that seeding step (`database/seed.js`) and rotate
  credentials before deploying anywhere real.
- "Official application portal" links are placeholders — this app does not submit real
  applications to any government system.
