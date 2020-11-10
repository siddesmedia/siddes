const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');

router.get('/api/get/username/:id', async function (req, res, next) {

    try {
        const user = await User.findOne({
            _id: req.params.id
        })

        res.json({
            username: user.username,
            displayname: user.displayname
        })
    } catch (err) {
        res.json({
            username: "[deleted]",
            displayname: ""
        })
    }
});

router.get('/api/uploadsbanned', async function (req, res, next) {
    try {
        const user = await User.findById(req.user._id)

        var banned

        if (user.suspended == true) {
            banned = true
        } else {
            banned = user.uploadbanned
        }

        res.json({
            banned: banned
        })
    } catch (err) {
        res.json({
            banned: false
        })
    }
});

router.get('/api/version', async function (req, res, next) {
    try {
        res.json({
            version: process.env.VERSION
        })
    } catch (err) {
        res.json({
            version: "BETA"
        })
    }
});

router.get('/api/premium', async function (req, res, next) {
    try {
        if (!req.user) {
            res.json({
                premium: false
            })
        } else if (req.user.premium == true) {
            res.json({
                premium: true
            })
        } else if (req.user.premium == false) {
            res.json({
                premium: false
            })
        }
    } catch (err) {
        res.json({
            premium: false
        })
    }
});

router.get('/api/theme/get', async function (req, res, next) {
    try {
        if (!req.user) {
            res.json({
                theme: 'dark'
            })
        } else {
            res.json({
                theme: req.user.theme
            })
        }
    } catch (err) {
        res.json({
            theme: 'dark'
        })
    }
});

router.get('/api/liked/:postid', async function (req, res, next) {

    try {
        const postobject = await Post.findById(req.params.postid)
        if (postobject.likes.includes(req.user._id) == true) {
            res.json({
                liked: true
            })
        } else {
            res.json({
                liked: false
            })
        }
    } catch (err) {
        res.json({
            liked: false
        })
    }
});

router.get('/api/redis/flush', async function (req, res, next) {

    if (req.user) {
        if (req.user.admin == true) {
            try {
                /*redis.flushdb(function (err, succeeded) {
                    res.send('did the flush succeed: ' + succeeded);
                });*/
                res.json({
                    "success": true
                })
            } catch (err) {
                res.send('their was an error');
            }
        } else {
            res.redirect('/account')
        }
    } else {
        res.redirect('/account')
    }
});

module.exports = router;