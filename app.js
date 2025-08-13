require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

const apiRouter = require("./api"); // make sure this path points to your index.js with routes
const authRouter = require("./auth");
const { db } = require("./database");

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:3000";

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// CORS setup
const allowed = [
  "http://127.0.0.1:3000",
  "https://local-beats-frontend.vercel.app",
];
const previewRegex = /^https:\/\/local-beats-frontend-.*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin) || previewRegex.test(origin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", apiRouter);
app.use("/auth", authRouter);

// Health checks
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/health/db", async (_req, res) => {
  try {
    const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
    try {
      const u = new URL(raw);
      console.log("DB host:", u.host);
    } catch {
      console.log("DB URL not valid for host extraction");
    }
    await db.authenticate();
    res.json({ db: "ok" });
  } catch (e) {
    console.error("DB health error:", e);
    res.status(500).json({ db: "down", error: e.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendStatus(500);
});

// Start server
const runApp = async () => {
  try {
    await db.sync();
    console.log("✅ Connected to the database");
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
};

runApp();
module.exports = app;
