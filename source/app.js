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


var options = require('./options.js')

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
app.use(express.static(__dirname + '/../../../places/03_01_2018_Seattle/photos/'))

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


/*
 [Script: To add more places data to database]
var fs = require('fs')
var path = require('path')

var locationTypes = [{res_american: ["newamerican", "tradamerican"]}, {res_cn: ["chinese"]}, {res_fr: ["french"]}, {res_in: ["indpak"]}, {res_it: ["italian"]},
					 {res_jp: ["japanese"]}, {res_mx: ["mexican"]}, {res_med: ["mediterranean"]}, {res_th: ["thai"]}, {res_veg: ["vegan"]}, {res_vet: ["vegetarian"]}, 
					 {caf_caf: ["cafes", "coffee", "coffeeroasteries"]}, {caf_bubble: ["bubbletea"]}, {caf_tea: ["tea"]}, {caf_juice: ["juicebars"]}, 
					 {caf_des: ["desserts"]}, {caf_ice: ["icecream", "gelato"]}, 
					 {attr_landmark: ["landmarks"]}, {attr_muse: ["museums"]}, {attr_aq: ["aquariums"]}, {attr_park: ["parks"]}, {attr_beach: ["beaches"]}, 
					 {attr_amusepark: ["amusementparks"]}, {attr_zoo: ["zoos"]}, {attr_theater: ["theater"]}, 
					 {shop_art: ["artsandcrafts"]}, {shop_book: ["bookstores"]}, {shop_cosm: ["cosmetics"]}, {shop_dept: ["deptstores"]}, {shop_drug: ["drugstores"]}, 
					 {shop_elec: ["electronics"]}, {shop_jewel: ["fashion", "jewelry"]}, {shop_grocery: ["grocery"]}, 
					 {night_bar: ["bars"]}, {night_beerg: ["beergardens"]}, {night_jazz: ["jazzandblues"]}, {night_karaoke: ["karaoke"]}, 
					 {night_comedy: ["comedyclubs"]}, {night_music: ["musicvenues"]}, {night_dance: ["danceclubs"]}];


for(var i = 0; i < locationTypes.length; i++){
	var type = locationTypes[i]
	var id = Object.keys(type)[0]
	var filenames = type[id]
	for(var j = 0; j < filenames.length; j++){
		var filename = filenames[j]
		var filePath = path.join(__dirname, "final/" + filename + "Final.txt")
		var data = fs.readFileSync(filePath, 'utf8')
		var temp = data.split('\n')
		temp.pop()
		var placesInfo = temp.map(str => JSON.parse(str))
		for(var k = 0; k < placesInfo.length; k++){
			var sql = `INSERT INTO places (p_mid, p_cid, p_top, p_data) 
					VALUES ('m_sea', 'c_${placesInfo[k].city.toLowerCase().replace(/ /g, "_")}', '${id}', 
							JSON_OBJECT('type', 'place', 'data',
										JSON_OBJECT('yelp', 
													JSON_OBJECT('id', ${con.escape(placesInfo[k].yelpId)}, 'name', ${con.escape(placesInfo[k].name)}, 'rating', ${con.escape(placesInfo[k].yelpRating)}, 
																'review_cnt', ${con.escape(placesInfo[k].yelpRatingCount)}, 'coord_lat', ${con.escape(placesInfo[k].locY)},
																'coord_lng', ${con.escape(placesInfo[k].locX)}, 'phone', ${con.escape(placesInfo[k].phone)}, 'address', ${con.escape(placesInfo[k].address)},
																'city', ${con.escape(placesInfo[k].city)}, 'zip', ${con.escape(placesInfo[k].zip)}, 'yelp_url', ${con.escape(placesInfo[k].yelpURL)}, 
																'yelp_url_mobile', ${con.escape(placesInfo[k].yelpURLMobile)}),
													'google',
													JSON_OBJECT('id', ${con.escape(placesInfo[k].placeId)}, 'rating', ${con.escape(placesInfo[k].googleRating)}, 'open_hours', ${con.escape(placesInfo[k].openingHours)}, 
																'images', ${con.escape(placesInfo[k].reference)}, 'price', ${con.escape(placesInfo[k].priceLevels)},
																'reviews', ${con.escape(placesInfo[k].googleReviews)}))))`
			con.query(sql, function(err, result){
				if(err) throw err;
			})
		}
	}
}
*/
