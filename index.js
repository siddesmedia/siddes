const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const http = require('http').Server(app);
const io = require('socket.io')(http);

require('dotenv').config()
require('./config/passport')(passport);
const port = process.env.PORT;

app.use(require('serve-static')('./public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'keyboard warrior cat',
    resave: true,
    saveUninitialized: true
}));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(passport.initialize());
app.use(passport.session());

const user = require('./routes/user')
app.use('/', user);
const premium = require('./routes/premium')
app.use('/', premium);
const mod = require('./routes/mod')
app.use('/', mod);
const api = require('./routes/api')
app.use('/', api);
const main = require('./routes/main')
app.use('/', main);

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

io.sockets.on('connection', function (socket) {
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

http.listen(port, function () {
    console.log('social media is live at: http://localhost:' + port);
});