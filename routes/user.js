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

router.get('/signup', forwardAuthenticated, function (req, res, next) {
    console.log(req.originalUrl)
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

router.post('/signup', (req, res) => {
    console.log(req.originalUrl)
    const verifyemailkey = uuidv4()
    const {
        username,
        email,
        password,
        password2
    } = req.body;
    let errors = [];

    const prohibitedusername = ["login", "signup", "latest", "company", "/"];

    if (prohibitedusername.includes(username.toLowerCase()) == true) {
        return res.redirect(url.format({
            pathname: "/signup",
            query: {
                "error": "That username is not allowed"
            }
        }))
    }

    if (!username || !email || !password || !password2) {
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
            username: username
        }).then(user => {
            if (user) {
                return res.redirect(url.format({
                    pathname: "/signup",
                    query: {
                        "error": "That username is already in use."
                    }
                }))
            } else {
                User.findOne({
                    email: email
                }).then(user => {
                    if (user) {
                        return res.redirect(url.format({
                            pathname: "/signup",
                            query: {
                                "error": "There is already an account using that email."
                            }
                        }))
                    } else {
                        const newUser = new User({
                            username,
                            email,
                            password,
                            description: "This is a description. Click 'Edit Account' to change me!",
                            moderator: false,
                            admin: false,
                            apikey: uuidv4(),
                            verifyemailkey: verifyemailkey
                        });

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then(async user => {
                                        res.redirect('/login');
                                        const pm = await ProtonMail.connect({
                                            username: 'mrwinson',
                                            password: 'aYWBNqMyT2n@uCV'
                                        })
                                        pm
                                        await pm.sendEmail({
                                            to: user.email,
                                            subject: 'Verify your account',
                                            body: 'Thanks for signing up! Verify yout email by clicking this link:\n\nhttp://localhost:3000/account/verify/' + verifyemailkey
                                        })
                                    })
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                })
            }
        });
    }
});

router.get('/login', forwardAuthenticated, function (req, res, next) {
    console.log(req.originalUrl)
    passport.authenticate('local', {
        failureRedirect: '/login'
    })
    if (req.user) {
        return res.redirect('/');
    }
    var errormessage
    if (req.query.email == 'true') {
        errormessage = 'Before you can login, verify your account'
    }
    if (req.query.email == 'false') {
        errormessage = 'Awesome, your email has been verified!'
    }
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
        error: errormessage
    };
    return res.render('base', about);
});

router.get('/account/verify/:verifytoken', forwardAuthenticated, async function (req, res, next) {
    console.log(req.originalUrl)
    const userexists = await User.exists({
        verifyemailkey: req.params.verifytoken
    })

    if (userexists == true) {
        const user = await User.findOneAndUpdate({
            verifyemailkey: req.params.verifytoken
        }, {
            emailverified: true
        })
        user
        res.redirect('/login?email=false')
    } else {
        res.redirect('/login')
    }
});

router.post('/login', async function (req, res, next) {
    console.log(req.originalUrl)

    try {
        const user = await User.findOne({
            username: req.body.username
        })

        if (user.emailverified == false || !user.emailverified) {
            return res.redirect('/login?email=true')
        }

        passport.authenticate('local', {
            successRedirect: '/',
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
});

router.get('/logout', (req, res) => {
    console.log(req.originalUrl)
    req.logout();
    res.redirect('/login');
});

module.exports = router;