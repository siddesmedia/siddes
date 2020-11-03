const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const redis = require('../../config/redis')
const funcs = require('../../config/functions');
const ratelimit = require("express-rate-limit");

const _15per15 = ratelimit({
    windowMs: 60000 * 15,
    max: 15,
    message: "ratelimited: 15 requests per 15 minutes"
});

const _60per15 = ratelimit({
    windowMs: 60000 * 15,
    max: 60,
    message: "ratelimited: 60 requests per 15 minutes"
});

router.post('/posts/new', _15per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        var body = req.body.posttext;
        var owner = verify._id
        var media = false;
        var date = Date.now()

        var newPost = new Post({
            body: body,
            owner: owner,
            media: media,
            date: date,
            repost: false
        })

        newPost
            .save()
            .then(post => {
                res.json({
                    "success": true,
                    "message": "/s/" + post._id
                })
            })
    }
});

router.get('/feed/get', _60per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        var feed = await funcs.getfeed(verify._id)
        var feedlinks = await funcs.getfeedlinks(verify._id)
        var feedtype = await funcs.getfeedtype(verify._id)

        var feeddata = '';
        var i = 0;

        for (i = 0; i < feed.length; i++) {
            feeddata = feeddata + `[ "text": "${feed[i]}","link": "${feedlinks[i]}","title": "${feedtype[i]}" ],`
        }

        res.json({
            feeddata
        })
    }
});

router.get('/posts/get', _60per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        try {
            var posts = await Post.find({
                owner: req.body.userid
            }).sort({
                date: -1
            }).skip(req.body.page * 20).limit(20);

            res.json(posts)
        } catch (err) {
            res.status(500).json({
                "success": false,
                "message": err
            })
        }
    }
});

router.get('/latest/get', _60per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        try {
            var posts;
            posts = await Post.find().sort({
                date: -1
            }).skip(req.body.page * 20).limit(20);

            var lastpage = false;

            if (posts.length < 20) {
                lastpage = true
            }

            res.json({
                posts
            })
        } catch (err) {
            res.status(500).json({
                "success": false,
                "message": err
            })
        }
    }
});

router.post('/like/add', _60per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        try {
            funcs.like(verify._id, req.body.postid)
            res.json({
                "success": true,
                "message": "like successfully added or already existed"
            })
        } catch (err) {
            res.status(500).json({
                "success": false,
                "message": err
            })
        }
    }
});

router.post('/like/remove', _60per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        try {
            funcs.removelike(verify._id, req.body.postid)
            res.json({
                "success": true,
                "message": "like successfully removed or never existed"
            })
        } catch (err) {
            res.status(500).json({
                "success": false,
                "message": err
            })
        }
    }
});

router.post('/comments/new', _15per15, async function (req, res, next) {
    const verify = await verifyapikey(req.body.apikey)
    if (verify == false) {
        res.status(500).json({
            "success": false,
            "message": "invalid api key"
        })
    } else {
        try {
            var updateownersfeed;
            var body = req.body.commenttext;
            var parentid = req.body.postid;
            var owner = verify._id;
            var date = Date.now()
            var postowner = await funcs.getpostowner(parentid)

            if (body.length == 0 || body.length == undefined || body == undefined || !body) {
                res.status(500).json({
                    "success": false,
                    "message": "empty comment"
                })
            } else {
                funcs.addtofeed(postowner, "Someone commented on your post!", '/s/' + req.body.parentid, body)

                updateownersfeed;

                const newComment = new Comment({
                    body: body,
                    parentid: parentid,
                    owner: owner,
                    date: date
                })

                newComment
                    .save()
                    .then(user => {
                        res.json({
                            "success": true,
                            "message": "/s/" + parentid
                        })
                    })
            }
        } catch (err) {
            res.status(500).json({
                "success": false,
                "message": "unknown fatal error"
            })
        }
    }
});

async function verifyapikey(apikey) {
    const rawapikey = apikey
    return await funcs.getuserbyapikey(rawapikey)
}

module.exports = router;