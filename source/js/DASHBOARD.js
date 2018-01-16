// js for DASHBOARD.html
// Present a DASHBOARD screen

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
			var height_doc = $(document).height();
			var height_cont = $("#SCR_DASHBOARD").height();
			var height_topbar = $("#top-bar").height()
			var height_top = $("#top").height()
			$("#bot").height(height_doc-height_topbar-$("#top-bar").outerHeight()-height_top);

			$("#event_title").keyup(function(){
				$(this).val() != "" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
			})

			// load user profile image, name and group information
			$.ajax({
				type: "GET",
				url: "/get_user_info",
				dataType: "json",
				success: function(data){
					$("#user-img").html('<img src="profile_imgs/' + data.filename + '"/>')
					$("#user-info").html('Howdy, ' + data.name)
					$("#info-widget").fadeIn()
					$.ajax({
						type: "GET",
						url: "/get_group_info",
						data: {data: data.groups},
						dataType: "json",
						success: function(groupList){
							if(groupList){
								$(".group_list").hide()
								for(i = 0; i < groupList.length; i++){
									var groupData = groupList[i]
									var images = ''
									for(j = 0; groupData.members && j < groupData.members.length ; j++){
										images += `<img src="profile_imgs/${groupData.members[j].user_img_filename}"/>`;
									}
									var html = `<div class="group_entry">
													<h1>
														<span class="group_title">${groupData.g_title}</span> on ${groupData.g_date.slice(0,10)}
													</h1>
													<p>
														<span class="num_msgs"> (not imple) new messages </span>in this group
													</p>
													<p>
														${groupData.g_info}
													</p>
													<p>
														${images}
													</p>
													<span class="btn"> PARTICIPATE </span>
													<span class="btn"> LEAVE THIS GROUP </span>
												</div>`
									$(".group_list").append(html);
								}
								$(".group_list").fadeIn();
								$("#bot").height($(document).height()-height_topbar-$("#top-bar").outerHeight()-height_top);
							}else{
								$(".group_list").append(`<p style="color: #aaa; font-size: 20px; font-weight: lighter"> You have no events to show </p>`)
							}
						}
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
	// [todo] need to off everything in the screen (including each button for each group entry)
}