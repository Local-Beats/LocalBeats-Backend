const express = require("express");
const router = express.Router();

const testDbRouter = require("./test-db");
const spotifyRouter = require("../auth/spotify"); 

const usersRouter = require("./users");

router.use("/test-db", testDbRouter);
router.use("/spotify", spotifyRouter); 

router.use("/users", usersRouter);

module.exports = router;
