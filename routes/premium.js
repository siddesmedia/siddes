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

router.get('/premium/live', async function (req, res, next) {
    console.log('/premium/live')
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.premium == false) {
        return res.redirect('/account')
    }

    const about = {
        title: 'Premium Live Chat - ' + Name,
        template: 'pages/premium/live',
        name: Name,
        loggedin: loggedin(req.user),
        moderator: moderator(req.user),
        navbar: true,
        footer: true,
        username: req.user.username
    };
    return res.render('base', about);
});

router.get('/premium', async function (req, res, next) {
    console.log('/premium')
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.premium == false) {
        return res.redirect('/account')
    }

    const about = {
        title: 'Premium Live Chat - ' + Name,
        template: 'pages/premium/premium',
        name: Name,
        loggedin: loggedin(req.user),
        moderator: moderator(req.user),
        navbar: true,
        footer: true,
        username: req.user.username
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