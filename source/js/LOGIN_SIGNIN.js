// js for LOGIN_SIGNIN.html
// Present a LOGIN_SIGNIN screen

$("#canvas").css("opacity",0);
$.ajax({
	url: "html/LOGIN_SIGNIN.html",
	dataType: "html",
	async: true,
	success: function (data){
		//Step 1. update UI at #canvas
		$("#canvas").empty();
		$("#canvas").append(data);
		setTimeout(function(){
			//Step 2. resize the divs
			var height_window = $(window).height();
			var height_cont = $("#SCR_LOGIN_SIGNIN").height();
			$("#SCR_LOGIN_SIGNIN").css("top", (height_window - height_cont)/2 - 30 + "px");
			$(".credit").css("top", (height_window - 40 - height_cont) + "px");

			//Step 3. add event handler
			//3-0. checking module
			//T.B.D: develop ID PW checking module.
			//Check inputs. Chnage class of the Sign up btn (#DASHBOARD) to "btn" if everything is okay.)
			//3-1. click a cancel button

			// verifying fields are filled and if they are make login button clickable
			$("#input_id").keyup(function(){
				if($(this).val() != "")
					$(this).css("color", "#000");
				else
					$(this).css("color", "#aaa");
				verify_filled();
			})
			$("#input_pw").keyup(function(){
				if($(this).val() != "")
					$(this).css("color", "#000");
				else
					$(this).css("color", "#aaa");
				verify_filled();
			})

			$(document).on("click", "#LOGIN_INIT", function(event){
				//screen will be updated. Off events.
				offEvents_login_signin();
				loadScreen_login_signin($(this).attr("id"));
			})
			//3-2. click a sign-in button
			$(document).on("click", "#DASHBOARD", function(event){
				//screen will be updated. Off events.
				if($(this).attr("class") == "btn"){
					// lets login if correct info, else display message in console
					verify_info();
				}
				else{console.log("not ready for registration.");}
			})			
			$("#canvas").animate({"opacity":1}, time_scr_fadein);
		}, time_scr_loadbuffer);
	},
	error: function (request, error){console.log(error)}
});

// Function: Loading different screens from LOGIN_SIGNIN.html
function loadScreen_login_signin(screen_id){
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
function offEvents_login_signin(){
	$(document).off("click", "#LOGIN_INIT");
	$(document).off("click", "#DASHBOARD");
}

// verifies fields are filled and if they are change button
function verify_filled(){
	if($("#input_id").val() != "" && $("#input_pw").val() != "")
		$("#DASHBOARD").attr("class", "btn");
	else if($("#DASHBOARD").attr('class') == "btn")
		$("#DASHBOARD").attr("class", "btn_dis");
}

// verifies user information through the database
function verify_info(){
	var data = {"id": $("#input_id").val(), "pw": $("#input_pw").val()};
	$.ajax({
		type: 'POST',
		url: '/login',
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data){
			if(data.success){
				// load the next screen
				offEvents_login_signin();
				loadScreen_login_signin("DASHBOARD");	
			}else{
				$("#err-msg").show();
			}
		}
	})
}