// js for LOGIN_INIT.html
// Present an initial screen that users will see when visiting ComeTogether

$(document).ready(function(){
	$("#canvas").css("opacity",0);
	//Load html and add events
	$.ajax({
		url: "html/LOGIN_INIT.html",
		dataType: "html",
		async: true,
		success: function (data){
			//Step 1. update UI at #canvas
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
					//Once the next screen is loaded, off events.
					offEvents_login_init();
					loadScreen_login_init($(this).attr("id"));
				})

				$("#canvas").animate({"opacity":1}, time_scr_fadein);
			}, time_scr_loadbuffer);
		},
		error: function (request, error){console.log(error)}
	});
});

// Function: Loading different screens from LOGIN_INIT.html
function loadScreen_login_init(screen_id){
	$("#canvas").animate({"opacity":0}, time_scr_fadeout, function(){
		$.ajax({
			url: "js/" + screen_id + ".js",
			dataType: "script",
			async: true,
			success: function (data){},
			error: function (request, error){console.log(error)}
		});		
	});
}

// Function: Off events, triggered once loading different screens
function offEvents_login_init(){
	$(document).off("click", ".btn");
}