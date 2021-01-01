require('../models/User.js');
require('dotenv').config()
const express = require('express');
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs');
const passport = require('passport')
const Name = process.env.NAME
const ProtonMail = require('protonmail-api');
const {
    forwardAuthenticated
} = require('../config/auth');
const funcs = require('../config/functions');
const {
    v4: uuidv4
} = require('uuid');
const url = require('url');
const {
    body,
    validationResult
} = require('express-validator');

router.get('/signup', forwardAuthenticated, function (req, res, next) {

    var error = req.query.error
    const about = {
        title: 'Signup - ' + Name,
        template: 'pages/signup',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        error: error,
    };
    return res.render('base', about);
});

router.post('/signup',
    body('password').isLength({
        min: 8
    }),
    body('password2').isLength({
        min: 8
    }),
    (req, res) => {

        const {
            username,
            password,
            password2
        } = req.body;
        let errors = [];

        const prohibitedusername = ["login", "signup", "latest", "company"];
        const prohibitedincludes = ["@", "/", "!", "#", "$", "%", "^", "&", "*", "(", ")", "-", "=", "+", "[", "]", "{", "}", "|", "\\", "`", "\"", "~", "'", ":", ";", ",", "<", ">", ",", "."]

        for (i = 0; i < prohibitedincludes.length; i++) {
            if (username.includes(prohibitedincludes[i]) == true) {
                return res.redirect(url.format({
                    pathname: "/signup",
                    query: {
                        "error": "That username is not allowed"
                    }
                }))
            } else {}
        }

        if (prohibitedusername.includes(username.toLowerCase()) == true) {
            return res.redirect(url.format({
                pathname: "/signup",
                query: {
                    "error": "That username is not allowed"
                }
            }))
        }

        if (!username || !password || !password2) {
            return '{"type": "error", "message": "Please fill out all fields."}'
        }

        if (password != password2) {
            return res.redirect(url.format({
                pathname: "/signup",
                query: {
                    "error": "Passwords are not the same."
                }
            }))
        }

        if (password.length < 8) {
            return res.redirect(url.format({
                pathname: "/signup",
                query: {
                    "error": "Your password needs to be at least 8 characters long."
                }
            }))
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
                username: {
                    '$regex': new RegExp(username, 'i')
                }
            }).then(user => {
                if (user) {
                    return res.redirect(url.format({
                        pathname: "/signup",
                        query: {
                            "error": "That username is already in use."
                        }
                    }))
                } else {
                    const newUser = new User({
                        username,
                        password,
                        description: "This is a description. Click 'Edit Account' to change me!",
                        moderator: false,
                        admin: false,
                        apikey: uuidv4(),
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(async user => {
                                    res.redirect('/login?success=true');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            })
        }
    });

router.get('/login', forwardAuthenticated, function (req, res, next) {
    var nextpage
    if (req.query.next) {
        nextpage = req.query.next
    }

    passport.authenticate('local', {
        failureRedirect: '/login'
    })
    if (req.user) {
        return res.redirect('/');
    }
    var errormessage
    if (req.query.error != undefined) {
        errormessage = req.query.error
    }
    const about = {
        title: 'Login - ' + Name,
        template: 'pages/login',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        nextpage: nextpage,
        error: errormessage
    };
    return res.render('base', about);
});

router.post('/login',
    body('username').trim().escape(),
    async function (req, res, next) {

        var nextpage = '/'
        if (req.body.nextpage) {
            nextpage = req.body.nextpage
        }

        try {
            passport.authenticate('local', {
                successRedirect: nextpage,
                failureRedirect: '/login',
            })(req, res, next);
        } catch (err) {
            res.redirect(url.format({
                pathname: "/login",
                query: {
                    "error": "There was an error logging you in, please try again."
                }
            }))
        }
    }
);

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;