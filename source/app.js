// ip: 127.0.0.1
// necessary packages
var express = require('express');
var mysql = require('mysql');
var indexController = require('./controllers/indexController');
var mainController = require('./controllers/mainController')
var socketController = require('./controllers/socketController');
var bodyParser = require("body-parser");
var session = require('express-session');
var mysqlStore = require('express-mysql-session')(session);

var app = express();

var server = require('http').createServer(app);

var options = {
	host: "hdslab.hcde.uw.edu",
	user: "traffigram",
	password: "traffigram@HCDE2017",
	database: "cometogether",
	connectionLimit: 100
};

// mysql connection configs
var con = mysql.createPool(options);

// initiating the session store
var sessionStore = new mysqlStore({
	checkExpirationInterval: 900000, // 15 mins
	expiration: 14400000 // 4 hours
},con);

// test mysql connection
con.getConnection(function(err, connection){
	if (err) throw err;
	console.log("connected!");
	connection.release();
})

// middleware for json posts
app.use(bodyParser.json());

// middleware for session/cookie handling
app.use(session({
	secret: 't@9R&(+fW]vU4!f^f@MK', // simply generated randomly
	resave: false,
	saveUninitialized: false,
	store: sessionStore
	/*
	name: 'random-name?',
	cookie: {
		secure: true,
		httpOnly: true
	}
	*/
}))

// initiate controller for index page and main page(including registration and login pages)
indexController(app, con);
mainController(app, con);
socketController(server, con)

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



/* [To add more places data to database]
// res_fr, res_in, res_it, res_jp, res_med, res_mx, res_aerican, res_th, res_veg, res_vet, res_cn, caf_caf, caf_bubble, caf_juice, caf_des, caf_ice, attr_aq, attr_landmark, attr_muse
// bubbletea, cafes, chinese, coffee, coffeeroasteries, desserts, french, gelato, icecream, indpak, italian, japanese, juicebars, mediterranean, mexican,
// newamerican, thai, tradamerican, vegan, vegetarian, aquariums, landmarks, museums
// (missing: aquariums, landmarks, museums)
var data = []

console.log(data.length)

for(i = 0; i < data.length; i++){
	var sql = `INSERT INTO places (p_mid, p_cid, p_top, p_data) 
			VALUES ('m_sea', 'c_${data[i].city.toLowerCase().replace(/ /g, "_")}', 'attr_landmark', 
					JSON_OBJECT('type', 'place', 'data',
								JSON_OBJECT('yelp', 
											JSON_OBJECT('id', ${con.escape(data[i].yelpId)}, 'name', ${con.escape(data[i].name)}, 'rating', ${con.escape(data[i].yelpRating)}, 
														'review_cnt', ${con.escape(data[i].yelpRatingCount)}, 'coord_lat', ${con.escape(data[i].locY)},
														'coord_lng', ${con.escape(data[i].locX)}, 'phone', ${con.escape(data[i].phone)}, 'address', ${con.escape(data[i].address)},
														'city', ${con.escape(data[i].city)}, 'zip', ${con.escape(data[i].zip)}, 'yelp_url', ${con.escape(data[i].yelpURL)}, 
														'yelp_url_mobile', ${con.escape(data[i].yelpURLMobile)}),
											'google',
											JSON_OBJECT('rating', ${con.escape(data[i].googleRating)}, 'open_hours', ${con.escape(data[i].openingHours)}, 
														'images', ${con.escape(data[i].photos)}, 'price', ${con.escape(data[i].priceLevels)},
														'reviews', ${con.escape(data[i].googleReviews)}))))`
	con.query(sql, function(err, result){
		if(err) throw err;
	})
}
*/
