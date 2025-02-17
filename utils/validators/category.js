const { body, check } = require('express-validator');

// Define validation for category with optional file
const validateCategory = [
    body('name')
    .notEmpty().withMessage('Name is required'),

    check("image").custom((value, { req }) => {
        // Allow image to be optional if it's an update
        if (req.method === 'POST' && !req.file) {
            throw new Error("Image is required");
        }
        // Check if the image size exceeds 5MB
        if (req.file && req.file.size > 5 * 1024 * 1024) {
            throw new Error("Image exceeds capacity");
        }
        return true;
    }),
    body('description')
    .notEmpty().withMessage('Description is required'),
];

module.exports = { validateCategory };