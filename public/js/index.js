/*
    Copyright (c) 2020 - Present Jude Wilson on Behalf of Social Media

    All other use is prohibited without permission.
*/

var loggedinbool;
var uploadsbanned = undefined;
var myid = ''

changetheme()

analytics()

function replacepostlinks(id) {
    return (document.getElementById(id).innerHTML = document.getElementById(id).innerHTML.replace(/#(\S*)/g, "<a href='/tag/$1' class='hashtag'>#$1</a>").replace(/@(\S*)/g, "<a href='/$1' class='mention'>@$1</a>").replace(/http:\/\/(\S*)/g, "<a href='http://$1' class='link'>http://$1</a>").replace(/https:\/\/(\S*)/g, "<a href='https://$1' class='link'>https://$1</a>"));
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
                    html = html + `<button class="chat" onclick="openmessage('${ids[i]}')">@${usernames[i]}</button>`
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

function openmessage(id) {
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
                html = html + `<br><li class="message ${float}">${data.dms[i].message}</li><br>`
            }

            document.getElementById('sendmessage').setAttribute('onclick', `sendmessage('${id}')`)
            return document.getElementById('messagescontainer').innerHTML = html
        } else {

        }
    })
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
        return document.getElementById('messagescontainer').innerHTML = document.getElementById('messagescontainer').innerHTML + `<br><li class="message right">${encodeHtmlEntity(message)}</li><br>`
    })
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

function showlatestposts(divid) {
    $.getJSON('/api/latest/3', function (json) {
        if (json.success == true) {
            var posts = json.posts
            var html = ''
            for (i = 0; i < posts.length; i++) {
                html = html + `
                <div style="width:100%;border-bottom:2px grey solid;cursor:pointer;" onclick="url('/s/${posts[i]._id}')">
                    <p class="commentsbody">${posts[i].body}</p>
                </div>
                `
            }
            document.getElementById(divid).innerHTML = html
        } else {
            alert('error')
        }
    })
}

function hidecomments(postid) {
    document.getElementById(postid).innerHTML = ''
}

async function like(postid, elemid, likecount) {
    if (loggedinbool == "true") {
        document.getElementById(elemid).innerHTML = "<button onclick='unlike(\"" + postid + '", "' + elemid + '", "' + eval(likecount + 1) + '")\' "type="button" class="postlike red button" id="i_' + elemid + '">Unlike - ' + eval(eval(likecount) + 1) + "</button>";
        $.post("/like/new", {
            postid: postid
        }, function (data, status, jqXHR) {
            return document.getElementById(elemid).innerHTML = "<button onclick='unlike(\"" + postid + '", "' + elemid + '", "' + eval(likecount + 1) + '")\' "type="button" class="postlike red button" id="i_' + elemid + '">Unlike - ' + eval(eval(likecount) + 1) + "</button>";
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