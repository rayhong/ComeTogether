// export controller to app.js
module.exports = function(app, con){
	// handlers to serve html files
	app.get('/main', function(req, res){
		if(req.session.userID){
			if(req.query.group_id){
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
			}else{
				res.sendFile('alt_index.html', {root: __dirname + '/../html'});
			}
		}else{
			res.sendFile('index.html', {root: __dirname + '/../'});
		}
	});

	app.get('/get_group_cdqs', function(req, res){
		var sql = `SELECT g_cdq, g_status FROM groups WHERE g_id=${con.escape(req.session.groupID)}`;

		con.query(sql, function(err, result){
			if(err) 
				console.log(err);
			else{
				var status = JSON.parse(result[0].g_status)
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
							if(err)
								console.log(err)
							else{
								res.send({id: {user: req.session.userID, group: req.session.groupID}, user: user, group: group, new: true});
							}
						})
					}else
						res.send({id: {user: req.session.userID, group: req.session.groupID}, user: user, group: group, new: false});
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
			if(err) 
				console.log(err);
			else{
				var placesList = result.map(function(entry){
					var entryData = JSON.parse(entry.p_data).data
					return {id: entryData.yelp.id, top: entry.p_top, name: entryData.yelp.name, price: entryData.google.price, 
							rating: entryData.yelp.rating, reviews: entryData.yelp.review_cnt, address: entryData.yelp.address}
				})
				res.send(placesList)
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
}