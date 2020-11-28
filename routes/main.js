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
const {
    forwardAuthenticated
} = require('../config/auth');
const {
    functions,
    reject
} = require('lodash');
const uploadimage = multer({
    dest: './usergenerated/imageslarge',
    limits: {
        fileSize: 4000000
    }
});
const uploadpfp = multer({
    dest: './usergenerated/user',
    limits: {
        fileSize: 4000000
    }
});
const analytics = require('../middleware/simple-lytics')

router.get('/', async function (req, res, nect) {
    if (funcs.loggedin(req.user) == true) {
        res.redirect('/home')
    } else {
        res.redirect('/latest/0/')
    }
})

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
        if (fs.existsSync(path.join(__dirname, '../', pfpurl.pfp)) == false || !pfpurl.pfp || pfpurl.pfp == '') {
            return res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
        } else {
            res.sendFile(path.join(__dirname, '../', pfpurl.pfp))
        }
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
        if (fs.existsSync(path.join(__dirname, '../', pfpurl.pfp)) == false || !pfpurl.pfp || pfpurl.pfp == '') {
            return res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
        } else {
            res.sendFile(path.join(__dirname, '../', pfpurl.pfp))
        }
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/account/:id/banner', async function (req, res, next) {
    const bannerid = req.params.id
    const bannerurl = await User.findById(bannerid)


    try {
        if (fs.existsSync(path.join(__dirname, '../', bannerurl.banner)) == false || !bannerurl.banner || bannerurl.banner == '') {
            return res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
        } else {
            res.sendFile(path.join(__dirname, '../', bannerurl.banner))
        }
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/latest/:page', async function (req, res, next) {

    if (isNaN(req.params.page) == true) {
        next()
    }
    var posts;
    if (isNaN(req.query.limit) == false) {
        if (req.query < 40) {
            posts = await Post.find().sort({
                date: -1
            }).skip(req.params.page * eval(req.query.limit)).limit(eval(req.query.limit));
        } else {
            posts = await Post.find().sort({
                date: -1
            }).skip(req.params.page * 20).limit(20);
        }
    } else {
        posts = await Post.find().sort({
            date: -1
        }).skip(req.params.page * 20).limit(20);
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
        page: req.params.page,
        posts: posts,
        lastpage: lastpage
    };
    return res.render('base', about);
});

router.get('/home', async function (req, res, next) {

    if (req.user) {
        const about = {
            title: 'Home - ' + Name,
            template: 'pages/home',
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
        res.redirect('/login')
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
        res.redirect('/login')
    } else {
        var user = await funcs.getuser(req.user._id)
        var apikey = user.apikey;

        const about = {
            title: 'New User - ' + Name,
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

router.get('/account', function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
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

    var posts = await Post.find({
        $text: {
            $search: '#' + req.params.hashtag
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

router.get('/account/new', async function (req, res, next) {

    if (!req.user) {
        return res.redirect('/login')
    }

    const about = {
        title: 'New Post ' + ' - ' + Name,
        template: 'pages/account/new',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        repost: req.query.repost,
        text: req.query.text
    };
    return res.render('base', about);
});

router.get('/account/clear', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
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

router.get('/account/clear/confirm', async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
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

router.get('/:username/:page', async function (req, res, next) {

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
            following: user._id
        })

        followers = followercount.length.toString()

        var posts = await Post.find({
            owner: await funcs.getuserid(req.params.username)
        }).sort({
            date: -1
        }).skip(req.params.page * 20).limit(20);

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
            page: req.params.page,
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

router.get('/:username', async function (req, res, next) {

    res.redirect('/' + req.params.username + '/0')
});

router.get('/usergenerated/images/:parentid', async function (req, res, next) {

    try {
        const mediaitem = await Media.findOne({
            parentid: req.params.parentid
        })
        if (fs.existsSync(path.join(__dirname, '..', mediaitem.file)) == false) {
            return res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
        } else {
            res.sendFile(path.join(__dirname, '..', mediaitem.file))
        }
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

router.post('/post/new', uploadimage.single('image'), async function (req, res, next) {
    if (!req.user) {
        res.redirect('/login')
    } else {
        var body = req.body.body;
        var owner = req.user._id;
        var media = false;
        var date = Date.now()
        var mediaid;

        if (req.file) {
            media = true
        }

        if (body.length > 265) {
            return res.json({
                error: 'body too long'
            })
        }

        var newPost = new Post({
            body: body,
            owner: owner,
            media: media,
            date: date,
            repost: req.body.repost
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
                await sharp(path.join(__dirname, '../', req.file.path))
                    .resize(400)
                    .toFile(path.join(__dirname, '../', 'usergenerated/images/' + req.file.filename))
                fs.unlinkSync(path.join(__dirname, '../', 'usergenerated/imageslarge/' + req.file.filename))
                imgur.uploadImageFile({
                    image: fs.readFileSync(path.join(__dirname, '../', 'usergenerated/images/' + req.file.filename)),
                    title: 'an image uploaded to siddes.com',
                    description: 'an image uploaded to siddes.com'
                }, async function (err, res) {
                    if (res.status == 200) {
                        await Media.findByIdAndUpdate(mediaid, {
                            file: res.data.link
                        })
                    }
                });
                fs.unlinkSync(path.join(__dirname, '../', 'usergenerated/images/' + req.file.filename))
            }
        }
    }
})

router.post('/comment/new', async function (req, res, next) {

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

router.post('/account/edit', uploadpfp.any(), async function (req, res, next) {

    if (!req.user) {
        res.redirect('/login')
    } else {
        var username = req.body.username;
        var displayname = req.body.displayname;
        var description = req.body.description;
        var theme = req.body.theme;

        var update = await User.findOneAndUpdate({
            _id: req.user._id
        }, {
            username: username,
            displayname: displayname,
            description: description,
            theme: theme
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
                    var updatepfp = await User.findOneAndUpdate({
                        _id: req.user._id
                    }, {
                        pfp: req.files[0].path,
                        banner: req.files[1].path
                    });
                }
            }
            updatepfp
        } catch (err) {
            var dog
        }

        res.redirect('/account/' + req.user._id)
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