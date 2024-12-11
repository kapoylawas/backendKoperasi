//import express validator
const { query } = require('express-validator');

const validateSales = [
    query('start_date')
    .notEmpty().withMessage('Start date tidak boleh kosong')
    .isISO8601().withMessage('Start date harus format tanggal'),
    query('end_date')
    .notEmpty().withMessage('End date tidak boleh kosong')
    .isISO8601().withMessage('End date harus format tanggal'),
];

module.exports = { validateSales };