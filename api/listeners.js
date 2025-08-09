const express = require('express');
const router = express.Router();
const { authenticateJWT } = require("../auth/middleware");
const { User } = require("../database")
const { ListeningSession } = require("../database");
const { Op } = require('sequelize');


// Get all listening session playing or paused
router.get("/", authenticateJWT, async (req, res) => {
    console.log("get all End point was hit")

    try {
        const sessions = await ListeningSession.findAll({
            where: { status: { [Op.in]: ["playing", "paused"] } },
            include: [{
                model: User,
                attributes: ["spotify_display_name", "spotify_image"],
            }],
            order: [["updated_at", "DESC"]]
        });
        res.json(sessions)
    } catch (error) {
        console.log("failed to fetch all listening sessions")
        res.status(500).json({ error: "Failed to get all listening sessions" })
    }
})

router.post("/", authenticateJWT, async (req, res) => {
    // console.log("endpoint is being hit")
    const user_id = req.user.id;
    try {
        const {
            status = "playing",
            song_id,
            ended_at,
        } = req.body

        if (!user_id || !song_id) {
            return res.status(400).json({ error: "user_id and song_id are required" })
        }
        if (!user_id || !song_id) {
            return res.status(403).json({ error: "Not allowed" })
        }

        await ListeningSession.update(
            { status: "stopped", ended_at: new Date() },
            { where: { user_id: user_id, status: { [Op.in]: ["playing", "paused"] } } }
        );
        const session = await ListeningSession.create(
            {
                status,
                user_id,
                song_id,
                ended_at,
            });

        res.status(201).json(session);
    } catch (error) {
        console.error("Failed to create a listening session:", error);
        res.status(500).json({ error: "Failed to create a listening session" })
    }
})


router.patch("/", authenticateJWT, async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: "id and status are required" });
        }

        // Only allow modifying your own session
        const session = await ListeningSession.findOne({
            where: { id, user_id: req.user.id },
        });
        if (!session) return res.status(404).json({ error: "Session not found" });

        session.status = status;
        if (status === "stopped") session.ended_at = new Date();
        if (status === "playing") session.ended_at = null;
        await session.save();
        res.json(session);
    } catch (error) {
        console.error("Failed to update listening session:", error);
        res.status(500).json({ error: "Failed to update listening session" });
    }
});


module.exports = router;