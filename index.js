const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');

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

const main = require('./routes/main')
app.use('/', main);
const user = require('./routes/user')
app.use('/', user);

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.listen(port, () => console.log('social media is live at: http://localhost:' + port));