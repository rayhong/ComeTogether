$("#canvas").css("opacity",0);
$.ajax({
	url: "html/LOGIN_INIT.html",
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
			var height_cont = $("#SCR_LOGIN_INIT").height();
			$("#SCR_LOGIN_INIT").css("top", (height_window - height_cont)/2 - 30 + "px");
			$(".credit").css("top", (height_window - 40 - height_cont) + "px");
			//Step 3. add event handler
			$(document).on("click", ".btn", function(event){
				//screen will be updated. Off events.
				offEvents_login_init();
				loadScreen_login_init($(this).attr("id"));
			})
			$("#canvas").animate({"opacity":1}, 500);
		}, 300);
	},
	error: function (request, error){console.log(error)}
});

function loadScreen_login_init(screen_id){
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

function offEvents_login_init(){
	$(document).off("click", ".btn");
}