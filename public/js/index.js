/*
    Copyright (c) 2020 - Present Jude Wilson on Behalf of Social Media

    All other use is prohibited without permission.
*/

var loggedinbool;
var uploadsbanned = undefined;
var myid = ''
var openeddm
var storage = window.localStorage

changetheme()

analytics()

setup()

function setup() {
    if (window.location.toString().includes('herokuapp') == true) {
        window.location = "https://siddes.com"
    }
}

function updates() {
    if (storage.getItem('1.0.7-notes-dismissed') == 'yes') {
        return
    }
    customalert(`
<h3 class="header nobottompadmar">Update V1.0.7</h3>

Client Side
* added robotstxt for seo and crawler permissions
* added sitemap for seo and crawlers
* added meta information in the base ejs template for better seo
* on big screens, the search bar is now on the right sidebar
* on small screens, the search bar is on the top of the screen as a nav
* all the rarely used buttons are in a hover state on your profile icon in the bottom left
* fixed posts not formatting correctly (eg: line breaks)
* your home feed is now posts and stuff made by users you follow
* dms now sort and look correct
* there is a list of the latest three boards on the right
* admins can create new boards
* you can find boards at /b/:boardname

Server Side
* created the boards url definition (/b/:boardname or /board/:boardid (redirects to /b/:boardname))
* posts can now be 1000 characters long (used to be 265)
* fixed routes for notifications
* /home is now posts by users you follow
* dms now update live every one second
* admins can create new boards
* boards routing done

Notes
* from now on, if you are worried about legal issues, check for a warant canary in the source code of the site
        
* please experiment and use the new dms
* boards can onnly be created by admins, this is to prevent thousands of useless boards being made. we don't want to be a reddit clone.
    `)
}

function leftmenu() {
    var classlist = document.getElementById('leftmenusection').className.split(/\s+/)
    if (classlist.includes('hidden')) {
        return document.getElementById('leftmenusection').classList.remove('hidden')
    } else {
        return document.getElementById('leftmenusection').classList.add('hidden')
    }
}

function closealert() {
    document.getElementById('alertbox').classList.add('hidden')
    storage.setItem('1.0.7-notes-dismissed', 'yes');
}

function customalert(text) {
    document.getElementById('alertbox').classList.remove('hidden')
    document.getElementById('alerttext').innerHTML = "<pre>" + text + "</pre>"
}

function replacepostlinks(id) {
    return (document.getElementById(id).innerHTML = document.getElementById(id).innerHTML.replace(/#(\S*)/g, "<a href='/tag/$1' class='hashtag'>#$1</a>").replace(/@(\S*)/g, "<a href='/$1' class='mention'>@$1</a>").replace(/http:\/\/(\S*)/g, "<a href='http://$1' rel='noopener noreferrer' target='_blank' class='link'>http://$1</a>").replace(/https:\/\/(\S*)/g, "<a href='https://$1' rel='noopener noreferrer' target='_blank' class='link'>https://$1</a>"));
}

function analytics() {
    $.getJSON("/analytics/addvisit", function (json) {})
}

function share(id) {
    document.getElementById('share_reddit_link').setAttribute('href', "https://www.reddit.com/submit?title=Check out this post on Siddes!&text=Here it is: https://www.siddes.com/s/" + id);
    document.getElementById('share_twitter_link').setAttribute('href', "https://www.twitter.com/share?title=Check out this post on Siddes!&text=Here it is: https://www.siddes.com/s/" + id);
    document.getElementById('share_facebook_link').setAttribute('href', "https://www.facebook.com/sharer/sharer.php?u=https://www.siddes.com/s/" + id);
    document.getElementById('share_email_link').setAttribute('href', "mailto:email@example.com?subject=You won't believe what I found on Siddes!&body=Here it is: https://www.siddes.com/s/" + id);
    document.getElementById('share_link').setAttribute('value', "https://siddes.com/s/" + id);
    return document.getElementById('sharemodal').classList.remove('hidden')
}

function getmedia(elem, id) {
    $.getJSON("/getimage/" + id, function (json) {
        document.getElementById(elem).setAttribute("src", json.img)
    })
}

function adddirect(id) {
    $.post('/api/dms/create', {
        id: id
    }, function (data) {

    })
}

function messages(toggle) {
    if (toggle == 'open') {
        var html = ''
        $.post('/api/get/dms', function (data) {
            if (data.success == true) {
                myid = data.id
                var ids = data.ids
                var usernames = data.usernames

                for (i = 0; i < ids.length; i++) {
                    html = html + `<button class="chat" onclick="openmessage('${ids[i]}'); changechatname('${ids[i]}')">@${usernames[i]}</button>`
                }
            } else {
                html = `<p class='section'>Nothing here...</p>`
            }

            document.getElementById('listofchats').innerHTML = html
        })

        document.getElementById('messagesbox').classList.remove('hidden')
    } else if (toggle == 'close') {
        document.getElementById('messagesbox').classList.add('hidden')
    }
}

function changechatname(id) {
    $.getJSON('/api/get/username/' + id, function (data) {
        document.getElementById('chattitle').innerText = '@' + data.username
    })
}

function openmessage(id) {
    openeddm = id
    $.post('/api/fetch/dms', {
        id: id
    }, function (data) {
        var html = ''
        if (data.success == true) {
            for (i = 0; i < data.dms.length; i++) {
                if (data.dms[i].sender == myid) {
                    var float = "right"
                } else {
                    var float = "left"
                }
                html = html + `<div class="messagediv"><li class="message ${float} message${float}">${data.dms[i].message}</li></div><br><br>`
            }

            document.getElementById('sendmessage').setAttribute('onclick', `sendmessage('${id}')`)
            document.getElementById('messagescontainer').innerHTML = html
            document.getElementById('messagescontainer').scrollIntoView();
            setTimeout('reopendms()', 1000);
        } else {

        }
    })
}

function reopendms() {
    openmessage(openeddm)
}

var encodeHtmlEntity = function (str) {
    var buf = [];
    for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return buf.join('');
};

function sendmessage(id) {
    var message = document.getElementById('sendmessageinput').value
    $.post('/api/message/send', {
        to: id,
        message: encodeHtmlEntity(message)
    }, function (data) {
        return document.getElementById('messagescontainer').innerHTML = document.getElementById('messagescontainer').innerHTML + `<div class="messagediv"><li class="message right messageright">${encodeHtmlEntity(message)}</li></div><br><br>`
    })
    document.getElementById('sendmessageinput').value = ""
}

function changetheme() {
    var themediv = document.getElementById('themelink')
    var themes = ['retro', 'flat', 'dark', 'light']

    $.getJSON("/api/theme/get", function (json) {
        if (themes.includes(json.theme) == true) {
            themediv.setAttribute('href', `/css/themes/${json.theme}.css`);
        } else {
            themediv.setAttribute('href', `/css/themes/dark.css`);
        }
    })

}

function shareclose() {
    var sharebox = document.getElementById('sharemodal')
    sharebox.classList.add('hidden')
}

function themename() {
    var themediv = document.getElementById('themename')

    $.getJSON("/api/theme/get", function (json) {
        themediv.innerHTML = json.theme
    })

}

function newPost(toggle) {
    if (uploadsbanned == undefined) {
        $.getJSON("/api/uploadsbanned", function (json) {
            if (json.banned == true) {
                uploadsbanned = true
                document.getElementById('newpostform').innerHTML = '<h3 class="header">Banned</h3><br><p class="section">Sorry, but you have been post banned, if you think this was a mistake, please contact us here: <a href="/admin/appeals">ban appeals</a>.</p>'
            } else {
                uploadsbanned = false
            }
        })
    }
    if (toggle == "show") {
        document.getElementById("postModal").classList.remove("hidden");

        if (uploadsbanned == true) {
            document.getElementById('newpostform').innerHTML = '<h3 class="header">Banned</h3><br><p class="section">Sorry, but you have been post banned, if you think this was a mistake, please contact us here: <a href="/admin/banappeals">ban appeals</a>.</p>'
        }
    } else if (toggle == "hide") {
        document.getElementById("postModal").classList.add("hidden");
    }
}

function uploadban(id) {
    var reason = prompt('Why?')
    $.getJSON("/mod/uploadban/" + id + '/' + encodeURIComponent(reason), function (json) {
        if (json.banned == true) {
            alert('success')
            window.location = window.location
        } else {
            alert('error')
        }
    })
}

function removeuploadban(id) {
    $.getJSON("/mod/removeuploadban/" + id, function (json) {
        if (json.banned == false) {
            alert('success')
            window.location = window.location
        } else {
            alert('error')
        }
    })
}

function suspend(id) {
    var reason = prompt('Why?')
    $.getJSON("/admin/suspend/" + id + '/' + encodeURIComponent(reason), function (json) {
        if (json.suspended == true) {
            alert('success')
            window.location = window.location
        } else {
            alert('error')
        }
    })
}

function unsuspend(id) {
    $.getJSON("/admin/unsuspend/" + id, function (json) {
        if (json.suspended == false) {
            alert('success')
            window.location = window.location
        } else {
            alert('error')
        }
    })
}

function verify(id) {
    $.getJSON("/admin/verify/" + id, function (json) {
        if (json.success == true) {
            alert('success')
            window.location = window.location
        } else {
            alert('error')
        }
    })
}

function unverify(id) {
    $.getJSON("/admin/unverify/" + id, function (json) {
        if (json.success == false) {
            alert('success')
            window.location = window.location
        } else {
            alert('error')
        }
    })
}

async function getusername(id, userid) {
    $.getJSON("/api/get/username/" + userid, function (json) {
        if (json.username == "[banned]") {
            document.getElementById(id).innerHTML = "@" + json.username;
            $("#" + id).replaceTag("span");
        } else {
            return (document.getElementById(id).innerHTML = "@" + json.username);
        }
    });
}

async function version(id) {
    return document.getElementById(id).innerHTML = window.localStorage['version'] || $.getJSON("/api/version", function (json) {
        window.localStorage['version'] = json.version;
        return (document.getElementById(id).innerHTML = json.version);
    });
}

async function haveiliked(elemid, likecount, postid, loggedin) {
    loggedinbool = loggedin;
    $.getJSON("/api/liked/" + postid, function (json) {
        if (json.liked == true) {
            return (document.getElementById(elemid).innerHTML = "<button onclick='unlike(\"" + postid + '", "' + elemid + '", "' + eval(likecount) + '")\' "type="button" class="postlike red button" id="i_' + elemid + '">Unlike - ' + eval(likecount) + "</button>");
        } else {
            return (document.getElementById(elemid).innerHTML = "<button onclick='like(\"" + postid + '", "' + elemid + '", "' + eval(likecount) + '")\' "type="button" class="postlike button" id="i_' + elemid + '">Like - ' + eval(likecount) + "</button>");
        }
    });
}

function url(path) {
    window.location = path
}

function showreplies(elem, id) {
    $.post('/comments/reply/get/' + id, function (data) {
        document.getElementById(elem).classList.remove('hidden')
        var html = `<br><button onclick="replycommenthide('${elem}')" class="button">Hide Replies</button><br><br>`
        if (data.success == true) {
            var comments = data.posts
            for (i = 0; i < data.posts.length; i++) {
                html = html + `
                <div class="commentcontainer">
                    <div class="expandcommentdiv">
                        <p class="commentsowner">
                            <a class="postownerlink"
                            href = "/account/${comments[i].owner}"
                                id="comment_${i}_${comments[i].owner}">View Poster</a>
                        </p>
                        <p class="commentsbody">${comments[i].body}</p>
                        <button class="button">${comments[i].date.toLocaleString()}</button>
                    </div>
                </div><br>`
                document.getElementById(`${elem}`).innerHTML = html

                getusername(`comment_${i}_${comments[i].owner}`, `${comments[i].owner}`)
            }

            if (data.posts.length == 0) {
                html = html + `<p class='section'>There are no comments.</p>`
            }

            html = html + `<button class="button" onclick="hidecomments('expand_${postid}')">Hide Comments</button>`

            if (comments.length == 20) {
                html = html + `<a class='section' href="/s/${postid}#comments">View More</a>`
            }

            document.getElementById(`${elem}`).innerHTML = html
        } else {

        }
    })
}

function replycomment(id) {
    document.getElementById(id).classList.remove('hidden')
}

function replycommenthide(id) {
    document.getElementById(id).classList.add('hidden')
}

function expandcomments(postid) {
    $.post('/api/comments/20/' + postid, function (data) {
        if (data.success == true) {
            var html = `<br><button class="button" onclick="hidecomments('expand_${postid}')">Hide Comments</button><br><br>`
            var comments = data.comments
            for (i = 0; i < data.comments.length; i++) {
                html = html + `
                <div class="commentcontainer">
                    <div class="expandcommentdiv">
                        <p class="commentsowner">
                            <a class="postownerlink" href="/account/${comments[i].owner}"
                                id="comment_${i}_${comments[i].owner}">View Poster</a>
                        </p>
                        <p class="commentsbody">${comments[i].body}</p>
                        <button class="button">${comments[i].date.toLocaleString()}</button>
                    </div>
                </div><br>`
                document.getElementById(`expand_${postid}`).innerHTML = html

                getusername(`comment_${i}_${comments[i].owner}`, `${comments[i].owner}`)
            }

            if (comments.length == 0) {
                html = html + `<p class='section'>There are no comments.</p>`
            }

            html = html + `<button class="button" onclick="hidecomments('expand_${postid}')">Hide Comments</button>`

            if (comments.length == 20) {
                html = html + `<a class='section' href="/s/${postid}#comments">View More</a>`
            }

            document.getElementById(`expand_${postid}`).innerHTML = html
        } else {
            alert('There was an error loading the comments.')
        }
    })
}

function showlatestposts(divclass) {
    $.getJSON('/api/latest/3', function (json) {
        if (json.success == true) {
            var posts = json.posts
            var html = ''
            var latestimgids = []
            for (i = 0; i < posts.length; i++) {
                if (posts[i].media == true) {
                    latestimgids.push(`${posts[i]._id}`)
                    html = html + `
                    <div style="width:100%;border-bottom:1px rgb(37,37,37) solid;cursor:pointer;" onclick="url('/s/${posts[i]._id}')">
                        <p class="commentsbody">${posts[i].body}</p>
                        <img class="postimage" style="width:100%" id="latest_img_${posts[i]._id}" src="" loading="lazy"><br>
                        <script>
                        </script>
                    </div>
                    `
                } else {
                    html = html + `
                <div style="width:100%;border-bottom:2px grey solid;cursor:pointer;" onclick="url('/s/${posts[i]._id}')">
                    <p class="commentsbody">${posts[i].body}</p>
                </div>
                `
                }
            }

            var elements = document.getElementsByClassName(divclass)
            for (i = 0; i < elements.length; i++) {
                elements[i].innerHTML = html
            }

            for (i = 0; i < latestimgids.length; i++) {
                getmedia("latest_img_" + latestimgids[i], latestimgids[i])
            }
        } else {
            console.log('error')
        }
    })
}

function showboards(divclass) {
    $.getJSON('/api/boards/10', function (json) {
        if (json.success == true) {
            var boards = json.boards
            var html = ''
            for (i = 0; i < boards.length; i++) {
                html = html + `
                <div style="width:100%;border-bottom:2px grey solid;cursor:pointer;" onclick="url('/b/${boards[i].name}')">
                    <p class="commentsbody">${boards[i].name}</p>
                </div>
                `
            }

            var elements = document.getElementsByClassName(divclass)
            for (i = 0; i < elements.length; i++) {
                elements[i].innerHTML = html
            }
        } else {
            console.log('error')
        }
    })
}

function hidecomments(postid) {
    document.getElementById(postid).innerHTML = ''
}

async function like(postid, elemid, likecount) {
    if (loggedinbool == "true") {
        document.getElementById(elemid).innerHTML = "<button onclick='unlike(\"" + postid + '", "' + elemid + '", ' + eval(likecount + 1) + ')\' "type="button" class="postlike red button" id="i_' + elemid + '">Unlike - ' + eval(eval(likecount) + 1) + "</button>";
        $.post("/like/new", {
            postid: postid
        }, function (data, status, jqXHR) {
            return document.getElementById(elemid).innerHTML = "<button onclick='unlike(\"" + postid + '", "' + elemid + '", ' + eval(likecount + 1) + ')\' "type="button" class="postlike red button" id="i_' + elemid + '">Unlike - ' + eval(eval(likecount) + 1) + "</button>";
        });
    } else {
        window.location = "/login";
    }
}

async function unlike(postid, elemid, likecount) {
    if (loggedinbool == "true") {
        document.getElementById(elemid).innerHTML = "<button onclick='like(\"" + postid + '", "' + elemid + '", "' + eval(likecount - 1) + '")\' "type="button" class="postlike button" id="i_' + elemid + '">Like - ' + eval(eval(likecount) - 1) + "</button>";
        $.post("/like/remove", {
            postid: postid
        }, function (data, status, jqXHR) {
            return document.getElementById(elemid).innerHTML = "<button onclick='like(\"" + postid + '", "' + elemid + '", "' + eval(likecount - 1) + '")\' "type="button" class="postlike button" id="i_' + elemid + '">Like - ' + eval(eval(likecount) - 1) + "</button>";
        });
    } else {
        window.location = "/login";
    }
}

async function premium(array) {
    $.getJSON("/api/premium", function (json) {
        if (json.premium == true) {
            for (i = 0; i < array.length; i++) {
                document.getElementById(array[i]).innerHTML = `<button class="sidebarbutton" onclick="url('/premium')"><i class="fas fa-star"></i></button>`
            }
        } else {
            return;
        }
    });
}

function copytext(elemid) {
    var copyText = document.getElementById(elemid);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

function approvepost(id) {
    $.post("/mod/reports", {
        id: id,
        approved: true,
        sensitive: false
    }, function (data, status, jqXHR) {
        window.location = window.location;
    });
    setTimeout(function () {
        location.reload();
    }, 500);
}

function approvesensitivepost(id) {
    $.post("/mod/reports", {
        id: id,
        approved: true,
        sensitive: true
    }, function (data, status, jqXHR) {
        window.location = window.location;
    });
    setTimeout(function () {
        location.reload();
    }, 500);
}

function removesensitive(id) {
    $.post("/mod/reports", {
        id: id,
        approved: true,
        sensitive: false
    }, function (data, status, jqXHR) {
        window.location = window.location;
    });
    setTimeout(function () {
        location.reload();
    }, 500);
}

function removepost(id) {
    $.post("/mod/reports", {
        id: id,
        approved: false,
        sensitive: true
    }, function (data, status, jqXHR) {
        location.reload();
    });
    setTimeout(function () {
        location.reload();
    }, 100);
}(function ($) {
    $.fn.replaceTag = function (newTag) {
        var originalElement = this[0],
            originalTag = originalElement.tagName,
            startRX = new RegExp("^<" + originalTag, "i"),
            endRX = new RegExp(originalTag + ">$", "i"),
            startSubst = "<" + newTag,
            endSubst = newTag + ">",
            newHTML = originalElement.outerHTML.replace(startRX, startSubst).replace(endRX, endSubst);
        this.replaceWith(newHTML);
    };
})(jQuery);

function opentab(tabname) {
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        x[i].classList.add("hidden");
    }
    if (tabname == 'all') {
        for (i = 0; i < x.length; i++) {
            x[i].classList.remove("hidden");
        }
    } else {
        document.getElementById(tabname).classList.remove("hidden");
    }
}

function showmenu(visibility) {
    if (visibility == 'show') {
        return document.getElementById('sidebarext').classList.remove('hidden')
    } else if (visibility == 'hide') {
        return document.getElementById('sidebarext').classList.add('hidden')
    } else {
        return;
    }
}