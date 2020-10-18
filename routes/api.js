const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const version = process.env.VERSION

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
            username: "[banned]",
            displayname: ""
        })
    }
});

router.get('/api/version', async function (req, res, next) {
    try {
        res.json({
            version: version
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

module.exports = router;