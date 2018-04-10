// js for DASHBOARD.html
// Present a DASHBOARD screen

var urlList = window.location.href.split('/')
if(urlList[3] !== '')
	window.location.href = window.location.href

$.ajax({
	url: "html/DASHBOARD.html",
	dataType: "html",
	async: true,
	success: function (data){
		$("#canvas").css("opacity",0);
		//Step 1. update UI at #canvas
		$("#canvas").empty();
		$("#canvas").append(data);
		setTimeout(function(){
			var socket = io();

			var height_doc = $(document).height();
			var height_cont = $("#SCR_DASHBOARD").height();
			var height_topbar = $("#top-bar").height()
			var height_top = $("#top").height()
			$("#bot").height(height_doc-height_topbar-$("#top-bar").outerHeight()-height_top);

			$('#event_title').keypress(function(e){
				if(e.keyCode == 13)
					$('#EVENT_CREATE').click()
			})

			// load user profile image, name and group information
			$.ajax({
				type: "GET",
				url: "/get_user_info",
				dataType: "json",
				success: function(data){
					$("#user-img").html('<img src="profile_imgs/' + data.filename + '"/>')
					$("#user-info").html('Howdy, ' + data.firstname)
					$("#info-widget").fadeIn()
					var stringList = "("
					var groupTimes = {};
					for(i = 0; i < data.groups.length; i++){
						if(i != 0)
							stringList += ", "
						stringList += `'${data.groups[i].g_id}'`
						groupTimes[data.groups[i].g_id] = data.groups[i].last_access_time;
					}
					stringList += ")"
					// [todo] get also last access time for each group and send to get_groups_info so can get num of messages
					$.ajax({
						type: "GET",
						url: "/get_group_info",
						data: {data: stringList},
						dataType: "json",
						success: function(groupList){
							if(groupList){
								$(".group_list").hide()
								for(i = 0; i < groupList.length; i++){
									var groupData = groupList[i]
									var numMsgs = getNumNewMsgs(new Date(groupTimes[groupData.g_id]), JSON.parse(groupData.g_chat_log).data)
									var images = ''
									var creatorName = ''
									for(j = 0; groupData.members && j < groupData.members.length ; j++){
										images += `<img src="profile_imgs/${groupData.members[j].user_img_filename}"/>`;
										if(groupData.members[j].user_id === groupData.g_status.invited_from)
											creatorName = groupData.members[j].user_first_name
									}
									var html = `<div class="group_entry" id=${groupData.g_id}>
													<h1><span class="group_title" ${groupData.members.length > 1 ? 'style="text-decoration: underline; cursor: pointer"' : ''}>${groupData.g_title}</span></h1>
													<h2>Created on ${groupData.g_status.creation_date.slice(0,10)} by ${creatorName}</h2>
													<p class='num_msgs_cont' ${numMsgs > 0 ? '' : 'hidden'}><span style="color: #f00"><span class="num_msgs">${numMsgs}</span> new messages </span>in this group after you left</p>
													<p class='imgs-cont'>${images}</p>
													${i == 0 ? `<p><span style="color: #f00">Group URL:</span> share the following URL with your </br>
																friends who will meet up in this event (up to 10)</p>` :
																''}
													<div style="margin-top: 5px">
														<span><input type="text" class="input_text copy_url" value="http://${ip_address}:8000/main?group_id=${groupData.g_id}" readonly/></span>
													</div>
													<span class="btn copy_btn" data-url="http://${ip_address}:8000/main?group_id=${groupData.g_id}"> COPY URL </span>
												</div>`
									$(".group_list").append(html);
								}

								$(".group_title").click(function(){
									if($(this).css('text-decoration').includes('underline'))
										window.location.href = `http://${ip_address}:8000/main?group_id=${$(this).parent().parent().attr('id')}`
								})

								$(".copy_btn").click(function(){
									var $temp = $("<input>");
									$("body").append($temp);
									$temp.val($(this).data("url")).select();
									document.execCommand("copy");
									$temp.remove();
								})

								$(".copy_url").click(function(){
									var $temp = $("<input>");
									$("body").append($temp);
									$temp.val($(this).val()).select();
									document.execCommand("copy");
									$temp.remove();
								})

								$(".group_list").fadeIn();
								$("#bot").height($(document).height()-height_topbar-$("#top-bar").outerHeight()-height_top);
							}else{
								$(".group_list").append(`<p style="color: #aaa; font-size: 20px; font-weight: lighter"> You have no events to show </p>`)
							}
							socket.emit('join all groups', {id: data.id, groups: Object.keys(groupTimes)})
						}
					})

					socket.on('new member', function(data){
						$('#' + data.groupID + ' .imgs-cont').append(`<img src="profile_imgs/${data.filename}"/>`)
						$('#' + data.groupID + ' .group_title').css({'text-decoration': 'underline', 'cursor': 'pointer'})
					})

					socket.on('new message', function(data){
						if(!$('#' + data.groupID + ' .num_msgs_cont').is(':visible'))
							$('#' + data.groupID + ' .num_msgs_cont').show()
						var numMsgs = parseInt($('#' + data.groupID + ' .num_msgs_cont .num_msgs').html())
						$('#' + data.groupID + ' .num_msgs_cont .num_msgs').html(numMsgs+1)
					})
				}
			})

			// go to settings page
			$(document).on("click", "#SETTINGS", function(){
				offEvents_dashboard();
				loadScreen_dashboard($(this).attr("id"));	
			})

			// go to group creation
			$(document).on("click", "#EVENT_CREATE", function(){
				//screen will be updated. Off events.
				offEvents_dashboard();
				loadScreen_dashboard($(this).attr("id"));
			});

			$("#canvas").animate({"opacity":1}, time_scr_fadein);
		}, time_scr_loadbuffer);
	},
	error: function (request, error){console.log(error)}
});

// Function: Loading different screens from DASHBOARD.html
function loadScreen_dashboard(screen_id){
	$("#canvas").animate({"opacity":0}, time_scr_fadeout, function(){
		$.ajax({
			url: "js/" + screen_id + ".js",
			dataType: "script",
			async: true,
			success: function (data){},
			error: function (request, error){console.log(error)}
		});		
	})
}

// Function: Off events, triggered once loading different screens
// T.B.D. including any event including in this screen should be offed in this function
function offEvents_dashboard(){
	$(document).off("click", "#EVENT_CREATE");
	$(document).off("click", "#SETTINGS");
	$(document).off("click", ".participate_btn");
	$(document).off("click", ".leave_btn");
	$(document).off("click", ".copy_url")
}

function getNumNewMsgs(logoutTime, chatLog){
	var result = 0;
	for(var i = chatLog.length - 1; i >= 0; i--){
		var msgTime = new Date(chatLog[i].timestamp)
		if(logoutTime.getTime() <= msgTime.getTime())
			result++;
		else
			break;
	}
	return result;
}