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
    date: {
        type: Date,
        unique: false,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('User', User)