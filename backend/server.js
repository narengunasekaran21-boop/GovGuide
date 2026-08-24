require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// --- Security headers ---
app.use(helmet());

// --- CORS: only the configured frontend origin, with credentials for cookies ---
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// --- Body parsing & cookies ---
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// --- Logging (dev-friendly, no sensitive body logging) ---
app.use(morgan("dev"));

// --- Global rate limit (defense in depth; auth routes have a stricter limit too) ---
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "govguide-backend", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GovGuide backend running on http://localhost:${PORT}`);
  console.log(`Allowed client origin (CORS): ${CLIENT_ORIGIN}`);
});
