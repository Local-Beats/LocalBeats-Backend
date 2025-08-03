const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../database");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateJWT };