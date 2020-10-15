/*
    Copyright (c) 2020 - Present Jude Wilson on Behalf of Social Media

    All other use is prohibited without permission.
*/

function replacepostlinks(id) {
    return (document.getElementById(id).innerHTML = document.getElementById(id).innerHTML.replace(/#(\S*)/g, "<a href='/tag/$1' class='hashtag'>#$1</a>").replace(/@(\S*)/g, "<a href='/$1' class='mention'>@$1</a>"));
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
        return (document.getElementById(id).innerHTML = json.username);
    });
}

function approvepost(id) {
    $.post("/mod/reports", {
            id: id,
            approved: 'true'
        },
        function (data, status, jqXHR) {
            location.reload()
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