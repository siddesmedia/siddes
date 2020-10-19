const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

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

module.exports = {
    loggedin,
    getpostowner,
    addtofeed,
    getfeed,
    getfeedlinks,
    getfeedtype,
    findposts,
    findcomments,
    moderator
}