const mongoose = require('mongoose');

const user = new mongoose.Schema({
    address: {
        type: String,
        unique: [true, "please provide a unique address"],
        required: [true, "please provide a address"],
    },
    lastBlock: {
        type: Number,
        required: [true, "provide a last block for calculation ease"],
    },
    lastBalance: {
        type: String, // doesn't support bigint // in vEth2
        required: [true, "provide the last Balance for calculation ease"],
    },
    lastContribution: {
        type: String, // doesn't support bigint (?)
        required: [true, "provide the last contribution for calculation ease"],
    },
    gain: {
        type: Number, // in eth
        required: [true, "please provide a gain to save the address"],
    },
},  // Mongoose uses Unix time (seconds since Jan 1, 1970)
    { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });


const address = mongoose.model('address', user);
module.exports = address;