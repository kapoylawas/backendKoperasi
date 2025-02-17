//import express
const express = require('express')

//import CORS
const cors = require('cors')

//import bodyParser
const bodyParser = require('body-parser')

//import path
const path = require('path')

//import router
const router = require('./routes')

//init app
const app = express()

const rateLimit = require('express-rate-limit');
const { checkToken } = require('./middlewares')


// Create a rate limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});


// Define allowed origins
const allowedOrigins = ['http://localhost:5173', 'https://warungkapoy.my.id'];

// Use CORS with options
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

//use body parser
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Apply the rate limiter to all requests
app.use(limiter);

//define port
const port = 3000;

//route
app.get('/', (req, res) => {
    res.status(200).send('API v.1.0')
})

// Route to serve uploaded files (if needed)
app.get('/uploads/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
});

//define routes
app.use('/api', router);

//start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})