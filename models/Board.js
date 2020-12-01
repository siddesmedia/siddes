const mongoose = require('mongoose');

const Board = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        unique: false,
        required: true
    },
    locked: {
        type: Boolean,
        unique: false,
        required: true
    },
    topic: {
        type: String,
        unique: false,
        required: true
    },
    icon: {
        type: String,
        unique: false,
        required: false
    },
    moderators: {
        type: Array,
        unique: false,
        required: false,
        default: []
    }
});

module.exports = mongoose.model('Board', Board)