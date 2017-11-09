$.ajax({
	url: "html/LOGIN_SIGNUP.html",
	dataType: "html",
	async: true,
	success: function (data){
		//If news file loaded succesfully
		//Step 1. update UI
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
			//DO THIS LATER -
			//Check inputs. Chnage Sign up btn class to "btn" if everything is okay.
			//3-2. Upload
			$(document).on("click", "#PROFILE_UPLOAD", function(){
				console.log("image upload handling");
			});
			//3-3. Register
			$(document).on("click", "#LOGIN_SIGNUP_DONE", function(){
				if($(this).attr("class") == "btn"){
					offEvents_login_signup();
					loadScreen_login_signup($(this).attr("id"));		
				}
				else{console.log("not ready for registration.");}
				//T.B.D.
			});
			//3-4. Cancel
			$(document).on("click", "#LOGIN_INIT", function(){
				//screen will be updated. Off events.
				offEvents_login_signup();
				loadScreen_login_signup($(this).attr("id"));
			});
			$("#canvas").animate({"opacity":1}, 500);
		}, 300);
	},
	error: function (request, error){console.log(error)}
});

function loadScreen_login_signup(screen_id){
	$("#canvas").animate({"opacity":0}, 300, function(){
		$.ajax({
			url: "js/" + screen_id + ".js",
			dataType: "script",
			async: true,
			success: function (data){},
			error: function (request, error){console.log(error)}
		});		
	})
}

function offEvents_login_signup(){
	$(document).off("click", "#PROFILE_UPLOAD");
	$(document).off("click", "#LOGIN_SIGNUP_DONE");
	$(document).off("click", "#LOGIN_INIT");
}