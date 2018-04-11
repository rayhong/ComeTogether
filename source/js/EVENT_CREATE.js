// js for EVENT_CREATE.html
// Present a EVENT_CREATE screen
var datetimes

$.ajax({
	url: "html/EVENT_CREATE.html",
	dataType: "html",
	async: true,
	success: function (data){
		// get input data depending on previous page
		var title = "";
		var tods;
		datetimes = []

		if($("#SCR_EVENT_CREATE_READY").length){
			title = $("#event-title").text()
			datetimes = $("#event-date").text().split(", ")
			tods = $("#event-tods").text().split(", ")
		}else{
			title = $("#event_title").val()
		}

		// update UI at #canvas
		$("#canvas").empty();
		$("#canvas").append(data);
		setTimeout(function(){
			// resize the divs
			var height_window = $(window).height();
			var width_window = $(window).width();
			var height_cont_right = $("#SCR_EVENT_CREATE #right").height();
			var height_cont_left = $("#SCR_EVENT_CREATE #left").height();
			var height_cont = height_cont_right;
			$("#SCR_EVENT_CREATE #left").css("top", (height_cont_right-height_cont_left)/2);
			$("#SCR_EVENT_CREATE").css("top", (height_window - height_cont)/2 - 30 + "px");
			$("#SCR_EVENT_CREATE").css("left", (width_window - 800)/2 + "px");
			$(".credit").css("top", (height_window - 40) + "px");

			$(window).on('beforeunload', function(){
			      return 'Are you sure you want to leave?';
			});

			$(window).on('unload', function(){
				$.ajax({
					type: 'POST',
					url: '/delete_group'
				})
			})

			// set input title to the title provided in last page
			if(title != ""){
				$("#input_title").val(title);
				$("#input_title").css("color", "#000");
				$("#check_title").html("&#10004;");
			}
			if(datetimes.length != 0){
				for(var i = 0; i < datetimes.length; i++){
					var temp = datetimes[i].split(' ')
					var date = temp[0]
					var time = temp[1]
					$('#added_datetimes').prepend(
						`<span><input type="date" id="input_date-${i}" class="input_text" placeholder="Date" style="width:150px" value="${date}" readonly/></span>
						 <span><input type="time" id="input_time-${i}" class="input_text" placeholder="Time" style="width:110px" step="1800" value="${time}" readonly/></span>
						 <span id="remove_datetime-${i}" class="btn" style="width: 70px;margin: 0;height: 30px;vertical-align:middle;line-height: 32px;">x Remove</span>`)
					$("#remove_datetime-" + i).click(function(){
						var index = $(this).attr('id').split('-')[1]/1
						$(this).remove()
						$('#input_date-' + index).remove()
						$('#input_time-' + index).remove()
						datetimes.splice(index, 1)
						verify_required()
					})

					datetimes[i] = formatDateTime(date, time)
				}
			}
			if(tods){
				for(i = 0; i < tods.length; i++){
					if(tods[i] == "Restaurants")
						$("#check_res").prop("checked", true)
					else if(tods[i] == "Cafes")
						$("#check_caf").prop("checked", true)
					else if(tods[i] == "Shopping")
						$("#check_shop").prop("checked", true)
					else if(tods[i] == "Nightlife")
						$("#check_night").prop("checked", true)
					else if(tods[i] == "Attractions")
						$("#check_attr").prop("checked", true)
				}
				verify_required()
			}

			// set minimum input date to current date
			var nowDate = new Date();
			var minDate = nowDate.toISOString().substring(0,10)
			$('#input_date').prop('min', minDate);

			// verify fields on keyup
			$("#input_title").keyup(function(){
				if($(this).val() != "")
					$("#check_title").html("&#10004;");
				else
					$("#check_title").html("*");
				verify_required();
			})

			$("#input_date").change(function(){
				verify_datetime()
			})

			$("#input_time").change(function(){
				verify_datetime()
			})

			$(".check_tod").change(function(){
				verify_required();
			})

			$("#add_datetime").click(function(){
				if($(this).attr("class") == "btn"){
					// todo check that datetime doesnt already exist
					// change id based on index so change only the index of datetime
					$('#added_datetimes').prepend(
						`<span><input type="date" id="input_date-${datetimes.length}" class="input_text" placeholder="Date" style="width:150px" value="${$('#input_date').val()}" readonly/></span>
						 <span><input type="time" id="input_time-${datetimes.length}" class="input_text" placeholder="Time" style="width:110px" step="1800" value="${$('#input_time').val()}" readonly/></span>
						 <span id="remove_datetime-${datetimes.length}" class="btn" style="width: 70px;margin: 0;height: 30px;vertical-align:middle;line-height: 32px;">x Remove</span>`)
					$("#remove_datetime-" + datetimes.length).click(function(){
						var index = $(this).attr('id').split('-')[1]/1
						$(this).remove()
						$('#input_date-' + index).remove()
						$('#input_time-' + index).remove()
						datetimes.splice(index, 1)
						verify_required()
					})

					datetimes.push(formatDateTime($('#input_date').val(), $("#input_time").val()))
					$("#input_date").val("")
					$("#input_time").val("")
					$(this).attr("class", "btn_dis")
					verify_required()
				}
			})

			// creates group or edits depending on whether user previous actions
			$(document).on("click", "#EVENT_CREATE_READY", function(){
				if($(this).attr("class") == "btn"){
					create_group();
				}
			});
			// Cancel
			$(document).on("click", "#DASHBOARD", function(){
				// deletes group if it exists
				delete_group();
			});
			$("#canvas").animate({"opacity":1}, time_scr_fadein);
		}, time_scr_loadbuffer);
	},
	error: function (request, error){console.log(error)}
});

// Function: Loading different screens from EVENT_CREATE.html
function loadScreen_event_create(screen_id){
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
function offEvents_event_create(){
	$(document).off("click", "#EVENT_CREATE_READY");
	$(document).off("click", "#DASHBOARD");
}

// verify that all required fields are filled
// and change register button if they are
function verify_required(){
	// checks if all necessary fields are filled or verified
	if($("#input_title").val()!="" && datetimes.length != 0
		&& ($("#check_res").is(":checked") || $("#check_caf").is(":checked") || $("#check_attr").is(":checked") ||
			$("#check_night").is(":checked") || $("#check_shop").is(":checked"))){
		$("#EVENT_CREATE_READY").attr("class", "btn");
	}else if($("#EVENT_CREATE_READY").attr('class') == "btn")
		$("#EVENT_CREATE_READY").attr("class", "btn_dis");
}

// verifies the date is valid
function verify_date(){
	if($("#input_date").val() != ""){
		$("#input_date").css("color", "#000");
		if($("#input_date")[0].valueAsNumber/86400000 < Math.floor(new Date()/86400000)){
			$("#check_date").html("&#10006;").css("color", "#c33");
			verify_required();
		}else{
			$("#check_date").html("&#10004;").css("color", "#fff")
			verify_required();
		}
	}else{
		$("#input_date").css("color", "#aaa");
		$("#check_date").html("*");
	}
}

function verify_datetime(){
	if($("#input_date").val()!="" && $("#input_date")[0].valueAsNumber/86400000 >= Math.floor(new Date()/86400000) &&
	   $("#input_time").val()!="" && !datetimes.includes(formatDateTime($("#input_date").val(), $("#input_time").val())))
		$("#add_datetime").attr("class", "btn");
	else if($("#add_datetime").attr("class", "btn"))
		$("#add_datetime").attr("class", "btn_dis")
}

function create_group(){
	var data = {title: $("#input_title").val(), datetimes: datetimes,
				type: {res: $("#check_res").is(":checked"), caf: $("#check_caf").is(":checked"), attr: $("#check_attr").is(":checked"),
					   night: $("#check_night").is(":checked"), shop: $("#check_shop").is(":checked")}}
	$.ajax({
		type: 'POST',
		url: "/create_group",
		data: JSON.stringify(data),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data){
			if(data.success){
				offEvents_event_create();
				window.localStorage.group_id = data.g_id;
				loadScreen_event_create("EVENT_CREATE_READY");
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
			$(window).unbind('beforeunload');
			$(window).unbind('unload');
			offEvents_event_create();
			loadScreen_event_create("DASHBOARD");
		}
	})
}

function formatDateTime(date, time){
	return date.replace(/-/g, '') + time.replace(/:/g, '')
}