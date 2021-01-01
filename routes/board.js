const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Media = require('../models/Media');
const Board = require('../models/Board');
const Comment = require('../models/Comment');
const fs = require('fs')
const User = require('../models/User');
const funcs = require('../config/functions');
const multer = require('multer');
const path = require('path');
const imgur = require('../config/imgur');
const uploadimage = multer({
    dest: './usergenerated/imageslarge',
    limits: {
        fileSize: 4000000
    }
});

router.get('/boards/explore', async function (req, res, next) {
    const boards = await Board.find()

    const about = {
        title: 'Explore Boards - ' + Name,
        template: 'pages/board/explore',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        admin: funcs.admin(req.user),
        navbar: true,
        footer: false,

        boards: boards
    };
    return res.render('base', about);
})

router.get('/b/:name', async function (req, res, next) {

    var boardexists = await Board.exists({
        name: req.params.name
    })

    if (boardexists == false) {
        next()
    } else {
        var following = null

        var name = req.params.name

        var board = await Board.findOne({
            name: name
        })

        if (!req.user) {
            following = false
        } else {
            const user = await User.findById(req.user._id)

            if (user.boards.includes(board._id)) {
                following = true
            }
        }

        var posts = await Post.find({
            boardonly: true,
            board: board._id
        }).sort({
            date: -1
        }).limit(60)

        const about = {
            title: name + ' - ' + Name,
            template: 'pages/board/index',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            admin: funcs.admin(req.user),
            navbar: true,
            footer: false,

            // user data being loaded
            board: board,
            following: following,
            posts: posts
        };
        return res.render('base', about);
    }
});

router.get('/b/insides', async function (req, res, next) {
    res.redirect('/b/insides/0')
})

router.get('/b/insides/:page', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/boards/explore')
    }

    if (isNaN(req.params.page) == true) {
        next()
    }

    const user = await User.findById(req.user._id)

    var posts;
    if (isNaN(req.query.limit) == false) {
        if (req.query < 40) {
            posts = await Post.find({
                boardonly: true,
                board: user.boards
            }).sort({
                date: -1
            }).skip(req.params.page * Number(req.query.limit)).limit(Number(req.query.limit));
        } else {
            posts = await Post.find({
                boardonly: true,
                board: user.boards
            }).sort({
                date: -1
            }).skip(req.params.page * 20).limit(20);
        }
    } else {
        posts = await Post.find({
            boardonly: true,
            board: user.boards
        }).sort({
            date: -1
        }).skip(req.params.page * 20).limit(20);
    }

    var lastpage = false;

    if (posts.length < 20) {
        lastpage = true
    }

    const about = {
        title: 'Boards Feed - ' + Name,
        template: 'pages/board/insides',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        page: req.params.page,
        posts: posts,
        lastpage: lastpage
    };
    return res.render('base', about);
});

router.get('/b/:name/submit', async function (req, res, next) {

    var boardexists = await Board.exists({
        name: req.params.name
    })

    if (boardexists == false) {
        next()
    } else {
        const boardsubmit = await Board.findOne({
            name: req.params.name
        })

        const about = {
            title: req.params.name + ' Submit - ' + Name,
            template: 'pages/board/submit',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            admin: funcs.admin(req.user),
            navbar: true,
            footer: false,
            board: boardsubmit._id,
            boardname: req.params.name
        };
        return res.render('base', about);
    }
});

router.get('/board/:id', async function (req, res, next) {

    var boardexists = await Board.exists({
        _id: req.params.id
    })

    if (boardexists == false) {
        next()
    } else {
        const boarddoesexist = await Board.findById(req.params.id)

        res.redirect('/b/' + boarddoesexist.name)
    }
});

router.post('/b/:name/submit', uploadimage.single('image'), async function (req, res, next) {

    var boardexists = await Board.exists({
        name: req.params.name
    })

    if (!req.user || boardexists == false) {
        return res.redirect('/account')
    } else {
        var body = req.body.body;
        var boardid = req.body.boardid;
        var owner = req.user._id;
        var media = false;
        var date = Date.now()
        var mediaid;

        if (req.file) {
            media = true
        }

        if (body.length > 1000) {
            return res.json({
                error: 'body too long'
            })
        }

        var newPost = new Post({
            body: body,
            owner: owner,
            media: media,
            date: date,
            repost: false,
            boardonly: true,
            board: boardid
        })

        if (req.user.uploadbanned == true || req.user.suspended == true) {
            res.redirect('/account')
        } else {

            newPost
                .save()
                .then(post => {
                    res.redirect('/s/' + newPost._id);

                    if (media == true) {

                        var newMedia = new Media({
                            owner: req.user._id,
                            parentid: post._id,
                            file: 'usergenerated/images/' + req.file.filename
                        })

                        mediaid = newMedia._id

                        newMedia.save().then(media => {

                        })
                    }
                })

            // imgur upload is a mess... needs updated
            if (media == true) {
                imgur.uploadImageFile({
                    image: fs.readFileSync(path.join(__dirname, '../', 'usergenerated/imageslarge/' + req.file.filename)),
                    title: 'an image uploaded to siddes.com',
                    description: 'an image uploaded to siddes.com'
                }, async function (err, res) {
                    if (res.status == 200) {
                        var updatemedia = await Media.findByIdAndUpdate(mediaid, {
                            file: res.data.link
                        })

                        updatemedia
                    }
                });
            }
        }
    }
});


module.exports = router;