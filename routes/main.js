const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const {
    forwardAuthenticated
} = require('../config/auth');
const User = require('../models/User');

router.get('/', function (req, res, next) {
    console.log('/')
    const about = {
        title: 'Home - ' + Name,
        template: 'pages/home',
        name: Name,
        loggedin: loggedin(req.user),
        navbar: false,
        footer: true
    };
    return res.render('base', about);
});

router.get('/account', function (req, res, next) {
    if (!req.user) {
        res.redirect('/login')
    } else {
        res.redirect('/' + req.user.username)
    }
});

router.get('/about', function (req, res, next) {
    console.log('/')
    const about = {
        title: 'About - ' + Name,
        template: 'pages/about',
        name: Name,
        loggedin: loggedin(req.user),
        navbar: false,
        footer: true
    };
    return res.render('base', about);
});

router.get('/:username', async function (req, res, next) {
    var userObject = await User.exists({
        username: req.params.username
    })

    if (userObject == false) {
        return res.render('base', {
            title: "404 Not Found" + Name,
            template: "errors/404",
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true
        });
    } else {
        var user = await User.findOne({
            username: req.params.username
        })

        const username = req.params.username

        console.log('/')
        const about = {
            title: username + Name,
            template: 'pages/user',
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true,

            // user data being loaded
            user: user
        };
        return res.render('base', about);
    }
});

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;