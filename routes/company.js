const express = require('express');
const router = express.Router()
require('dotenv').config()
const Name = process.env.NAME
const funcs = require('../config/functions');
const Analytics = require('../models/Analytics');

router.get('/', function (req, res, next) {

    const about = {
        title: Name,
        template: 'pages/company/index',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/about', function (req, res, next) {

    const about = {
        title: 'About - ' + Name,
        template: 'pages/company/about',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/transparency', function (req, res, next) {

    const about = {
        title: 'Transparency Report - ' + Name,
        template: 'pages/company/transparency',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/howto', function (req, res, next) {

    const about = {
        title: 'How to Use ' + Name,
        template: 'pages/company/howto',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/bugs', function (req, res, next) {

    const about = {
        title: 'Bugs - ' + Name,
        template: 'pages/company/bugs',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/releases', function (req, res, next) {

    const about = {
        title: 'Releases - ' + Name,
        template: 'pages/company/releases',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/brand', function (req, res, next) {

    const about = {
        title: 'Releases - ' + Name,
        template: 'pages/company/brand',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/the-press-sucks', function (req, res, next) {

    const about = {
        title: 'Press Kit - ' + Name,
        template: 'pages/company/presskit',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/tos', function (req, res, next) {

    const about = {
        title: 'Terms of Service - ' + Name,
        template: 'pages/company/legal/tos',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/pp', function (req, res, next) {

    const about = {
        title: 'Privacy Policy - ' + Name,
        template: 'pages/company/legal/pp',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/tm', function (req, res, next) {

    const about = {
        title: 'Trademarks - ' + Name,
        template: 'pages/company/legal/tm',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/cr', function (req, res, next) {

    const about = {
        title: 'Copyright - ' + Name,
        template: 'pages/company/legal/cr',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/roadmap', function (req, res, next) {
    const about = {
        title: 'Roadmap - ' + Name,
        template: 'pages/company/roadmap',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true
    };
    return res.render('base', about);
});

router.get('/contact', function (req, res, next) {
    const about = {
        title: 'Contact - ' + Name,
        template: 'pages/company/contact',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: false
    };
    return res.render('base', about);
});

router.get('/analytics', async function (req, res, next) {
    const analytics = await Analytics.find().sort({
        _id: -1
    }).limit(400)

    var chart_data = []
    var chart_labels = []

    if (analytics.length < 25) {
        for (i = 0; i < analytics.length; i++) {
            chart_labels.push(`${analytics[i].hour}`)
            chart_data.push(analytics[i].views)
        }
    } else {
        for (i = 0; i < 24; i++) {
            chart_labels.push(`${analytics[i].hour}`)
            chart_data.push(analytics[i].views)
        }
    }

    const about = {
        title: 'Analytics - ' + Name,
        template: 'pages/admin/analytics',
        name: Name,
        loggedin: funcs.loggedin(req.user),
        moderator: funcs.moderator(req.user),
        navbar: true,
        footer: true,
        analytics: analytics,
        chart_data: chart_data,
        chart_labels: chart_labels
    };
    return res.render('base', about);
});

router.get('/jobs', async function (req, res, next) {
    res.send('no jobs')
});

module.exports = router