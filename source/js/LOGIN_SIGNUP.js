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

			// verify that all required fields are filled
			$("#input_email").keyup(function(){
				verify_required();
			})
			$("#input_name").keyup(function(){
				verify_required();
			})
			$("#input_pw").keyup(function(){
				verify_required();
			})
			$("#input_pwconf").keyup(function(){
				verify_required();
			})


			// img uploading and displaying handler
			$("#img_upload").change(function(){
				var old_filename = $("#img_upload").data("filename");
				var formData = new FormData(); // problem with FormData is that not supported by all browsers
				formData.append('file', this.files[0]);
				if(this.files[0]){
					$.ajax({
						url: "/uploadimg",
						data: formData,
						processData: false,
						contentType: false,
						dataType: 'json',
						type: 'POST',
						success: function(data){
							$("#profile_pic").attr('src', '/temp/' + data.name);
							$("#img_upload").data("filename", data.name); // to be used to delete temp file once registration done
							verify_required();
							
							// if a previous temp file exists, delete it
							if(old_filename != ""){
								$.ajax({
									type: 'POST',
									url: '/deleteimg/' + old_filename
								})
							}
						}
					})
				}
			})

			$(document).on("click", "#PROFILE_UPLOAD", function(){
				console.log("image upload handling");
				$("#img_upload").trigger('click'); // triger click in input to upload file
			});
			//3-3. Register
			$(document).on("click", "#LOGIN_SIGNUP_DONE", function(){
				if($(this).attr("class") == "btn"){
					offEvents_login_signup();
					loadScreen_login_signup($(this).attr("id"));
					//T.B.D.: finish SIGN up call - check if the input user enter correct.

					// ajax post request to register
					post_register();
				}
				else{console.log("not ready for registration.");}
			});
			//3-4. Cancel
			$(document).on("click", "#LOGIN_INIT", function(){
				//screen will be updated. Off events.
				offEvents_login_signup();
				loadScreen_login_signup($(this).attr("id"));

				// delete temp img file
				if($("#img_upload").data("filename") != ""){
					$.ajax({
						type: 'POST',
						url: '/deleteimg/' + $("#img_upload").data("filename")
					})
				}
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

// verify that all required fields are filled
// and change register button if they are
function verify_required(){
	if($("input_email").val() != "" && $("#input_name").val() != "" && 
		$("#input_pw").val() != "" && $("#input_pwconf").val() != "" && $("#img_upload").data("filename") != "")
		$("#LOGIN_SIGNUP_DONE").attr("class", "btn");
	else if($("#LOGIN_SIGNUP_DONE").attr('class') == "btn")
		$("#LOGIN_SIGNUP_DONE").attr("class", "btn_dis");
}

// ajax post request to register
function post_register(){
	// send filename so server can store it in profile_imgs and remove temp
	var data = {"email": $("#input_email").val(), "name": $("#input_name").val(), 
				"password": $("#input_pw").val(), "homeaddr": $("#input_homeadd").val(),
				"officeaddr": $("#input_officeadd").val(), "filename": $("#img_upload").data("filename")};
	$.ajax({
		type: 'POST',
		url: "/register",
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data){
			// do something after registration success
			console.log("successfully registered " + $("#input_name").val());
		}
	});
}