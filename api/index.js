const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const spotifyRouter = require("./spotify"); // Import the Spotify router

router.use("/test-db", testDbRouter);
router.use("/spotify", spotifyRouter); // Mount the Spotify route

module.exports = router;
