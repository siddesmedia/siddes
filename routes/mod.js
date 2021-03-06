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
const {
    body,
    validationResult
} = require('express-validator');

router.get('/mod/reports', async function (req, res, next) {

    if (!req.user) {
        return res.redirect('/login?next=/mod/reports')
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
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        posts: reportedposts
    };
    return res.render('base', about);
});

router.get('/mod', async function (req, res, next) {

    if (!req.user) {
        return res.redirect('/login?next=/mod')
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
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        admin: funcs.admin(req.user),
        navbar: true,
        footer: true,
    };
    return res.render('base', about);
});

router.get('/mod/viewappeals', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login?next=/mod/viewappeals')
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }

    const users = await User.find({
        uploadbannedappealed: true
    })

    const about = {
        title: 'View Appeals - ' + Name,
        template: 'pages/mod/viewappeals',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        users: users
    };
    return res.render('base', about);
});

router.post('/mod/reports',
    body('sensitive').toBoolean(),
    async function (req, res, next) {

        if (!req.user) {
            return res.redirect('/login?next=/mod/reports')
        }
        if (req.user.admin == false) {
            if (req.user.moderator == false) {
                return res.redirect('/account')
            }
        }
        const postid = req.body.id;
        const approved = req.body.approved;
        const sensitive = req.body.sensitive;
        if (approved == 'true') {
            const updateapprovedpost = await Post.findByIdAndUpdate(postid, {
                reported: false,
                approved: approved,
                sensitive: sensitive,
            })
            return updateapprovedpost;
        } else {
            const removebadpost = await funcs.removepost(postid)
            return removebadpost;
        }
    }
);

router.get('/report', async function (req, res, next) {

    const postexists = await Post.exists({
        _id: req.query.post
    })
    if (postexists == false) {
        const about = {
            title: '404 - ' + Name,
            template: 'errors/400',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
        };
        return res.render('base', about);
    } else {
        const about = {
            title: 'Report a Post - ' + Name,
            template: 'pages/report',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
            postid: req.query.post
        };
        return res.render('base', about);
    }
});

router.get('/mod/uploadban/:id/:reason', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login?next=/mod/uploadban/' + req.params.id + '/' + req.params.reason)
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }
    try {
        const updateuserwithban = await User.findByIdAndUpdate(req.params.id, {
            uploadbanned: true,
            uploadbannedappealed: false,
            banreason: decodeURIComponent(req.params.reason)
        })

        updateuserwithban

        funcs.addtofeed(req.params.id, "A moderator has upload banned you.", '/admin/appeals', 'Press me to appeal this upload ban. Reason: ' + decodeURIComponent(req.params.reason))

        res.json({
            banned: true
        })
    } catch (err) {

        res.json({
            banned: false
        })
    }
});

router.get('/mod/removeuploadban/:id', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login?next=/mod/removeuploadban/' + req.params.id)
    }
    if (req.user.admin == false) {
        if (req.user.moderator == false) {
            return res.redirect('/account')
        }
    }
    try {
        const updateuserwithban = await User.findByIdAndUpdate(req.params.id, {
            uploadbanned: false,
            uploadbannedappealed: false,
            banreason: ""
        })

        updateuserwithban

        funcs.addtofeed(req.params.id, "Your upload ban has been removed.", '/account', 'You can now post if your account is not suspended.')

        res.json({
            banned: false
        })
    } catch (err) {
        res.json({
            banned: true
        })
    }
});

router.post('/mod/appealuploadban', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/account')
    }

    try {
        const updateuploadban = await User.findByIdAndUpdate(req.user._id, {
            uploadbannedappealed: true
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

router.post('/report',
    body('reason').escape(),
    async function (req, res, next) {

        const postexists = await Post.exists({
            _id: req.body.post
        })
        if (postexists == false) {
            return res.redirect('/mod/reports')
        } else {
            const reportpost = await Post.findByIdAndUpdate(req.body.post, {
                reported: true,
                approved: false,
                reportreason: req.body.reason
            })
            reportpost;
            res.redirect('/')
        }
    }
);

module.exports = router;