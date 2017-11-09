$("#canvas").css("opacity",0);
$.ajax({
	url: "html/LOGIN_SIGNIN.html",
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
			var height_cont = $("#SCR_LOGIN_SIGNIN").height();
			$("#SCR_LOGIN_SIGNIN").css("top", (height_window - height_cont)/2 - 30 + "px");
			$(".credit").css("top", (height_window - 40 - height_cont) + "px");
			//Step 3. add event handler
			//3-0. check module
			//DO THIS LATER -
			//Check user ID PW. Chnage Login btn class to "btn" if everything is okay.
			//3-1. click cancel button
			$(document).on("click", "#LOGIN_INIT", function(event){
				//screen will be updated. Off events.
				offEvents_login_signin();
				loadScreen_login_signin($(this).attr("id"));
			})
			//3-2. click sign-in button
			$(document).on("click", "#DASHBOARD", function(event){
				//screen will be updated. Off events.
				if($(this).attr("class") == "btn"){
					offEvents_login_signin();
					loadScreen_login_signin($(this).attr("id"));		
					console.log("show next screen");
				}
				else{console.log("not ready for registration.");}
			})			
			$("#canvas").animate({"opacity":1}, 500);
		}, 300);
	},
	error: function (request, error){console.log(error)}
});

function loadScreen_login_signin(screen_id){
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

function offEvents_login_signin(){
	$(document).off("click", "#LOGIN_INIT");
	$(document).off("click", "#DASHBOARD");
}