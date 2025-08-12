require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const apiRouter = require("./api");
const authRouter = require("./auth");
const { db } = require("./database");
const cors = require("cors");

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:3000";

// body parser middleware
app.use(express.json());

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
// cookie parser middleware
app.use(cookieParser());

app.use(morgan("dev")); // logging middleware
app.use(express.static(path.join(__dirname, "public"))); // serve static files from public folder
app.use("/api", apiRouter); // mount api router
app.use("/auth", authRouter); // mount auth router

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/health/db", async (_req, res) => {
  try {
    // show which host we’re trying to reach (no secrets)
    const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
    try {
      const u = new URL(raw);
      console.log("DB host:", u.host);
    } catch { }

    await db.authenticate();       // only checks connection, not tables
    res.json({ db: "ok" });
  } catch (e) {
    console.error("DB health error:", e);
    res.status(500).json({ db: "down", error: e.message });
  }
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendStatus(500);
});

const runApp = async () => {
  try {
    await db.sync();
    console.log("✅ Connected to the database");
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
};

runApp();

module.exports = app;
