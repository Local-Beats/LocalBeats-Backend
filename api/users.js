// backend/routes/users.js
const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../auth/middleware");
const { User } = require("../database");
const { Op } = require("sequelize");

// Helper: safely extract lat/lng from a GeoJSON Point { type: "Point", coordinates: [lng, lat] }
function extractLatLng(geojson) {
  if (
    !geojson ||
    geojson.type !== "Point" ||
    !Array.isArray(geojson.coordinates) ||
    geojson.coordinates.length < 2
  ) {
    return null;
  }
  const [lng, lat] = geojson.coordinates;
  if (
    typeof lat !== "number" || typeof lng !== "number" ||
    !Number.isFinite(lat) || !Number.isFinite(lng)
  ) return null;

  return { latitude: lat, longitude: lng };
}

// GET /api/users/online
// Returns users who have updated location in the last 5 minutes.
router.get("/online", authenticateJWT, async (req, res) => {
  try {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const since = new Date(Date.now() - FIVE_MINUTES);

    const users = await User.findAll({
      where: {
        location: { [Op.ne]: null },
        last_seen: { [Op.gte]: since },
      },
      attributes: ["id", "username", "location", "last_seen"],
    });

    const mapped = [];
    for (const u of users) {
      const coords = extractLatLng(u.location);
      if (!coords) continue; // skip malformed locations
      mapped.push({
        id: u.id,
        username: u.username,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }

    res.json({ users: mapped });
  } catch (err) {
    console.error("[USERS/ONLINE] Error:", err);
    res.status(500).json({ error: "Failed to fetch users with location" });
  }
});

// POST /api/users/location
// Updates current user's location and marks them as online now.
router.post("/location", authenticateJWT, async (req, res) => {
  try {
    // Accept numbers or numeric strings and coerce safely
    let { latitude, longitude } = req.body;
    latitude = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    longitude = typeof longitude === "string" ? parseFloat(longitude) : longitude;

    if (
      typeof latitude !== "number" || typeof longitude !== "number" ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude)
    ) {
      return res.status(400).json({ error: "Latitude and longitude must be numbers" });
    }

    // Basic range validation
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: "Latitude/longitude out of range" });
    }

    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // IMPORTANT: GeoJSON order is [lng, lat]
    user.location = { type: "Point", coordinates: [longitude, latitude] };
    user.last_seen = new Date();

    await user.save();

    res.json({
      message: "Location updated",
      user: {
        id: user.id,
        username: user.username,
        latitude,
        longitude,
      },
    });
  } catch (err) {
    console.error("[USERS/LOCATION] Error:", err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

module.exports = router;
