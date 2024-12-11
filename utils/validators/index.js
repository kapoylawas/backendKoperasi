const { validateLogin } = require("./auth");
const { validateCart } = require("./cart");
const { validateCategory } = require("./category");
const { validateCustomer } = require("./customer");
const { validateProduct } = require("./product");
const { validateProfit } = require("./profit");
const { validateSales } = require("./sale");
const { validateTransaction } = require("./transaction");
const { validateUser } = require("./user");

module.exports = {
    validateLogin,
    validateUser,
    validateCategory,
    validateProduct,
    validateCustomer,
    validateCart,
    validateTransaction,
    validateSales,
    validateProfit
}