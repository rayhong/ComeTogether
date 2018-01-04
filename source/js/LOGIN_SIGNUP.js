// js for LOGIN_SIGNUP.html
// Present a LOGIN_SIGNUP screen

// global timer variables to check when user stops typing
var emailTimer;
var pwTimer;
var pwconfTimer;
var typingInterval = 500;

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

			// verify email if user stops typing for 0.5 secs
			$("#input_email").keyup(function(){
				$(this).val() !="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
				clearTimeout(emailTimer);
				emailTimer = setTimeout(verify_email, typingInterval);
			})
			$("#input_email").keydown(function(e){
				// in case user uses tab to go to the next field
				if(e.keyCode === 9)
					verify_email()
				clearTimeout(emailTimer);
			})

			// verify name on keyup
			$("#input_name").keyup(function(){
				if($(this).val() != ""){
					$(this).css("color", "#000");
					$("#check_name").html("&#10004;");
				}else{
					$(this).css("color", "#aaa");
					$("#check_name").html("*");
				}
				verify_required();
			})

			// verify pw and pwconf when user stops typing
			$("#input_pw").keyup(function(){
				$(this).val() !="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
				clearTimeout(pwTimer);
				pwTimer = setTimeout(verify_pw, typingInterval);
			})
			$("#input_pw").keydown(function(e){
				if(e.keyCode === 9)
					verify_pw()
				clearTimeout(pwTimer);
			})

			$("#input_pwconf").keyup(function(){
				$(this).val() !="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
				clearTimeout(pwconfTimer);
				pwconfTimer = setTimeout(verify_pwconf, typingInterval);
			})
			$("#input_pwconf").keydown(function(e){
				if(e.keyCode === 9)
					verify_pwconf()
				clearTimeout(pwconfTimer);
			})

			// verify home and office addresses on keyup
			$("#input_homeadd").keyup(function(){
				if(!$("#check_homeadd").is(":checked")){
					$(this).val()!="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
					verify_required();
				}
			})
			$("#input_officeadd").keyup(function(){
				if(!$("#check_officeadd").is(":checked")){
					$(this).val()!="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
					verify_required();
				}
			})

			// make home and office address inputs writeable if "Do not want to specify" boxes are not checked
 			$("#check_homeadd").change(function(){
				verify_required();
				if(!$(this).is(":checked")){
					$("#input_homeadd").prop("readonly", false);
					if($("#input_homeadd").val() != "")
						$("#input_homeadd").css("color", "#000");
				}else{
					$("#input_homeadd").prop("readonly", true);
					$("#input_homeadd").css("color", "#aaa");
				}
			})
			$("#check_officeadd").change(function(){
				verify_required();
				if(!$(this).is(":checked")){
					$("#input_officeadd").prop("readonly", false);
					if($("#input_officeadd").val() != "")
						$("#input_officeadd").css("color", "#000");
				}else{
					$("#input_officeadd").prop("readonly", true);
					$("#input_officeadd").css("color", "#aaa");
				}
			})


			// img uploading and displaying handler
			$("#img_upload").change(function(){
				if(this.files && this.files[0]){
					var reader = new FileReader();
					reader.onload = function(e){
						$("#profile_pic").attr("src", e.target.result);
					}
					reader.readAsDataURL(this.files[0]);
					$(this).data("filled", true);
					$("#check_upload").html("&#10004;")
					verify_required();
				}
			})
			// triger click in input to upload file
			$(document).on("click", "#PROFILE_UPLOAD", function(){
				$("#img_upload").trigger('click'); 
			});

			//3-3. Register
			$(document).on("click", "#LOGIN_SIGNUP_DONE", function(){
				if($(this).attr("class") == "btn"){
					// ajax post request to register and move to next screen if success
					post_register();
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

// verify email by checking with regex and checking that email is not in use
function verify_email(){
	var email = $("#input_email").val();
	// regex to check email validity (could be improved)
	var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ 
	if(re.test(email)){
		var data = {"email": email};
		// check if email doesnt already exist in database
		$.ajax({
			type: 'POST',
			url: "/verify_email",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: 'json',
			success: function(data){
				$("#input_email").data("verified", data.success)
				if(data.success){
					$("#check_email").html("&#10004;").css("color", "#fff");
					$("#email_err").html("")
				}else{
					$("#check_email").html("&#10006;").css("color", "#c33");
					$("#email_err").html("Email already in use.")
				}
				verify_required();
			}
		})
	}else{
		$("#input_email").data("verified", false)
		$("#check_email").html("&#10006;").css("color", "#c33")
		$("#email_err").html("Please enter a valid email.")
		verify_required();	
	}
}


// simply verifies password (could be improved)
function verify_pw(){
	var pw = $("#input_pw").val()
	// regex to validate password: 1 lowercase, 1 uppercase, 1 digit, 7 in length
	var re = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{7,}$/
	var valid = re.test(pw)
	$("#input_pw").data("verified", valid);
	if(valid){
		$("#check_pw").html("&#10004;").css("color", "#fff")
		$("#pw_err").html("")
	}else{
		$("#check_pw").html("&#10006;").css("color", "#c33")
		$("#pw_err").html("Your password must be 7 characters long and contain at least 1 letter and 1 digit.")
	}
	verify_required();
	return valid;
}

// simply verifies password confirmation
function verify_pwconf(){
	var pw = $("#input_pwconf").val()
	var valid = pw == $("#input_pw").val() && verify_pw($("#input_pw").val())
	$("#input_pwconf").data("verified", valid);
	if(valid){
		$("#check_pwconf").html("&#10004;").css("color", "#fff")
		$("#pwconf_err").html("")
	}else{
		$("#check_pwconf").html("&#10006;").css("color", "#c33")
		$("#pwconf_err").html("Passwords do not match")
	}
	verify_required();
}

// verify that all required fields are filled
// and change register button if they are
function verify_required(){
	// checks if all necessary fields are filled or verified
	if($("#input_email").data("verified") && $("#input_name").val() != "" && 
		$("#input_pw").data("verified") && $("#input_pwconf").data("verified") && $("#img_upload").data("filled") &&
		($("#check_homeadd").is(":checked") || $("#input_homeadd").val() != "") && 
		($("#check_officeadd").is(":checked") || $("#input_officeadd").val() != "")){
		$("#LOGIN_SIGNUP_DONE").attr("class", "btn");
	}else if($("#LOGIN_SIGNUP_DONE").attr('class') == "btn")
		$("#LOGIN_SIGNUP_DONE").attr("class", "btn_dis");
}

// ajax post request to register
function post_register(){
	var formData = new FormData();
	formData.append('file', $("#img_upload")[0].files[0]);
	var data = {"email": $("#input_email").val(), "name": $("#input_name").val(), 
				"password": $("#input_pw").val(), "homeaddr": $("#input_homeadd").val(),
				"officeaddr": $("#input_officeadd").val()};
	if($("#check_homeadd").is(":checked"))
		data.homeaddr = "";
	if($("#check_officeadd").is(":checked"))
		data.officeaddr = "";

	// upload image and then upload data to register
	$.ajax({
		type: 'POST',
		url: "/uploadimg",
		data: formData,
		processData: false,
		contentType: false,
		dataType: 'json',
		success: function(res){
			data.filename = res.name
			$.ajax({
				type: 'POST',
				url: "/register",
				data: JSON.stringify(data),
				contentType: 'application/json',
				dataType: 'json',
				success: function(data){
					// load the next page if registration finished correctly
					if(data.success){
						console.log("successfully registered");
						offEvents_login_signup();
						loadScreen_login_signup("LOGIN_SIGNUP_DONE");
					}else{
						console.log("failed registration")
					}
				}
			});
		}
	})
}