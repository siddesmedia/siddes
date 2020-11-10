const Analytics = require('../models/Analytics');

async function analytics() {
    const date = new Date
    const analyticsexists = await Analytics.exists({
        hour: date.getHours(),
        day: date.getDay(),
        month: date.getMonth(),
        year: date.getFullYear()
    })

    if (analyticsexists == true) {
        const views = await Analytics.findOne({
            hour: date.getHours(),
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
        })
        const updateanalytics = await Analytics.findOneAndUpdate({
            hour: date.getHours(),
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
        }, {
            views: eval(views.views) + 1
        })

        updateanalytics
    } else {
        var monthday = date.getDate()
        if (date.getDate().toString().length == 1) {
            var monthday = '0' + date.getDate()
        }
        var currentdate = date.getFullYear() + '/' + date.getMonth() + '/' + monthday

        const createanalytics = new Analytics({
            title: Date.now(),
            hour: date.getHours(),
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear(),
            views: 1,
            date: currentdate
        })

        createanalytics.save()
    }
};

module.exports = {
    analytics
}