const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const Directs = require('../../models/Directs');
const funcs = require('../../config/functions');
const Media = require('../../models/Media');

router.get('/api/get/username/:id', async function (req, res, next) {

    try {
        const user = await User.findOne({
            _id: req.params.id
        })

        res.json({
            username: user.username,
            displayname: user.displayname
        })
    } catch (err) {
        res.json({
            username: "[deleted]",
            displayname: ""
        })
    }
});

router.get('/api/uploadsbanned', async function (req, res, next) {
    try {
        const user = await User.findById(req.user._id)

        var banned

        if (user.suspended == true) {
            banned = true
        } else {
            banned = user.uploadbanned
        }

        res.json({
            banned: banned
        })
    } catch (err) {
        res.json({
            banned: false
        })
    }
});

router.post('/api/comments/:amount/:id', async function (req, res, next) {
    try {
        const comments = await Comment.find({
            parentid: req.params.id
        }).sort({
            date: -1
        }).limit(20)

        return res.send({
            success: true,
            comments: comments
        })
    } catch (err) {
        res.json({
            success: false
        })
    }
});

router.get('/api/latest/:amount', async function (req, res, next) {
    try {
        const posts = await Post.find().sort({
            date: -1
        }).limit(eval(req.params.amount))

        return res.send({
            success: true,
            posts: posts
        })
    } catch (err) {
        res.json({
            success: false
        })
    }
});

router.post('/api/get/dms', async function (req, res, next) {
    try {
        const user = await User.findById(req.user._id)
        const dm_id_array = user.directmessages
        const dm_username_array = []

        for (i = 0; i < dm_id_array.length; i++) {
            var tempuser = await User.findById(dm_id_array[i])
            dm_username_array.push(tempuser.username)
        }

        return res.send({
            success: true,
            ids: dm_id_array,
            id: req.user._id,
            usernames: dm_username_array
        })
    } catch (err) {
        res.json({
            success: false,
            error: err
        })
    }
});

router.post('/api/fetch/dms', async function (req, res, next) {
    try {
        const myid = req.user._id
        const id = req.body.id

        var dms = await Directs.find({
            sender: myid,
            res: id
        }).sort({
            date: -1
        })

        var dms2 = await Directs.find({
            sender: id,
            res: myid
        }).sort({
            date: -1
        })

        var dms = dms.concat(dms2)

        dms.sort(function (a, b) {
            return eval(a.date) - eval(b.date)
        });

        return res.send({
            success: true,
            dms: dms
        })
    } catch (err) {
        res.json({
            success: false,
            error: err
        })
    }
});

router.post('/api/dms/create', async function (req, res, next) {
    try {
        const id = req.body.id
        const user = await User.findById(req.user._id)

        const directsarray = user.directmessages

        if (directsarray.includes(id) == true) {

        } else {
            directsarray.push(id)
            funcs.addtofeed(id, "Someone started a DM with you!", 'javascript:messages("open")', 'Click me to view the messages!')
        }

        const updatedms = await User.findByIdAndUpdate(req.user._id, {
            directmessages: directsarray
        })

        updatedms

        return res.send({
            success: true
        })
    } catch (err) {
        res.json({
            success: false,
            error: err
        })
    }
});

router.post('/api/message/send', async function (req, res, next) {
    try {
        const to = req.body.to
        const message = req.body.message

        const createmessage = new Directs({
            sender: req.user._id,
            res: to,
            message: message
        })

        createmessage.save()

        return res.send({
            success: true
        })
    } catch (err) {
        res.json({
            success: false
        })
    }
});

router.get('/api/version', async function (req, res, next) {
    try {
        res.json({
            version: process.env.VERSION
        })
    } catch (err) {
        res.json({
            version: "BETA"
        })
    }
});

router.get('/api/premium', async function (req, res, next) {
    try {
        if (!req.user) {
            res.json({
                premium: false
            })
        } else if (req.user.premium == true) {
            res.json({
                premium: true
            })
        } else if (req.user.premium == false) {
            res.json({
                premium: false
            })
        }
    } catch (err) {
        res.json({
            premium: false
        })
    }
});

router.get('/api/theme/get', async function (req, res, next) {
    try {
        if (!req.user) {
            res.json({
                theme: 'dark'
            })
        } else {
            res.json({
                theme: req.user.theme
            })
        }
    } catch (err) {
        res.json({
            theme: 'dark'
        })
    }
});

router.get('/api/liked/:postid', async function (req, res, next) {

    try {
        const postobject = await Post.findById(req.params.postid)
        if (postobject.likes.includes(req.user._id) == true) {
            res.json({
                liked: true
            })
        } else {
            res.json({
                liked: false
            })
        }
    } catch (err) {
        res.json({
            liked: false
        })
    }
});

router.get('/getimage/:id', async function (req, res, next) {
    const media = await Media.findOne({
        parentid: req.params.id
    })

    try {
        return res.json({
            success: true,
            img: media.file
        })
    } catch (err) {
        res.json({
            success: false,
            err: err
        })
    }
});

router.get('/api/redis/flush', async function (req, res, next) {

    if (req.user) {
        if (req.user.admin == true) {
            try {
                /*redis.flushdb(function (err, succeeded) {
                    res.send('did the flush succeed: ' + succeeded);
                });*/
                res.json({
                    "success": true
                })
            } catch (err) {
                res.send('their was an error');
            }
        } else {
            res.redirect('/account')
        }
    } else {
        res.redirect('/account')
    }
});

module.exports = router;