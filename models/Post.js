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
    },
    repost: {
        type: String,
        unique: false,
        required: true
    },
    likes: {
        type: Array,
        unique: false,
        required: true
    },
    dislikes: {
        type: Array,
        unique: false,
        required: true
    },
    reported: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    approved: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    reportreason: {
        type: String,
        unique: false,
        required: false
    }
});

Post.index({
    body: 'text',
    owner: 'text',
    date: 'text'
});

module.exports = mongoose.model('Post', Post)