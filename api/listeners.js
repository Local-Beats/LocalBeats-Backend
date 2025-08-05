const express = require('express');
const router = express.Router();
const { authenticateJWT } = require("../auth/middleware");
const { User } = require("../database")
const { ListeningSession } = require("../database");

router.get("/sync", authenticateJWT, async (req, res) => {
    const listeningSession = await ListeningSession.findAll(
        {
            where: { status: "playing" || "paused" },
            include: { User },
            attributes: ["spotify_display_name", "spotify_image"],
        })


})

module.exports = router;