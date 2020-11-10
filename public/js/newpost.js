$("#newpostinput").keyup(function () {
    $("#newpostcount").text($(this).val().length);
});