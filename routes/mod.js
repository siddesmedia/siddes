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
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
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
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
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
    const sensitive = req.body.sensitive;
    if (approved == 'true') {
        const updateapprovedpost = await Post.findByIdAndUpdate(postid, {
            reported: false,
            approved: approved,
            sensitive: sensitive,
        })
        return updateapprovedpost;
    } else {
        const removebadpost = await Post.findByIdAndDelete(postid)
        return removebadpost;
    }
});

router.get('/report', async function (req, res, next) {
    console.log('/report?post=' + req.query.post)
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

router.post('/report', async function (req, res, next) {
    console.log('/report POST')
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
});

module.exports = router;