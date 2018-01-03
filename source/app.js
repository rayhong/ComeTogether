// necessary packages
var express = require('express');
var mysql = require('mysql');
var indexController = require('./controllers/indexController');
var bodyParser = require("body-parser");
var session = require('express-session');
var mysqlStore = require('express-mysql-session')(session);

var app = express();

var options = {
	host: "hdslab.hcde.uw.edu",
	user: "traffigram",
	password: "traffigram@HCDE2017",
	database: "cometogether"
};

// mysql connection configs
var con = mysql.createConnection(options);

// initiating the session store
var sessionStore = new mysqlStore({
	checkExpirationInterval: 900000, // 15 mins
	expiration: 14400000 // 4 hours
},con);

// test mysql connection
con.connect(function(err){
	if (err) throw err;
	console.log("connected!");
})

// install middleware for static files and json posts
app.use(express.static(__dirname));
app.use(bodyParser.json());

// middleware for session/cookie handling
app.use(session({
	secret: 't@9R&(+fW]vU4!f^f@MK', // simply generated randomly
	resave: false,
	saveUninitialized: false,
	store: sessionStore
}))

// initiate controller for index page (including regitration and login pages)
indexController(app, con);

// start the server
app.listen(8000);
console.log('server up');