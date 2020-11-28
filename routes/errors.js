require('../models/User.js');
require('dotenv').config()
const express = require('express');
const router = express.Router()
const Name = process.env.NAME
const funcs = require('../config/functions');

router.get('/*', function (req, res, next) {
    const about = {
        title: '404 ;) - ' + Name,
        template: 'errors/400',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.status(404).render('base', about);
});

module.exports = router;