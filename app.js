require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const apiRouter = require("./api");
const { router: authRouter } = require("./auth");
const { db } = require("./database");

const PORT = process.env.PORT || 8080;
// You can keep FRONTEND_URL for other uses if you want
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

// Body parser middleware
app.use(express.json());

// CORS middleware with multiple allowed origins
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like Postman or server-to-server
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware
app.use(morgan("dev"));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Mount API router
app.use("/api", apiRouter);

// Mount auth router
app.use("/auth", authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendStatus(500);
});

// Run the app and connect to DB
const runApp = async () => {
  try {
    await db.sync();
    console.log("✅ Connected to the database");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
};

runApp();

module.exports = app;
