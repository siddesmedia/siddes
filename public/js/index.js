/*
    Copyright (c) 2020 - Present Jude Wilson on Behalf of Social Media

    All other use is prohibited without permission.
*/

function replacepostlinks(id) {
    return (document.getElementById(id).innerHTML = document.getElementById(id).innerHTML.replace(/#(\S*)/g, "<a href='/tag/$1' class='hashtag'>#$1</a>").replace(/@(\S*)/g, "<a href='/$1' class='mention'>@$1</a>").replace(/http:\/\/(\S*)/g, "<a href='http://$1' class='link'>http://$1</a>").replace(/https:\/\/(\S*)/g, "<a href='https://$1' class='link'>https://$1</a>"))
}

function newPost(toggle) {
    if (toggle == "show") {
        document.getElementById("postModal").classList.remove("hidden");
    } else if (toggle == "hide") {
        document.getElementById("postModal").classList.add("hidden");
    }
}

async function getusername(id, userid) {
    $.getJSON("/api/get/username/" + userid, function (json) {
        if (json.username == '[banned]') {
            document.getElementById(id).innerHTML = '@' + json.username;
            $('#' + id).replaceTag('span')
        } else {
            return document.getElementById(id).innerHTML = '@' + json.username;
        }
    });
}

async function version(id) {
    $.getJSON("/api/version", function (json) {
        return document.getElementById(id).innerHTML = json.version;
    });
}

async function haveiliked(elemid, likecount, postid) {
    $.getJSON("/api/liked/" + postid, function (json) {
        if (json.liked == true) {
            return document.getElementById(elemid).innerHTML = '<button onclick="unlike(\'' + postid + '\')"type="button" class="postlike red">Unlike - ' + likecount + '</button>';
        } else {
            return document.getElementById(elemid).innerHTML = '<button onclick="like(\'' + postid + '\')"type="button" class="postlike">Like - ' + likecount + '</button>';
        }
    });
}

async function like(postid) {
    $.post("/like/new", {
            postid: postid
        },
        function (data, status, jqXHR) {
            location.reload()
        }
    );
}

async function unlike(postid) {
    $.post("/like/remove", {
            postid: postid
        },
        function (data, status, jqXHR) {
            location.reload()
        }
    );
}

async function premium(id) {
    $.getJSON("/api/premium", function (json) {
        if (json.premium == true) {
            return document.getElementById(id).innerHTML = '<a href="/premium">Premium</a>';
        } else {
            return;
        }
    });
}


function approvepost(id) {
    $.post("/mod/reports", {
            id: id,
            approved: 'true'
        },
        function (data, status, jqXHR) {
            window.location = window.location
        }
    );
    setTimeout(function () {
        location.reload()
    }, 500);
}

function removepost(id) {
    $.post("/mod/reports", {
            id: id,
            approved: 'false'
        },
        function (data, status, jqXHR) {
            location.reload()
        }
    );
    setTimeout(function () {
        location.reload()
    }, 100);
}

(function ($) {
    $.fn.replaceTag = function (newTag) {
        var originalElement = this[0],
            originalTag = originalElement.tagName,
            startRX = new RegExp('^<' + originalTag, 'i'),
            endRX = new RegExp(originalTag + '>$', 'i'),
            startSubst = '<' + newTag,
            endSubst = newTag + '>',
            newHTML = originalElement.outerHTML
            .replace(startRX, startSubst)
            .replace(endRX, endSubst);
        this.replaceWith(newHTML);
    };
})(jQuery);