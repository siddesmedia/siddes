const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const http = require('http').Server(app);
const io = require('socket.io').listen(http);
const funcs = require('./config/functions');
require('dotenv').config()
require('./config/passport')(passport);
const port = process.env.PORT
const statusoptions = {
    path: '/company/status',
    title: `${process.env.NAME} Status`
}
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis')
const redisClient = redis.createClient(process.env.REDIS_URL)
const webPush = require('web-push')

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails('mailto:support@siddes.com', publicVapidKey, privateVapidKey);

app.use(require('serve-static')('./public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    url: process.env.REDIS_URL,
    secret: 'i sware i didnt ship development code to production... i sware',
    name: '',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    },
}));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(passport.initialize());
app.use(passport.session());

app.use(require('express-status-monitor')(statusoptions));

io.sockets.on('connection', function (socket) {
    console.log('socket connection')
    socket.on('username', function (username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
    });

    socket.on('disconnect', function (username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function (message) {
        if (message.trim().length < 1) {
            return;
        } else {
            io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
        }
    });
});

if (process.env.ENV == "p" || process.env.ENV == "production") {
    const user = require('./routes/user')
    app.use('/', user);
    const premium = require('./routes/premium')
    app.use('/', premium);
    const mod = require('./routes/mod')
    app.use('/', mod);
    const admin = require('./routes/admin')
    app.use('/', admin);
    const internalapi = require('./routes/api/internal')
    app.use('/', internalapi);
    const company = require('./routes/company')
    app.use('/company', company);
    const redirects = require('./routes/redirects')
    app.use('/redirects', redirects);
    const keyapi = require('./routes/api/key')
    app.use('/api/v1', keyapi);
    const nokeyapi = require('./routes/api/nokey')
    app.use('/api/v1', nokeyapi);
    const apidocs = require('./routes/api/docs')
    app.use('/', apidocs);
    const main = require('./routes/main')
    app.use('/', main);
    const board = require('./routes/board')
    app.use('/', board);
    const errors = require('./routes/errors')
    app.use('/', errors);
}


if (process.env.ENV == "m" || process.env.ENV == "maintenance") {
    app.get('/*', async function (req, res, next) {
        const about = {
            title: 'Maintenance - ' + process.env.NAME,
            template: 'errors/maintenance',
            name: process.env.NAME,
            loggedin: funcs.loggedin(req.user),
            moderator: funcs.moderator(req.user),
            navbar: false,
            footer: false
        };
        return res.render('base', about);
    });
}

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

http.listen(port, function () {
    console.log(process.env.NAME + ' is live at: http://localhost:' + port);
});