//import express validator
const { body } = require('express-validator');

//import prisma
const prisma = require('../../prisma/client');

const validateLogin = [
    body('email').notEmpty().withMessage('Email tidak boleh kosong'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter'),
]

module.exports = { validateLogin };