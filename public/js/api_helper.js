function regeneratekey() {
    $.post('/account/developer/key/regenerate', {}, function (data) {
        if (data.success == true) {
            customalert('API Key Regeneration', `API key: ${data.key}\nYou'll only see this once so write it down somewhere.`)
        } else {
            alert('It seems there was an error regenerating your API key, please try to regenerate it again later.')
        }
    })
}