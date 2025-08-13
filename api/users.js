const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../auth/middleware");
const { User } = require("../database");

// Get all online users with their locations
// Get all users who have a location set (i.e., have logged in and shared location)
router.get("/online", authenticateJWT, async (req, res) => {
    try {
        // Only users who updated location in last 5 minutes are online
        const FIVE_MINUTES = 5 * 60 * 1000;
        const since = new Date(Date.now() - FIVE_MINUTES);
        const users = await User.findAll({
            where: {
                location: { $ne: null },
                last_seen: { $gte: since }
            },
            attributes: ["id", "username", "location"]
        });
        // Map to return lat/lng
        const mapped = users.map(u => {
            const { latitude, longitude } = u.getLatLng();
            return {
                username: u.username,
                latitude,
                longitude
            };
        });
        res.json({ users: mapped });
    } catch (err) {
        console.error("[USERS/ONLINE] Error:", err);
        res.status(500).json({ error: "Failed to fetch users with location" });
    }
});

// Update current user's location and mark as online
router.post("/location", authenticateJWT, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return res.status(400).json({ error: "Latitude and longitude required" });
        }
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });
    user.location = { type: "Point", coordinates: [latitude, longitude] };
    user.last_seen = new Date();
    await user.save();
    res.json({ message: "Location updated", user: { id: user.id, username: user.username, latitude, longitude } });
    } catch (err) {
        console.error("[USERS/LOCATION] Error:", err);
        res.status(500).json({ error: "Failed to update location" });
    }
});

module.exports = router;
