const mongoose = require('mongoose');

const Directs = new mongoose.Schema({
    sender: {
        type: String,
        unique: false,
        required: true
    },
    res: {
        type: String,
        unique: false,
        required: true
    },
    message: {
        type: String,
        unique: false,
        required: true
    },
    date: {
        type: String,
        unique: false,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('Directs', Directs)