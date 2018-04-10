// export controller to app.js
module.exports = function(app, con){
	// handlers to serve html files
	app.get('/main', function(req, res){
		if(req.session.userID){
			if(req.query.group_id){
				var selectSql = `SELECT g_status FROM groups WHERE g_id=${con.escape(req.query.group_id)} AND (JSON_LENGTH(g_status->'$.invited_to') < 9 OR 
																   JSON_SEARCH(g_status, 'one', ${con.escape(req.session.userID)}, NULL, '$.invited_to[*].user_id') IS NOT NULL 
																   OR g_status->'$.invited_from' = ${con.escape(req.session.userID)})`
				con.query(selectSql, function(err, result){
					if(err || result.length == 0)
						res.sendFile('err_index.html', {root: __dirname + '/../html'})
					else{
						var groupSql = `UPDATE groups SET g_status=JSON_ARRAY_APPEND(g_status, '$.invited_to', JSON_OBJECT('user_id', ${con.escape(req.session.userID)}, 'accepted', true))   
										WHERE g_id=${con.escape(req.query.group_id)} AND JSON_SEARCH(g_status, 'one', ${con.escape(req.session.userID)}, NULL, '$.invited_to[*].user_id') IS NULL 
										AND g_status->'$.invited_from' != ${con.escape(req.session.userID)}`
						con.query(groupSql, function(err, result){
							if (err)
								res.sendFile('alt_index.html', {root: __dirname + '/../html'})
							else{
								req.session.groupID = req.query.group_id;
								if(result.affectedRows != 0){
									var userSql = `UPDATE users SET user_groups = JSON_ARRAY_APPEND(user_groups, '$.data', JSON_OBJECT('g_id', ${con.escape(req.query.group_id)}, 'last_access_time', CURRENT_TIMESTAMP)) 
												   WHERE user_id=${con.escape(req.session.userID)} AND 
												   JSON_SEARCH(user_groups, 'one', ${con.escape(req.query.group_id)}, NULL, '$.data') IS NULL`
									con.query(userSql, function(err, result){
										res.sendFile('MAIN.html', {root: __dirname + '/../html'})
									})
								}else{
									res.sendFile('MAIN.html', {root: __dirname + '/../html'})
								}
							}
						})
					}
				})
			}else{
				res.sendFile('err_index.html', {root: __dirname + '/../html'});
			}
		}else{
			res.sendFile('index.html', {root: __dirname + '/../'});
		}
	});

	app.get('/get_group_cdqs', function(req, res){
		var sql = `SELECT g_title, g_cdq, g_status, g_types FROM groups WHERE g_id=${con.escape(req.session.groupID)}`;

		con.query(sql, function(err, result){
			if(err){
				console.log(err);
				res.send({})
			}else{
				var title = result[0].g_title
				var status = JSON.parse(result[0].g_status)
				var types = JSON.parse(result[0].g_types)
				var cdqData = JSON.parse(result[0].g_cdq).data;
				var invitedToList = status.invited_to;
				var idList = "(" + con.escape(status.invited_from);
				for(j = 0; j < invitedToList.length; j++){
					if(invitedToList[j].accepted)
						idList += ", " + con.escape(invitedToList[j].user_id)
				}
				idList += ")"
				var membersSql = `SELECT user_id, user_first_name, user_last_name, 
									user_img_filename FROM users WHERE user_id IN ${idList}`
				con.query(membersSql, function(err, result){
					var members = {}
					for(i = 0; i < result.length; i++){
						var member = result[i]
						members[member.user_id] = {firstname: member.user_first_name, lastname: member.user_last_name, filename: member.user_img_filename}
					}

					var alreadyAdded = false
					var group = []
					var user = {top: false, price: false, rating: -1, reviews: false, id: req.session.userID,
								firstname: members[req.session.userID].firstname, lastname: members[req.session.userID].lastname,
								filename: members[req.session.userID].filename,}
					for(i = 0; i < cdqData.length; i++){
						var cdqEntry = cdqData[i]
						// current user
						if(cdqEntry.user_id == req.session.userID){
							alreadyAdded = true;
							if(cdqEntry.top_init)
								user.top = cdqEntry.top
							if(cdqEntry.price_init)
								user.price = cdqEntry.price
							if(cdqEntry.rating_init)
								user.rating = cdqEntry.rating
							if(cdqEntry.reviews_init)
								user.reviews = cdqEntry.reviews
						}else{
							var temp = {top: false, price: false, rating: -1, reviews: false}
							if(cdqEntry.top_init)
								temp.top = cdqEntry.top
							if(cdqEntry.price_init)
								temp.price = cdqEntry.price
							if(cdqEntry.rating_init)
								temp.rating = cdqEntry.rating
							if(cdqEntry.reviews_init)
								temp.reviews = cdqEntry.reviews
							temp.id = cdqEntry.user_id
							temp.firstname = members[cdqEntry.user_id].firstname
							temp.lastname = members[cdqEntry.user_id].lastname
							temp.filename = members[cdqEntry.user_id].filename
							group.push(temp)
						}
					}
					if(!alreadyAdded){
						var addSql = `UPDATE groups SET g_cdq=JSON_ARRAY_APPEND(g_cdq, '$.data', JSON_OBJECT('user_id', ${con.escape(req.session.userID)}, 
												'top_init', false, 'top', JSON_ARRAY(), 'price_init', false, 'price', JSON_OBJECT('min', '$', 'max', '$$$$'),
												'rating_init', false, 'rating', 0, 'reviews_init', false, 'reviews', JSON_OBJECT('min', 10, 'max', 100), 
												'cities_init', false, 'cities', JSON_ARRAY())) 
									   WHERE g_id=${con.escape(req.session.groupID)}`
						con.query(addSql, function(err, result){
							if(err){
								console.log(err)
								res.send({})
							}else{
								res.send({id: {user: req.session.userID, group: req.session.groupID, title: title}, user: user, group: group, new: true, types: types});
							}
						})
					}else
						res.send({id: {user: req.session.userID, group: req.session.groupID, title: title}, user: user, group: group, new: false, types: types});
				})
			}
		})
	})

	// client sends the current index of the msg it got
	app.get("/get_msgs", function(req, res){
		var groupID = req.session.groupID
		if(groupID){
			var current_index = req.query.current_index;
			var sql = `SELECT g_chat_log->'$.data' FROM groups WHERE g_id=${con.escape(groupID)}`
			con.query(sql, function(err, result){
				if (err) console.log(err);
				var chatLog = JSON.parse(result[0]["g_chat_log->'$.data'"]);
				var length = chatLog.length;
				if(current_index == null)
					current_index = chatLog.length
				var newIndex;
				if(current_index < 20)
					newIndex = 0
				else
					newIndex = current_index - 20
				var result = chatLog.slice(newIndex, current_index)
				res.send([result, newIndex]);
			})
		}
	})

	app.post('/get_places', function(req, res){
		var data = req.body
		var sql = `SELECT p_top, p_data FROM places WHERE `
		if(data.topList){
			var strList = '(' + con.escape(data.topList[0])
			for(i = 1; i < data.topList.length; i++){
				strList += ', ' + con.escape(data.topList[i])
			}
			strList += ')'
			sql += `p_top IN ${strList} AND `
		}
		sql += `CAST(p_data->'$.data.google.price' AS decimal) BETWEEN ${con.escape(data.price.min)} AND ${con.escape(data.price.max)} AND
			CAST(p_data->'$.data.yelp.rating' AS decimal(10, 1)) >= ${con.escape(data.rating)} AND `

		sql += `CAST(p_data->'$.data.yelp.review_cnt' AS decimal) >= ${con.escape(data.reviews.min)}`
		if(data.reviews.max != 1001)
			sql +=  ` AND CAST(p_data->'$.data.yelp.review_cnt' AS decimal) <= ${con.escape(data.reviews.max)}`

		con.query(sql, function(err,result){
			if(err){
				console.log(err);
				res.send([])
			}else{
				var placesList = result.map(function(entry){
					var entryData = JSON.parse(entry.p_data).data
					return {id: entryData.yelp.id, top: entry.p_top, name: entryData.yelp.name, price: entryData.google.price, 
							rating: entryData.yelp.rating, reviews: entryData.yelp.review_cnt, address: entryData.yelp.address, photo: entryData.google.images, 
							lat: entryData.yelp.coord_lat, lng: entryData.yelp.coord_lng, phone: entryData.yelp.phone}
				})
				res.send(placesList)
			}
		})
	})

	app.get('/get_favorites', function(req, res){
		var sql = `SELECT fav_user_id, fav_place_id FROM favorites WHERE fav_g_id=${con.escape(req.session.groupID)}`
		con.query(sql, function(err, favs){
			if(err){
				console.log(err);
				res.send([])
			}else{
				var placeIDs = ''
				var idToUserMap = {}
				for(var i = 0; i < favs.length; i++){
					if(i != 0) 
						placeIDs += ", "
					placeIDs += favs[i].fav_place_id
					idToUserMap[favs[i].fav_place_id] = favs[i].fav_user_id
				}
				if(placeIDs !== ''){
					sql = `SELECT id, p_top, p_data FROM places WHERE id IN (${placeIDs})`
					con.query(sql, function(err, result){
						if(err){
							console.log(err);
							res.send([])
						}else{
							var placesList = result.map(function(entry){
								var entryData = JSON.parse(entry.p_data).data
								return {id: entryData.yelp.id, user: idToUserMap[entry.id], top: entry.p_top, name: entryData.yelp.name, price: entryData.google.price, 
										rating: entryData.yelp.rating, reviews: entryData.yelp.review_cnt, address: entryData.yelp.address, photo: entryData.google.images,
										lat: entryData.yelp.coord_lat, lng: entryData.yelp.coord_lng, phone: entryData.yelp.phone}
							})
							res.send(placesList)
						}
					})
				}else
					res.send([])
			}
		}) 
	})

	app.get("/get_pings", function(req, res){
		var groupID = req.session.groupID
		var userID = req.session.userID
		if(groupID){
			var sql = `SELECT * FROM pings WHERE ping_g_id=${con.escape(groupID)} AND (ping_from_id=${con.escape(userID)} OR ping_to_id=${con.escape(userID)})`
			con.query(sql, function(err, result){
				if (err) console.log(err);
				res.send(result)
			})
		}
	})

	app.post("/get_search_suggestions", function(req, res){
		var str = con.escape('%' + req.body.str.toLowerCase() + '%')
		var sql = `SELECT DISTINCT p_data->'$.data.yelp.name' FROM places WHERE LOWER(p_data->'$.data.yelp.name') LIKE ${str} LIMIT 10`
		con.query(sql, function(err, result){
			if (err) console.log(err);
			res.send(result.map(entry => entry["p_data->'$.data.yelp.name'"]));
		})
	})

	app.post('/search_place', function(req, res){
		var str = con.escape('%' + req.body.str.toLowerCase() + '%')
		var sql = `SELECT DISTINCT p_top, p_data FROM places WHERE LOWER(p_data->'$.data.yelp.name') LIKE ${str} LIMIT 1`

		con.query(sql, function(err,result){
			if(err){
				console.log(err);
				res.send(false)
			}else{
				if(result.length > 0){
					var entryData = JSON.parse(result[0].p_data).data
					res.send({id: entryData.yelp.id, top: result[0].p_top, name: entryData.yelp.name, price: entryData.google.price, 
							rating: entryData.yelp.rating, reviews: entryData.yelp.review_cnt, address: entryData.yelp.address, photo: entryData.google.images, 
							lat: entryData.yelp.coord_lat, lng: entryData.yelp.coord_lng, phone: entryData.yelp.phone})
				}else{
					res.send(false)
				}
			}
		})
	})
}