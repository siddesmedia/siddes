const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const {
    forwardAuthenticated
} = require('../config/auth');

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

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;