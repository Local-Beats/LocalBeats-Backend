const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
const { User } = require("../database");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const isProd = process.env.NODE_ENV === "production";

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
            secure: isProd,                      // ❗ false in dev
            sameSite: isProd ? "None" : "Lax",   // ❗ Lax in dev, None in prod
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
