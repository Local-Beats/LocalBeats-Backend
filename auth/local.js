const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../database");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Signup route---------------------------------------------------------------
router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .send({ error: "Username and password are required" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .send({ error: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).send({ error: "Username already exists" });
        }

        // Create new user
        const passwordHash = User.hashPassword(password);
        const user = await User.create({ username, passwordHash });

        // Generate JWT token
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
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.send({
            message: "User created successfully",
            user: { id: user.id, username: user.username },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.sendStatus(500);
    }
});



// Login route--------------------------------------------------------------------
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send({ error: "Username and password are required" });
            return;
        }

        // Find user
        const user = await User.findOne({ where: { username } });
        user.checkPassword(password);
        if (!user || !user.checkPassword(password)) {
            return res.status(401).send({ error: "Invalid credentials" });
        }

        // Check password
        if (!user.checkPassword(password)) {
            return res.status(401).send({ error: "Invalid credentials" });
        }

        // Generate JWT token
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
            secure: process.env.NODE_ENV === "production" || req.secure,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.send({
            message: "Login successful",
            user: { id: user.id, username: user.username },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.sendStatus(500);
    }
});

// Logout route--------------------------------------------------------------------
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.send({ message: "Logout successful" });
});



// Get current user route (protected)---------------------------------------------
router.get("/me", async (req, res) => {
    const token = req.cookies.token;
    // console.log("🍪 Token from cookie:", token);

    if (!token) {
        console.log("❌ No token found in cookie");
        return res.send({});
    }

    jwt.verify(token, JWT_SECRET, async (err, decodedUser) => {
        if (err) {
            console.error("❌ JWT verify error:", err.message);
            return res.status(403).send({ error: "Invalid or expired token" });
        }
        // console.log("✅ Decoded user from token:", decodedUser);

        try {
            const fullUser = await User.findOne({ where: { id: decodedUser.id } });

            if (!fullUser) {
                console.log("❌ No user found in DB");
                return res.status(404).send({ error: "User not found" });
            }
            // console.log("✅ Full user fetched from DB:", {
            //     id: fullUser.id,
            //     username: fullUser.username
            // });
            res.send({ user: fullUser });
        } catch (err) {
            console.error("DB error in /auth/me:", err);
            res.status(500).send({ error: "Failed to fetch user" });
        }
    });
});

module.exports = router;