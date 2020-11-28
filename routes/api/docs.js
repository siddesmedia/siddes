const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const funcs = require('../../config/functions');
const ratelimit = require("express-rate-limit");

router.get('/account/developer/home', async function (req, res, next) {
    const about = {
        title: 'Developer Home - ' + Name,
        template: 'pages/developer/home',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
    };
    return res.render('base', about);
});

router.get('/account/developer/docs', async function (req, res, next) {
    const about = {
        title: 'API Docs - ' + Name,
        template: 'pages/developer/docs/index',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: false,
        footer: true,
    };
    return res.render('base', about);
});

async function verifyapikey(apikey) {
    const rawapikey = apikey
    return await funcs.getuserbyapikey(rawapikey)
}

module.exports = router;