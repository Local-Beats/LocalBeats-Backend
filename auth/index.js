const express = require("express");
const router = express.Router();

const auth0Routes = require("./auth0");
const localRoutes = require("./local");
const spotifyRoutes = require("./spotify");


router.use("/", localRoutes);
router.use("/authO", auth0Routes);
router.use("/spotify", spotifyRoutes);














module.exports = { router };
