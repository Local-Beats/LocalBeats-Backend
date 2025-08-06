const express = require('express');
const router = express.Router();
const { authenticateJWT } = require("../auth/middleware");
const { User } = require("../database")
const { ListeningSession } = require("../database");

router.get("/", authenticateJWT, async (req, res) => {
    const listeningSession = await ListeningSession.findAll(
        {
            where: { status: "playing" || "paused" },
            include: { User },
            attributes: ["spotify_display_name", "spotify_image"],
        })
})

router.post("/", authenticateJWT, async (req, res) => {
    // console.log("endpoint is being hit")
    const {
        status,
        user_id,
        song_id,
        ended_at,
    } = req.body

    const listeningSession = await ListeningSession.create(
        {
            status,
            user_id,
            song_id,
            ended_at,
        })
    res.json(listeningSession);

    console.log("created listening session")
})



module.exports = router;