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
    let user = req.session.user.username;
    gab.find({}, null, { sort: { created_at: -1 } }, function(err, gabs) {
        res.render('user', {
            username: user,
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

app.get('/logout', function(req, res) {
    req.session.user = 0;
    res.redirect('/');
});

app.post('/login', function(req, res) {
    user.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
            return res.render('error', {
                title: 'error',
                error: "user does not exist punk"
            })
        }
        if (user.compare(req.body.password)) {
            req.session.user = user;
            req.session.save();
            res.redirect('/user');
        } else {
            res.render('error', {
                title: 'error',
                error: 'wrong password!'
            })
        }
    })
});

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
                req.session.user = user;
                req.session.save();
                res.redirect('/user')
            }
        });
    } else {
        res.render('error', {
            title: error,
            error: 'username or password required'
        });
    }
});

app.post('/gab', function(req, res) {
    if (req.body && req.body.gab) {
        gab.create({
            gabs: req.body.gab,
            author: req.session.user.username
        }, function(error, gab) {
            if (error) {
                res.render('error', {
                    title: 'error',
                    error: 'gab was not created'
                });
            } else {
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


app.post('/like', function(req, res) {
    gab.findOneAndUpdate({ gabs: req.body.like }, {
        $push: {
            like: req.session.user.username
        }
    }, function(err, like) {
        if (err) {
            res.render('error', {
                title: 'error',
                error: 'Unable to like'
            })
        } else {
            res.redirect('/user')
        }
    });
});

app.post('/delete', function(req, res) {
    gab.findOneAndRemove({ gabs: req.body.delete }, function(err, deleted) {
        if (err) {
            res.render('error', {
                title: 'error',
                error: 'Unable to delete Gab.'
            });
        } else {
            res.redirect('/user')
        }
    })
});


app.listen(3000, () => console.log("My Ninja We Init!"));