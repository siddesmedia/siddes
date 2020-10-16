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

router.get('/mod/reports', async function (req, res, next) {
    console.log('/mod/reports')
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }
    const reportedposts = await Post.find({
        reported: true,
        approved: false
    })
    const about = {
        title: 'Current Reports - ' + Name,
        template: 'pages/mod/reports',
        name: Name,
        loggedin: loggedin(req.user),
        moderator: moderator(req.user),
        navbar: true,
        footer: true,
        posts: reportedposts
    };
    return res.render('base', about);
});

router.get('/mod', async function (req, res, next) {
    console.log('/mod')
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }

    const about = {
        title: 'Current Reports - ' + Name,
        template: 'pages/mod/mod',
        name: Name,
        loggedin: loggedin(req.user),
        moderator: moderator(req.user),
        navbar: true,
        footer: true,
    };
    return res.render('base', about);
});

router.post('/mod/reports', async function (req, res, next) {
    console.log('/mod/reports POST')
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }
    const postid = req.body.id;
    const approved = req.body.approved;
    if (approved == 'true') {
        const updateapprovedpost = await Post.findByIdAndUpdate(postid, {
            reported: false,
            approved: true,
        })
        return updateapprovedpost;
    } else {
        const removebadpost = await Post.findByIdAndDelete(postid)
        return removebadpost;
    }
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