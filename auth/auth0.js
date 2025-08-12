const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
const { User } = require("../database");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Get current Auth0 user route (protected)
router.get("/me", async (req, res) => {
    const token = req.cookies.token;
    console.log("🍪 [Auth0] Token from cookie:", token);

    if (!token) {
        console.log("❌ [Auth0] No token found in cookie");
        return res.send({});
    }

    jwt.verify(token, JWT_SECRET, async (err, decodedUser) => {
        if (err) {
            console.error("❌ [Auth0] JWT verify error:", err.message);
            return res.status(403).send({ error: "Invalid or expired token" });
        }
        console.log("✅ [Auth0] Decoded user from token:", decodedUser);
        try {
            const fullUser = await require("../database").User.findOne({ where: { id: decodedUser.id } });
            if (!fullUser) {
                console.log("❌ [Auth0] No user found in DB");
                return res.status(404).send({ error: "User not found" });
            }
            console.log("✅ [Auth0] Full user fetched from DB:", {
                id: fullUser.id,
                username: fullUser.username
            });
            res.send({ user: fullUser });
        } catch (err) {
            console.error("[Auth0] DB error in /auth/me:", err);
            res.status(500).send({ error: "Failed to fetch user" });
        }
    });
});

// Auth0 authentication route
router.post("/", async (req, res) => {
    try {
        const { auth0Id, email, username } = req.body;

        if (!auth0Id) {
            return res.status(400).send({ error: "Auth0 ID is required" });
        }

        // Try to find existing user by auth0Id first
        let user = await User.findOne({ where: { auth0Id } });

        if (!user && email) {
            // If no user found by auth0Id, try to find by email
            user = await User.findOne({ where: { email } });

            if (user) {
                // Update existing user with auth0Id
                user.auth0Id = auth0Id;
                await user.save();
            }
        }

        if (!user) {
            // Create new user if not found
            const userData = {
                auth0Id,
                email: email || null,
                username: username || email?.split("@")[0] || `user_${Date.now()}`, // Use email prefix as username if no username provided
                passwordHash: null, // Auth0 users don't have passwords
            };

            // Ensure username is unique
            let finalUsername = userData.username;
            let counter = 1;
            while (await User.findOne({ where: { username: finalUsername } })) {
                finalUsername = `${userData.username}_${counter}`;
                counter++;
            }
            userData.username = finalUsername;

            user = await User.create(userData);
        }

        // Generate JWT token with auth0Id included
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                auth0Id: user.auth0Id,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // <--- for local dev
            sameSite: "lax", // <--- for cross-origin dev
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.send({
            message: "Auth0 authentication successful",
            user: {
                id: user.id,
                username: user.username,
                auth0Id: user.auth0Id,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Auth0 authentication error:", error);
        res.sendStatus(500);
    }
});

module.exports = router;
