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
const Directs = require('../models/Directs');
const Media = require('../models/Media');

router.get('/admin/redis/flush', async function (req, res, next) {

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

router.get('/admin/report', async function (req, res, next) {

    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        return res.redirect('/account')
    }

    const usercount = await User.find().count()
    const postcount = await Post.find().count()
    const commentcount = await Comment.find().count()
    const directcount = await Directs.find().count()
    const mediacount = await Media.find().count()

    const about = {
        title: 'Database Report - ' + Name,
        template: 'pages/admin/report',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        usercount: usercount,
        postcount: postcount,
        commentcount: commentcount,
        directcount: directcount,
        mediacount: mediacount
    };
    return res.render('base', about);
});

router.get('/admin/suspend/:id/:reason', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }
    try {
        const updateuserwithban = await User.findByIdAndUpdate(req.params.id, {
            suspended: true,
            suspensionreason: decodeURIComponent(req.params.reason),
            suspensionappealed: false,
        })

        updateuserwithban

        funcs.addtofeed(req.params.id, "An admin has suspended you.", '/admin/appeals', 'Press me to appeal this suspension. Reason: ' + decodeURIComponent(req.params.reason))

        res.json({
            suspended: true
        })
    } catch (err) {

        res.json({
            suspended: false
        })
    }
});

router.get('/admin/viewappeals', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }

    const users = await User.find({
        suspensionappealed: true
    })

    const about = {
        title: 'View Appeals - ' + Name,
        template: 'pages/admin/viewappeals',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        users: users
    };
    return res.render('base', about);
});

router.get('/admin/appeals', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/account')
    }

    const user = await User.findById(req.user._id)

    const about = {
        title: 'Ban Appeals - ' + Name,
        template: 'pages/admin/appeals',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        user: user
    };
    return res.render('base', about);
});

router.get('/admin/unsuspend/:id', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login')
    }
    if (req.user.admin == false) {
        return res.redirect('/account')
    }
    try {
        const updateuserwithsuspension = await User.findByIdAndUpdate(req.params.id, {
            suspended: false,
            suspensionappealed: false,
            suspensionreason: ""
        })

        updateuserwithsuspension

        funcs.addtofeed(req.params.id, "Your account has been unsuspended.", '/admin/appeals', 'You can now use your account normally if you are not upload banned.')

        res.json({
            suspended: false
        })
    } catch (err) {
        res.json({
            suspended: true
        })
    }
});

router.post('/admin/appealsuspension', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/account')
    }

    try {
        const updateuploadban = await User.findByIdAndUpdate(req.user._id, {
            suspensionappealed: true
        })

        updateuploadban

        res.json({
            success: true
        })
    } catch (err) {
        res.json({
            success: false
        })
    }
})

module.exports = router;