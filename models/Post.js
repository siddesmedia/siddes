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

Post.index({
    body: 'text',
    owner: 'text',
    date: 'text'
});

module.exports = mongoose.model('Post', Post)