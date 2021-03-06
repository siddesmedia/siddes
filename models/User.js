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
    uploadbanned: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    suspended: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    banreason: {
        type: String,
        unique: false,
        required: false
    },
    suspensionreason: {
        type: String,
        unique: false,
        required: false
    },
    suspensionappealed: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    uploadbannedappealed: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    apikey: {
        type: String,
        unique: true,
        required: true,
    },
    apikey_v2: {
        type: String,
        unique: true,
        required: false,
    },
    pfp: {
        type: String,
        unique: false,
        required: false,
    },
    banner: {
        type: String,
        unique: false,
        required: false,
    },
    directmessages: {
        type: Array,
        unique: false,
        required: true,
        default: []
    },
    following: {
        type: Array,
        unique: false,
        required: true,
        default: []
    },
    boards: {
        type: Array,
        unique: false,
        required: true,
        default: []
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
    feedtype: {
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
        default: "dark"
    },
    premium: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    verified: {
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
        default: true
    },
    bot: {
        type: Boolean,
        unique: false,
        required: true,
        default: false
    },
    notifications: {
        type: Object,
        unique: true,
        required: false
    },
    notificationson: {
        type: String,
        unique: false,
        required: false
    },
    twitterlink: {
        type: String,
        unique: false,
        required: false
    },
    githublink: {
        type: String,
        unique: false,
        required: false
    },
    facebooklink: {
        type: String,
        unique: false,
        required: false
    },
    discordlink: {
        type: String,
        unique: false,
        required: false
    },
    instagramlink: {
        type: String,
        unique: false,
        required: false
    },
    youtubelink: {
        type: String,
        unique: false,
        required: false
    },
    steamlink: {
        type: String,
        unique: false,
        required: false
    },
    websitelink: {
        type: String,
        unique: false,
        required: false
    }
});

User.index({
    username: 'text',
    displayname: 'text',
    description: 'text'
});

module.exports = mongoose.model('User', User)