const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const spotifyRouter = require("./spotify");
const listenerRouter = require("./listeners");

router.use("/test-db", testDbRouter);
router.use("/spotify", spotifyRouter);
router.use("/listeners", listenerRouter),

    module.exports = router;
