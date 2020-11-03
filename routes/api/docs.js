const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const redis = require('../../config/redis')
const funcs = require('../../config/functions');
const ratelimit = require("express-rate-limit");

router.get('/account/developer/docs', async function (req, res, next) {
    res.send('POST to /api/v1/post/new')
});

async function verifyapikey(apikey) {
    const rawapikey = apikey
    return await funcs.getuserbyapikey(rawapikey)
}

module.exports = router;