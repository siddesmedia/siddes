/*
    Copyright (c) 2020 - Present Jude Wilson on Behalf of Social Media

    All other use is prohibited without permission.
*/

function newPost(toggle) {
    if (toggle == "show") {
        document.getElementById("postModal").classList.remove("hidden")
    } else if (toggle == "hide") {
        document.getElementById("postModal").classList.add("hidden")
    }
}

async function getusername(id, userid) {
    $.getJSON('/api/get/username/' + userid, function (json) {
        return document.getElementById(id).innerHTML = json.username
    });
}

function follow(username) {
    
}