// necessary packages
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var bcrypt = require('bcrypt');

// export controller to app.js
module.exports = function(app, con){
	// set configs for file upload and storage
	var storage = multer.diskStorage({
		destination: function(req, file, callback){
			callback(null, __dirname + '/../temp/');
		},
		filename: function(req, file, callback){
			callback(null, Date.now() + path.basename(file.originalname))
		}
	});
	var upload = multer({
		storage: storage
	}).single('file');

	// handlers to serve html files
	app.get('/', function(req, res){
		res.sendFile('index.html', {root: __dirname + '/../'});
	});

	// post handler for uploading images and storing in temp
	app.post('/uploadimg', function(req, res){
		upload(req, res, function(err){
			if(err) throw err;
			res.send(JSON.stringify({name: req.file.filename}));
		})
	})

	// post handler to store registration information in database and permanently storing profile image
	app.post('/register', function(req, res){
		var data = req.body;
		// verifies the data given is valid (in case user deactivates javascript)
		var emailRe = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ 
		var pwRe = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{7,}$/
		if(!pwRe.test(data.password) || !emailRe.test(data.email)){
			res.send(JSON.stringify({success:false}))
		}else{
			var sql = "SELECT user_id FROM users WHERE user_id=" + con.escape(data.email);
			con.query(sql, function(err, result){
				// checks if email already exists
				if(result.length > 0)
					res.send(JSON.stringify({success: false}));
				else{
					// hash the password
					bcrypt.hash(data.password, 10, function(err, hash){
						if (err) throw err;
						var img_dir = __dirname + "/../temp/" + data.filename;

						// create the sql query string
						var sql = "INSERT INTO users (user_id, user_pw, user_name, user_home_address, user_office_address, user_groups) VALUES (";
						if(data.homeaddr == "" && data.officeaddr == "")
							sql += `${con.escape(data.email)}, '${hash}', ${con.escape(data.name)}, NULL, NULL, `;
						else if(data.homeaddr == "")
							sql += `${con.escape(data.email)}, '${hash}', ${con.escape(data.name)}, NULL, ${con.escape(data.officeaddr)}, `;
						else if (data.officeaddr == "")
							sql += `${con.escape(data.email)}, '${hash}', ${con.escape(data.name)}, ${con.escape(data.homeaddr)}, NULL, `;
						else
							sql += `${con.escape(data.email)}, '${hash}', ${con.escape(data.name)}, ${con.escape(data.homeaddr)}, ${con.escape(data.officeaddr)}, `;
						sql += "JSON_OBJECT('type', 'user_groups', 'data', JSON_ARRAY()))"

						// insert new user into the table
						con.query(sql, function(err, result){
							if (err) throw err;
							// copy file from temp to profile_imgs folder, and delete temp file
							fs.readFile(img_dir, function(err, data){
								if (err) throw err;
								fs.writeFile(__dirname + "/../profile_imgs/" + result.insertId + path.extname(img_dir), data, function(err){
									if (err) throw err;
									fs.unlink(img_dir, function(err){ if (err) throw err; });
									res.send(JSON.stringify({success: true}));
								})
							})
						});
					})
				}
			});
		}
	})

	// returns true to the user if email is not already in use
	app.post('/verify_email', function(req, res){
		var data = req.body;
		var sql = "SELECT user_id FROM users WHERE user_id=" + con.escape(data.email);
		con.query(sql, function(err, result){
			if(result.length > 0){
				res.send(JSON.stringify({success: false}));
			}else{
				res.send(JSON.stringify({success: true}));
			}
		});
	});

	// post handler for logins: checks that userid exists and if password match
	// returns a json to user depending on verification outcome
	app.post('/login', function(req, res){
		// allows login no matter what inputted if a session exists
		if(req.session.userID != null){
			res.send(JSON.stringify({success: true, issue: false}));
		}else{
			var data = req.body;
			var sql = "SELECT user_id, user_pw FROM users WHERE user_id=" + con.escape(data.id);
			con.query(sql, function(err, result){
				if(result.length > 0){
					var hashed_pw = result[0].user_pw;
					if(bcrypt.compareSync(data.pw, hashed_pw)){
						req.session.userID = result[0].user_id;
						res.send(JSON.stringify({success: true, issue: false}));
					}else{
						res.send(JSON.stringify({success: false, issue: false})) 
					}
				}else{
					res.send(JSON.stringify({success: false, issue: true})); // issue is true if email is the problem
				}
			});
		}
	});

/*
	// post handler for logins: checks that userid exists and if password match
	// returns a json to user depending on verification outcome
	app.post('/create', function(req, res){
		var data = req.body;
		//var time = new Date();
		//var timestamp = `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
		var sql = "INSERT INTO groups (g_id, g_date, g_info, g_status, g_cdq, g_fav, g_chat_log, g_ping_log, g_activities_log) VALUES("
		sql += `'${data.title}', '${data.date}', '${data.info}', `
		sql += `JSON_OBJECT('ongoing', true, 'terminated', false, 'invited_from', '${req.session.userID}', 'invited_to', JSON_ARRAY()), `
		sql += `JSON_OBJECT('type', 'g_cdq', 'g_id', null, 'data', JSON_ARRAY()), `
		sql += `JSON_OBJECT('type', 'g_fav', 'data', JSON_ARRAY()), `
		sql += `JSON_OBJECT('type', 'g_chat_log', 'data', JSON_ARRAY()), `
		sql += `JSON_OBJECT('type', 'g_ping_log', 'g_id', null, 'data', JSON_ARRAY()), `
		sql += `JSON_OBJECT('type', 'g_behavior_log', 'g_id', null, 'timestamp', JSON_OBJECT('initiated', ${Date.now()}, 'terminated', null), 'activities', JSON_ARRAY()))`
		con.query(sql, function(err, result){
			if (err) throw err;
			res.send(JSON.stringify({title: data.title}));
		})
	});
*/
}
