$(document).ready(function(){
	$('.input-chat').keydown(function(e){
		if(e.keyCode == 13 && !e.shiftKey){
			e.preventDefault()
			var msg = $.trim($(this).val())
			if(msg !== ''){
				socket.emit('new message', msg);
				var date = new Date()
				var dateStr = getDate(date)
				var msgGroupId = 'msg-group-' + dateStr.slice(0, dateStr.length-6)
				if($('#' + msgGroupId).length == 0)
					$("#msg-list").append(`<div id='${msgGroupId}'><div class='date-separation'>${dateStr}</div></div>`)
				$("#" + msgGroupId).append(`<div class='msg-entry'>
												<div class='msg-pic-section'><img src='profile_imgs/${members[0].filename}' style='border-color:${colors[0]}'/></div>
												<div class='msg-text-section'>
													<h1>${members[0].firstname} ${members[0].lastname} <span class='msg-date'>${getTime(date)}</span></h1>
													<p>${highlightMention(msg)}</p>
												</div>
											</div>`);
		        $("#right .column-content").animate({scrollTop: $('#right .column-content').prop("scrollHeight")}, 500)
				$(this).val('')
			}
		}

		if($(this).prop('scrollHeight') - 11 < 115){
			$(this).css('overflow-y', 'hidden')
			$(this).height(15)
			$(this).height($(this).prop('scrollHeight') - 11)
			inputHeight = $(this).outerHeight()
			var windowHeight = $(window).height();
			$('#right > .column-content').height(windowHeight - 110 - 110 - inputHeight - 6)
			if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
				$('#right > .column-content').css('overflow-y', 'scroll')
			else
				$('#right > .column-content').css('overflow-y', 'hidden')
		}else
			$(this).css('overflow-y', 'auto')

	})
	$('.input-chat').keyup(function(){
		if($(this).prop('scrollHeight') - 11 < 115){
			$(this).css('overflow-y', 'hidden')
			$(this).height(15)
			$(this).height($(this).prop('scrollHeight') - 11)
			inputHeight = $(this).outerHeight()
			var windowHeight = $(window).height();
			$('#right > .column-content').height(windowHeight - 110 - 110 - inputHeight - 6)
			if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
				$('#right > .column-content').css('overflow-y', 'scroll')
			else
				$('#right > .column-content').css('overflow-y', 'hidden')
		}else
			$(this).css('overflow-y', 'auto')
	})

	$("#right .column-content").scroll(function(){
		if($(this).scrollTop() == 0){
			if(currentMsgIndex != 0){
				var firstMsg = $('.msg-entry:first-child')[0] != null ? $('.msg-entry:first-child') : $('.msg-entry:nth-child(2)')
				$("#load-more").html("Loading...")
				$.ajax({
					type: 'GET',
					url: "/get_msgs?current_index=" + currentMsgIndex,
					dataType: 'json',
					success: function(data){
						var msgs = data[0]
						currentMsgIndex = data[1]
						for(i= msgs.length - 1; i >= 0; i--){
							var entry = msgs[i];
							var date = new Date(entry.timestamp)
							var dateStr = getDate(date)
							var msgGroupId = 'msg-group-' + dateStr.slice(0, dateStr.length-6)
							if($('#' + msgGroupId).length == 0){
								$("#msg-list").append(`<div id='${msgGroupId}'><div class='date-separation'>${dateStr}</div></div>`)
								$("#right .column-content").scrollTop(firstMsg[0].offsetTop - $('#right .column-content')[0].offsetTop)
							}
							if(entry.user_id === userCDQ.id){
								$(`<div class='msg-entry'>
										<div class='msg-pic-section'><img src='profile_imgs/${members[0].filename}' style='border-color:${colors[0]}'/></div>
										<div class='msg-text-section'>
											<h1>${members[0].firstname} ${members[0].lastname} <span class='msg-date'>${getTime(date)}</span></h1>
											<p>${highlightMention(entry.txt)}</p>
										</div>
									</div>`).insertAfter('#' + msgGroupId + " > .date-separation")
								$("#right .column-content").scrollTop(firstMsg[0].offsetTop - $('#right .column-content')[0].offsetTop)
							}else{
								var index = members.findIndex(function(member){
									return this.id === member.id
								}, {id: entry.user_id})
								$(`<div class='msg-entry'>
										<div class='msg-pic-section'><img src='profile_imgs/${members[index].filename}' style='border-color:${colors[index]}'/></div>
										<div class='msg-text-section'>
											<h1>${members[index].firstname} ${members[index].lastname} <span class='msg-date'>${getTime(date)}</span></h1>
											<p>${highlightMention(entry.txt)}</p>
										</div>
									</div>`).insertAfter('#' + msgGroupId + " > .date-separation")
								$("#right .column-content").scrollTop(firstMsg[0].offsetTop - $('#right .column-content')[0].offsetTop)
							}
						}
						$("#load-more").fadeOut(200, function(){
							if(currentMsgIndex != 0){
								$("#load-more").html("Scroll up to Load More Messages");
								$("#load-more").show()
							}
						});
					}
				})
			}
		}
	})

	// Change view from chat to pings, and back
	$('input[type=radio][name=msgs-list]').change(function(){
		if(this.value === 'chat'){
			$('#chat-container').show()
			$('.input-chat').show()
			$('#ping-container').hide()
		}else if(this.value === 'ping'){
			$('#chat-container').hide()
			$('.input-chat').hide()
			$('#ping-container').show()
		}
		if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
			$('#right > .column-content').css('overflow-y', 'scroll')
		else
			$('#right > .column-content').css('overflow-y', 'hidden')
	})

})

function highlightMention(msg){
	var result = ''
	while(msg && msg.indexOf('@') != -1){
		var startIndex = msg.indexOf('@')
		var endIndex;
		var i;
		for(i = startIndex + 1; i < msg.length; i++){
			if(msg[i] == ' ')
				break;
		}
		endIndex = i
		var mention = msg.slice(startIndex, endIndex)
		var userIndex = -1;
		for(i = 0; i < members.length; i++){
			var member = members[i]
			if('@' + member.firstname.toLowerCase() + member.lastname[0].toLowerCase() === mention.toLowerCase()){
				userIndex = i
				break;
			}
		}
		result += msg.slice(0, startIndex)
		if(userIndex != -1){
			result += `<span style='color: ${colors[userIndex]}'>${mention}</span>`
		}else{
			result += mention
		}
		msg = msg.slice(endIndex, msg.length);
	}
	return result + msg
}


// PINGS
function acceptPing(category, option){
	socket.emit('accept ping', {category: category, option: option})

	if(category === 'top'){
		var topData = option.split('_')

		// trigger click on relevant category
		if(!userCDQ.top.includes(option))
			$('#top-type-' + topData[0] + ' #top-group-' + topData[1] + ' .check-box').trigger('click')
	}else if(category === 'price'){
		option = option.length
		var target = $('#top-handle')
		var newPosition = 1 + 26*(4-option)
		if(userCDQ.price.min.length > option){
			target = $('#bot-handle')
			newPosition += 26
		}

		changePriceDisplay(target, newPosition)
	}else if(category === 'rating'){
		option = option/1
		if($('#rating-no-pref').is(':checked')){
			$('#rating-no-pref').prop('checked', false)
			$('#rating-sel-area').css('fill', '#AEC7E8')
			$('#rating-sel-area-agreed').css('fill', '#1F77B5')
			userCDQ.rating = option
			ratingAgreements[5]--;
			updateRatingAgreement(5, userCDQ.rating)
		}else{
			oldRating = userCDQ.rating
			updateRatingAgreement(userCDQ.rating, option)
			userCDQ.rating = option
		}
		$('#rating-sel-area').attr('height', (minToRatingIndex(userCDQ.rating)+1)*26)
		socket.emit('rating change', userCDQ.rating)
		$('#rating-handle').attr('y', 26*(5-userCDQ.rating) + 1)

        var userRating = userCDQ.rating == -1 ? 4 : minToRatingIndex(userCDQ.rating)
        for(var i = 0; i < 5; i++){
            if(i <= userRating){
                $('[id^=ping-rating-' + minToRatingIndex(i) + ']').css({'opacity': 1, 'cursor': 'pointer'})
            }else{
                $('[id^=ping-rating-' + minToRatingIndex(i) + ']').css({'opacity': 0, 'cursor': 'auto'})
            }
        }

		getLocations()
	}else if(category === 'review'){
		var target = $('#review-top-handle')
		var newPosition = 1 + 26*reviewToIndex(option)
		if(userCDQ.reviews.min > option)
			target = $('#review-bot-handle')

		changeReviewDisplay(target, newPosition)
	}

	$('.ping-' + category + '-' + option).remove(); 
	var pingLeft = $('#ping-unanswered').html().split(' ')[0].slice(1)/1 - 1
	if(pingLeft == 0)
		$('#ping-unanswered').html('')
	else
		$('#ping-unanswered').html('(' + pingLeft + ' unanswered)')

	if($('#right > .column-content')[0].scrollHeight <= $('#right > .column-content').height())
		$('#right > .column-content').css('overflow-y', 'hidden')
	if($('#received-pings').height() == 0)
		$("#received-pings .nothing-msg").show()
}

function rejectPing(senderID, category, option){
	socket.emit('reject ping', {senderID: senderID, category: category, option: option})

	if(category === 'price')
		$('.ping-' + category + '-' + option.length + '[data-sender="' + senderID + '"]').remove(); 
	else
		$('.ping-' + category + '-' + option + '[data-sender="' + senderID + '"]').remove(); 
	if($('#right > .column-content')[0].scrollHeight <= $('#right > .column-content').height())
		$('#right > .column-content').css('overflow-y', 'hidden')
	if($('#received-pings').height() == 0)
		$("#received-pings .nothing-msg").show()
}


/*
	app.get("/get_msgs", function(req, res){
		var group_id = req.query.group_id
		var current_index = req.query.current_index;
		var sql = `SELECT g_chat_log->'$.data' FROM groups WHERE g_id='${group_id}'`
		con.query(sql, function(err, result){
			if (err) throw err;
			var chatLog = JSON.parse(result[0]["g_chat_log->'$.data'"]);
			var length = chatLog.length;
			if(current_index == null)
				current_index = chatLog.length
			var newIndex;
			if(current_index < 15)
				newIndex = 0
			else
				newIndex = current_index - 15
			var result = chatLog.slice(newIndex, current_index)
			res.send([result, newIndex]);
		})
	})

// returns the number of new msgs
// [todo] can be used to return all new messages if there are more than 15 new messages
function getNewMsgNum(groups, date){
	for(i = 0; i < groups.length; i++){
		var chatLog = JSON.parse(groups[i].g_chat_log).data
		var index = chatLog.length - 1;
		var total = 0;
		while(index >= 0 && date < (new Date(chatLog[index].timestamp).getTime())){
			index--;
			total++
		}
		delete groups[i].g_chat_log;
		groups[i].numMsgs = total;
	}
	return groups;
}

$.ajax({
	type: 'GET',
	url: '/get_user_info',
	dataType: 'json',
	success: function(userInfo){
		$.ajax({
			type: 'GET',
			url: '/get_group_info',
			data: {data: [currentGroup]},
			dataType: 'json',
			success: function(groupList){
				if(groupList){
					// [todo] probably need to store groupID as well
					var groupData = groupList[0];
					currentUser = userInfo.id
					members = objectifyMembersList(groupData.members);
					socket.emit('join group', {userID: userInfo.id, groupID: groupData.g_id})
					$.ajax({
						type: 'GET',
						url: "/get_msgs?group_id=" + currentGroup,
						dataType: 'json',
						success: function(data){
							var msgs = data[0]
							currentIndex = data[1]
							for(i=0; i < msgs.length; i++){
								var entry = msgs[i];
								if(entry.user_id === currentUser)
									$("#msgs").append('<div class="msg-right"><p class="speech-right">' + entry.txt + '</p></div>')
								else
									$("#msgs").append('<div class="msg-left"><img src="profile_imgs/' + members[entry.user_id].filename + '"/><p class="speech-left">' + entry.txt + '</p></div>')
							}
							if(currentIndex == 0)
								$("#load_more").hide();
							$("#messages").scrollTop($("#messages")[0].scrollHeight)
						}
					})
				}
			}
		})
	}
})

// [todo] need a json get request to display past messages
// would work with the req.session.groupID

// [todo] need to go through stored chat log and show older msgs (not json request) if user scrolls over (need more messages)
$("#messages").scroll(function(){
	if($(this).scrollTop() == 0){
		var firstMsg = $(".msg-right:first-child").position() != null ? $(".msg-right:first-child") : $(".msg-left:first-child");
		if(currentIndex != 0){
			$("#load_more").html("Loading...")
			$.ajax({
				type: 'GET',
				url: "/get_msgs?group_id=" + currentGroup + "&current_index=" + currentIndex,
				dataType: 'json',
				success: function(data){
					var msgs = data[0]
					currentIndex = data[1]
					var html = ""
					for(i=0; i < msgs.length; i++){
						var entry = msgs[i];
						if(entry.user_id === currentUser)
							html += '<div class="msg-right"><p class="speech-right">' + entry.txt + '</p></div>'
						else
							html += '<div class="msg-left"><img src="profile_imgs/' + members[entry.user_id].filename + '"/><p class="speech-left">' + entry.txt + '</p></div>'
					}
					$("#load_more").fadeOut(200, function(){
						$("#msgs").prepend(html);
						$("#messages").scrollTop(firstMsg.position().top)
						if(currentIndex != 0){
							$("#load_more").html("Scroll up to Load More Messages");
							$("#load_more").show()
						}
					});
				}
			})
		}
	}
})


// display message received
socket.on('chat message', function(data){
	$('#msgs').append('<div class="msg-left"><img src="profile_imgs/' + members[data.id].filename + '"/><p class="speech-left">'+data.message +'</p></div>');
	$("#messages").animate({scrollTop: $('#messages').prop("scrollHeight")}, 500)
})

*/