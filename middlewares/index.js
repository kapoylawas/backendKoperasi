//import middleware
const verifyToken = require('./auth');
const upload = require('./upload');
const handleValidationErrors = require('./handleValidationErrors');
const checkToken = require('./checkToken');


//export middleware
module.exports = { verifyToken, upload, handleValidationErrors, checkToken }