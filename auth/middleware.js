const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
    console.log("[AUTH] Incoming cookies:", req.cookies); // Add this line

    const token = req.cookies.token;

    if (!token) {
        console.warn("[AUTH] No token in cookies");
        return res.status(401).send({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn("[AUTH] Invalid token:", err.message);
            return res.status(403).send({ error: "Invalid or expired token" });
        }

        console.log("[AUTH] JWT verified, user payload:", user);
        req.user = user;
        next();
    });
};

module.exports = { authenticateJWT };