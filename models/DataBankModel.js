const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, "please provide a unique name"],
        required: [true, "please provide a name"],
    },
    data: {
        type: String, //keep it as string even when its not
        required: [true, "please provide a data"],
    },
    history: [{
        date: Date,
        value: String
    }]
},
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    { timestamps: true }
);


const dataBank = mongoose.model('dataBank', dataSchema);
module.exports = dataBank;