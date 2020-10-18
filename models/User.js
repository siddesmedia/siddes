const mongoose = require('mongoose');

const User = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    displayname: {
        type: String,
        unique: false,
        required: false
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        unique: false,
        required: true
    },
    description: {
        type: String,
        unique: false,
        required: true
    },
    moderator: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    admin: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    following: {
        type: Array,
        unique: false,
        required: true,
        default: ["5f878ebc9b39e38585777498"]
    },
    feed: {
        type: Array,
        unique: false,
        required: true,
        default: []
    },
    feedlinks: {
        type: Array,
        unique: false,
        required: true,
        default: []
    },
    date: {
        type: Date,
        unique: false,
        required: true,
        default: Date.now()
    },
    theme: {
        type: String,
        unique: false,
        required: false,
        default: "retro"
    },
    premium: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    premiumexpiration: {
        type: Date,
        unique: false,
        required: false,
    },
    developer: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    staff: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    betatester: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    bot: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    }
});

User.index({
    username: 'text',
    displayname: 'text',
    description: 'text'
});

module.exports = mongoose.model('User', User)