const { body, check } = require('express-validator');

//import prisma
const prisma = require('../../prisma/client');

const validateProduct = [
    body("barcode")
    .notEmpty().withMessage("Barcode tidak boleh kosong")
    .custom(async(barcode, { req }) => {

        const existingProduct = await prisma.product.findFirst({
            where: { barcode: barcode },
        })

        if (existingProduct && (!req.params.id || existingProduct !== parseInt(req.params.id))) {
            throw new Error("Baracode harud unique")
        }

        return true
    }),
    body("category_id").notEmpty().withMessage("Category tidak boleh kosong"),
    body("title").notEmpty().withMessage("Title tidak boleh kosong"),
    body("description").notEmpty().withMessage("Description tidak boleh kosong"),
    check("image").custom((value, { req }) => {
        // Allow image to be optional if it's an update
        if (req.method === 'POST' && !req.file) {
            throw new Error("Image tidak boleh kosong");
        }
        // No need to check image on update if not provided
        return true;
    }),
    body("buy_price").notEmpty().withMessage("Buy Price is required"),
    body("sell_price").notEmpty().withMessage("Sell Price is required"),
    body("stock").notEmpty().withMessage("Stock is required"),
]

module.exports = { validateProduct }