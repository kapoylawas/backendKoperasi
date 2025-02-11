// Import express
const express = require('express');

// Import jwt untuk verifikasi token JWT
const jwt = require('jsonwebtoken');

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

const checkToken = async(req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token tidak ditemukan",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Jika token kedaluwarsa, update status isLoggedIn menjadi false
            const decoded = jwt.decode(token); // Decode token untuk mendapatkan user ID
            await prisma.user.update({
                where: { id: decoded.id },
                data: { isLoggedIn: false },
            });
        }
        return res.status(401).json({
            success: false,
            message: "Token tidak valid atau kedaluwarsa",
        });
    }
};

module.exports = checkToken;