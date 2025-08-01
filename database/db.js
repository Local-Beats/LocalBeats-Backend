// db/index.js

require("dotenv").config();
const { Sequelize } = require("sequelize");

// Database name
const dbName = "capstone-2";

// Create Sequelize instance
const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`,
  {
    logging: false, // Set to true if you want to see raw SQL logs
  }
);

module.exports = db;
