const imgurwrap = require('imgurwrap');
require('dotenv').config()

imgurwrap.setUserAgent('siddes official imgur api');
imgurwrap.setClientID(process.env.IMGUR);

module.exports = imgurwrap;