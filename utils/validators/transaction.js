//import express validator
const { body } = require('express-validator');

const validateTransaction = [
    body('cash').notEmpty().withMessage('Cash tidak boleh kosong'),
    body('grand_total').notEmpty().withMessage('Grand Tidak boleh kosong'),
]

module.exports = { validateTransaction }