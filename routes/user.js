require('../models/User.js');
require('dotenv').config()
const express = require('express');
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs');
const Name = process.env.NAME
const {
    forwardAuthenticated
} = require('../config/auth');

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
                    password
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

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;