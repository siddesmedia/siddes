/*
    Copyright (c) 2020 - Present Jude Wilson on Behalf of Social Media

    All other use is prohibited without permission.
*/

var loggedinbool;
var uploadsbanned = undefined;

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
    return document.getElementById('sharemodal').classList.remove('hidden')
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
                document.getElementById('newpostform').innerHTML = '<h3 class="header">Banned</h3><br><p class="section">Sorry, but you have been post banned, if you think this was a mistake, please contact us here: <a href="/admin/banappeals">ban appeals</a>.</p>'
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
    $.getJSON("/mod/uploadban/" + id, function (json) {
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
    $.getJSON("/admin/suspend/" + id, function (json) {
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
                document.getElementById(array[i]).innerHTML = '<a href="/premium">Premium</a>'
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