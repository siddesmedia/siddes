const mongoose = require('mongoose');

const Media = new mongoose.Schema({
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