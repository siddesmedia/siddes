const mongoose = require('mongoose');

const Post = new mongoose.Schema({
    body: {
        type: String,
        unique: false,
        required: true
    },
    owner: {
        type: String,
        unique: false,
        required: true
    },
    media: {
        type: Boolean,
        unique: true,
        required: true
    },
    date: {
        type: Date,
        unique: false,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('Post', Post)