const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const {
    forwardAuthenticated
} = require('../config/auth');
const User = require('../models/User');

router.get('/admin/redis/flush', async function (req, res, next) {
    console.log('/admin/redis/flush')
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        return res.redirect('/account')
    }
    const about = {
        title: 'Flush Redis - ' + Name,
        template: 'pages/admin/flushredis',
        name: Name,
        loggedin: loggedin(req.user),
        moderator: moderator(req.user),
        navbar: true,
        footer: true,
    };
    return res.render('base', about);
});

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

function moderator(user) {
    if (user) {
        if (user.moderator == false) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

module.exports = router;