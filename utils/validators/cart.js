//import express validator
const { body } = require('express-validator');

const validateCart = [
    body('product_id').notEmpty().withMessage('Product tidak boleh kosong'),
    body('qty').notEmpty().withMessage('Qty tidak boleh kosong'),
]

module.exports = { validateCart }