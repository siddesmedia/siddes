require('../models/User.js');
require('dotenv').config()
const express = require('express');
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs');
const passport = require('passport')
const Name = process.env.NAME
const {
    forwardAuthenticated
} = require('../config/auth');
const funcs = require('../config/functions');

router.get('/signup', forwardAuthenticated, function (req, res, next) {
    console.log('/signup')
    const about = {
        title: 'Signup - ' + Name,
        template: 'pages/signup',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.post('/signup', (req, res) => {
    console.log('/signup POST')
    const {
        username,
        email,
        password,
        password2
    } = req.body;
    let errors = [];

    if (!username || !email || !password || !password2) {
        return '{"type": "error", "message": "Please fill out all fields."}'
    }

    if (password != password2) {
        return '{"type": "error", "message": "Passwords are not the same."}'
    }

    if (password.length < 8) {
        return '{"type": "error", "message": "Password is to short, make sure it is more than 8 characters."}'
    }

    if (errors.length > 0) {
        res.render('pages/signup', {
            errors,
            username,
            password,
            password2
        });
    } else {
        User.findOne({
            username: username
        }).then(user => {
            if (user) {
                return '{"type": "error", "message": "Username already exists. Pick a new one."}'
            } else {
                const newUser = new User({
                    username,
                    email,
                    password,
                    "description": "This is a description. Click 'Edit Account to change me!",
                    "moderator": false,
                    "admin": false
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                res.redirect('/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

router.get('/login', forwardAuthenticated, function (req, res, next) {
    console.log('/login')
    passport.authenticate('local', {
        failureRedirect: '/login'
    })
    if (req.user) {
        return res.redirect('/');
    }
    const about = {
        title: 'Login - ' + Name,
        template: 'pages/login',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.post('/login', (req, res, next) => {
    console.log('/login POST')
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    console.log('/logout')
    req.logout();
    res.redirect('/login');
});

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

function moderator(user) {
    if (user) {
        if (user.moderator == false) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

module.exports = router;