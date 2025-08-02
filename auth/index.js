const express = require("express");
const router = express.Router();

const auth0Routes = require("./authO");
const localRoutes = require("./local");
const spotifyRoutes = require("./spotify");
const middlewareRoutes = require("./middleware");

router.use("/", localRoutes);
router.use("/authO", auth0Routes);
router.use("/spotify", spotifyRoutes);
router.use("/middleware", middlewareRoutes);














module.exports = { router };
