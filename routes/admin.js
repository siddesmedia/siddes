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
const funcs = require('../config/functions');

router.get('/admin/redis/flush', async function (req, res, next) {
    console.log(req.originalUrl)
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
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
    };
    return res.render('base', about);
});

module.exports = router;