const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Media = require('../models/Media');
const Comment = require('../models/Comment');
const fs = require('fs')
const sharp = require('sharp')
const User = require('../models/User');
const JSON5 = require('json5')
const funcs = require('../config/functions');
const multer = require('multer');
const path = require('path');
const imgur = require('../config/imgur');
const uploadimage = multer({
    dest: './usergenerated/imageslarge',
    limits: {
        fileSize: 8000000,
        files: 1
    }
});
const uploadpfp = multer({
    dest: './usergenerated/user',
    limits: {
        fileSize: 4000000
    }
});
const analytics = require('../middleware/simple-lytics')
const url = require('url');
const mongoose = require('mongoose');
const {
    v4: uuidv4
} = require('uuid')
const bcrypt = require('bcryptjs');
const {
    body,
    validationResult
} = require('express-validator');

router.get('/', async function (req, res, nect) {
    if (funcs.loggedin(req.user) == true) {
        res.redirect('/home?p=1')
    } else {
        res.redirect('/latest?p=1')
    }
})

router.post('/subscribe', (req, res) => {
    const subscription = JSON.parse(req.body.body);

    res.sendStatus(200);

    funcs.subscribe(subscription, req.user._id);
});

router.get('/analytics/addvisit', async function (req, res, next) {
    await analytics.analytics()

    return res.json({
        success: true
    })
});

router.get('/account/:id/pfp', async function (req, res, next) {
    const pfpid = req.params.id
    const pfpurl = await User.findById(pfpid)

    try {
        res.redirect(pfpurl.pfp)
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/account/pfp', async function (req, res, next) {
    if (!req.user) {
        return res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
    const pfpurl = await User.findById(req.user._id)

    try {
        return res.redirect(pfpurl.pfp)
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/account/:id/banner', async function (req, res, next) {
    const bannerid = req.params.id
    const bannerurl = await User.findById(bannerid)


    try {
        res.redirect(bannerurl.banner)
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})
router.get('/home', async function (req, res, next) {
    if (!req.query.p) {
        return res.redirect(`/home?p=1`)
    }

    if (req.query.p < 1) {
        return res.redirect(`/home?p=1`)
    }

    req.query.p = req.query.p - 1

    if (!req.user) {
        return res.redirect('/latest')
    }

    if (isNaN(req.query.p) == true) {
        next()
    }

    const user = await User.findById(req.user._id)

    var posts;
    if (isNaN(req.query.limit) == false) {
        if (req.query < 40) {
            posts = await Post.find({
                owner: user.following
            }).sort({
                date: -1
            }).skip(req.query.p * eval(req.query.limit)).limit(eval(req.query.limit));
        } else {
            posts = await Post.find({
                owner: user.following
            }).sort({
                date: -1
            }).skip(req.query.p * 20).limit(20);
        }
    } else {
        posts = await Post.find({
            owner: user.following
        }).sort({
            date: -1
        }).skip(req.query.p * 20).limit(20);
    }

    var lastpage = false;

    if (posts.length < 20) {
        lastpage = true
    }

    const about = {
        title: 'Home Feed - ' + Name,
        template: 'pages/home',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        page: req.query.p,
        posts: posts,
        lastpage: lastpage
    };
    return res.render('base', about);
});

router.get('/latest', async function (req, res, next) {
    if (!req.query.p) {
        return res.redirect(`/latest?p=1`)
    }

    if (req.query.p < 1) {
        return res.redirect(`/latest?p=1`)
    }

    req.query.p = req.query.p - 1

    if (isNaN(req.query.p) == true) {
        return next()
    }
    var posts;
    if (isNaN(req.query.limit) == false) {
        if (req.query.limit < 40) {
            posts = await Post.find().sort({
                date: -1
            }).skip(req.query.p * eval(req.query.limit)).limit(eval(req.query.limit));
        } else {
            posts = await Post.find().sort({
                date: -1
            }).skip(req.query.p * 20).limit(20);
        }
    } else {
        posts = await Post.find().sort({
            date: -1
        }).skip(req.query.p * 20).limit(20);
    }

    var lastpage = false;

    if (posts.length < 20) {
        lastpage = true
    }

    const about = {
        title: 'The Latest - ' + Name,
        template: 'pages/latest',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        page: req.query.p,
        posts: posts,
        lastpage: lastpage
    };
    return res.render('base', about);
});

router.get('/:username', async function (req, res, next) {
    if (!req.query.p) {
        return res.redirect(`/${req.params.username}?p=1`)
    }

    if (req.query.p < 1) {
        return res.redirect(`/${req.params.username}?p=1`)
    }

    req.query.p = req.query.p - 1

    var userObject = await User.exists({
        username: req.params.username
    })

    if (userObject == false) {
        next()
    } else {
        var followers;

        var user = await User.findOne({
            username: req.params.username
        })

        var followercount = await User.find({
            following: user._id.toString()
        })

        followers = followercount.length.toString()

        var posts = await Post.find({
            owner: await funcs.getuserid(req.params.username)
        }).sort({
            date: -1
        }).skip(req.query.p * 20).limit(20);

        var currentUser;
        var followingbool;
        var lastpage = false;

        if (posts.length < 20) {
            lastpage = true
        }

        var follows;
        if (!req.user) {
            currentUser = null;
            followingbool = null;
        } else {
            follows = await User.findById(req.user._id)

            followingbool = follows.following.includes(user._id)

            if (req.user.username == user.username) {
                currentUser = true;
            } else {
                currentUser = false;
            }
        }

        const username = req.params.username

        const about = {
            title: username + ' - ' + Name,
            template: 'pages/user',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            admin: funcs.admin(req.user),
            navbar: true,
            footer: true,
            page: req.query.p,
            lastpage: lastpage,

            // user data being loaded
            user: user,
            posts: posts,
            sameuser: currentUser,
            follows: followingbool,
            followers: followers
        };
        return res.render('base', about);
    }
});

router.get('/notifications', async function (req, res, next) {

    if (req.user) {
        const about = {
            title: 'Notifications - ' + Name,
            template: 'pages/notifications',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
            feed: await funcs.getfeed(req.user._id),
            feedlinks: await funcs.getfeedlinks(req.user._id),
            feedtype: await funcs.getfeedtype(req.user._id)
        };
        return res.render('base', about);
    } else {
        res.redirect('/')
    }
});

router.get('/embed/:postid', async function (req, res, next) {

    const embeddedpost = await Post.findById(req.params.postid)
    const about = {
        title: 'Embed - ' + Name,
        template: 'pages/embed',
        name: Name,
        navbar: false,
        footer: false,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        post: embeddedpost
    };
    return res.render('base', about);
});

router.get('/account/edit', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login?next=/account/edit')
    } else {
        const user = await User.findById({
            _id: req.user._id
        })

        const about = {
            title: 'Edit Account - ' + Name,
            template: 'pages/account/edit',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
            user: user
        };
        return res.render('base', about);
    }
});

router.get('/account/developer', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login?next=/account/developer')
    } else {
        var user = await funcs.getuser(req.user._id)
        var apikey = user.apikey_v2;

        const about = {
            title: 'Developer - ' + Name,
            template: 'pages/account/developer',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
            apikey: apikey
        };
        return res.render('base', about);
    }
})

router.post('/account/developer/key/regenerate', async function (req, res, next) {
    var newkey = uuidv4().toString()

    res.json({
        success: true,
        key: newkey
    })

    bcrypt.hash(newkey, 10, async (err, hash) => {
        if (err) throw err;
        const updateuserwithnewkey = await User.findByIdAndUpdate(req.user._id, {
            apikey_v2: hash
        })

        console.log(hash)

        return updateuserwithnewkey
    });

    newkey = 'placeholder so nothing malicious gets the key'
})

router.get('/account', function (req, res, next) {

    if (!req.user) {
        res.redirect('/login?next=/account')
    } else {
        res.redirect('/' + req.user.username)
    }
});

router.get('/search/', async function (req, res, next) {

    res.redirect('/search/0?q=' + req.query.q)
})

router.get('/search/:page', async function (req, res, next) {

    var posts = await Post.find({
        $text: {
            $search: req.query.q
        }
    }).skip(req.params.page * 20).limit(20);

    var lastpage = false;

    if (posts.length < 20) {
        lastpage = true
    }

    const about = {
        title: req.query.q + ' - ' + Name,
        template: 'pages/search',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        posts: posts,
        lastpage: lastpage,
        page: req.params.page,
        searchterm: req.query.q
    };
    return res.render('base', about);
});

router.get('/tag/:hashtag', async function (req, res, next) {

    res.redirect('/tag/0/' + req.params.hashtag)
});

router.get('/tag/:page/:hashtag', async function (req, res, next) {
    var regex = new RegExp(`\B#\w+${req.params.hashtag}`, 'i')
    console.log(regex)

    var posts = await Post.find({
        $text: {
            $search: `"#${req.params.hashtag}"`
        }
    }).skip(req.params.page * 20).limit(20);

    var lastpage = false;

    if (posts.length < 20) {
        lastpage = true
    }

    const about = {
        title: '#' + req.params.hashtag + ' - ' + Name,
        template: 'pages/hashtag',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        lastpage: lastpage,
        posts: posts,
        page: req.params.page,
        hashtag: req.params.hashtag
    };
    return res.render('base', about);
});

router.get('/account/search', async function (req, res, next) {

    var users = await User.find({
        username: req.query.q
    })

    const about = {
        title: req.query.q + ' - ' + Name,
        template: 'pages/account/search',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        users: users,
        searchterm: req.query.q
    };
    return res.render('base', about);
});

router.get('/account/clear', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login?next=/account/clear')
    } else {
        const about = {
            title: 'Clear Account - ' + Name,
            template: 'pages/account/clear',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
        };
        return res.render('base', about);
    }
})

router.get('/account/repost', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login?next=/account/repost')
    } else {
        try {
            var repostid = req.query.postid

            var repostitem = await Post.findById(repostid)

            var newpost = new Post({
                body: repostitem.body,
                owner: req.user._id,
                media: repostitem.media,
                date: Date.now(),
                repost: true,
                boardonly: repostitem.boardonly,
                board: repostitem.board
            })

            if (repostitem.media == true) {
                var repostmedia = await Media.findOne({
                    parentid: repostitem._id
                })

                var newmedia = new Media({
                    owner: repostmedia.owner,
                    parentid: newpost._id,
                    file: repostmedia.file
                })

                newmedia.save()
            }

            newpost.save().then(post => {
                res.redirect('/s/' + newpost._id)
            })
        } catch (err) {
            console.log(err)
            return res.send('Internal Server Error', 500)
        }
    }
})

router.get('/account/messages', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login?next=/account/messages')
    }

    try {
        const user = await User.findById(req.user._id)
        const dm_id_array = user.directmessages
        const dm_username_array = []

        for (i = 0; i < dm_id_array.length; i++) {
            var tempuser = await User.findById(dm_id_array[i])
            dm_username_array.push(tempuser.username)
        }

        about = {
            title: 'Messages - ' + Name,
            template: 'pages/account/messages',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: false,

            // user data being loaded
            success: true,
            ids: dm_id_array,
            id: req.user._id,
            usernames: dm_username_array
        };
        return res.render('base', about);
    } catch (err) {

    }
})

router.get('/account/messages/:id', async function (req, res, next) {
    if (!req.user) {
        return res.redirect('/login?next=/account/messages/' + req.params.id)
    }

    try {
        about = {
            title: 'Messages - ' + Name,
            template: 'pages/account/messageview',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: false,
            footer: false,
            id: req.params.id,
            myid: req.user._id
        };
        return res.render('base', about);
    } catch (err) {

    }
})

router.get('/account/clear/confirm', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login?next=/account/clear/confirm')
    } else {
        const userid = req.user._id;
        const clearuser = await User.findOneAndUpdate({
            _id: req.user._id
        }, {
            following: ["orbit"],
            displayname: "",
            description: "This is a description.",
            moderator: false,
            admin: false,
            premium: false,
            theme: 'retro'
        })
        const deletecomments = await funcs.findcomments(userid)
        const deleteposts = await funcs.findposts(userid)
        var i;
        for (i = 0; i < deletecomments.length; i++) {
            const deletecomment = await Comment.findByIdAndDelete(deletecomments[i]._id)
            deletecomment;
        }
        for (i = 0; i < deleteposts.length; i++) {
            const deletepost = await Post.findByIdAndDelete(deleteposts[i]._id)
            deletepost;
        }
        clearuser;
        res.redirect('/account')
    }
})

router.get('/account/:id', async function (req, res, next) {

    try {
        const username = await User.findOne({
            _id: req.params.id
        })
        res.redirect('/' + username.username)
    } catch (err) {
        next()
    }
});

router.get('/:username/following', async function (req, res, next) {

    var userObject = await User.exists({
        username: req.params.username
    })

    if (userObject == false) {
        next()
    } else {
        var about;
        var username;
        var user = await User.findOne({
            username: req.params.username
        })

        username = req.params.username

        about = {
            title: username + ' Following - ' + Name,
            template: 'pages/following',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,

            // user data being loaded
            username: username,
            user: user
        };
        return res.render('base', about);
    }
});

router.get('/:username/followers', async function (req, res, next) {

    var userObject = await User.exists({
        username: req.params.username
    })

    if (userObject == false) {
        next()
    } else {
        var about;
        var username;
        var user = await User.findOne({
            username: req.params.username
        })

        username = req.params.username

        var followers = await User.find({
            following: user._id.toString()
        })

        about = {
            title: username + ' Followers - ' + Name,
            template: 'pages/account/followers',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,

            // user data being loaded
            username: username,
            followers: followers
        };
        return res.render('base', about);
    }
});

router.get('/s/:postid', async function (req, res, next) {

    try {
        var media = false;
        var post = await Post.findOne({
            _id: req.params.postid
        })
        var comments = await Comment.find({
            parentid: req.params.postid
        })
        var owner = await User.findOne({
            _id: post.owner
        })

        var liked;

        if (funcs.loggedin(req.user) == true) {
            var post = await Post.findById(req.params.postid)
            if (post.likes.includes(req.user._id) == true) {
                liked = true
            } else {
                liked = false
            }
        } else {
            liked = false
        }

        if (post.media == true) {
            media = true
        }

        const about = {
            title: 'Post - ' + Name,
            template: 'pages/post',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,

            // post data being loaded
            post: post,
            owner: owner,
            liked: liked,
            comments: comments.reverse(),
            media: media
        };
        return res.render('base', about);
    } catch (err) {
        next()
    }
});

router.get('/usergenerated/images/:parentid', async function (req, res, next) {

    try {
        const mediaitem = await Media.findOne({
            parentid: req.params.parentid
        })
        res.redirect(mediaitem.file)
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/usergenerated/user/:parentid', async function (req, res, next) {

    try {
        if (fs.existsSync(path.join(__dirname, '../usergenerated/user/', req.params.parentid)) == false || !req.params.parentid || req.params.parentid == '') {
            return res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
        } else {
            res.sendFile(path.join(__dirname, '../usergenerated/user/', req.params.parentid))
        }
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.post('/post/new',
    body('body').escape(),
    body('owner').escape(),
    uploadimage.single('image'), async function (req, res, next) {
        if (!req.user) {
            res.redirect('/login')
        } else {
            var body = req.body.body;
            var owner = req.user._id;
            var media = false;
            var date = Date.now()
            var mediaid;

            // posts can have images
            // but its not required
            // so if they selected an image,
            // set media to true and upload the img
            if (req.file) {
                media = true
            }

            // only images are allowed
            // so if the mime type does not begin with 'i' (image)
            // dont allow the upload and return a server error
            if (media == true && req.file.mimetype[0] != 'i') {
                media = false
                return res.send('Only Images are Allowed', 501)
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
                repost: req.body.repost,
                boardonly: false
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
    }
);

router.post('/comment/new',
    body('body').escape(),
    body('parentid').escape(),
    async function (req, res, next) {

        if (!req.user) {
            res.redirect('/login')
        } else {
            var postowner;
            var updateownersfeed;
            var body = req.body.body;
            var parentid = req.body.parentid;
            var owner = req.user._id;
            var date = Date.now()
            postowner = await funcs.getpostowner(parentid)

            if (body.length == 0) {
                var car;
            } else {
                funcs.addtofeed(postowner, "Someone commented on your post!", '/s/' + req.body.parentid, body)
            }


            updateownersfeed;

            const newComment = new Comment({
                reply: false,
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

router.post('/comment/reply',
    body('body').escape(),
    body('parentid').escape(),
    async function (req, res, next) {

        if (!req.user) {
            res.redirect('/login')
        } else {
            var postowner;
            var updateownersfeed;
            var body = req.body.body;
            var parentid = req.body.parentid;
            var owner = req.user._id;
            var date = Date.now()
            postowner = await funcs.getpostowner(parentid)

            if (body.length == 0) {
                var car;
            } else {
                funcs.addtofeed(postowner, "Someone commented on your post!", '/s/' + req.body.parentid, body)
            }


            updateownersfeed;

            const newComment = new Comment({
                reply: true,
                parentcomment: req.body.parent,
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
    }
)

router.post('/account/edit',
    body('username').isLength({
        max: 15
    }).escape(),
    body('displayname').isLength({
        max: 15
    }).escape(),
    body('theme').isLength({
        max: 20
    }).escape(),
    body('description').isLength({
        max: 300
    }).escape(),
    uploadpfp.any(), async function (req, res, next) {

        if (!req.user) {
            res.redirect('/login')
        } else {
            var username = req.body.username;
            var displayname = req.body.displayname;
            var description = req.body.description;
            var theme = req.body.theme;
            var notificationson = req.body.notifications;

            const prohibitedincludes = ["@", "/", "!", "#", "$", "%", "^", "&", "*", "(", ")", "-", "=", "+", "[", "]", "{", "}", "|", "\\", "`", "\"", "~", "'", ":", ";", ",", "<", ">", ",", "."]
            const prohibitedusername = ["login", "signup", "latest", "company"];

            for (i = 0; i < prohibitedincludes.length; i++) {
                if (username.includes(prohibitedincludes[i]) == true) {
                    return res.redirect(url.format({
                        pathname: "/account/edit",
                        query: {
                            "error": "That username is not allowed"
                        }
                    }))
                } else {}
            }

            if (prohibitedusername.includes(username) == true) {
                return res.redirect(url.format({
                    pathname: "/account/edit",
                    query: {
                        "error": "That username is not allowed"
                    }
                }))
            }

            var usernameexists = await User.exists({
                username: {
                    '$regex': new RegExp(username, 'i')
                }
            })

            if (usernameexists == true) {
                username = req.user.username
            }

            console.log(notificationson)

            var update = await User.findOneAndUpdate({
                _id: req.user._id
            }, {
                username: username,
                displayname: displayname,
                description: description,
                theme: theme,
                notificationson: notificationson
            });

            update

            try {
                if (req.files) {
                    if (req.files.length == 1) {
                        if (req.files[0].fieldname == 'banner') {
                            imgur.uploadImageFile({
                                image: fs.readFileSync(req.files[0].path),
                                title: 'an image uploaded to siddes.com',
                                description: 'an image uploaded to siddes.com'
                            }, async function (err, res) {
                                if (res.status == 200) {
                                    var updatepfp = await User.findOneAndUpdate({
                                        _id: req.user._id
                                    }, {
                                        banner: res.data.link
                                    });

                                    updatepfp
                                }
                            });
                        } else {
                            imgur.uploadImageFile({
                                image: fs.readFileSync(req.files[0].path),
                                title: 'an image uploaded to siddes.com',
                                description: 'an image uploaded to siddes.com'
                            }, async function (err, res) {
                                if (res.status == 200) {
                                    var updatepfp = await User.findOneAndUpdate({
                                        _id: req.user._id
                                    }, {
                                        pfp: res.data.link
                                    });

                                    updatepfp
                                }
                            });
                        }
                    } else if (req.files.length == 2) {
                        imgur.uploadImageFile({
                            image: fs.readFileSync(req.files[1].path),
                            title: 'an image uploaded to siddes.com',
                            description: 'an image uploaded to siddes.com'
                        }, async function (err, res) {
                            if (res.status == 200) {
                                var updatepfp = await User.findOneAndUpdate({
                                    _id: req.user._id
                                }, {
                                    banner: res.data.link
                                });

                                updatepfp
                            }
                        });

                        imgur.uploadImageFile({
                            image: fs.readFileSync(req.files[0].path),
                            title: 'an image uploaded to siddes.com',
                            description: 'an image uploaded to siddes.com'
                        }, async function (err, res) {
                            if (res.status == 200) {
                                var updatepfp = await User.findOneAndUpdate({
                                    _id: req.user._id
                                }, {
                                    pfp: res.data.link
                                });

                                updatepfp
                            }
                        });
                    }
                }
                updatepfp
            } catch (err) {
                var dog
            }
            res.redirect('/account/edit')
        }
    }
)

router.post('/account/edit/connections',
    body('github').isLength({
        max: 30
    }).escape(),
    body('twitter').isLength({
        max: 15
    }).escape(),
    body('facebook').isLength({
        max: 50
    }).escape(),
    body('discord').isLength({
        max: 10
    }).escape(),
    body('instagram').isLength({
        max: 30
    }).escape(),
    body('youtube').isLength({
        max: 50
    }).escape(),
    body('steam').isLength({
        max: 50
    }).escape(),
    body('website').escape(),
    async function (req, res, next) {
        if (!req.user) {
            res.redirect('/login')
        } else {
            var githublink = req.body.github
            var twitterlink = req.body.twitter
            var facebooklink = req.body.facebook
            var discordlink = req.body.discord
            var instagramlink = req.body.instagram
            var youtubelink = req.body.youtube
            var steamlink = req.body.steam
            var websitelink = req.body.website

            const updateuserwithconnections = await User.findByIdAndUpdate(req.user._id, {
                githublink,
                twitterlink,
                facebooklink,
                discordlink,
                instagramlink,
                youtubelink,
                steamlink,
                websitelink
            })

            updateuserwithconnections

            return res.redirect('/account')
        }
    })

router.post('/follow/new', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
    } else {
        var username = req.body.username;

        var usertoedit = await User.findOne(req.user._id)

        var newFollowing = usertoedit.following

        if (newFollowing.includes(username)) {
            return res.redirect('/account/' + username);
        } else {
            newFollowing.push(username.toString())

            var update = await User.findOneAndUpdate({
                _id: req.user._id
            }, {
                following: newFollowing
            });

            update;

            res.redirect('/account/' + username)
        }
    }
})

router.post('/follow/remove', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
    } else {
        var username = req.body.username;

        var usertoedit = await User.findOne(req.user._id)

        var newFollowing = usertoedit.following

        if (!newFollowing.includes(username)) {
            return res.redirect('/account/' + username);
        } else {
            newFollowing.splice(newFollowing.indexOf(req.body.username), 1)

            var update = await User.findOneAndUpdate({
                _id: req.user._id
            }, {
                following: newFollowing
            });

            update;

            res.redirect('/account/' + username)
        }
    }
})

router.post('/like/new', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
    } else {
        funcs.like(req.user._id, req.body.postid)
    }
    res.json({
        success: true
    })
})

router.post('/like/remove', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
    } else {
        funcs.removelike(req.user._id, req.body.postid)
    }
    res.json({
        success: true
    })
})

module.exports = router;