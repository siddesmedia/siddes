const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const {
    findOne
} = require('../models/Post');
const {
    use
} = require('passport');

function loggedin(user) {
    if (user) {
        return true;
    } else {
        return false;
    }
}

async function getpostowner(postid) {
    const postowner = await Post.findById(postid)
    return postowner.owner.toString()
}

async function getuserid(username) {
    const userid = await User.findOne({
        username: username
    })
    return userid._id
}

async function getuser(userid) {
    const user = await User.findById(userid)
    return user
}

async function getlatestusers() {
    const latestusers = await User.find().sort({
        _id: -1
    }).limit(10)

    return latestusers
}

async function getlatestposts() {
    const latestposts = await Post.find().sort({
        _id: -1
    }).limit(40)

    return latestposts
}

async function addtofeed(feedowner, type, link, feed) {
    var oldfeed = await getfeed(feedowner)
    var oldfeedlinks = await getfeedlinks(feedowner)
    var oldfeedtype = await getfeedtype(feedowner)

    if (oldfeed.length < 40) {
        oldfeed.unshift(feed)
        oldfeedlinks.unshift(link)
        oldfeedtype.unshift(type)

        updateownersfeed = await User.findByIdAndUpdate({
            _id: feedowner
        }, {
            feed: oldfeed,
            feedlinks: oldfeedlinks,
            feedtype: oldfeedtype
        })
    } else {
        oldfeed.unshift(feed)
        oldfeedlinks.unshift(link)
        oldfeedtype.unshift(type)
        oldfeed.pop()
        oldfeedlinks.pop()
        oldfeedtype.pop()

        updateownersfeed = await User.findOneAndUpdate({
            _id: feedowner
        }, {
            feed: oldfeed,
            feedlinks: oldfeedlinks,
            feedtype: oldfeedtype
        })
    }

    updateownersfeed;
}

async function getfeed(ownerid) {
    const userfeed = await User.findById(ownerid);
    return userfeed.feed
}

async function getfeedlinks(ownerid) {
    const userfeed = await User.findById(ownerid);
    return userfeed.feedlinks
}

async function getfeedtype(ownerid) {
    const userfeed = await User.findById(ownerid);
    return userfeed.feedtype
}

async function findposts(ownerid) {
    const postobjects = await Post.find({
        owner: ownerid
    });
    return postobjects
}

async function findcomments(ownerid) {
    const commentobjects = await Comment.find({
        owner: ownerid
    });
    return commentobjects
}

function moderator(user) {
    if (user) {
        if (user.moderator == false) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

function admin(user) {
    if (user) {
        if (user.admin == false) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

async function getuserbyapikey(apikey) {
    var userid = await User.find({
        apikey: apikey
    })
    if (userid.length == 0) {
        userid = false
    } else {
        userid = await User.findOne({
            apikey: apikey
        })
    }

    return userid
}

async function like(id, postid) {
    var username = id

    var posttoedit = await Post.findById(postid.toString())

    var newLikes = posttoedit.likes
    var likeCount = posttoedit.likes.length + 1
    // tenlikes hundredlikes thousandlikes tenthousandlikes hundredthousandlikes millionlikes
    if (likeCount == 10) {
        if (posttoedit.tenlikes == true) {
            var tenlikes;
        } else {
            addtofeed(posttoedit.owner, "Your post hit 10 likes!", '/s/' + posttoedit._id, posttoedit.body)
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
        return;
    } else {
        newLikes.push(username.toString())

        var update = await Post.findOneAndUpdate({
            _id: postid
        }, {
            likes: newLikes
        });

        update;
    }
}

async function removelike(userid, postid) {
    var username = userid;

    var posttoedit = await Post.findById(postid)

    var newLikes = posttoedit.likes

    if (newLikes.includes(username) == false) {
        return;
    } else {

        newLikes.splice(newLikes.indexOf(userid), 1)

        var update = await Post.findOneAndUpdate({
            _id: postid
        }, {
            likes: newLikes
        });

        update;

        return;
    }
}

module.exports = {
    loggedin,
    getpostowner,
    addtofeed,
    getfeed,
    getfeedlinks,
    getfeedtype,
    findposts,
    findcomments,
    getuser,
    getlatestusers,
    getlatestposts,
    moderator,
    admin,
    getuserid,
    getuserbyapikey,
    like,
    removelike
}