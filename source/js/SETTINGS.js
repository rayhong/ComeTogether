// js for SETTINGS.html
// Present a SETTINGS screen

// global timer variables to check when user stops typing
var pwTimer;
var pwconfTimer;
var typingInterval = 500;

// variable that verifies if any changes to user information were made
var anyChange = false;

$.ajax({
	url: "html/SETTINGS.html",
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
			var height_cont_right = $("#SCR_SETTINGS #right").height();
			var height_cont_left = $("#SCR_SETTINGS #left").height();
			var height_cont = height_cont_right;
			$("#SCR_SETTINGS #left").css("top", (height_cont_right-height_cont_left)/2);
			$("#SCR_SETTINGS").css("top", (height_window - height_cont)/2 - 30 + "px");
			$("#SCR_SETTINGS").css("left", (width_window - 800)/2 + "px");
			$(".credit").css("top", (height_window - 40) + "px");


			// get user information and place it in the input fields
			// get user's groups' urls and display them
			$.ajax({
				type: "GET",
				url: "/get_user_info",
				dataType: "json",
				success: function(data){
					$("#input_email").val(data.id);
					$("#input_name").val(data.name).css("color", "#000");
					$("#input_pw").val("placeholder").css("color", "#000");
					$("#input_pwconf").val("placeholder").css("color", "#000");
					$("#profile_pic").attr("src", "/profile_imgs/" + data.filename)
					if(data.homeadd != ""){
						$("#input_homeadd").val(data.homeadd).css("color", "#000");
						$("#input_homeadd").prop("readonly", false)
						$("#check_homeadd").attr("checked", false)
					}
					if(data.officeadd != ""){
						$("#input_officeadd").val(data.officeadd).css("color", "#000");
						$("#input_officeadd").prop("readonly", false)
						$("#check_officeadd").attr("checked", false)
					}
					$.ajax({
						type: "GET",
						url: "/get_group_info",
						data: {data: data.groups},
						dataType: 'json',
						success: function(groupList){
							$("#url_list").hide()
							for(i = 0; i < groupList.length; i++){
								var groupData = groupList[i]
								var html = `<div>
												<span class="label">${groupData.g_title} <span style="font-weight:lighter">on</span> ${groupData.g_date.slice(0,10)}</span>
											</div>
											<div>
												<span><input type="text" id="group${groupData.g_id}" class="input_text" value="https://127.0.0.1:8000/?group_id=${groupData.g_id}" readonly/></span><!--
												--><span class="btn copy_url" data-g_id="${groupData.g_id}">COPY URL</span>
											</div>`
								$("#url_list").append(html)
								$(".copy_url").click(function(){
									var $temp = $("<input>");
									$("body").append($temp);
									$temp.val($("#group" + $(this).data("g_id")).val()).select();
									document.execCommand("copy");
									$temp.remove()
								})
							}
							$("#url_list").fadeIn()
							var height_window = $(window).height();
							var height_cont_right = $("#SCR_SETTINGS #right").height();
							var height_cont_left = $("#SCR_SETTINGS #left").height();
							var height_cont = height_cont_right;
							$("#SCR_SETTINGS #left").css("top", (height_cont_right-height_cont_left)/2);
							$("#SCR_SETTINGS").css("top", (height_window - height_cont)/2 - 30 + "px");
							$(".credit").css("top", (height_window - 40) + "px");
						}
					})
				}
			})

			// verify name on keyup
			$("#input_name").keyup(function(){
				anyChange = true;
				if($(this).val() != ""){
					$(this).css("color", "#000");
				}else{
					$(this).css("color", "#aaa");
				}
				$(this).data("changed", true)
				verify_required();
			})

			// clear password input field if user clicks on it
			$("#input_pw").focus(function(){
				anyChange = true;
				$(this).data('changed', true)
				$("#input_pw").val("")
				$(this).data("verified", false)
				$("#input_pwconf").data("verified", false)
				verify_required()
			})
			$("#input_pwconf").focus(function(){
				anyChange = true;
				$("#input_pw").data('changed', true)
				$("#input_pwconf").val("")
				$(this).data("verified", false)
				verify_required()
			})

			// verify pw and pwconf when user stops typing
			$("#input_pw").keyup(function(){
				anyChange = true;
				$(this).data('changed', true)
				$(this).val() !="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
				clearTimeout(pwTimer);
				pwTimer = setTimeout(verify_pw, typingInterval);
			})
			$("#input_pw").keydown(function(e){
				anyChange = true;
				$(this).data('changed', true)
				if(e.keyCode === 9)
					verify_pw()
				clearTimeout(pwTimer);
			})
			$("#input_pwconf").keyup(function(){
				anyChange = true;
				$("#input_pw").data('changed', true)
				$(this).val() !="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
				clearTimeout(pwconfTimer);
				pwconfTimer = setTimeout(verify_pwconf, typingInterval);
			})
			$("#input_pwconf").keydown(function(e){
				anyChange = true;
				$("#input_pw").data('changed', true)
				if(e.keyCode === 9)
					verify_pwconf()
				clearTimeout(pwconfTimer);
			})

			// verify home and office addresses on keyup
			$("#input_homeadd").keyup(function(){
				if(!$("#check_homeadd").is(":checked")){
					anyChange = true;
					$(this).data('changed', true)
					$(this).val()!="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
					verify_required();
				}
			})
			$("#input_officeadd").keyup(function(){
				if(!$("#check_officeadd").is(":checked")){
					anyChange = true;
					$(this).data('changed', true)
					$(this).val()!="" ? $(this).css("color", "#000") : $(this).css("color", "#aaa");
					verify_required();
				}
			})

			// make home and office address inputs writeable if "Do not want to specify" boxes are not checked
 			$("#check_homeadd").change(function(){
 				anyChange = true;
				$("#input_homeadd").data('changed', true)
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
				anyChange = true;
				$("#input_officeadd").data('changed', true)
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
				// check that the image is valid: is an image and smaller than 10MB
				anyChange = true;
				$(this).data('changed', true)
				if(this.files && this.files[0] && this.files[0].type.split('/')[0] == "image" && this.files[0].size < 10*1000*1000){
					var reader = new FileReader();
					reader.onload = function(e){
						$("#profile_pic").attr("src", e.target.result);
					}
					reader.readAsDataURL(this.files[0]);
					$(this).data("filled", true);
					verify_required();
				}else{
					$("#profile_pic").attr("src", "");
					$(this).data("filled", false);
					if(this.files[0].size >= 10*1000*1000)
						$("#check_img").html("<span style='font-size: 14px; color: #fff'>Image is too big (> 10MB).</span>").css("color", "#c33");
					else
						$("#check_img").html("<span style='font-size: 14px; color: #fff'>Invalid image format.</span>").css("color", "#c33");
					verify_required();
				}
			})
			// triger click in input to upload file
			$(document).on("click", "#PROFILE_UPLOAD", function(){
				$("#img_upload").trigger('click'); 
			});

			//3-3. Update user information
			$(document).on("click", "#update", function(){
				if($(this).attr("class") == "btn"){
					// ajax post request to register and move to next screen if success
					update();
				}
			});

			//3-4. Go back to dashboard
			$(document).on("click", "#DASHBOARD", function(){
				//screen will be updated. Off events.
				offEvents_settings();
				loadScreen_settings($(this).attr("id"));
			});

			$("#canvas").animate({"opacity":1}, time_scr_fadein);
		}, time_scr_loadbuffer);
	},
	error: function (request, error){console.log(error)}
});

// Function: Loading different screens from SETTINGS.html
function loadScreen_settings(screen_id){
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
function offEvents_settings(){
	$(document).off("click", "#PROFILE_UPLOAD");
	$(document).off("click", "#update");
	$(document).off("click", "#DASHBOARD");
	$(document).off("click", ".copy_url");
}

// simply verifies password (could be improved)
function verify_pw(){
	var pw = $("#input_pw").val()
	// regex to validate password: 1 lowercase, 1 uppercase, 1 digit, 7 in length
	var re = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{7,}$/
	var valid = re.test(pw)
	$("#input_pw").data("verified", valid);
	if(valid){
		$("#pw_err").html("")
	}else{
		$("#pw_err").html("Your password must be 7 characters long and contain at least 1 letter and 1 digit.")
		$("#input_pwconf").data("verified", valid)
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
		$("#pwconf_err").html("")
	}else{
		$("#pwconf_err").html("Passwords do not match.")
	}
	verify_required();
}

// verify that if any changes were made, that the changes are valid
// makes the update button clickable if they were
function verify_required(){
	if(anyChange){
		if((!$("#input_name").data("changed") || $("#input_name").val() != "") &&
			(!$("#input_pw").data("changed") || ($("#input_pw").data("verified") && $("#input_pwconf").data("verified"))) &&
			(!$("#input_homeadd").data("changed") || ($("#check_homeadd").is(":checked") || $("#input_homeadd").val() != "")) &&
			(!$("#input_officeadd").data("changed") || ($("#check_officeadd").is(":checked") || $("#input_officeadd").val() != "")) &&
			(!$("#img_upload").data("changed") || $("#img_upload").data("filled"))){
			$("#update").attr("class", "btn")
		}else if($("#update").attr('class') == "btn")
			$("#update").attr("class", "btn_dis");
	}else if($("#update").attr('class') == "btn")
		$("#update").attr("class", "btn_dis");
}

// updates user information 
// by first uploading the image (if it was changed) and then posting the other information
function update(){
	if($("#img_upload").data("changed")){
		var formData = new FormData();
		formData.append('file', $("#img_upload")[0].files[0]);
		$.ajax({
			type: 'POST',
			url: "/uploadimg",
			data: formData,
			processData: false,
			contentType: false,
			dataType: 'json',
			success: function(res){
				update_info(res.name)
			}
		})
	}else
		update_info(false);
}


// updates the user information
// by posting it after the image has been uploaded
function update_info(filename){
	var data = {name: $("#input_name").val(), pw: false, homeadd: $("#input_homeadd").val(), 
				officeadd: $("#input_officeadd").val(), filename: filename};

	if($("#check_homeadd").is(":checked"))
		data.homeaddr = "";
	if($("#check_officeadd").is(":checked"))
		data.officeaddr = "";
	if($("#input_pw").data("changed"))
		data.pw = $("#input_pw").val();

	$.ajax({
		type: 'POST',
		url: "/update_info",
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data){
			// refreshes the page if updates were carried out successfuly
			if(data.success){
				offEvents_settings();
				loadScreen_settings("SETTINGS")
			}else{
				// in situation where user messes with the javascript
				console.log("failed registration")
			}
		}
	});
}