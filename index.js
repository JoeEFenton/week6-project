var express = require('express');
var mongoose = require('mongoose');
var pug = require('pug');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

var user = require('./models/User');

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/gabble', { useMongoClient: true });

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.render('index', { title: 'home' });
});

app.get('/login', function(req, res) {
    res.render('login', { title: 'login' });
});

app.get('/register', function(req, res) {
    res.render('register', { title: 'register' });
});

app.get('/userHome', function(req, res) {
    res.render('user', { title: 'user' });
});

app.post('/login', function(req, res) {
    user.findOne({ username: req.body.username }, function(err, user) {
        if (err) res.render('error', {
            title: error,
            error: "user is not there, boo."
        })
    });
    user.compare(req.body.password)
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
                res.send(user)
            }
        });
    } else {
        res.render('error', {
            title: error,
            error: 'username or password required'
        })
    }
});

app.listen(3000, () => console.log("My Ninja We Init!"));