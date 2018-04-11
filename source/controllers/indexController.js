// necessary packages
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var bcrypt = require('bcryptjs');

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
		if(req.session.userID){
			res.sendFile('alt_index.html', {root: __dirname + '/../html'});
		}else{
			res.sendFile('index.html', {root: __dirname + '/../'});
		}
	});

	// post handler for uploading images and storing in temp
	app.post('/uploadimg', function(req, res){
		upload(req, res, function(err){
			if(err) console.log(err);
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
						if (err) console.log(err);
						var img_dir = __dirname + "/../temp/" + data.filename;

						var img_filename = "" + Date.now() + data.firstname[0] + data.lastname[0] + path.extname(img_dir);
						fs.readFile(img_dir, function(err, img){
							if (err) console.log(err);
							fs.writeFile(__dirname + "/../profile_imgs/" + img_filename, img, function(err){
								if (err) console.log(err);
								fs.unlink(img_dir, function(err){ if (err) console.log(err); });
							})
						})

						// create the sql query string
						var sql = `INSERT INTO users (user_id, user_pw, user_first_name, user_last_name, user_home_address, user_office_address, user_groups, user_img_filename) 
									VALUES (${con.escape(data.email)}, '${hash}', ${con.escape(data.firstname)},  ${con.escape(data.lastname)},
									${data.homeaddr == "" ? 'NULL' : con.escape(data.homeaddr)}, 
									${data.officeaddr == "" ? 'NULL' : con.escape(data.officeaddr)}, 
									JSON_OBJECT('type', 'user_groups', 'data', JSON_ARRAY()), ${con.escape(img_filename)})`;

						// insert new user into the table
						con.query(sql, function(err, result){
							if(err)
								res.send(JSON.stringify({success: false}))
							else{
								req.session.userID = data.email;
								res.send(JSON.stringify({success: true}));
							}
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
			res.send(JSON.stringify({success: true, issue: false, id: req.session.userID}));
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


	// handler for GET requests for user information
	app.get('/get_user_info', function(req, res){
		var sql = `SELECT user_id, user_first_name, user_last_name, user_home_address, user_office_address, user_img_filename, user_groups 
					FROM users WHERE user_id=${con.escape(req.session.userID)}`
		con.query(sql, function(err, result){
			var data = {id: result[0].user_id, firstname: result[0].user_first_name, lastname: result[0].user_last_name,
						homeadd: result[0].user_home_address, officeadd: result[0].user_office_address,
						filename: result[0].user_img_filename, groups: JSON.parse(result[0].user_groups).data}
			res.send(JSON.stringify(data))
		})
	})

	// returns information about the group/event specified in the url query
	app.get('/get_group_info', function(req, res){
		var data = req.query.data;
		if(data !== '()'){
			var sql = `SELECT g_id, g_title, g_date, g_types, g_status, g_chat_log FROM groups WHERE g_id IN ${data}`
			con.query(sql, function(err, result){
				getMembersInfo(result, 0, con, res)
			})
		}else
			res.send()

		/*
		var id = req.query.group_id
		var sql = `SELECT g_id, g_title, g_date, g_info, g_status FROM groups WHERE g_id=${con.escape(id)}`
		con.query(sql, function(err, result){
			var data = {id: result[0].g_id, title: result[0].g_title, date: result[0].g_date, note: result[0].g_info};
			var invitedToList = JSON.parse(result[0].g_status).invited_to;
			var idList = "(" + con.escape(JSON.parse(result[0].g_status).invited_from);
			for(j = 0; j < invitedToList.length; j++){
				if(invitedToList[j].accepted)
					idList += ", " + con.escape(invitedToList[j].user_id)
			}
			idList += ")"
			var membersSql = `SELECT user_id, user_name, user_img_filename FROM users WHERE user_id IN ${idList}`
			con.query(membersSql, function(err, result){
				data.members = result;
				res.send(JSON.stringify(data))
			})
		})
		*/
	})

	// post handler for creating and editting groups
	app.post('/create_group', function(req, res){
		var data = req.body;
		// if group creation in progress, edit the group
		// else create the group
		if(req.session.g_id){
			var datetimesStr = data.datetimes.map(str => con.escape(str)).join(', ')
			var sql = `UPDATE groups SET g_title=${con.escape(data.title)}, g_datetimes=JSON_ARRAY(${datetimesStr}), 
					   g_types=JSON_OBJECT('restaurants', ${data.type.res}, 'cafe', ${data.type.caf}, 'attractions', ${data.type.attr}, 'shopping', ${data.type.shop}, 'nightlife', ${data.type.night}) 
					   WHERE g_id=${con.escape(req.session.g_id)}`
			con.query(sql, function(err, result){
				if(err)
					res.send(JSON.stringify({success: false}))
				else
					res.send(JSON.stringify({success: true, g_id: req.session.g_id}))
			})
		}else{
			var id = Math.random().toString(36).substring(2, 12).toUpperCase()
			var datetimesStr = data.datetimes.map(str => con.escape(str)).join(', ')
			var sql = `INSERT INTO groups (g_id, g_title, g_types, g_status, g_cdq, g_fav, g_chat_log, g_ping_log, g_activities_log, g_datetimes) VALUES(
					   ${con.escape(id)}, ${con.escape(data.title)}, 
					   JSON_OBJECT('res', ${data.type.res}, 'caf', ${data.type.caf}, 'attr', ${data.type.attr}, 'shop', ${data.type.shop}, 'night', ${data.type.night}), 
					   JSON_OBJECT('ongoing', true, 'creation_date', CURRENT_TIMESTAMP, 'terminated', false, 'invited_from', ${con.escape(req.session.userID)}, 'invited_to', JSON_ARRAY()), 
					   JSON_OBJECT('type', 'g_cdq', 'g_id', null, 'data', JSON_ARRAY(
					   JSON_OBJECT('user_id', ${con.escape(req.session.userID)}, 'top_init', false, 'top', JSON_ARRAY(), 'price_init', false, 
					   'price', JSON_OBJECT('min', '$', 'max', '$$$$'), 'rating_init', false, 'rating', 0, 'reviews_init', false, 
					   'reviews', JSON_OBJECT('min', 10, 'max', 100), 'cities_init', false, 'cities', JSON_ARRAY()))), JSON_OBJECT('type', 'g_fav', 'data', JSON_ARRAY()), 
					   JSON_OBJECT('type', 'g_chat_log', 'data', JSON_ARRAY()), JSON_OBJECT('type', 'g_ping_log', 'g_id', null, 'data', JSON_ARRAY()), 
					   JSON_OBJECT('type', 'g_behavior_log', 'g_id', null, 'timestamp', JSON_OBJECT('initiated', ${Date.now()}, 'terminated', null), 'activities', JSON_ARRAY()),
					   JSON_ARRAY(${datetimesStr}))`
			con.query(sql, function(err, result){
				if(err){
					console.log(err)
					res.send(JSON.stringify({success: false}))
				}else{
					req.session.g_id = id
					res.send(JSON.stringify({success: true, g_id: id}))
				}
			})
		}
	});

	// post handler for group deletion in case user cancels group creation
	app.post('/delete_group', function(req, res){
		if(req.session.g_id){
			var sql = `DELETE FROM groups WHERE g_id=${con.escape(req.session.g_id)}`
			con.query(sql, function(err, result){
				delete req.session.g_id;
				res.send({success: true});
			})
		}else{
			res.send({success: true});
		}
	})

	// post handler to solidify group creation (send emails and deletes cookie/session group_id)
	app.post('/finish_group', function(req, res){
		var g_id = req.session.g_id;
		delete req.session.g_id;
		var userSql = `UPDATE users SET user_groups=JSON_ARRAY_APPEND(user_groups, '$.data', JSON_OBJECT('g_id', ${con.escape(g_id)}, 'last_access_time', CURRENT_TIMESTAMP)) 
						WHERE user_id=${con.escape(req.session.userID)}`
		con.query(userSql, function(err, result){
			if(err){
				console.log(err)
				res.send(JSON.stringify({success: false}))
			}else{
				res.send(JSON.stringify({success: true}));
			}
		})
		// [todo] handle the emails and emailing
	})


	// handler for updating user information
	app.post('/update_info', function(req, res){
		var data = req.body;
		var sql = `UPDATE users SET user_first_name=${con.escape(data.firstname)}, user_last_name=${con.escape(data.lastname)}, 
					user_home_address=${data.homeadd == "" ? 'NULL' : con.escape(data.homeadd)}, 
					user_office_address=${data.officeadd == "" ? 'NULL' : con.escape(data.officeadd)}`
		var sqlEnd = ` WHERE user_id=${con.escape(req.session.userID)}`;

		// if the profile image was changed
		if(data.filename){
			var img_dir = __dirname + "/../temp/" + data.filename;

			// move img file from temp to profile_imgs folder with new name
			var img_filename = "" + Date.now() + data.firstname[0] + data.lastname[0] + path.extname(img_dir);
			fs.readFile(img_dir, function(err, img){
				if (err) console.log(err);
				fs.writeFile(__dirname + "/../profile_imgs/" + img_filename, img, function(err){
					if (err) console.log(err);
					fs.unlink(img_dir, function(err){ if (err) console.log(err) });
				})
			})

			// delete old profile image
			con.query(`SELECT user_img_filename FROM users WHERE user_id=${con.escape(req.session.userID)}`, function(err, result){
				if(result.length > 0)
					fs.unlink(__dirname + '/../profile_imgs/' + result[0].user_img_filename, function(err){ if (err) console.log(err) });
			})
			sql += `, user_img_filename=${con.escape(img_filename)}`
		}

		// if the password was changed, update it
		if(data.pw){
			bcrypt.hash(data.pw, 10, function(err, hash){
				sql += `, user_pw=${con.escape(hash)}`;
				con.query(sql + sqlEnd, function(err, result){
					if (err)
						res.send({success: false})
					else
						res.send({success: true})
				})
			})
		}else{
			con.query(sql + sqlEnd, function(err, result){
				if (err)
					res.send({success: false})
				else
					res.send({success: true})
			})
		}
	})

	app.post('/logout', function(req, res){
		if(req.session.userID){
			var userSql = `UPDATE users SET user_time=CURRENT_TIMESTAMP WHERE user_id=${con.escape(req.session.userID)}`
			con.query(userSql, function(err, result){
				if(err)
					console.log(err)
				var deleteSql = `DELETE FROM sessions WHERE data->'$.userID'=${con.escape(req.session.userID)}`
				con.query(deleteSql, function(err, result){
					if(err)
						console.log(err)
					res.send()
				})
			})
		}
	})

}


function getMembersInfo(groups, index, con, res){
	if(index == groups.length)
		res.send(JSON.stringify(groups))
	else{
		groups[index].g_status = JSON.parse(groups[index].g_status)
		var invitedToList = groups[index].g_status.invited_to;
		var idList = "(" + con.escape(groups[index].g_status.invited_from);
		for(j = 0; j < invitedToList.length; j++){
			if(invitedToList[j].accepted)
				idList += ", " + con.escape(invitedToList[j].user_id)
		}
		idList += ")"
		var membersSql = `SELECT user_id, user_first_name, user_last_name, 
							user_img_filename FROM users WHERE user_id IN ${idList}`
		con.query(membersSql, function(err, result){
			groups[index].members = result;
			getMembersInfo(groups, index+1, con, res)
		})
	}
}