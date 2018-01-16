// js for EVENT_CREATE_READY.html
// Present a EVENT_CREATE_READY screen
var numOfEmails = 0;

$.ajax({
	url: "html/EVENT_CREATE_READY.html",
	dataType: "html",
	async: true,
	success: function (data){
		// update UI at #canvas
		var title = $("#input_title").val()
		var date = $("#input_date").val()
		var note = $("#input_note").val()
		$("#canvas").empty();
		$("#canvas").append(data);
		setTimeout(function(){
			// resize the divs
			var height_window = $(window).height();
			var width_window = $(window).width();
			var height_cont_right = $("#SCR_EVENT_CREATE_READY #right").height();
			var height_cont_left = $("#SCR_EVENT_CREATE_READY #left").height();
			var height_cont = height_cont_right;
			$("#SCR_EVENT_CREATE_READY #left").css("top", (height_cont_right-height_cont_left)/2);
			$("#SCR_EVENT_CREATE_READY").css("top", (height_window - height_cont)/2 - 30 + "px");
			$("#SCR_EVENT_CREATE_READY").css("left", (width_window - 800)/2 + "px");
			$(".credit").css("top", (height_window - 40) + "px");

			$("#event-title").text(title);
			$("#event-date").text(date);
			$("#event-note").text(note);
			$("#group_url").val("http://127.0.0.1/?group_id=" + window.localStorage.group_id);

			$(document).on("click", "#EVENT_CREATE", function(){
				offEvents_event_create_ready();
				loadScreen_event_create_ready($(this).attr("id"));
			});

			$(document).on("click", "#copy_url", function(){
				var $temp = $("<input>");
				$("body").append($temp);
				$temp.val($("#group_url").val()).select();
				document.execCommand("copy");
				$temp.remove();
			});

			$("#input_email").keyup(function(){
				$("#email-err-msg").hide();
				if($(this).val() != "")
					$(this).css("color", "#000");
				else
					$(this).css("color", "#aaa");
			})

			$(document).on("click", "#add_email", function(){
				var email = $("#input_email").val()
				var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
				if(re.test(email)){
					$("#email-list").append(`<div id="email${numOfEmails}"><span class="description"> ${email} <span class="email-remove" data-num="${numOfEmails}">remove</span></span></div>`)
					numOfEmails++;
					$("#input_email").val();
				}else{
					$("#email-err-msg").show();
				}
			});

			$(document).on("click", ".email-remove", function(){
				var num = $(this).data("num");
				$("#email"+num).remove();
			});

			// solidifies group creation and sends emails
			$(document).on("click", "#EVENT_CREATE_DONE", function(){
				finish_creation();
			});

			// Cancel
			$(document).on("click", "#DASHBOARD", function(){
				// delete group
				delete_group();
			});
			$("#canvas").animate({"opacity":1}, time_scr_fadein);
		}, time_scr_loadbuffer);
	},
	error: function (request, error){console.log(error)}
});

// Function: Loading different screens from EVENT_CREATE.html
function loadScreen_event_create_ready(screen_id){
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
function offEvents_event_create_ready(){
	$(document).off("click", "#EVENT_CREATE");
	$(document).off("click", "#EVENT_CREATE_DONE");
	$(document).off("click", "#copy_url");
	$(document).off("click", "#DASHBOARD");
	$(document).off("click", "#add_email");
	$(document).off("click", ".email-remove");
	$(window).unbind('beforeunload');
	$(window).unbind('unload');
}

// ajax post request to finish group creation
function finish_creation(){
	// [todo] handle sending emails to server
	var data = {}
	$("body").prepend("<div class='modal'></div>")
	$.ajax({
		type: 'POST',
		url: "/finish_group",
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data){
			if(data.success){
				console.log("group created")
				$(".modal").append(`<div id="popup_msg" class="modal-content" style="width: 470px"><h2> YOUR EVENT IS CREATED </h2>
					<p> You can arrange your event, '${$("#event-title").text()}'. 
					Share the link below </br>to arrange your event with your friends!</p>
					<div><span><input type="text" id="group_url" class="input_text" value="${$("#group_url").val()}" readonly/></span><!--
					--><span class="btn" id="copy_url" style="margin-left:0px;">COPY URL</span>
					</div><span class="btn" id="CONFIRM"> &#10004; PROCEED </span></div>`)
				$("#popup_msg").fadeIn(function(){
					$(document).on("click", "#CONFIRM", function(){
						//screen will be updated. Off events.
						offEvents_event_create_ready();
						$(document).off('click', '#CONFIRM');
						$(".modal").remove();
						loadScreen_event_create_ready("DASHBOARD");
					});
				});
			}else
				console.log("group not created, error")
		}
	})
}

function delete_group(){
	$.ajax({
		type: 'POST',
		url: '/delete_group',
		success: function(){
			offEvents_event_create_ready();
			loadScreen_event_create_ready("DASHBOARD");
		}
	})
}