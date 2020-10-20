const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const Post = require('../models/Post');
const Media = require('../models/Media');
const Comment = require('../models/Comment');
const {
    forwardAuthenticated
} = require('../config/auth');
const User = require('../models/User');
const redis = require('../config/redis')
const JSON5 = require('json5')
const funcs = require('../config/functions');
const multer = require('multer');
const path = require('path');
const uploadimage = multer({
    dest: './usergenerated/images',
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

router.get('/', async function (req, res, next) {
    console.log('/')
    if (!req.user) {
        const getlatestusers = await funcs.getlatestusers()
        const getlatestposts = await funcs.getlatestposts()
        const about = {
            title: 'New User - ' + Name,
            template: 'pages/latest',
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true,
            posts: getlatestposts,
            users: getlatestusers
        };
        return res.render('base', about);
    } else {
        res.redirect('/home')
    }
});

router.get('/home', async function (req, res, next) {
    console.log('/home')
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
    console.log('/home')
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
    console.log('/account/edit')
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
    console.log('/account/developer')
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
    console.log('/account')
    if (!req.user) {
        res.redirect('/login')
    } else {
        res.redirect('/' + req.user.username)
    }
});

router.get('/company/about', function (req, res, next) {
    console.log('/company/about')
    const about = {
        title: 'About - ' + Name,
        template: 'pages/company/about',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/company/releases', function (req, res, next) {
    console.log('/company/releases')
    const about = {
        title: 'Releases - ' + Name,
        template: 'pages/company/releases',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/search', async function (req, res, next) {
    console.log('/search?q=' + req.query.q)

    var posts = await Post.find({
        $text: {
            $search: req.query.q
        }
    })

    const about = {
        title: req.query.q + ' - ' + Name,
        template: 'pages/search',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        posts: posts,
        searchterm: req.query.q
    };
    return res.render('base', about);
});

router.get('/tag/:hashtag', async function (req, res, next) {
    console.log('/tag/' + req.params.hashtag)

    var posts = await Post.find({
        $text: {
            $search: '#' + req.params.hashtag
        }
    })

    const about = {
        title: '#' + req.params.hashtag + ' - ' + Name,
        template: 'pages/hashtag',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        posts: posts,
        hashtag: req.params.hashtag
    };
    return res.render('base', about);
});

router.get('/account/search', async function (req, res, next) {
    console.log('/account/search?q=' + req.query.q)

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
    console.log('/account/new?text=' + req.query.text + '&repost=' + req.query.repost)
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
    console.log('/account/clear')
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
    console.log('/account/clear/confirm')
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
    console.log('/account/' + req.params.id)
    try {
        const username = await User.findOne({
            _id: req.params.id
        })
        res.redirect('/' + username.username)
    } catch (err) {
        res.status(404)
        res.status(404).render('base', {
            title: "404 Not Found" + Name,
            template: "errors/400",
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true
        });
    }
});

router.get('/:username/following', async function (req, res, next) {
    console.log('/' + req.params.username + '/following')
    var userObject = await User.exists({
        username: req.params.username
    })

    if (userObject == false) {
        res.status(404)
        res.status(404).render('base', {
            title: "404 Not Found" + Name,
            template: "errors/400",
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true
        });
    } else {
        var about;
        var username;

        redis.get('user_following_list_' + req.params.username, async (err, value) => {
            if (value) {
                username = req.params.username

                about = {
                    title: username + ' Following - ' + Name,
                    template: 'pages/following',
                    name: Name,
                    loggedin: funcs.loggedin(req.user),
                    moderator: funcs.moderator(req.user),
                    navbar: true,
                    footer: true,

                    // user data being loaded through cache
                    username: username,
                    user: JSON5.parse(value)
                };
                return res.render('base', about);
            } else {
                var user = await User.findOne({
                    username: req.params.username
                })

                redis.set('user_following_list_' + req.params.username, JSON.stringify(user))

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
        })
    }
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
            template: "errors/400",
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true
        });
    } else {
        var followers;

        var user = await User.findOne({
            username: req.params.username
        })

        redis.get('user_follow_count_' + req.params.username, async (err, value) => {
            if (value) {
                followers = value
            } else {
                var followercount = await User.find({
                    following: user._id
                })

                followers = followercount.length.toString()
                redis.set('user_follow_count_' + req.params.username, followers)

            }
        })
        var posts = await Post.find({
            owner: user._id
        })

        var currentUser;
        var followingbool;

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
            navbar: true,
            footer: true,

            // user data being loaded
            user: user,
            posts: posts.reverse(),
            sameuser: currentUser,
            follows: followingbool,
            followers: followers
        };
        return res.render('base', about);
    }
});

router.get('/usergenerated/images/:parentid', async function (req, res, next) {
    console.log(req.originalUrl)
    try {
        const mediaitem = await Media.findOne({
            parentid: req.params.parentid
        })
        res.sendFile(path.join(__dirname, '../', mediaitem.file))
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/usergenerated/user/:parentid', async function (req, res, next) {
    console.log(req.originalUrl)
    try {
        res.sendFile(path.join(__dirname, '../usergenerated/user/', req.params.parentid))
    } catch (err) {
        res.sendFile(path.join(__dirname, '../usergenerated/images/notfound.jpeg'))
    }
})

router.get('/s/:postid', async function (req, res, next) {
    console.log('/s/' + req.params.postid)

    var postObject = await Post.exists({
        _id: req.params.postid
    })

    if (postObject == false) {
        res.status(404)
        res.status(404).render('base', {
            title: "404 Not Found" + Name,
            template: "errors/400",
            name: Name,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: true,
            footer: true
        });
    } else {
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
    }
});

router.post('/post/new', uploadimage.single('image'), async function (req, res, next) {
    console.log('/post/new POST')
    if (!req.user) {
        res.redirect('/login')
    } else {
        var body = req.body.body;
        var owner = req.user._id;
        var media = false;
        var date = Date.now()

        if (req.file) {
            media = true
        }

        var newPost = new Post({
            body: body,
            owner: owner,
            media: media,
            date: date,
            repost: req.body.repost
        })

        newPost
            .save()
            .then(post => {
                res.redirect('/s/' + newPost._id);

                if (media == true) {

                    var newMedia = new Media({
                        owner: req.user._id,
                        parentid: post._id,
                        file: req.file.path
                    })

                    newMedia.save().then(media => {})
                }
            })
    }
})

router.post('/comment/new', async function (req, res, next) {
    console.log('/comment/new POST')
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
    console.log('/account/edit POST')
    if (!req.user) {
        res.redirect('/login')
    } else {
        var username = req.body.username;
        var displayname = req.body.displayname;
        var description = req.body.description;
        var email = req.body.email;

        var update = await User.findOneAndUpdate({
            _id: req.user._id
        }, {
            username: username,
            displayname: displayname,
            description: description,
            email: email
        });

        update

        console.log(req.files)

        try {
            if (req.files) {
                if (req.files.length == 1) {
                    if (req.files[0].fieldname == 'banner') {
                        var updatepfp = await User.findOneAndUpdate({
                            _id: req.user._id
                        }, {
                            banner: req.files[0].path
                        });
                    } else {
                        var updatepfp = await User.findOneAndUpdate({
                            _id: req.user._id
                        }, {
                            pfp: req.files[0].path
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
    console.log('/follow/new POST')
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
    console.log('/follow/remove POST')
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
    console.log('/like/new POST')
    if (!req.user) {
        res.redirect('/login')
    } else {
        var username = req.user._id

        var posttoedit = await Post.findById(req.body.postid.toString())

        var newLikes = posttoedit.likes
        var likeCount = posttoedit.likes.length + 1
        // tenlikes hundredlikes thousandlikes tenthousandlikes hundredthousandlikes millionlikes
        if (likeCount == 10) {
            if (posttoedit.tenlikes == true) {
                var tenlikes;
            } else {
                funcs.addtofeed(posttoedit.owner, "Your post hit 10 likes!", '/s/' + posttoedit._id, posttoedit.body)
                var updatepostlikecountstatus = await Post.findOneAndUpdate({
                    _id: posttoedit._id
                }, {
                    tenlikes: true
                })
                updatepostlikecountstatus
            }
        }
        if (likeCount == 100) {
            if (posttoedit.hundredlikes == true) {
                var hundredlikes;
            } else {
                addtofeed(posttoedit.owner, "Your post hit 100 likes!", '/s/' + posttoedit._id, posttoedit.body)
                var updatepostlikecountstatus = await Post.findOneAndUpdate({
                    _id: posttoedit._id
                }, {
                    hundredlikes: true
                })
                updatepostlikecountstatus
            }
        }
        if (likeCount == 1000) {
            if (posttoedit.thousandlikes == true) {
                var thousandlikes;
            } else {
                addtofeed(posttoedit.owner, "Your post hit 1,000 likes!", '/s/' + posttoedit._id, posttoedit.body)
                var updatepostlikecountstatus = await Post.findOneAndUpdate({
                    _id: posttoedit._id
                }, {
                    thousandlikes: true
                })
                updatepostlikecountstatus
            }
        }
        if (likeCount == 10000) {
            if (posttoedit.tenthousandlikes == true) {
                var tenthousandlikes;
            } else {
                addtofeed(posttoedit.owner, "Your post hit 10,000 likes!", '/s/' + posttoedit._id, posttoedit.body)
                var updatepostlikecountstatus = await Post.findOneAndUpdate({
                    _id: posttoedit._id
                }, {
                    tenthousandlikes: true
                })
                updatepostlikecountstatus
            }
        }
        if (likeCount == 100000) {
            if (posttoedit.hundredthousandlikes == true) {
                var hundredthousandlikes;
            } else {
                addtofeed(posttoedit.owner, "Your post hit 100,000 likes! That's something to celebrate about!", '/s/' + posttoedit._id, posttoedit.body)
                var updatepostlikecountstatus = await Post.findOneAndUpdate({
                    _id: posttoedit._id
                }, {
                    hundredthousandlikes: true
                })
                updatepostlikecountstatus
            }
        }
        if (likeCount == 1000000) {
            if (posttoedit.millionlikes == true) {
                var millionlikes;
            } else {
                addtofeed(posttoedit.owner, "Wow, your post hit 1,000,000 likes. That's insane!", '/s/' + posttoedit._id, posttoedit.body)
                var updatepostlikecountstatus = await Post.findOneAndUpdate({
                    _id: posttoedit._id
                }, {
                    millionlikes: true
                })
                updatepostlikecountstatus
            }
        }
        if (newLikes.includes(username)) {
            return res.redirect('/s/' + req.body.postid);
        } else {
            newLikes.push(username.toString())

            var update = await Post.findOneAndUpdate({
                _id: req.body.postid
            }, {
                likes: newLikes
            });

            update;

            res.redirect('/s/' + req.body.postid)
        }
    }
})

router.post('/like/remove', async function (req, res, next) {
    console.log('/like/remove POST')
    if (!req.user) {
        res.redirect('/login')
    } else {
        var username = req.user._id;

        var posttoedit = await Post.findById(req.body.postid)

        var newLikes = posttoedit.likes

        if (newLikes.includes(username) == false) {
            return res.redirect('/s/' + req.body.postid);
        } else {

            newLikes.splice(newLikes.indexOf(req.user._id), 1)

            var update = await Post.findOneAndUpdate({
                _id: req.body.postid
            }, {
                likes: newLikes
            });

            update;

            res.redirect('/s/' + req.body.postid)
        }
    }
})

module.exports = router;