const express = require("express");
const axios = require("axios");
const { authenticateJWT } = require("./Auth");

const router = express.Router();

router.get("/current-track", authenticateJWT, async (req, res) => {
  const accessToken = req.user?.spotifyAccessToken;

  if (!accessToken) {
    console.log("Spotify access token is missing");
    return res.status(401).json({ error: "Spotify access token missing" });
  }

  console.log("Using Spotify access token:", accessToken);

  try {
    // Try to get the currently playing track
    const current = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (current.status === 200 && current.data?.item) {
      const item = current.data.item;
      return res.json({
        title: item.name,
        artist: item.artists.map((a) => a.name).join(", "),
        albumArt: item.album.images[0]?.url,
        preview_url: item.preview_url,
        source: "currently-playing",
      });
    }
  } catch (err) {
    if (err.response?.status !== 204) {
      console.error("Error getting current track:", err.response?.data || err.message);
    }
  }

  // If not currently playing, get the most recently played track
  try {
    const recent = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const item = recent.data.items[0].track;
    return res.json({
      title: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
      albumArt: item.album.images[0]?.url,
      preview_url: item.preview_url,
      source: "recently-played",
    });
  } catch (err) {
    console.error("Error getting recent track:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to retrieve track info" });
  }
});

module.exports = router;
