const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const funcs = require('../config/functions');

router.get('/github', function (req, res, next) {
    res.redirect('https://github.com/siddesmedia')
});

module.exports = router