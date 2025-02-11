// Import express
const express = require("express");

// Import bcrypt untuk enkripsi password
const bcrypt = require("bcryptjs");

// Import jsonwebtoken untuk pembuatan token JWT
const jwt = require("jsonwebtoken");

// Import prisma client untuk berinteraksi dengan database
const prisma = require("../prisma/client");

// Fungsi login
const login = async(req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                isLoggedIn: true, // Ambil status login
            },
        });

        if (!user)
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan",
            });

        // // Memeriksa apakah pengguna sudah login
        // if (user.isLoggedIn)
        //     return res.status(403).json({
        //         success: false,
        //         message: "Pengguna sudah login di perangkat lain",
        //     });

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPassword)
            return res.status(401).json({
                success: false,
                message: "Password tidak valid",
            });

        // Update status login pengguna
        await prisma.user.update({
            where: { id: user.id },
            data: { isLoggedIn: true },
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).send({
            meta: {
                success: true,
                message: "Login berhasil",
            },
            data: {
                user: userWithoutPassword,
                token: token,
            },
        });
    } catch (error) {
        res.status(500).send({
            meta: {
                success: false,
                message: "Terjadi kesalahan di server",
            },
            errors: error,
        });
    }
};

// Fungsi logout
const logout = async(req, res) => {
    try {
        // Mendapatkan user ID dari token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token tidak ditemukan",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Update status login pengguna
        await prisma.user.update({
            where: { id: userId },
            data: { isLoggedIn: false },
        });

        res.status(200).send({
            meta: {
                success: true,
                message: "Logout berhasil",
            },
        });
    } catch (error) {
        res.status(500).send({
            meta: {
                success: false,
                message: "Terjadi kesalahan di server",
            },
            errors: error,
        });
    }
};


// Mengekspor fungsi login agar dapat digunakan di tempat lain
module.exports = { login, logout };