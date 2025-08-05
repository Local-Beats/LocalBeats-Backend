const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("./middleware");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const { User } = require("../database");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// SYNC USER AND CREATE JWT
router.post("/sync", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const spotifyAccessToken = authHeader.split(" ")[1];
        console.log("🧪 Incoming token from frontend:", spotifyAccessToken);

        // Fetch Spotify profile
        console.log("🎧 Fetching Spotify profile...");
        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
            },
        });

        const spotifyProfile = profileRes.data;

        // Create or update DB user
        const auth0Id = "spotify|" + spotifyProfile.id;
        console.log("✅ Spotify profile received:", {
            display_name: spotifyProfile.display_name,
            email: spotifyProfile.email,
            id: spotifyProfile.id,
            image: spotifyProfile.images?.[0]?.url,
        });

        const [user, created] = await User.findOrCreate({
            where: { auth0Id },
            defaults: {
                username: spotifyProfile.display_name,
                spotify_email: spotifyProfile.email,
                spotify_id: spotifyProfile.id,
                spotify_display_name: spotifyProfile.display_name,
                last_seen: new Date(),
                spotify_image: spotifyProfile.images?.[0]?.url || null,
                is_public: true,
                spotify_access_token: spotifyAccessToken,
            }
        });

        if (!created) {
            user.spotify_access_token = spotifyAccessToken;
            user.last_seen = new Date();
            await user.save();
        }

        // Create JWT
        const tokenPayload = {
            id: user.id,
            username: user.username,
            spotifyAccessToken: user.spotify_access_token,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "User synced and session created" });
    } catch (error) {
        console.error("❌ Error in spotify user setup:", error.response?.data || error.message);
        res.status(500).send({ error: "Failed to create or update user" });
    }
});

// GET CURRENT OR RECENT TRACK
router.get("/current-track", authenticateJWT, async (req, res) => {
    try {
        const accessToken = req.user.spotifyAccessToken;

        if (!accessToken) {
            return res.status(401).json({ error: "Spotify access token missing" });
        }

        console.log("🎵 Fetching currently playing track...");
        let trackRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            validateStatus: status => true // Allow handling of 204
        });

        console.log("🎵 Spotify status:", trackRes.status);
        if (trackRes.status === 204 || !trackRes.data || !trackRes.data.item) {
            console.log("⚠️ No currently playing track found, checking recently played...");

            const recentRes = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

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
