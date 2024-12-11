//import express validator
const { body } = require('express-validator');

const validateCustomer = [
    body('name').notEmpty().withMessage('Name tidak boleh kosong'),
    body('no_telp').notEmpty().withMessage('No. Telp tidak boleh kosong'),
    body('address').notEmpty().withMessage('Alamat tidak boleh kosong'),
]

module.exports = { validateCustomer }