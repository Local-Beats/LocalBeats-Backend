const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("./middleware");
const axios = require('axios');
const { User } = require("../database");

router.post("/sync", authenticateJWT, async (req, res) => {
    try {
        const auth0Id = req.user.auth0Id;

        const {
            id: userId,
            username,
            email,
            ["https://localbeats.app/spotify_access_token"]: spotifyAccessToken,
        } = req.user;

        // Fetch Spotify profile
        const profileRes = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
            },
        });

        const spotifyProfile = profileRes.data;


        // check if user exist if not then create it
        const [user, created] = await User.findOrCreate({
            where: { auth0Id },
            defaults: {
                username: username || spotifyProfile.display_name,
                email: email || spotifyProfile.email,
                spotify_id: spotifyProfile.id,
                spotify_name: spotifyProfile.display_name,
                spotify_last_seen: new Date(),
                icon_image: spotifyProfile.images?.[0]?.url || null,
                is_public: true,
                spotify_access_token: spotifyAccessToken,
            }

        })

        if (!created) {
            user.spotify_access_token = spotifyAccessToken;
            user.spotify_last_seen = new Date();
            await user.save();
        }

        res.status(200).json({ message: "User created or updated", user });
    } catch (error) {
        console.error("Error in spotify user setup:", error.response?.data || error.message);
        res.status(500).send({ error: 'Failed to create or update user' });
    }
});

module.exports = router;
