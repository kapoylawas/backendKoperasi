const { validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        // jika ada error, kembalikan  error ke pengguna
        return res.status(422).json({
            meta: {
                success: false,
                message: "Validation errors occured"
            },
            errors: errors.array()
        });
    }

}

module.exports = handleValidationErrors