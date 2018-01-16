// necessary packages
var express = require('express');
var mysql = require('mysql');
var indexController = require('./controllers/indexController');
var bodyParser = require("body-parser");
var session = require('express-session');
var mysqlStore = require('express-mysql-session')(session);

var app = express();

var server = require('http').createServer(app);

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

// middleware for json posts
app.use(bodyParser.json());

// middleware for session/cookie handling
app.use(session({
	secret: 't@9R&(+fW]vU4!f^f@MK', // simply generated randomly
	resave: false,
	saveUninitialized: false,
	store: sessionStore
}))

// initiate controller for index page (including registration and login pages)
indexController(app, con);

// install middleware for static files
app.use(express.static(__dirname));

// start the server
server.listen(8000);
console.log('server up');


// returns the current time as a string timestamp 'YYYY-MM-DD HH:MM:SS'
function getTimestamp(){
	var date = new Date();
	var result = ""
	result += date.getFullYear() + '-';
	result += (date.getMonth()<9 ? "0" + (date.getMonth()+1) : (date.getMonth()+1)) + "-"
	result += (date.getDate()<10 ? "0" + date.getDate() : date.getDate()) + " "
	result += (date.getHours()<10 ? "0" + date.getHours() : date.getHours()) + ":" 
	result += (date.getMinutes()<10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" 
	result += (date.getSeconds()<10 ? "0" + date.getSeconds() : date.getSeconds());
	return result;
}