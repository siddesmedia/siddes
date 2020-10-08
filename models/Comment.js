const mongoose = require('mongoose');

const Comment = new mongoose.Schema({
    body: {
        type: String,
        unique: false,
        required: true
    },
    parentid: {
        type: String,
        unique: false,
        required: true
    },
    owner: {
        type: String,
        unique: false,
        required: true
    },
    date: {
        type: Date,
        unique: false,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('Comment', Comment)