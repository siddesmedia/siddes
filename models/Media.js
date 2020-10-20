const mongoose = require('mongoose');

const Media = new mongoose.Schema({
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
    file: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Media', Media)