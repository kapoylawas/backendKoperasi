//import express validator
const { body } = require('express-validator');

//import prisma
const prisma = require('../../prisma/client');

const validateUser = [
    body('name').notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email')
    .notEmpty().withMessage('Email tidak boleh kosong')
    .isEmail().withMessage('Format harus email')
    .custom(async(value, { req }) => {
        if (!value) {
            throw new Error('Email tidak boleh kosong')
        }

        // For update operations, exclude the current user ID from the email uniqueness check
        const user = await prisma.user.findFirst({
            where: {
                email: value,
                NOT: {
                    id: Number(req.params.id) || undefined
                }
            }
        });

        if (user) {
            throw new Error('Email already exists')
        }
        return true
    }),

    // conditional password
    body('password').if((value, { req }) => req.method === 'POST')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('password').if((value, { req }) => req.method === PUT)
    .optional(),
]

module.exports = { validateUser }