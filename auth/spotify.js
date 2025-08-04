const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("./middleware");
const axios = require('axios');
const { User } = require("../database");

router.post("/sync", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const spotifyAccessToken = authHeader.split(" ")[1];
        console.log("🧪 Incoming token from frontend:", spotifyAccessToken); // ✅ Add this
        // Fetch Spotify profile
        console.log("🎧 Fetching Spotify profile...");
        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
            },
        });

        const spotifyProfile = profileRes.data;

        // Create or update DB user — generate a fake auth0Id for now if needed
        const auth0Id = "spotify|" + spotifyProfile.id;
        console.log("Spotify profile received:", {
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

        res.status(200).json({ message: "User created or updated", user });
    } catch (error) {
        console.error("Error in spotify user setup:", error.response?.data || error.message);
        res.status(500).send({ error: 'Failed to create or update user' });
    }
});

module.exports = router;
