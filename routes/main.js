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
    if (!req.user) {
        console.log('/')
        const about = {
            title: 'New User - ' + Name,
            template: 'pages/newuser',
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true
        };
        return res.render('base', about);
    } else {
        res.redirect('/home')
    }
});

router.get('/home', function (req, res, next) {
    console.log('/home')
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
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true,
            user: user
        };
        return res.render('base', about);
    }
});

router.get('/account', function (req, res, next) {
    console.log('/account')
    if (!req.user) {
        res.redirect('/login')
    } else {
        res.redirect('/' + req.user.username)
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
        loggedin: loggedin(req.user),
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
        loggedin: loggedin(req.user),
        navbar: true,
        footer: true,
        posts: posts,
        hashtag: req.params.hashtag
    };
    return res.render('base', about);
});

router.get('/account/search', async function (req, res, next) {
    console.log('/account/search?q=' + req.query.q)

    var usersthatwerefound = await User.find({
        $text: {
            $search: req.query.q
        }
    })

    console.log(req.query.q)

    console.log(usersthatwerefound)

    const about = {
        title: req.query.q + ' - ' + Name,
        template: 'pages/account/search',
        name: Name,
        loggedin: loggedin(req.user),
        navbar: true,
        footer: true,
        users: usersthatwerefound,
        searchterm: req.query.q
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
            loggedin: loggedin(req.user),
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
        const deletecomments = await Comment.find({
            owner: userid
        })
        const deleteposts = await Post.find({
            owner: userid
        })
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
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true
        });
    } else {

        var user = await User.findOne({
            username: req.params.username
        })

        const username = req.params.username

        const about = {
            title: username + ' Following - ' + Name,
            template: 'pages/following',
            name: Name,
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true,

            // user data being loaded
            username: username,
            user: user
        };
        return res.render('base', about);
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

        var currentUser;
        var followingbool;
        var followercount = await User.find({
            following: user._id.toString()
        })

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
            loggedin: loggedin(req.user),
            navbar: true,
            footer: true,

            // user data being loaded
            user: user,
            posts: posts.reverse(),
            sameuser: currentUser,
            follows: followingbool,
            followers: followercount.length.toString()
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
            template: "errors/400",
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

router.post('/account/edit', async function (req, res, next) {
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

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;