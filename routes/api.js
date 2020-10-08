const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

router.get('/api/get/username/:id', async function (req, res, next) {
    const user = await User.findOne({
        _id: req.params.id
    })

    res.json({
        username: user.username,
        displayname: user.displayname
    })
});

module.exports = router;