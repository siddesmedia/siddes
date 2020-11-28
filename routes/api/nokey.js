const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const Directs = require('../../models/Directs');

module.exports = router;