
const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("./middleware");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const { User } = require("../database");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Debug endpoint: print decoded JWT payload
router.get("/debug/jwt", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ error: "No token cookie found" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ decoded });
    } catch (err) {
        res.status(400).json({ error: "Invalid token", details: err.message });
    }
});

// Debug endpoint: print user object from DB
router.get("/debug/user", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: "DB error", details: err.message });
    }
});

// GET CURRENT OR RECENT TRACK
router.get("/current-track", authenticateJWT, async (req, res) => {
    try {
        const accessToken = req.user.spotifyAccessToken;
        console.log("[DEBUG] JWT payload:", req.user);
        if (!accessToken) {
            console.log("[ERROR] No spotifyAccessToken in JWT payload");
            return res.status(401).json({ error: "Spotify access token missing" });
        }

        console.log("🎵 Fetching currently playing track with accessToken:", accessToken);
        let trackRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            validateStatus: status => true // Allow handling of 204
        });

        console.log("🎵 Spotify status:", trackRes.status, "Response:", trackRes.data);
        if (trackRes.status === 204 || !trackRes.data || !trackRes.data.item) {
            console.log("⚠️ No currently playing track found, checking recently played...");

            const recentRes = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("[DEBUG] Recently played response:", recentRes.data);

            const recentTrack = recentRes.data.items?.[0]?.track;
            if (!recentTrack) {
                return res.status(404).json({ error: "No recent tracks found" });
            }

            return res.json({
                spotifyTrackId: recentTrack.id,
                title: recentTrack.name,
                artist: recentTrack.artists.map(a => a.name).join(", "),
                albumArt: recentTrack.album.images?.[0]?.url || null,
                preview_url: recentTrack.preview_url,
                source: "recently-played"
            });
        }

        const currentTrack = trackRes.data.item;
        console.log("[DEBUG] Currently playing track:", currentTrack);
        return res.json({
            spotifyTrackId: currentTrack.id,
            title: currentTrack.name,
            artist: currentTrack.artists.map(a => a.name).join(", "),
            albumArt: currentTrack.album.images?.[0]?.url || null,
            preview_url: currentTrack.preview_url,
            source: "currently-playing"
        });

    } catch (err) {
        console.error("❌ Spotify API error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
            return res.status(401).json({ error: "Spotify token expired or unauthorized" });
        }
        res.status(500).json({ error: "Failed to fetch track info" });
    }
});

module.exports = router;