module.exports = function(server, con){
	var io = require('socket.io').listen(server)
	io.on('connection', function(socket){
		//console.log('a user connected');

		socket.on('join all groups', function(data){
			socket.userID = data.id
			for(i = 0; i < data.groups.length; i++)
				socket.join(data.groups[i])
			socket.groups = data.groups;
		})

		socket.on('join group', function(data){
			socket.userID = data.userID
			socket.groupID = data.groupID
			socket.join(data.groupID)
		})

		socket.on('new member', function(data){
			socket.broadcast.to(socket.groupID).emit('new member', {id: socket.userID, firstname: data.firstname, lastname: data.lastname, filename: data.filename, groupID: socket.groupID})
		})

		socket.on('top change', function(data){
			socket.broadcast.to(socket.groupID).emit('top change', {id: socket.userID, topId: data.topId, change: data.change})
			var sql;
			if(data.change > 0)
				sql = `UPDATE groups SET g_cdq=JSON_ARRAY_APPEND(g_cdq, 'xxxx.top', ${con.escape(data.topId)}) WHERE g_id=${con.escape(socket.groupID)}`
			else
				sql = `UPDATE groups SET g_cdq=JSON_REMOVE(g_cdq, 
						TRIM(BOTH '"' FROM JSON_SEARCH(g_cdq, 'one', ${con.escape(data.topId)}, NULL, 'xxxx.top'))) 
						WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('top change all', function(data){
			socket.broadcast.to(socket.groupID).emit('top change all', {id: socket.userID, change: data.change})
			var sql;
			if(data.change > 0)
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.top_init', false, 'xxxx.top', JSON_ARRAY()) WHERE g_id=${con.escape(socket.groupID)}`
			else
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.top_init', true, 'xxxx.top', JSON_ARRAY()) WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('price change', function(data){
			var sql;
			if(!data.noPref){
				socket.broadcast.to(socket.groupID).emit('price change', {id: socket.userID, noPref: false, min: data.min, max: data.max})
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.price_init', true, 
						'xxxx.price', JSON_OBJECT('min', ${con.escape(data.min)}, 'max', ${con.escape(data.max)}))
						WHERE g_id=${con.escape(socket.groupID)}`
			}else{
				socket.broadcast.to(socket.groupID).emit('price change', {id: socket.userID, noPref: true})
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.price_init', false) WHERE g_id=${con.escape(socket.groupID)}`
			}
			getPathAndQuery(sql, socket, con)
		})

		socket.on('rating change', function(rating){
			socket.broadcast.to(socket.groupID).emit('rating change', {id: socket.userID, rating: rating})
			var sql;
			if(rating != -1){
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.rating_init', true, 'xxxx.rating', ${con.escape(rating)})
						WHERE g_id=${con.escape(socket.groupID)}`
			}else
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.rating_init', false) WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('review change', function(data){
			var sql;
			if(!data.noPref){
				socket.broadcast.to(socket.groupID).emit('review change', {id: socket.userID, noPref: false, min: data.min, max: data.max})
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.reviews_init', true, 
						'xxxx.reviews', JSON_OBJECT('min', ${con.escape(data.min)}, 'max', ${con.escape(data.max)}))
						WHERE g_id=${con.escape(socket.groupID)}`
			}else{
				socket.broadcast.to(socket.groupID).emit('review change', {id: socket.userID, noPref: true})
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.reviews_init', false) WHERE g_id=${con.escape(socket.groupID)}`
			}
			getPathAndQuery(sql, socket, con)
		})

		socket.on('city change', function(data){
			socket.broadcast.to(socket.groupID).emit('city change', {id: socket.userID, cityId: data.cityId, change: data.change})
			var sql;
			if(data.change > 0)
				sql = `UPDATE groups SET g_cdq=JSON_ARRAY_APPEND(g_cdq, 'xxxx.cities', ${con.escape(data.cityId)}) WHERE g_id=${con.escape(socket.groupID)}`
			else
				sql = `UPDATE groups SET g_cdq=JSON_REMOVE(g_cdq, 
						TRIM(BOTH '"' FROM JSON_SEARCH(g_cdq, 'one', ${con.escape(data.cityId)}, NULL, 'xxxx.cities'))) 
						WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('city change all', function(data){
			socket.broadcast.to(socket.groupID).emit('city change all', {id: socket.userID, change: data.change})
			var sql;
			if(data.change > 0)
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.cities_init', false, 'xxxx.cities', JSON_ARRAY()) WHERE g_id=${con.escape(socket.groupID)}`
			else
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.cities_init', true, 'xxxx.cities', JSON_ARRAY()) WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('datetime change', function(data){
			socket.broadcast.to(socket.groupID).emit('datetime change', {id: socket.userID, datetimeId: data.datetimeId, change: data.change})
			var sql;
			if(data.change > 0)
				sql = `UPDATE groups SET g_cdq=JSON_ARRAY_APPEND(g_cdq, 'xxxx.datetime', ${con.escape(data.datetimeId)}) WHERE g_id=${con.escape(socket.groupID)}`
			else
				sql = `UPDATE groups SET g_cdq=JSON_REMOVE(g_cdq, 
						TRIM(BOTH '"' FROM JSON_SEARCH(g_cdq, 'one', ${con.escape(data.datetimeId)}, NULL, 'xxxx.datetime'))) 
						WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('datetime change all', function(data){
			socket.broadcast.to(socket.groupID).emit('datetime change all', {id: socket.userID, change: data.change})
			var sql;
			if(data.change > 0)
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.datetime_init', false, 'xxxx.datetime', JSON_ARRAY()) WHERE g_id=${con.escape(socket.groupID)}`
			else
				sql = `UPDATE groups SET g_cdq=JSON_SET(g_cdq, 'xxxx.datetime_init', true, 'xxxx.datetime', JSON_ARRAY()) WHERE g_id=${con.escape(socket.groupID)}`
			getPathAndQuery(sql, socket, con)
		})

		socket.on('new message', function(msg){
			var sql = `UPDATE groups SET g_chat_log=JSON_ARRAY_APPEND(g_chat_log, '$.data', 
						JSON_OBJECT('user_id', ${con.escape(socket.userID)}, 'timestamp', CURRENT_TIMESTAMP, 'txt', ${con.escape(msg)})) 
						WHERE g_id=${con.escape(socket.groupID)}`
			con.query(sql, function(err, result){
				if (err) console.log(err);
				socket.broadcast.to(socket.groupID).emit('new message', {id: socket.userID, msg: msg, groupID: socket.groupID});			
			})
		})

		socket.on('new ping', function(data){
			// cdq_action: 'top': id, 'price': '$', 'rating': '4', 'reviews': 1000
			// for the ranges: make the other user reach the range
			insertAndSendPing(con, socket, data.id, data.category, data.option)
		})

		socket.on('new ping candidate', function(data){
			// cdq_action: 'top': id, 'price': '$', 'rating': '4', 'reviews': 1000
			// for the ranges: make the other user reach the range
			var categories = Object.keys(data)
			for(var i = 0; i < categories.length; i++){
				if(categories[i] !== 'id')
					insertAndSendPing(con, socket, data.id, categories[i], data[categories[i]])
			}
		})

		socket.on('accept ping', function(data){
			var sql = `UPDATE pings SET ping_accepted=true WHERE ping_g_id=${con.escape(socket.groupID)} AND ping_to_id=${con.escape(socket.userID)}
		 			   AND ping_cdq_action->'$.${data.category}'=${con.escape(data.option)} AND ping_accepted IS NULL`
			con.query(sql, function(err, result){
				if (err) console.log(err);
				if(result.affectedRows)
					socket.broadcast.to(socket.groupID).emit('accept ping', {receiverID: socket.userID, category: data.category, option: data.option})
			})
		})

		socket.on('reject ping', function(data){
			var sql = `UPDATE pings SET ping_accepted=false WHERE ping_g_id=${con.escape(socket.groupID)} AND ping_to_id=${con.escape(socket.userID)}
		 			   AND ping_cdq_action->'$.${data.category}'=${con.escape(data.option)} AND ping_from_id=${con.escape(data.senderID)} AND
		 			   ping_accepted IS NULL`
			con.query(sql, function(err, result){
				if (err) console.log(err);
				if(result.affectedRows)
					socket.broadcast.to(socket.groupID).emit('reject ping', {senderID: data.senderID, receiverID: socket.userID, category: data.category, option: data.option})
			})
		})

		socket.on('add fav', function(placeID){
			var sqlsearch = `SELECT id, p_top, p_data FROM places WHERE p_data->'$.data.yelp.id'=${con.escape(placeID)}`
			con.query(sqlsearch, function(err, placeInfo){
				if(placeInfo.length > 0){
					var sql = `INSERT INTO favorites (fav_g_id, fav_user_id, fav_place_id) VALUES (${con.escape(socket.groupID)}, ${con.escape(socket.userID)}, ${placeInfo[0].id})`
					con.query(sql, function(err, result){
						if (err)
							console.log(err)
						else{
							var entryData = JSON.parse(placeInfo[0].p_data).data
							io.in(socket.groupID).emit('add fav', {user: socket.userID, id: entryData.yelp.id, top: placeInfo[0].p_top, name: entryData.yelp.name, 
																   price: entryData.google.price, rating: entryData.yelp.rating, reviews: entryData.yelp.review_cnt, 
																   address: entryData.yelp.address, photo: entryData.google.images,
																   lat: entryData.yelp.coord_lat, lng: entryData.yelp.coord_lng, phone: entryData.yelp.phone})
						}
					})
				}
			})
		})

		socket.on('remove fav', function(placeID){
			var sqlsearch = `SELECT id FROM places WHERE p_data->'$.data.yelp.id'=${con.escape(placeID)}`
			con.query(sqlsearch, function(err, placeInfo){
				if(placeInfo.length > 0){
					var sql = `DELETE FROM favorites WHERE fav_g_id=${con.escape(socket.groupID)} AND fav_user_id=${con.escape(socket.userID)} AND fav_place_id=${placeInfo[0].id}`
					con.query(sql, function(err, result){
						if (err) 
							console.log(err)
						else
							socket.broadcast.to(socket.groupID).emit('remove fav', placeID)
					})
				}
			})
		})

		socket.on('add datetime', function(datetime){
			var sql = `UPDATE groups SET g_datetimes=JSON_ARRAY_APPEND(g_datetimes, '$', ${con.escape(datetime)}) WHERE g_id=${con.escape(socket.groupID)} AND 
					   JSON_CONTAINS(g_datetimes, ${con.escape(datetime)})=0`
			con.query(sql, function(err, result){
				if(err)
					console.log(err)
				else
					io.in(socket.groupID).emit('add datetime', datetime)
			})
		})

		socket.on('disconnect', function(){
			if(socket.groupID){
				var sql = `UPDATE users SET user_groups=JSON_SET(user_groups, CONCAT(TRIM(TRAILING '.g_id' FROM TRIM(BOTH '"' FROM 
							JSON_SEARCH(user_groups, 'one', ${con.escape(socket.groupID)}, NULL, '$.data[*].g_id'))), '.last_access_time'), CURRENT_TIMESTAMP) 
							WHERE user_id=${con.escape(socket.userID)}`
				con.query(sql, function(err, result){
					if (err) console.log(err);
				})
				socket.leave(socket.groupID)
			}else{
				for(i = 0; socket.groups && i < socket.groups.length; i++)
					socket.leave(socket.groups[i])
			}
		})
	})
}


function getPathAndQuery(sql, socket, con){
	if(socket.path){
		sql = sql.replace(/xxxx/g, socket.path)
		con.query(sql, function(err, result){
			if(err) console.log(err)
		})
	}else{
		var searchSql = `SELECT JSON_SEARCH(g_cdq, 'one', ${con.escape(socket.userID)}, NULL, '$.data[*].user_id') FROM groups WHERE g_id=${con.escape(socket.groupID)}`;
		con.query(searchSql, function(err, result){
			if(err)
				console.log(err)
			else{
				var path =  Object.keys(result[0]).map(k => result[0][k])[0]

				path = path.slice(1, path.length - 9)
				socket.path = path;
				sql = sql.replace(/xxxx/g, socket.path)
				con.query(sql, function(err, result){
					if(err) console.log(err)
				})
			}
		})
	}
}

function insertAndSendPing(con, socket, receiverID, category, option){
	// cdq_action: 'top': id, 'price': '$', 'rating': '4', 'reviews': 1000
	// for the ranges: make the other user reach the range
	var sql = `INSERT INTO pings (ping_g_id, ping_from_id, ping_to_id, ping_notified, ping_cdq_action) SELECT 
			   ${con.escape(socket.groupID)}, ${con.escape(socket.userID)}, ${con.escape(receiverID)}, false, 
			   JSON_OBJECT(${con.escape(category)}, ${con.escape(option)}) WHERE NOT EXISTS 
			   (SELECT id FROM pings WHERE ping_g_id=${con.escape(socket.groupID)} AND ping_from_id=${con.escape(socket.userID)} 
			   AND ping_to_id=${con.escape(receiverID)} AND ping_cdq_action->'$.${category}'=${con.escape(option)} AND
			   ping_accepted IS NULL)`
			   
	con.query(sql, function(err, result){
		if (err) console.log(err);
		if(result.affectedRows)
			socket.broadcast.to(socket.groupID).emit('new ping', {senderID: socket.userID, receiverID: receiverID, category: category, option: option})
	})
}