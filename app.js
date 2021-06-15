const path = require('path')
const express = require('express')

//extra packages 
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

//app
const app = express()

//////////////// Global MIDDLEWARES ///////////////////
//4 development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use(helmet())
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(xssClean());
app.use(mongoSanitize());


// ROUTES
const statsRouter = require("./routes/statsRouter")
const barbecue = require("./routes/barbecue")

app.use('/stats', statsRouter);
app.use('/barbecue/', barbecue);

app.all('*', (req, res) => {
    res.status(404).send('This Page is not exist.');
});

module.exports = app;
