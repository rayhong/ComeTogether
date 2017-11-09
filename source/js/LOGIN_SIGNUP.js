// js for LOGIN_SIGNUP.html
// Present a LOGIN_SIGNUP screen

$.ajax({
	url: "html/LOGIN_SIGNUP.html",
	dataType: "html",
	async: true,
	success: function (data){
		//Step 1. update UI at #canvas
		$("#canvas").empty();
		$("#canvas").append(data);
		setTimeout(function(){
			//Step 2. resize the divs
			var height_window = $(window).height();
			var width_window = $(window).width();
			var height_cont_right = $("#SCR_LOGIN_SIGNUP #right").height();
			var height_cont_left = $("#SCR_LOGIN_SIGNUP #left").height();
			var height_cont = height_cont_right;
			$("#SCR_LOGIN_SIGNUP #left").css("top", (height_cont_right-height_cont_left)/2);
			$("#SCR_LOGIN_SIGNUP").css("top", (height_window - height_cont)/2 - 30 + "px");
			$("#SCR_LOGIN_SIGNUP").css("left", (width_window - 800)/2 + "px");
			$(".credit").css("top", (height_window - 40) + "px");

			//Step 3. Addcheck routines and event handler
			//3-1. Check input validity
			//T.B.D. Developing checking module 
			//Check inputs. Chnage class of the Sign up btn (#LOGIN_SIGNUP_DONE) to "btn" if everything is okay.)
			//3-2. Upload
			$(document).on("click", "#PROFILE_UPLOAD", function(){
				console.log("image upload handling");
			});
			//3-3. Register
			$(document).on("click", "#LOGIN_SIGNUP_DONE", function(){
				if($(this).attr("class") == "btn"){
					offEvents_login_signup();
					loadScreen_login_signup($(this).attr("id"));
					//T.B.D.: finish SIGN up call - check if the input user enter correct.
				}
				else{console.log("not ready for registration.");}
			});
			//3-4. Cancel
			$(document).on("click", "#LOGIN_INIT", function(){
				//screen will be updated. Off events.
				offEvents_login_signup();
				loadScreen_login_signup($(this).attr("id"));
			});
			$("#canvas").animate({"opacity":1}, time_scr_fadein);
		}, time_scr_loadbuffer);
	},
	error: function (request, error){console.log(error)}
});

// Function: Loading different screens from LOGIN_SIGNUP.html
function loadScreen_login_signup(screen_id){
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
function offEvents_login_signup(){
	$(document).off("click", "#PROFILE_UPLOAD");
	$(document).off("click", "#LOGIN_SIGNUP_DONE");
	$(document).off("click", "#LOGIN_INIT");
}