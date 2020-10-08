const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Comment = require('../models/Comment');
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
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/account', function (req, res, next) {
    console.log('/account')
    if (!req.user) {
        res.redirect('/login')
    } else {
        res.redirect('/' + req.user.username)
    }
});

router.get('/account/:id', async function (req, res, next) {
    console.log('/account/' + req.params.id)
    const userexists = await User.exists({
        _id: req.params.id
    })
    if (userexists == false) {
        return;
    } else {
        const username = await User.findOne({
            _id: req.params.id
        })
        res.redirect('/' + username.username)
    }
});

router.get('/about', function (req, res, next) {
    console.log('/about')
    const about = {
        title: 'About - ' + Name,
        template: 'pages/about',
        name: Name,
        loggedin: loggedin(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/:username', async function (req, res, next) {
    console.log('/' + req.params.username)
    var userObject = await User.exists({
        username: req.params.username
    })

    if (userObject == false) {
        res.status(404)
        res.status(404).render('base', {
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
        var posts = await Post.find({
            owner: user._id
        })

        const username = req.params.username

        const about = {
            title: username + ' - ' + Name,
            template: 'pages/user',
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true,

            // user data being loaded
            user: user,
            posts: posts.reverse()
        };
        return res.render('base', about);
    }
});

router.get('/s/:postid', async function (req, res, next) {
    console.log('/s/' + req.params.postid)

    var postObject = await Post.exists({
        _id: req.params.postid
    })

    if (postObject == false) {
        res.status(404)
        res.status(404).render('base', {
            title: "404 Not Found" + Name,
            template: "errors/404",
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true
        });
    } else {
        var post = await Post.findOne({
            _id: req.params.postid
        })
        var comments = await Comment.find({
            parentid: req.params.postid
        })
        var owner = await User.findOne({
            _id: post.owner
        })

        const about = {
            title: 'Post - ' + Name,
            template: 'pages/post',
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true,

            // post data being loaded
            post: post,
            owner: owner,
            comments: comments.reverse()
        };
        return res.render('base', about);
    }
});

router.post('/post/new', async function (req, res, next) {
    console.log('/post/new POST')
    if (!req.user) {
        res.redirect('/login')
    } else {
        var body = req.body.body;
        var owner = req.user._id;
        var media = false;
        var date = Date.now()

        const newPost = new Post({
            body: body,
            owner: owner,
            media: media,
            date: date
        })

        newPost
            .save()
            .then(user => {
                res.redirect('/s/' + newPost._id);
            })
    }
})

router.post('/comment/new', async function (req, res, next) {
    console.log('/comment/new POST')
    if (!req.user) {
        res.redirect('/login')
    } else {
        var body = req.body.body;
        var parentid = req.body.parentid;
        var owner = req.user._id;
        var date = Date.now()

        const newComment = new Comment({
            body: body,
            parentid: parentid,
            owner: owner,
            date: date
        })

        newComment
            .save()
            .then(user => {
                res.redirect('/s/' + parentid);
            })
    }
})

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;