var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var pug = require('pug');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var session = require('express-session');

var user = require('./models/User');
var gab = require('./models/Gabs');

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/gabble', { useMongoClient: true });

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'Wubb4 Lubb4', saveUninitialized: true, resave: true }));

var authenticated = function(req, res, next) {
    // req.session.gab = gab;
    // req.session.like = like;
    req.session.user = user;
    req.session.save();
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', function(req, res) {
    if (!req.session || !req.session.user) {
        res.render('index', { title: 'Welcome to Gabble' })
    } else {
        res.redirect('/user');
    }
});

app.get('/login', function(req, res) {
    res.render('login', { title: 'login' });
});

app.get('/register', function(req, res) {
    res.render('register', { title: 'register' });
});

app.get('/user', authenticated, function(req, res) {
    gab.find({}, function(err, gabs) {
        res.render('user', {
            username: req.session.user.username,
            gabs: gabs
        });
    })
});

app.get('/gab/:id', authenticated, function(req, res) {
    gab.findOne({ _id: req.params.id }, function(err, gab) {
        user.findOne({ _id: gab.author }, function(error, user) {
            res.render('gab', { username: req.session.user.username, content: gab.gabs })
        })
    });
});

app.post('/login', authenticated, function(req, res) {
    user.findOne({ username: req.body.username }, function(err, foundUser) {
        if (!foundUser) {
            return res.render('error', {
                title: 'error',
                error: "user does not exist punk"
            })
        }
        if (foundUser.compare(req.body.password)) {
            req.session.user._id = foundUser._id;
            req.session.user.username = foundUser.username;
            req.session.save();
            res.redirect('/user');
        } else {
            res.render('error', {
                title: 'error',
                error: 'wrong password!'
            })
        }
    })
})

app.post('/register', function(req, res) {
    if (req.body.username && req.body.password) {
        user.create({
            username: req.body.username,
            password: req.body.password
        }, function(error, user) {
            if (error) {
                res.render('error', {
                    title: error,
                    error: 'user was not created'
                });
            } else {
                res.redirect('/')
            }
        });
    } else {
        res.render('error', {
            title: error,
            error: 'username or password required'
        });
    }
});

app.post('/gab', authenticated, function(req, res) {
    if (req.body && req.body.gab) {
        gab.create({
            gabs: req.body.gab,
            author: req.session.user._id
        }, function(error, gab) {
            if (error) {
                res.render('error', {
                    title: 'error',
                    error: 'gab was not created'
                });
            } else {
                req.session.gab = gab;
                res.redirect('/user');
            }
        });
    } else {
        res.render('error', {
            title: 'error',
            error: 'gab was not found'
        });
    }
});


app.post('/gab', function(req, res) {
    gab.create({
        like: req.body.like
    })
});

app.listen(3000, () => console.log("My Ninja We Init!"));