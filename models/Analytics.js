const mongoose = require('mongoose');

const Analytics = new mongoose.Schema({
    title: {
        type: String,
        unique: false,
        required: true
    },
    views: {
        type: String,
        unique: false,
        required: true
    },
    hour: {
        type: Number,
        unique: false,
        required: true,
    },
    day: {
        type: Number,
        unique: false,
        required: true,
        default: Date.now()
    },
    month: {
        type: Number,
        unique: false,
        required: true,
        default: Date.now()
    },
    year: {
        type: Number,
        unique: false,
        required: true,
        default: Date.now()
    },
    date: {
        type: String,
        unique: false,
        required: true
    }
});

module.exports = mongoose.model('Analytics', Analytics)