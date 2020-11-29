const mongoose = require('mongoose');

const Comment = new mongoose.Schema({
    body: {
        type: String,
        unique: false,
        required: true
    },
    reply: {
        type: Boolean,
        unique: false,
        required: true
    },
    parentid: {
        type: String,
        unique: false,
        required: true
    },
    parentcomment: {
        type: String,
        unique: false,
        required: false
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