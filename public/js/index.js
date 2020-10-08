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