const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const spotifyRouter = require("../auth/spotify"); // ✅ correct path

router.use("/test-db", testDbRouter);
router.use("/spotify", spotifyRouter); // ✅ mounts /api/spotify

module.exports = router;
