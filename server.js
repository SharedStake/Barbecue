const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const mongoose = require('mongoose');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log("DATABASE CONNECTED ✔"));


const app = require('./app')

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Started on ${PORT}`))

process.on('unhandledRejection', err => {
    console.log(err.name, ':', err.message)
    console.log('UNHANDLED REJECTION!❌\nshutting down...')
    server.close(() => {
        process.exit(1);
    })
});

process.on('uncaughtException', err => {
    console.log(err.name, ':', err.message)
    console.log('UNCAUGHT EXCEPTION!❌\nshutting down...')
    process.exit(1);

});