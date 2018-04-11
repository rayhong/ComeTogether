// colors available to be assigned to members
var colors = ['#17537F', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7f7f7f', '#BCBD22', '#17becf']

// test variables and objects
var groupSize = 1;
var userCDQ;
var members;

// checkmark image: +11 of checkmark box x, +6 of box y
 
// top id: type_category | topAgreements[type][category] -> num of agreed
// night: {bar: 0, beerg: 0, jazz: 0, karaoke: 0, comedy: 0, music: 0, dance: 0},
var topAgreements = {res: {american: 0, cn: 0, fr: 0, in: 0, it: 0, jp: 0, mx: 0, med: 0, th: 0, veg: 0, vet: 0},
					 caf: {caf: 0, bubble: 0, tea: 0, juice: 0, des: 0, ice: 0},
					 attr: {aq: 0, muse: 0, landmark: 0, park: 0, beach: 0, amusepark: 0, zoo: 0, theater: 0},
					 shop: {art: 0, book: 0, cosm: 0, dept: 0, drug: 0, elec: 0, jewel: 0, grocery: 0},
					 night: {bar: 0, beerg: 0, jazz: 0, karaoke: 0, comedy: 0, music: 0, dance: 0},
					 notCare: 0}
var topNames = {american: "American", cn: "Chinese", fr: "French", in: "Indian", it: "Italian", jp: "Japanese", mx: "Mexican", med: "Mediterranean",
				th: "Thai", veg: "Vegan", vet: "Vegetarian", fast: "Fastfood", bar: "Bars", beerg: "Beer gardens", jazz: "Jazz & Blues", 
				karaoke: "Karaoke", comedy: "Comedy Clubs", music: "Music Venues", dance: "Dance Clubs", 
				caf: 'Cafes', bubble: 'Bubble Tea', tea: 'Tea', juice: 'Juice Bars', des: 'Desserts', ice: 'Ice Cream',
				aq: 'Aquariums', muse: 'Museums', landmark: 'Landmarks', park: 'Parks', beach: 'Beaches', amusepark: 'Amusement Parks', zoo: 'Zoos',
				theater: 'Performing Arts', art: 'Arts & Crafts', book: 'Bookstores', cosm: 'Cosmetics', dept: 'Department Stores', drug: 'Drugstores',
				elec: 'Electronics', jewel: 'Fashion & Jewelry', grocery: 'Grocery', bar: 'Bars', beerg: 'Beer Gardens', jazz: 'Jazz & Blues',
				karaoke: 'Karaoke', comedy: 'Comedy Clubs', music: 'Music Venues', dance: 'Dance Clubs'}
var topAgreed = 0;

var cityAgreements = {c_edmonds: 0, c_lynnwood: 0, c_mountlake_terrace: 0, c_shoreline: 0, c_lake_forest_park: 0, c_seattle: 0, c_bothell: 0, 
					  c_kirkland: 0, c_redmond: 0, c_woodinville: 0, c_tukwila: 0, c_burien: 0, c_seatac: 0, c_normandy_park: 0, c_mercer_island: 0, 
					  c_bellevue: 0, c_renton: 0, c_snohomish: 0, c_des_moines: 0, c_kent: 0, c_kenmore: 0, c_mill_creek: 0, c_newcastle: 0, 
					  c_lynnwood: 0, c_ballard: 0, c_brier: 0, c_clyde_hill: 0, c_medina: 0, c_issaquah: 0, notCare: 0}
var cityAgreed = 0;

// index 0: $$$$, index 3: $, index 4: notCare
var priceAgreements = [0, 0, 0, 0, 0]
// index 0: 5-4, index 4: 1-0, index 5: notCare
var ratingAgreements = [0, 0, 0, 0, 0, 0]
// index 0: Over 1000-1000, index 4: 50-0, index 5: notCare
var reviewAgreements = [0, 0, 0, 0, 0, 0]

var datetimesList = []
var datetimeAgreements = {}
var datetimeAgreed = 0

var typesChosen;

var placesList = [];
var placesLoaded = 0;

var favsList = [];

var sentPingsList = []

var inputHeight = 29;
var currentMsgIndex;

var numQueued = 0;

var socket = io();

var searchTimer;
var typingInterval = 300;

var placeDetailHeight = 700
var mymap;
var marker;

var searchPlace = null

$(document).ready(function(){
	$('#top-show-all').prop('checked', false)
	$('#top-show-categories').prop('checked', false)
	$('#price-show-all').prop('checked', false)

	$('#ego-radio').prop('checked', true)
	$('#chat-radio').prop('checked', true)

	$(".input-search").keyup(function(){
		clearTimeout(searchTimer);
		searchTimer = setTimeout(getSearchSuggestions, typingInterval);
	})
	$(".input-search").keydown(function(e){
		if(e.keyCode == 13){
			$('.place-detail').hide()
			$('.overlay').fadeIn()
			$.ajax({
				type: 'POST',
				url: '/search_place',
				data: JSON.stringify({str: $('.input-search').val()}),
				dataType: 'json',
				contentType: 'application/json',
				success: function(place){
					if(place){
						searchPlace = place
						searchPlace.agree = []
						searchPlace.disagree = []
						for(var j = 0; j < members.length; j++){
							var member = members[j]
							var agree = (!member.top || member.top.includes(searchPlace.top)) && (member.rating == -1 || member.rating <= searchPlace.rating) && 
										(!member.price || (member.price.min.length <= searchPlace.price && searchPlace.price <= member.price.max.length)) &&
										(!member.reviews || member.reviews.min <= searchPlace.reviews)
							if(member.reviews && member.reviews.max != 1001)
								agree = agree && (searchPlace.reviews <= member.reviews.max)

							if(agree)
								searchPlace.agree.push({id: member.id, filename: member.filename, index: j})
							else
								searchPlace.disagree.push({id: member.id, filename: member.filename, index: j})
						}
						displayPlaceDetails(searchPlace)
						$('.place-detail').fadeIn()
					}
				}
			})
		}
		clearTimeout(searchTimer);
	})

	$('.overlay').click(function(e){
		if(!$('.place-detail').is(e.target) && $('.place-detail').has(e.target).length === 0){
        	$(this).fadeOut()
        	searchPlace = null
		}else if($('#place-detail-photo').is(e.target))
			changeDetailImage()
	})

	$('#place-detail-photo').load(function(){
		$('.map-area').width(Math.floor(600 - $('#place-detail-photo')[0].getBoundingClientRect().width))
		window.dispatchEvent(new Event('resize'));
	})

	$('#close-detail').click(function(){
		$('.overlay').fadeOut()
		searchPlace = null
	})

	mymap = L.map('mapid').setView([50, -0.9], 13);
	marker = L.marker([51.5, -0.09]).addTo(mymap);
	mymap.scrollWheelZoom.disable();

	$.ajax({
		url: '/get_group_cdqs',
		type: 'GET',
		dataType: 'json',
		success: function(data){
			// add the current user to members array and compile members CDQs
			socket.emit('join group', {userID: data.id.user, groupID: data.id.group})
			if(data.new)
				socket.emit('new member', {firstname: data.user.firstname, lastname: data.user.lastname, filename: data.user.filename})
			members = data.group
			userCDQ = data.user 
			groupSize += data.group.length
			$('#add-datetime').width($('#add-datetime').width() + (groupSize-2)*30)
			members.unshift(userCDQ)
			typesChosen = data.types;
			datetimesList = data.datetimesList
			compileMembersCDQ(members)

			$("#user-img").html('<img src="profile_imgs/' + userCDQ.filename + '"/>')
			$("#user-info").html('Howdy, ' + userCDQ.firstname)
			$("#info-widget").fadeIn()

			// set width of left
			$('.bar-content').width(260 + (groupSize-1)*30 + 600 + 400)
			$('#content-area').width(260 + (groupSize-1)*30 + 600 + 400)
			$('#left').width(200 + (groupSize-1)*30)
			$('#btn-area').width(240 + (groupSize-1)*30)

			$('#meeting-name').text(data.id.title)

			// display images of members of the group
			var membersHtml = '<span>You</span>'
			var picsHtml = ''
			for(i = 0; i < members.length; i++){
				if(i != 0)
					membersHtml += `<span>${members[i].firstname[0]}.${members[i].lastname[0]}.</span>`
				picsHtml += `<img src='profile_imgs/${members[i].filename}' style='border-color: ${colors[i]}'/>`
			}
			$('#member-list').append(membersHtml)
			$('#profile-pics').append(picsHtml)
			$('.img-list').append(picsHtml)

			$('#all-agreed-label').width((groupSize-1)*30)


			// PLACE CATEGORIES
			// display the restaurant section of the filters for the place category
			var svgHtml = ''
			var endHtml;
			var locCategories = Object.keys(topAgreements)
			var yPosition = 1
			for(var i = 0; i < locCategories.length - 1; i++){
				endHtml = ''
				var category = locCategories[i]

				if(!typesChosen[category])
					continue;

				var topKeyList = Object.keys(topAgreements[category])
				svgHtml += `<g id='top-type-${category}'>`

				var notAdded = 0;
				for(var j = 0; j < topKeyList.length; j++){
					var top = topKeyList[j]
					if(topAgreements[category][top] > 0){
						if((topAgreements[category][top] + topAgreements.notCare) != groupSize){
							endHtml += `<g id='top-group-${top}' transform='translate(0, ${-notAdded*26})'>
										<rect id='left-rect' class='criteria-rect' width='100' height='26' x='61' y='${yPosition + j*26}'/>
										<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}' style='opacity: 0'/>
										<text id='left-text' class='category-text' x='71' y='${j*26 + yPosition + 17}'>${topNames[top]}</text>
										<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (topAgreements[category][top] + topAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
										<g class='top-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										<image class="check-mark" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
										<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 1'/>
										</g>`
						}else{
							topAgreed++;
							endHtml += `<g id='top-group-${top}' transform='translate(0, ${-notAdded*26})'>
										<rect id='left-rect' class='criteria-rect agreed-rect' width='100' height='26' x='61' y='${j*26 + yPosition}'/>
										<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}'/>
										<text id='left-text' class='agreed-text' x='71' y='${j*26 + yPosition + 17}'>${topNames[top]}</text>
										<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>Yes!</text>
										<g class='top-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										<image class="check-mark" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
										<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 1'/>
										</g>`
						}
					}else{
						if(topAgreements.notCare == groupSize){
							topAgreed++;
							endHtml += `<g id='top-group-${top}' style='opacity: 0'>
										<rect id='left-rect' class='criteria-rect agreed-rect' width='100' height='26' x='61' y='${j*26 + yPosition}'/>
										<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}'/>
										<text id='left-text' class='agreed-text' x='71' y='${j*26 + yPosition + 17}'>${topNames[top]}</text>
										<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>Yes!</text>
										<g class='top-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										<image class="check-mark" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
										<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 1'/>
										</g>`
						}else{		
							endHtml += `<g id='top-group-${top}' style='opacity: 0'>
										<rect id='left-rect' class='criteria-rect' width='100' height='26' x='61' y='${yPosition + j*26}'/>
										<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}' style='opacity: 0'/>
										<text id='left-text' class='category-text' x='71' y='${j*26 + yPosition + 17}'>${topNames[top]}</text>
										<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (topAgreements[category][top] + topAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
										<g class='top-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										<image class="check-mark" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
										<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 1'/>
										</g>`
						}
						notAdded++
					}
				}

				var added = topKeyList.length - notAdded

				var label = ''
				if(category === 'res'){
					label = `<text class='category-label' x='5' y='${yPosition + 18}' ${added == 0 ? 'style="display: none"' : ''}> Restaura-</text>
							 <text class='category-label' x='5' y='${yPosition + 35}' ${added <= 1 ? 'style="display: none"' : ''}>nts </text>`
				}else if(category === 'night'){
					label = `<text class='category-label' x='5' y='${yPosition + 18}' ${added == 0 ? 'style="display: none"' : ''}> Night-</text>
							 <text class='category-label' x='5' y='${yPosition + 35}' ${added <= 1 ? 'style="display: none"' : ''}>lifes </text>`
				}else if(category === 'caf'){
					label = `<text class='category-label' x='5' y='${yPosition + 18}' ${added == 0 ? 'style="display: none"' : ''}> Cafe </text>`
				}else if(category === 'attr'){
					label = `<text class='category-label' x='5' y='${yPosition + 18}' ${added == 0 ? 'style="display: none"' : ''}> Attracti-</text>
							 <text class='category-label' x='5' y='${yPosition + 35}' ${added <= 1 ? 'style="display: none"' : ''}>ons </text>`
				}else if(category === 'shop'){
					label = `<text class='category-label' x='5' y='${yPosition + 18}' ${added == 0 ? 'style="display: none"' : ''}> Shopping</text>`
				}
				endHtml = label + endHtml

				svgHtml += `<rect id='top-type-label' class='criteria-rect' x='1' width='60' y='${yPosition}' height='${26*added}'/>`
				svgHtml +=  endHtml + '</g>'
				yPosition += 26*added
			}
			// append place category svg to html
			$('#top-svg-container').append(`<svg id='top-svg' height='${yPosition+2}' width='${202 + (groupSize-1)*30}'>
										${svgHtml}
										<rect id='top-disagreed-border' class='disagreed-inner-border' x='2' y='1' width='${198 + (groupSize-1)*30}' height='${yPosition}' style='opacity: 0'></rect>
									</svg>`)

			// if user clicks on one of the checkbox for tops
			// add or remove it from its prefered list of locations, change display accordingly
			$('#top-svg .check-box, #top-svg image').click(function(){
				var top = $(this).parent().attr('id').slice(10)
				var category = $(this).parent().parent().attr('id').slice(9)
				var topList = topAgreements[category]
				var topId = category + "_" + top

				if(userCDQ.top !== false && userCDQ.top.indexOf(topId) != -1){
					userCDQ.top.splice(userCDQ.top.indexOf(topId), 1)
					if(topList[top] == (groupSize - topAgreements.notCare))
						topAgreed--;
					topList[top]--;
					socket.emit('top change', {topId: topId, change: -1})
					updateTopAgreement(category, top)
					if(topList[top] == 0)
						clearDisagreedTop();

					$('#top-group-' + top + ' .check-mark').css('opacity', 0)
					for(var i = 1; i < members.length; i++){
						$('#top-group-' + top + ' > .top-members-sel image:nth-child(' + (2*i) + ')').css({'opacity': 0, 'cursor': 'auto'})
					}

					getLocations()
				}else{
					if($('#top-no-pref').is(":checked")){
						$('#top-svg .check-box').css('fill', '#FFF')
						$('#top-svg .check-nopref').css('opacity', 0)
						$('#top-no-pref').prop('checked', false)
						socket.emit('top change all', {change: -1})
						updateTopAgreementAll(-1, false)
						userCDQ.top = []
					}
					userCDQ.top.push(topId)
					topList[top]++;
					if(topList[top] == (groupSize - topAgreements.notCare))
						topAgreed++;
					socket.emit('top change', {topId: topId, change: 1})
					updateTopAgreement(category, top)

					$('#top-group-' + top + ' .check-mark').css('opacity', 1)
					for(var i = 1; i < members.length; i++){
						var member = members[i]
						var isSelected = member.top === false || member.top.indexOf(topId) != -1
						if(!isSelected){
							$('#top-group-' + top + ' > .top-members-sel image:nth-child(' + (2*i) + ')').css('opacity', 1)
							if($('#top-show-all').is(':checked'))
								$('#top-group-' + top + ' > .top-members-sel image:nth-child(' + (2*i) + ')').css('cursor', 'pointer')
						}
					}

					getLocations()
				}
			})

			// show that members disagreed completely
			if(topAgreed == 0){
				$('#top-disagreed-border').css('opacity', 1)
				$('#top-label').css('color', '#f00')
				$('#top-svg text').addClass('disagreed-text')
				$('#top-svg .agreement-rect').addClass('disagreed-rect')
			}

			var allNoPref = true

			if(members[0].top !== false){
				allNoPref = false
				$('#top-no-pref').prop('checked', false)
				var locCategories = Object.keys(topAgreements)
				for(i = 0; i < locCategories.length - 1; i++){
					var category = locCategories[i]
					if(!typesChosen[category])
                   		continue;
					var topKeyList = Object.keys(topAgreements[category])
					for(j = 0; j < topKeyList.length; j++){
						var top = topKeyList[j]
						var topId = category + "_" + top
						$('#top-group-' + top + ' .check-nopref').css('opacity', 0)
						if(members[0].top.indexOf(topId) != -1){
							$('#top-group-' + top + ' .check-mark').css('opacity', 1)
							if(topAgreements[category][top] + topAgreements.notCare == groupSize)
								$('#top-group-' + top + ' > .check-box').css('fill', '#1F77B5')
							else
								$('#top-group-' + top + ' > .check-box').css('fill', '#AEC7E8')
						}else{
							$('#top-group-' + top + ' > .check-box').css('fill', '#FFF')
						}
					}
				}
			}

			// append rectangles to place category svg to display other members' preferences
			var locCategories = Object.keys(topAgreements)
			for(i = 0; i < locCategories.length - 1; i++){
				var category = locCategories[i]
				if(!typesChosen[category])
                    continue;
				var topKeyList = Object.keys(topAgreements[category])
				for(j = 0; j < topKeyList.length; j++){
					var top = topKeyList[j]
					var topId = category + "_" + top
					var userSelected = userCDQ.top && userCDQ.top.includes(topId)
					var groupHtml = ''
					for(k = 1; k < members.length; k++){
						var member = members[k]
						var isSelected = member.top === false || member.top.indexOf(topId) != -1
						allNoPref = allNoPref & !member.top
						groupHtml += `<rect class='criteria-rect' x='${201 + (k-1)*30}' y='${$('#top-group-' + top + ' > #right-rect').attr('y')}' width='30' height='26' 
											style='fill:${colors[k]}; ${isSelected ? '' : 'opacity: 0'}'/>
									  <image id='ping-top-${topId}-${member.id}' class='test-ping' href='img/CDQ_ping.png'
									  		 x='${201 + (k-1)*30 + 7}' y='${$('#top-group-' + top + ' > #right-rect').attr('y')/1 + 6}'
									  		 width='14px' height='14px'
									 		 style='${(isSelected || !userSelected) ? 'opacity: 0' : ''}'/>`
					}
					$('#top-group-' + top + ' > .top-members-sel').html(groupHtml)
				}
			}

			if(allNoPref){
				var locCategories = Object.keys(topAgreements)
				var totalAdded = 0;
				var added = 0;
				for(i = 0; i < locCategories.length - 1; i++){
					var category = locCategories[i]
	                if(!typesChosen[category])
	                    continue;
					if(added > 0 || totalAdded > 0){
						totalAdded += added;
						if($('#top-type-' + category).attr('transform'))
							$('#top-type-' + category).attr('transform', $('#top-type-' + category).attr('transform') + ' translate(0, ' + totalAdded*26 + ')')
						else
							$('#top-type-' + category).attr('transform', 'translate(0, ' + totalAdded*26 + ')')
						added = 0;
					}
					var topKeyList = Object.keys(topAgreements[category])
					for(j = 0; j < topKeyList.length; j++){
						var top = topKeyList[j]
						if(topAgreements[category][top] == 0){
							$('#top-group-' + top).css('opacity', 1)
							added++;
						}else if(added > 0){
							$('#top-group-' + top).attr('transform', '')
						}
					}
					if(added > 0){
						$('#top-type-'+category+' > #top-type-label').attr('height', added*26 + $('#top-type-'+category+' > #top-type-label').attr('height')/1)
						$('#top-type-'+category+' .category-label').show()
						$('#top-disagreed-border').attr('height', added*26 + $('#top-disagreed-border').attr('height')/1)
						$('#top-svg').attr('height', added*26 + $('#top-svg').height()/1)
					}
				}
				$('#top-show-categories').attr('checked', true)
			}



			// PRICE RANGE
			// set width of the prices svg
			$('#prices-svg').attr('width', 202 + (groupSize-1)*30)

			// change display for price range users agree in (including selectionm area and agreed area)
			var rangeAgreed = 0;
			for(i = 0; i < priceAgreements.length - 1; i++){
				$('#right-rect-price-' + i).attr('width', (groupSize-1)*30)
				$('#right-text-price-' + i).attr('x', (201*2 + (groupSize-1) * 30)/2)
				if((priceAgreements[i] + priceAgreements[4]) == groupSize){
					$('#left-rect-price-' + i).addClass('agreed-rect')
					$('#left-text-price-' + i).addClass('agreed-text')
					$('#right-rect-price-' + i).addClass('agreed-rect')
					$('#right-text-price-' + i).addClass('agreed-text').html('Yes!')
					rangeAgreed++;
				}else{
					$('#right-text-price-' + i).html(`No ${groupSize > 2 ? '(' + (priceAgreements[i] + priceAgreements[4]) + '/' + groupSize + ')' : ''}`)
					if(rangeAgreed > 0){
						$('#price-inner-border').attr({'y': (i-rangeAgreed)*26 + 7, 'height': rangeAgreed*26 - 2})
						$('#price-sel-area-agreed').attr({'y': (i-rangeAgreed)*26 + 6, 'height': rangeAgreed*26})
						rangeAgreed = -1;
					}
				}
			}
			$('#price-inner-border').attr('width', 198 + (groupSize-1)*30)
			$('#price-disagreed-border').attr('width', 198 + (groupSize-1)*30)
			if(rangeAgreed > 0){
				$('#price-inner-border').attr({'y': (4-rangeAgreed)*26 + 7, 'height': rangeAgreed*26 - 2})
				$('#price-sel-area-agreed').attr({'y': (4-rangeAgreed)*26 + 6, 'height': rangeAgreed*26})
			}else if(rangeAgreed == 0){
				$('#price-label').css('color', '#F00')
				$('#price-disagreed-border').css('opacity', 1)
				$('#prices-svg text').addClass('disagreed-text')
				$('#prices-svg .agreement-rect').addClass('disagreed-rect')
			}

			var minIndex = 3
			var maxIndex = 0

			if(members[0].price){
				minIndex = stringToPriceIndex(members[0].price.min)
				maxIndex = stringToPriceIndex(members[0].price.max)
				$('#price-no-pref').prop('checked', false)
				$('#price-sel-area').css('fill', '#AEC7E8')
				$('#price-sel-area-agreed').css('fill', '#1F77B5')
				$('#price-sel-area').attr({'height': (minIndex - maxIndex + 1)*26, 'y': 6 + maxIndex*26})
				$('#top-handle').attr('y', 1 + maxIndex*26)
				$('#bot-handle').attr('y', 1 + minIndex*26 + 26)
			}

			// display preferences of each member for price range
			var membersSelHtml = ``
			for(i = 1; i < members.length; i++){
				membersSelHtml += `<rect class='criteria-rect' x='${171 + i*30}' y='${6}' width='30' height='${4*26}' fill-opacity='0' stroke-opacity='0.1'/>`
				for(j = 0; j < 4; j++){
					membersSelHtml += `<image id='${'ping-price-' + priceIndexToString(j).length + '-' + members[i].id}' class='test-ping' href='img/CDQ_ping.png' 
									   		  x='${201 + (i-1)*30 + 7}' y='${j*26 + 12}' height='14px' width='14px' style='opacity: ${j >= maxIndex && j <= minIndex ? 1 : 0}'/>`
				}
				if(members[i].price){
					membersSelHtml += `<rect x='${176 + i*30}' y='${6 + stringToPriceIndex(members[i].price.max)*26}' width='20' fill='${colors[i]}' 
											 height='${(stringToPriceIndex(members[i].price.min) - stringToPriceIndex(members[i].price.max) + 1) * 26}'/>`
				}else
					membersSelHtml += `<rect x='${176 + i*30}' y='${6}' width='20' height='${4*26}' fill='${colors[i]}'/>`
			}
			$('#price-members-sel').html(membersSelHtml)



			// RATINGS
			// set width of ratings svg
			$('#ratings-svg').attr('width', 202 + (groupSize-1)*30)
			disagreement = false

			// change display for ratings users agree in (including selectionm area and agreed area)
			for(i = 0; i < ratingAgreements.length - 1; i++){
				if((ratingAgreements[i] + ratingAgreements[5]) == groupSize){
					$('#left-rect-rating-' + i).addClass('agreed-rect')
				}else{
					if(!disagreement){
						disagreement = true;
						$('#right-rect-agreed').attr({'width': (groupSize-1)*30, 'height': 26*i})
						$('#right-rect-disagreed').attr({'y': 26*i + 5, 'width': (groupSize-1)*30, 'height': 26*(5-i)})
						$('#right-text-agreed').attr({'x': (201*2 + (groupSize-1) * 30)/2, 'y': 6 + 13*i})
						$('#right-text-disagreed').attr({'x': (201*2 + (groupSize-1) * 30)/2, 'y': 26*i + 13*(5-i) + 6})
						$('#rating-inner-border').attr({'width': 198 + (groupSize-1)*30, 'height': i*26 - 2})
						$('#rating-sel-area-agreed').attr('height', i*26)
					}
				}
			}
			if(!disagreement){
				$('#right-rect-agreed').attr({'width': (groupSize-1)*30, 'height': 26*5})
				$('#right-rect-disagreed').attr({'y': 26*5 + 5, 'width': (groupSize-1)*30, 'height': 0})
				$('#right-text-agreed').attr({'x': (201*2 + (groupSize-1) * 30)/2, 'y': 6 + 13*5})
				$('#right-text-disagreed').attr({'x': (201*2 + (groupSize-1) * 30)/2, 'y': 26*5 + 13*(5-i) + 6}).css('opacity', 0)
				$('#rating-inner-border').attr({'width': 198 + (groupSize-1)*30, 'height': 5*26 - 2})
				$('#rating-sel-area-agreed').attr('height', 5*26)
			}

			if(members[0].rating != -1){
				$('#rating-no-pref').prop('checked', false)
				$('#rating-sel-area').css('fill', '#AEC7E8')
				$('#rating-sel-area-agreed').css('fill', '#1F77B5')
				$('#rating-sel-area').attr('height', (minToRatingIndex(members[0].rating) + 1)*26)
				$('#rating-handle').attr('y', 1 + (minToRatingIndex(members[0].rating) + 1)*26)
			}

			// display preferences of each member for price range
			var userRating = userCDQ.rating == -1 ? 4 : minToRatingIndex(userCDQ.rating)
			var membersSelHtml = ``
			for(i = 1; i < members.length; i++){
				membersSelHtml += `<rect class='criteria-rect' x='${171 + i*30}' y='${6}' width='30' height='${5*26}' fill-opacity='0' stroke-opacity='0.1'/>`
				for(j = 0; j < 5; j++){
					membersSelHtml += `<image id='${'ping-rating-' + minToRatingIndex(j) + '-' + members[i].id}' class='test-ping' href='img/CDQ_ping.png' 
									   		  x='${201 + (i-1)*30 + 7}' y='${j*26 + 12}' height='14px' width='14px' style='opacity: ${j <= userRating ? 1 : 0}'/>`
				}
				if(members[i].rating){
					membersSelHtml += `<rect x='${176 + i*30}' y='${6}' width='20' fill='${colors[i]}' 
											 height='${(minToRatingIndex(members[i].rating) + 1) * 26}'/>`
				}else
					membersSelHtml += `<rect x='${176 + i*30}' y='${6}' width='20' height='${5*26}' fill='${colors[i]}'/>`
			}
			$('#rating-members-sel').html(membersSelHtml)



			// REVIEWS
			// set width of the reviews svg
			$('#reviews-svg').attr('width', 202 + (groupSize-1)*30)

			// change display for review range users agree in (including selectionm area and agreed area)
			var rangeAgreed = 0;
			for(i = 0; i < reviewAgreements.length - 1; i++){
				if((reviewAgreements[i] + reviewAgreements[5]) == groupSize){
					$('#left-rect-review-' + i).addClass('agreed-rect')
					rangeAgreed++;
				}else{
					if(rangeAgreed > 0){
						$('#reviews-svg #right-rect-agreed').attr({'height': 26*rangeAgreed, 'y': 26*(i-rangeAgreed) + 6})
						$('#reviews-svg #right-rect-disagreed-top').attr({'height': 26*(i-rangeAgreed)})
						$('#reviews-svg #right-rect-disagreed-bot').attr({'y': 26*i + 5, 'height': 26*(5-i)})
						$('#reviews-svg #right-text-agreed').attr({'y': 26*(i-rangeAgreed) + 6 + 13*rangeAgreed}).css('opacity', 1)
						$('#reviews-svg #right-text-disagreed-top').attr({'y': 13*(i-rangeAgreed) + 6}).css('opacity', 1)
						$('#reviews-svg #right-text-disagreed-bot').attr({'y': 26*i + 13*(5-i) + 6}).css('opacity', 1)
						$('#reviews-svg #review-inner-border').attr({'y': (i-rangeAgreed)*26 + 7, 'height': rangeAgreed*26 - 2})
						$('#reviews-svg #review-sel-area-agreed').attr({'y': (i-rangeAgreed)*26 + 6, 'height': rangeAgreed*26})
						if(i - rangeAgreed == 0)
							$('#reviews-svg #right-text-disagreed-top').css('opacity', 0)
						rangeAgreed = -1;
					}
				}
			}
			$('#reviews-svg #review-inner-border').attr('width', 198 + (groupSize-1)*30)
			$('#review-disagreed-border').attr('width', 198 + (groupSize-1)*30)
			$('#reviews-svg #right-rect-agreed').attr({'width': (groupSize-1)*30})
			$('#reviews-svg #right-rect-disagreed-top').attr({'width': (groupSize-1)*30})
			$('#reviews-svg #right-rect-disagreed-bot').attr({'width': (groupSize-1)*30})
			$('#reviews-svg #right-text-agreed').attr({'x': (201*2 + (groupSize-1) * 30)/2})
			$('#reviews-svg #right-text-disagreed-top').attr({'x': (201*2 + (groupSize-1) * 30)/2})
			$('#reviews-svg #right-text-disagreed-bot').attr({'x': (201*2 + (groupSize-1) * 30)/2})
			if(rangeAgreed > 0){
				$('#reviews-svg #right-rect-agreed').attr({'height': 26*rangeAgreed, 'y': 26*(5-rangeAgreed) + 6})
				$('#reviews-svg #right-rect-disagreed-top').attr({'height': 26*(5-rangeAgreed)})
				$('#reviews-svg #right-rect-disagreed-bot').attr({'y': 26*5 + 5})
				$('#reviews-svg #right-text-agreed').attr({'y': 26*(5-rangeAgreed) + 6 + 13*rangeAgreed}).css('opacity', 1)
				$('#reviews-svg #right-text-disagreed-top').attr({'y': 13*(5-rangeAgreed) + 6}).css('opacity', 1)
				$('#reviews-svg #right-text-disagreed-bot').attr({'y': 26*5 + 6})
				$('#reviews-svg #review-inner-border').attr({'y': (5-rangeAgreed)*26 + 7, 'height': rangeAgreed*26 - 2})
				$('#reviews-svg #review-sel-area-agreed').attr({'y': (5-rangeAgreed)*26 + 6, 'height': rangeAgreed*26})
				if(rangeAgreed == 5)
					$('#reviews-svg #right-text-disagreed-top').css('opacity', 0)
			}else if(rangeAgreed == 0){
				$('#review-label').css('color', '#F00')
				$('#reviews-svg #right-rect-disagreed-top').attr('width', (groupSize-1)*30)
				$('#reviews-svg #right-text-disagreed-top').attr('x', (201*2 + (groupSize-1) * 30)/2).css('opacity', 1)
				$('#review-disagreed-border').css('opacity', 1)
				$('#reviews-svg text').addClass('disagreed-text')
				$('#reviews-svg .agreement-rect').addClass('disagreed-rect')
			}

			var minIndex = 5
			var maxIndex = 0

			if(members[0].reviews){
				minIndex = reviewToIndex(members[0].reviews.min)
				maxIndex = reviewToIndex(members[0].reviews.max)
				$('#review-no-pref').prop('checked', false)
				$('#review-sel-area').css('fill', '#AEC7E8')
				$('#review-sel-area-agreed').css('fill', '#1F77B5')
				$('#review-sel-area').attr({'height': (minIndex - maxIndex)*26, 'y': 6 + maxIndex*26})
				$('#review-top-handle').attr('y', 1 + maxIndex*26)
				$('#review-bot-handle').attr('y', 1 + minIndex*26)
			}

			// display preferences of each member for price range
			var membersSelHtml = ``
			for(i = 1; i < members.length; i++){
				membersSelHtml += `<rect class='criteria-rect' x='${171 + i*30}' y='${6}' width='30' height='${4*26}' fill-opacity='0' stroke-opacity='0.1'/>`
				for(j = 0; j < 5; j++){
					membersSelHtml += `<image id='${'ping-review-' + indexToReview(j) + '-' + members[i].id}' class='test-ping' href='img/CDQ_ping.png' 
									   		  x='${201 + (i-1)*30 + 7}' y='${j*26 + 12}' height='14px' width='14px' style='opacity: ${j >= maxIndex && j < minIndex ? 1 : 0}'/>`
				}
				if(members[i].price){
					membersSelHtml += `<rect x='${176 + i*30}' y='${6 + reviewToIndex(members[i].reviews.max)*26}' width='20' fill='${colors[i]}' 
											 height='${(reviewToIndex(members[i].reviews.min) - reviewToIndex(members[i].reviews.max)) * 26}'/>`
				}else
					membersSelHtml += `<rect x='${176 + i*30}' y='${6}' width='20' height='${5*26}' fill='${colors[i]}'/>`
			}
			$('#review-members-sel').html(membersSelHtml)




			// CITIES
			var notAdded = 0;
			svgHtml = ''
			citiesID = Object.keys(cityAgreements)
			for(var i = 0; i < citiesID.length - 1; i++){
				var city = citiesID[i]

				if(cityAgreements[city] > 0){
					if((cityAgreements[city] + cityAgreements.notCare) != groupSize){
						svgHtml += `<g id='city-group-${city}' transform='translate(0, ${-notAdded*26})'>
									<rect id='left-rect' class='criteria-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${2 + i*26}' style='opacity: 0'/>
									<text id='left-text' class='category-text' x='11' y='${i*26 + 18}'>${getCityName(city)}</text>
									<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (cityAgreements[city] + cityAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
									<g class='city-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}else{
						cityAgreed++;
						svgHtml += `<g id='city-group-${city}' transform='translate(0, ${-notAdded*26})'>
									<rect id='left-rect' class='criteria-rect agreed-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${i*26 + 2}'/>
									<text id='left-text' class='agreed-text' x='11' y='${i*26 + 18}'>${getCityName(city)}</text>
									<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>Yes!</text>
									<g class='city-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}
				}else{
					if(cityAgreements.notCare == groupSize){
						cityAgreed++;
						svgHtml += `<g id='city-group-${city}' style='opacity: 0'>
									<rect id='left-rect' class='criteria-rect agreed-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${i*26 + 2}'/>
									<text id='left-text' class='agreed-text' x='11' y='${i*26 + 18}'>${getCityName(city)}</text>
									<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>Yes!</text>
									<g class='city-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}else{		
						svgHtml += `<g id='city-group-${city}' style='opacity: 0'>
									<rect id='left-rect' class='criteria-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${i*26 + 2}' style='opacity: 0'/>
									<text id='left-text' class='category-text' x='11' y='${i*26 + 18}'>${getCityName(city)}</text>
									<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (cityAgreements[city] + cityAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
									<g class='city-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}
					notAdded++;
				}
			}
			// append place category svg to html
			$('#cities-svg-container').append(`<svg id='cities-svg' height='${(citiesID.length - 1 - notAdded)*26 + 2}' width='${202 + (groupSize-1)*30}'>
													${svgHtml}
													<rect id='city-disagreed-border' class='disagreed-inner-border' x='2' y='1' width='${198 + (groupSize-1)*30}' height='${(citiesID.length - 1 - notAdded)*26}' style='opacity: 0'></rect>
												</svg>`)

			$('#cities-svg-container .check-box, #cities-svg-container image').click(function(){
				var city = $(this).parent().attr('id').slice(11)

				if(userCDQ.cities !== false && userCDQ.cities.indexOf(city) != -1){
					userCDQ.cities.splice(userCDQ.cities.indexOf(city), 1)
					if(cityAgreements[city] == (groupSize - cityAgreements.notCare))
						cityAgreed--;
					cityAgreements[city]--
					socket.emit('city change', {cityId: city, change: -1})
					updateCityAgreement(city)
					if(cityAgreements[city] == 0)
						clearDisagreedCity();
					

					$('#city-group-' + city + ' .check-mark').css('opacity', 0)

					for(var i = 1; i < members.length; i++){
						$('#city-group-' + city + ' > .city-members-sel image:nth-child(' + (2*i) + ')').css({'opacity': 0, 'cursor': 'auto'})
					}

					getLocations()
				}else{
					
					if($('#city-no-pref').is(":checked")){
						$('#cities-svg .check-box').css('fill', '#FFF')
						$('#cities-svg .check-nopref').css('opacity', 0)
						$('#city-no-pref').prop('checked', false)
						socket.emit('city change all', {change: -1})
						updateCityAgreementAll(-1, false)
						userCDQ.cities = []
					}
					userCDQ.cities.push(city)
					
					cityAgreements[city]++;
					if(cityAgreements[city] == (groupSize - cityAgreements.notCare))
						cityAgreed++;
					socket.emit('city change', {cityId: city, change: 1})
					updateCityAgreement(city)

					$('#city-group-' + city + ' .check-mark').css('opacity', 1)

					for(var i = 1; i < members.length; i++){
						var member = members[i]
						var isSelected = member.cities === false || member.cities.indexOf(city) != -1
						if(!isSelected){
							$('#city-group-' + city + ' > .city-members-sel image:nth-child(' + (2*i) + ')').css('opacity', 1)
							if($('#city-show-all').is(':checked'))
								$('#city-group-' + city + ' > .city-members-sel image:nth-child(' + (2*i) + ')').css('cursor', 'pointer')
						}
					}

					getLocations()
				}
			})

			if(cityAgreed == 0){
				$('#city-disagreed-border').css('opacity', 1)
				$('#cities-svg text').addClass('disagreed-text')
				$('#cities-svg .agreement-rect').addClass('disagreed-rect')
			}

			var allNoPref = true

			if(members[0].cities !== false){
				allNoPref = false
				$('#city-no-pref').prop('checked', false)
				var citiesID = Object.keys(cityAgreements)
				for(i = 0; i < citiesID.length - 1; i++){
					var city = citiesID[i]
					$('#city-group-' + city + ' .check-nopref').css('opacity', 0)
					if(members[0].cities.indexOf(city) != -1){
						$('#city-group-' + city + ' .check-mark').css('opacity', 1)
						if(cityAgreements[city] + cityAgreements.notCare == groupSize)
							$('#city-group-' + city + ' > .check-box').css('fill', '#1F77B5')
						else
							$('#city-group-' + city + ' > .check-box').css('fill', '#AEC7E8')
					}else{
						$('#city-group-' + city + ' > .check-box').css('fill', '#FFF')
					}
				}
			}


			// append rectangles to place category svg to display other members' preferences
			var citiesID = Object.keys(cityAgreements)
			for(i = 0; i < citiesID.length - 1; i++){
				var city = citiesID[i]
				var userSelected = userCDQ.cities && userCDQ.cities.includes(city)
				var groupHtml = ''
				for(k = 1; k < members.length; k++){
					var member = members[k]
					var isSelected = member.cities === false || member.cities.indexOf(city) != -1
					// todo allNoPref = allNoPref & !member.cities
					groupHtml += `<rect class='criteria-rect' x='${201 + (k-1)*30}' y='${$('#city-group-' + city + ' > #right-rect').attr('y')}' width='30' height='26' 
										style='fill:${colors[k]}; ${isSelected ? '' : 'opacity: 0'}'/>
								  <image id='ping-city-${city}-${member.id}' class='test-ping' href='img/CDQ_ping.png'
								  		 x='${201 + (k-1)*30 + 7}' y='${$('#city-group-' + city + ' > #right-rect').attr('y')/1 + 6}'
								  		 width='14px' height='14px'
								 		 style='${(isSelected || !userSelected) ? 'opacity: 0' : ''}'/>`
				}
				$('#city-group-' + city + ' > .city-members-sel').html(groupHtml)
			}
			/* todo
			if(allNoPref){
				var locCategories = Object.keys(topAgreements)
				var totalAdded = 0;
				var added = 0;
				for(i = 0; i < locCategories.length - 1; i++){
					var category = locCategories[i]
	                if(!typesChosen[category])
	                    continue;
					if(added > 0 || totalAdded > 0){
						totalAdded += added;
						if($('#top-type-' + category).attr('transform'))
							$('#top-type-' + category).attr('transform', $('#top-type-' + category).attr('transform') + ' translate(0, ' + totalAdded*26 + ')')
						else
							$('#top-type-' + category).attr('transform', 'translate(0, ' + totalAdded*26 + ')')
						added = 0;
					}
					var topKeyList = Object.keys(topAgreements[category])
					for(j = 0; j < topKeyList.length; j++){
						var top = topKeyList[j]
						if(topAgreements[category][top] == 0){
							$('#top-group-' + top).css('opacity', 1)
							added++;
						}else if(added > 0){
							$('#top-group-' + top).attr('transform', '')
						}
					}
					if(added > 0){
						$('#top-type-'+category+' > #top-type-label').attr('height', added*26 + $('#top-type-'+category+' > #top-type-label').attr('height')/1)
						$('#top-type-'+category+' .category-label').show()
						$('#top-disagreed-border').attr('height', added*26 + $('#top-disagreed-border').attr('height')/1)
						$('#top-svg').attr('height', added*26 + $('#top-svg').height()/1)
					}
				}
				$('#top-show-categories').attr('checked', true)
			}*/







			// DATETIME
			var notAdded = 0;
			svgHtml = ''
			datetimeID = Object.keys(datetimeAgreements)
			for(var i = 0; i < datetimeID.length - 1; i++){
				var datetime = datetimeID[i]
				var datetimeStr = `${datetime.slice(0,4)}-${datetime.slice(4,6)}-${datetime.slice(6,8)} ${datetime.slice(8,10)}:${datetime.slice(10,12)}`

				if(datetimeAgreements[datetime] > 0){
					if((datetimeAgreements[datetime] + datetimeAgreements.notCare) != groupSize){
						svgHtml += `<g id='datetime-group-${datetime}' transform='translate(0, ${-notAdded*26})'>
									<rect id='left-rect' class='criteria-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${2 + i*26}' style='opacity: 0'/>
									<text id='left-text' class='category-text' x='11' y='${i*26 + 18}'>${datetimeStr}</text>
									<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (datetimeAgreements[datetime] + datetimeAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
									<g class='datetime-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}else{
						datetimeAgreed++;
						svgHtml += `<g id='datetime-group-${datetime}' transform='translate(0, ${-notAdded*26})'>
									<rect id='left-rect' class='criteria-rect agreed-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${i*26 + 2}'/>
									<text id='left-text' class='agreed-text' x='11' y='${i*26 + 18}'>${datetimeStr}</text>
									<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>Yes!</text>
									<g class='datetime-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}
				}else{
					if(datetimeAgreements.notCare == groupSize){
						datetimeAgreed++;
						svgHtml += `<g id='datetime-group-${datetime}' style='opacity: 0'>
									<rect id='left-rect' class='criteria-rect agreed-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${i*26 + 2}'/>
									<text id='left-text' class='agreed-text' x='11' y='${i*26 + 18}'>${datetimeStr}</text>
									<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>Yes!</text>
									<g class='datetime-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}else{		
						svgHtml += `<g id='datetime-group-${datetime}' style='opacity: 0'>
									<rect id='left-rect' class='criteria-rect' width='160' height='26' x='1' y='${i*26 + 1}'/>
									<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${i*26 + 1}'/>
									<rect id='inner-border' class='agreed-inner-border' width='${198 + (groupSize-1)*30}' height='24' x='2' y='${i*26 + 2}' style='opacity: 0'/>
									<text id='left-text' class='category-text' x='11' y='${i*26 + 18}'>${datetimeStr}</text>
									<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${i*26 + 18}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (datetimeAgreements[datetime] + datetimeAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
									<g class='datetime-members-sel' style="opacity: 0; transition: 0.2s"></g>
									<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${i*26 + 1}'/>
									<image class="check-mark" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 0'/>
									<image class="check-nopref" href="img/CDQ_check.png" x='172' y='${i*26 + 7}' height='13px' width='19px' style='opacity: 1'/>
									</g>`
					}
					notAdded++;
				}
			}
			// append place category svg to html
			$('#datetime-svg-container').append(`<svg id='datetime-svg' height='${(datetimeID.length - 1 - notAdded)*26 + 2}' width='${202 + (groupSize-1)*30}'>
													<g class="datetime-options">
														${svgHtml}
													</g>
													<rect id='datetime-disagreed-border' class='disagreed-inner-border' x='2' y='1' width='${198 + (groupSize-1)*30}' height='${(datetimeID.length - 1 - notAdded)*26}' style='opacity: 0'></rect>
												</svg>`)

			setDatetimeCheckboxHandler()

			if(datetimeAgreed == 0){
				$('#datetime-disagreed-border').css('opacity', 1)
				$('#datetime-svg text').addClass('disagreed-text')
				$('#datetime-svg .agreement-rect').addClass('disagreed-rect')
			}

			var allNoPref = true

			if(members[0].datetime !== false){
				allNoPref = false
				$('#datetime-no-pref').prop('checked', false)
				var datetimeID = Object.keys(datetimeAgreements)
				for(i = 0; i < datetimeID.length - 1; i++){
					var datetime = datetimeID[i]
					$('#datetime-group-' + datetime + ' .check-nopref').css('opacity', 0)
					if(members[0].datetime.indexOf(datetime) != -1){
						$('#datetime-group-' + datetime + ' .check-mark').css('opacity', 1)
						if(datetimeAgreements[datetime] + datetimeAgreements.notCare == groupSize)
							$('#datetime-group-' + datetime + ' > .check-box').css('fill', '#1F77B5')
						else
							$('#datetime-group-' + datetime + ' > .check-box').css('fill', '#AEC7E8')
					}else{
						$('#datetime-group-' + datetime + ' > .check-box').css('fill', '#FFF')
					}
				}
			}


			// append rectangles to place category svg to display other members' preferences
			var datetimeID = Object.keys(datetimeAgreements)
			for(i = 0; i < datetimeID.length - 1; i++){
				var datetime = datetimeID[i]
				var userSelected = userCDQ.datetime && userCDQ.datetime.includes(datetime)
				var groupHtml = ''
				for(k = 1; k < members.length; k++){
					var member = members[k]
					var isSelected = member.datetime === false || member.datetime.indexOf(datetime) != -1
					// todo allNoPref = allNoPref & !member.datetime
					groupHtml += `<rect class='criteria-rect' x='${201 + (k-1)*30}' y='${$('#datetime-group-' + datetime + ' > #right-rect').attr('y')}' width='30' height='26' 
										style='fill:${colors[k]}; ${isSelected ? '' : 'opacity: 0'}'/>
								  <image id='ping-datetime-${datetime}-${member.id}' class='test-ping' href='img/CDQ_ping.png'
								  		 x='${201 + (k-1)*30 + 7}' y='${$('#datetime-group-' + datetime + ' > #right-rect').attr('y')/1 + 6}'
								  		 width='14px' height='14px'
								 		 style='${(isSelected || !userSelected) ? 'opacity: 0' : ''}'/>`
				}
				$('#datetime-group-' + datetime + ' > .datetime-members-sel').html(groupHtml)
			}
			/* todo
			if(allNoPref){
				var locCategories = Object.keys(topAgreements)
				var totalAdded = 0;
				var added = 0;
				for(i = 0; i < locCategories.length - 1; i++){
					var category = locCategories[i]
	                if(!typesChosen[category])
	                    continue;
					if(added > 0 || totalAdded > 0){
						totalAdded += added;
						if($('#top-type-' + category).attr('transform'))
							$('#top-type-' + category).attr('transform', $('#top-type-' + category).attr('transform') + ' translate(0, ' + totalAdded*26 + ')')
						else
							$('#top-type-' + category).attr('transform', 'translate(0, ' + totalAdded*26 + ')')
						added = 0;
					}
					var topKeyList = Object.keys(topAgreements[category])
					for(j = 0; j < topKeyList.length; j++){
						var top = topKeyList[j]
						if(topAgreements[category][top] == 0){
							$('#top-group-' + top).css('opacity', 1)
							added++;
						}else if(added > 0){
							$('#top-group-' + top).attr('transform', '')
						}
					}
					if(added > 0){
						$('#top-type-'+category+' > #top-type-label').attr('height', added*26 + $('#top-type-'+category+' > #top-type-label').attr('height')/1)
						$('#top-type-'+category+' .category-label').show()
						$('#top-disagreed-border').attr('height', added*26 + $('#top-disagreed-border').attr('height')/1)
						$('#top-svg').attr('height', added*26 + $('#top-svg').height()/1)
					}
				}
				$('#top-show-categories').attr('checked', true)
			}*/


			// todo add datetime
			$("#input-date").change(function(){
				verify_datetime()
			})

			$("#input-time").change(function(){
				verify_datetime()
			})

			$("#add-datetime").click(function(){
				if($(this).attr("class") == "btn"){
					socket.emit('add datetime', formatDateTime($('#input-date').val(), $('#input-time').val()))
					$("#input-date").val("")
					$("#input-time").val("")
					$(this).attr("class", "btn_dis")
				}
			})


			setPingHandlers()

			// PLACE LIST: get data, store data and display
			getFavoritesAndLocations()

			$('input[type=radio][name=place-list]').change(function(){
				if(this.value === 'personal'){
					$('#places-container').show()
					$('#favs-container').hide()
					$('#load-more-places').show()
				}else if(this.value === 'archive'){
					$('#places-container').hide()
					$('#favs-container').show()
					$('#load-more-places').hide()
				}
				if($('#middle > .column-content')[0].scrollHeight > $('#middle > .column-content').height())
					$('#middle > .column-content').css('overflow-y', 'scroll')
				else
					$('#middle > .column-content').css('overflow-y', 'hidden')
			})

			// TEST PINGS
			getPings()

			// MESSAGES: get data and display
			$.ajax({
				type: 'GET',
				url: "/get_msgs",
				dataType: 'json',
				success: function(data){
					var msgs = data[0]
					currentMsgIndex = data[1]
					if(msgs.length > 0)
						$('#chat-container .nothing-msg').hide();
					for(i=0; i < msgs.length; i++){
						var entry = msgs[i];
						var date = new Date(entry.timestamp)
						var dateStr = getDate(date)
						var msgGroupId = 'msg-group-' + dateStr.slice(0, dateStr.length-6)
						if($('#' + msgGroupId).length == 0)
							$("#msg-list").append(`<div id='${msgGroupId}'><div class='date-separation'>${dateStr}</div></div>`)
						if(entry.user_id === userCDQ.id)
							$('#' + msgGroupId).append(`<div class='msg-entry'>
															<div class='msg-pic-section'><img src='profile_imgs/${members[0].filename}' style='border-color:${colors[0]}'/></div>
															<div class='msg-text-section'>
																<h1>${members[0].firstname} ${members[0].lastname} <span class='msg-date'>${getTime(date)}</span></h1>
																<p>${highlightMention(entry.txt)}</p>
															</div>
														</div>`)
						else{
							var index = members.findIndex(function(member){
								return this.id === member.id
							}, {id: entry.user_id})
							$('#' + msgGroupId).append(`<div class='msg-entry'>
															<div class='msg-pic-section'><img src='profile_imgs/${members[index].filename}' style='border-color:${colors[index]}'/></div>
															<div class='msg-text-section'>
																<h1>${members[index].firstname} ${members[index].lastname} <span class='msg-date'>${getTime(date)}</span></h1>
																<p>${highlightMention(entry.txt)}</p>
															</div>
														</div>`)
						}
					}
					if(currentMsgIndex == 0)
						$('#load-more').hide();
					$("#right .column-content").scrollTop($('#right .column-content').prop("scrollHeight"))

					$('#SCR_MAIN').fadeIn()

					// SCREEN RESIZE
					var windowHeight = $(window).height();
					$('#middle').height(windowHeight - 110)
					$('#right').height(windowHeight - 110)
					$('#left').height(windowHeight - 110)
					$('#left > .column-content').height(windowHeight - 110 - 110)
					$('#middle > .column-content').height(windowHeight - 110 - 110)
					$('#right > .column-content').height(windowHeight - 110 - 110 - inputHeight - 6)
					if($('#left > .column-content')[0].scrollHeight > $('#left > .column-content').height())
						$('#left > .column-content').css('overflow-y', 'scroll')
					if($('#middle > .column-content')[0].scrollHeight > $('#middle > .column-content').height())
						$('#middle > .column-content').css('overflow-y', 'scroll')
					if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
						$('#right > .column-content').css('overflow-y', 'scroll')
					$("#right .column-content").scrollTop($("#right .column-content")[0].scrollHeight)
					if(windowHeight < 700){
						var newPhotoHeight = 230 - (700 - windowHeight)
						$('#place-detail-photo').css('height', newPhotoHeight)
						$('#mapid').css('height', newPhotoHeight)
						$('.place-detail').css({height: 470 + newPhotoHeight, top: 0})
					}else{
						var diff = windowHeight - 700
						$('#place-detail-photo').css('height', 230)
						$('#mapid').css('height', 230)
						$('.place-detail').css({height: 700, top: diff/2})
					}
				}
			})
		}
	})

	// LOAD MORE PLACES
	$("#middle .column-content").scroll(function(){
		if($(this).scrollTop() + $(this).height() == $(this).prop('scrollHeight')){
			if(placesLoaded != placesList.length){
				$("#load-more-places").fadeOut(200, function(){
					if(placesLoaded + 20 < placesList.length){
						$('#places-list').append(placesList.slice(placesLoaded, placesLoaded + 20).map(place => place.html).join(''))
						placesLoaded = placesLoaded + 20
					}else{
						$('#places-list').append(placesList.slice(placesLoaded, placesList.length).map(place => place.html).join(''))	
						placesLoaded = placesList.length
					}
					if(placesLoaded != placesList.length){
						$("#load-more-places").html("Scroll up to Load More Messages");
						$("#load-more-places").show()
					}
				});
			}
		}
	})
	
	$('#home-btn').click(function(){
		window.location.href = 'http://' + ip_address + ':8000';
	})

	$(window).resize(function(){
		var windowHeight = $(window).height();

		if(windowHeight < 700){
			var newPhotoHeight = 230 - (700 - windowHeight)
			$('#place-detail-photo').css('height', newPhotoHeight)
			$('#mapid').css('height', newPhotoHeight)
			$('.place-detail').css({height: 470 + newPhotoHeight, top: 0})
		}else{
			var diff = windowHeight - 700
			$('#place-detail-photo').css('height', 230)
			$('#mapid').css('height', 230)
			$('.place-detail').css({height: 700, top: diff/2})
		}

		$('#middle').height(windowHeight - 110)
		$('#right').height(windowHeight - 110)
		$('#left').height(windowHeight - 110)
		$('#left > .column-content').height(windowHeight - 110 - 110)
		$('#middle > .column-content').height(windowHeight - 110 - 110)
		$('#right > .column-content').height(windowHeight - 110 - 110 - inputHeight - 6)
		if($('#left > .column-content')[0].scrollHeight > $('#left > .column-content').height())
			$('#left > .column-content').css('overflow-y', 'scroll')
		else
			$('#left > .column-content').css('overflow-y', 'hidden')
		if($('#middle > .column-content')[0].scrollHeight > $('#middle > .column-content').height())
			$('#middle > .column-content').css('overflow-y', 'scroll')
		else
			$('#middle > .column-content').css('overflow-y', 'hidden')
		if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
			$('#right > .column-content').css('overflow-y', 'scroll')
		else
			$('#right > .column-content').css('overflow-y', 'hidden')
	})
})


// based on the individual members' CDQs it creates objects that contain the 
// total or combination of these preferences
function compileMembersCDQ(members){
	for(var i = 0; i < datetimesList.length; i++)
		datetimeAgreements[datetimesList[i]] = 0

	datetimeAgreements.notCare = 0;

	for(var i = 0; i < members.length; i++){
		var member = members[i];
		if(member.top === false)
			topAgreements.notCare++;
		else{
			for(var j = 0; j < member.top.length; j++){
				var topId = member.top[j].split('_')
				topAgreements[topId[0]][topId[1]]++;
			}
		}
		if(member.price){
			for(var m = stringToPriceIndex(member.price.max); m < stringToPriceIndex(member.price.min) + 1; m++)
				priceAgreements[m]++
		}else{
			priceAgreements[4]++;
		}

		if(member.rating != -1){
			for(m = 0; m < minToRatingIndex(member.rating) + 1; m++)
				ratingAgreements[m]++
		}else{
			ratingAgreements[5]++
		}

		if(member.reviews){
			for(var m = reviewToIndex(member.reviews.max); m < reviewToIndex(member.reviews.min); m++)
				reviewAgreements[m]++
		}else{
			reviewAgreements[5]++;
		}

		if(member.cities === false)
			cityAgreements.notCare++;
		else{
			for(var j = 0; j < member.cities.length; j++){
				cityAgreements[member.cities[j]]++;
			}
		}
		
		if(member.datetime === false)
			datetimeAgreements.notCare++;
		else{
			for(var j = 0; j < member.datetime.length; j++){
				datetimeAgreements[member.datetime[j]]++
			}
		}

	}
}

function getDate(date){
	var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = days[date.getDay()]
	var date = date.getDate()

	if(month < 10)
		month = '0' + month
	if(date < 10)
		date = '0' + date

	return `${month}-${date}-${year} (${day})`
}

function getTime(date){
	var amOrPm = 'AM'
	var hour = date.getHours()
	if(hour > 11){
		amOrPm = 'PM'
		if(hour > 12)
			hour = hour-12
	}else if(hour == 0)
		hour = 12
	var minute = date.getMinutes()
	if(minute < 10)
		minute = '0' + minute
	return `${hour}:${minute} ${amOrPm}`
}

// PLACES list

function getLocations(){
	// var preferences = {topList: userCDQ.top, price: userCDQ.price, rating: userCDQ.rating, reviews: userCDQ.reviews}

	var preferences = {topList: userCDQ.top, price: userCDQ.price, rating: userCDQ.rating, reviews: userCDQ.reviews, cities: userCDQ.cities}
	preferences.price = preferences.price ? {min: preferences.price.min.length, max: preferences.price.max.length} : {min: 1, max: 4}

	if(preferences.rating == -1)
		preferences.rating = 0

	if(!preferences.reviews)
		preferences.reviews = {min: 0, max: 1001}

	numQueued++
	var queuedIndex = numQueued

	$('#places-list').html("<div class='place-loading'>Loading...</div>")
	$('#num-ego-cen').html('')
	$('#load-more-places').hide()

	$.ajax({
		type: 'POST',
		url: '/get_places',
		data: JSON.stringify(preferences),
		dataType: 'json',
		contentType: 'application/json',
		success: function(list){
			if(numQueued == queuedIndex){
				placesList = [];
				for(var i = 0; i < list.length; i++){
					var entry = list[i]
					entry.agree = []
					entry.disagree = []
					var agreeImgs = ''
					var disagreeImgs = ''
					for(var j = 0; j < members.length; j++){
						var member = members[j]
						var agree = (!member.top || member.top.includes(entry.top)) && (member.rating == -1 || member.rating <= entry.rating) && 
									(!member.price || (member.price.min.length <= entry.price && entry.price <= member.price.max.length)) &&
									(!member.reviews || member.reviews.min <= entry.reviews) &&
									(!member.cities || member.cities.includes(entry.city))
						if(member.reviews && member.reviews.max != 1001)
							agree = agree && (entry.reviews <= member.reviews.max)

						if(agree){
							entry.agree.push({id: member.id, filename: member.filename, index: j})
							agreeImgs += `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[j]}">`
						}else{
							entry.disagree.push({id: member.id, filename: member.filename, index: j})
							disagreeImgs += `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[j]}" data-userid='${member.id}' data-placeid='${entry.id}'>`
						}
					}

					var ratingHtml = ''
					var left = entry.rating/1
					for(j = 0; j < 5; j++){
						if(left == 0.5){
							ratingHtml += "<span><img src='img/List_star_dot5.png'></span>"
							left -= 0.5
						}else if(left == 0)
							ratingHtml += "<span><img src='img/List_star_0.png'></span>"
						else{
							ratingHtml += "<span><img src='img/List_star_1.png'></span>"
							left--;
						}

					}

					entry.html = `<div id='place-${entry.id}' class='place-entry' style='cursor: pointer'>
										<div class='place-img-section'>
											<img src='${entry.photo}0.jpg'/>
											<img id="check-place-${entry.id}" class='bookmark-button' src="img/LIST_favoff.png">
										</div>
										<div class='place-info-section'>
											<h1>${topNames[entry.top.split('_')[1]]}</h1>
											<h1><b>${entry.name} | ${'$'.repeat(entry.price)}</b></h1>
											<div class='place-reviews'>
												${ratingHtml}
												<span>${entry.reviews} reviews</span>
											</div>
											<h2>${entry.address} | ${getCityName(entry.city)}</h2>
											<div class='place-agreement-info'>
												<div class='place-agrees'>
													<h2><b> Agreed: </b></h2>
													<div class='img-list'>${agreeImgs}</div>
												</div>
												<div class='place-disagrees'>
													<h2><b> Disagreed: </b></h2>
													<div class='img-list'>${disagreeImgs}</div>
												</div>
											</div>
										</div>
									</div>`

					placesList.push(entry)
				}
				$('#num-ego-cen').html(placesList.length + ' places')

				// LOAD MORE PLACES
				if(placesList.length == 0){
					placesLoaded = 0
					$("#places-list").html("<div class='nothing-msg' style='width: 540px'> No places to show </div>")
					$('#middle > .column-content').css('overflow-y', 'hidden')
				}else{
					placesList.sort(placeListSort)
					if(placesList.length > 20){
						placesLoaded = 20
						$('#load-more-places').show()
						$('#places-list').html(placesList.slice(0,20).map(place => place.html).join(''))
					}else{
						placesLoaded = placesList.length
						$('#load-more-places').hide()
						$('#places-list').html(placesList.map(place => place.html).join(''))
					}

					$('#places-list .place-entry').click(function(e){
						if(!$('.place-disagrees img').is(e.target) && !$('.bookmark-button').is(e.target))
							getAndDisplayPlaceDetails($(this).attr('id').slice(6), 'places')
					})

					$('#places-list .place-entry:first-child .place-agreement-info').append(`<p style='margin: 0; font-size: 12px; color: #d21c5d'>Tip: You can click a profile of those who disagree to "ping" this location.</p>`)

					setCandidatePingInteraction('places')

					$("#places-list .bookmark-button").click(function(){
						var id = $(this).attr("id").slice(12,)
						if($(this).attr('src') === 'img/LIST_favoff.png'){
							socket.emit('add fav', id)
							$(this).attr('src', 'img/LIST_favon.png')
							$('.ping-tooltip').html(`Remove this place from Group Bookmark`)
						}else{
							socket.emit('remove fav', id)
							for(var j = 0; j < favsList.length; j++){
								if(favsList[j].id === id){
									favsList.splice(j, 1)
									$("#fav-" + id).remove();
									$(this).attr('src', 'img/LIST_favoff.png')
									$('.ping-tooltip').html(`Add this place from Group Bookmark`)
									$('#num-fav').html(favsList.length + ' places')
									break;
								}
							}
						}
					})

					$('#places-list .bookmark-button').mouseover(function(e){
						if($(this).attr('src') === 'img/LIST_favon.png')
							$('.ping-tooltip').html(`Remove this place from Group Bookmark`)
						else
							$('.ping-tooltip').html(`Add this place from Group Bookmark`)
						$('.ping-tooltip').css({left: e.pageX + 15 + 'px', top: e.pageY + 'px'})
						$('.ping-tooltip').css('visibility', 'visible')
					}).mouseout(function(){
						$('.ping-tooltip').css('visibility', 'hidden')
					})

					if($('#middle > .column-content')[0].scrollHeight > $('#middle > .column-content').height())
						$('#middle > .column-content').css('overflow-y', 'scroll')
					else
						$('#middle > .column-content').css('overflow-y', 'hidden')
				}

				for(var j = 0; j < favsList.length; j++){
					if(favsList[j].user !== userCDQ.id)
						$("#place-" + favsList[j].id + " .bookmark-button").remove()
					else
						$("#place-" + favsList[j].id + " .bookmark-button").attr('src', 'img/LIST_favon.png')
				}
			}
		}
	})
}

function getFavoritesAndLocations(){
	$.ajax({
		type: 'GET',
		url: '/get_favorites',
		contentType: 'application/json',
		success: function(list){
			for(var i = 0; i < list.length; i++){
				var entry = list[i]
				entry.agree = []
				entry.disagree = []
				var agreeImgs = ''
				var disagreeImgs = ''
				for(var j = 0; j < members.length; j++){
					var member = members[j]
					var agree = (!member.top || member.top.includes(entry.top)) && (member.rating == -1 || member.rating <= entry.rating) && 
								(!member.price || (member.price.min.length <= entry.price && entry.price <= member.price.max.length)) &&
								(!member.reviews || member.reviews.min <= entry.reviews) &&
								(!member.cities || member.cities.includes(entry.city))
					if(member.reviews && member.reviews.max != 1001)
						agree = agree && (entry.reviews <= member.reviews.max)

					if(agree){
						entry.agree.push({id: member.id, filename: member.filename, index: j})
						agreeImgs += `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[j]}">`
					}else{
						entry.disagree.push({id: member.id, filename: member.filename, index: j})
						disagreeImgs += `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[j]}" data-userid='${member.id}' data-placeid='${entry.id}'>`
					}
				}

				var ratingHtml = ''
				var left = entry.rating/1
				for(j = 0; j < 5; j++){
					if(left == 0.5){
						ratingHtml += "<span><img src='img/List_star_dot5.png'></span>"
						left -= 0.5
					}else if(left == 0)
						ratingHtml += "<span><img src='img/List_star_0.png'></span>"
					else{
						ratingHtml += "<span><img src='img/List_star_1.png'></span>"
						left--;
					}

				}

				entry.html = `<div id='fav-${entry.id}' class='place-entry' style='cursor: pointer'>
									<div class='place-img-section'>
										<img src='${entry.photo}0.jpg'/>
										${entry.user === userCDQ.id ? '<img id="check-fav-' + entry.id + '" class="bookmark-button" src="img/LIST_favon.png">' : ''}
									</div>
									<div class='place-info-section'>
										<h1>${topNames[entry.top.split('_')[1]]}</h1>
										<h1><b>${entry.name} | ${'$'.repeat(entry.price)}</b></h1>
										<div class='place-reviews'>
											${ratingHtml}
											<span>${entry.reviews} reviews</span>
										</div>
										<h2>${entry.address} | ${getCityName(entry.city)}</h2>
										<div class='place-agreement-info'>
											<div class='place-agrees'>
												<h2><b> Agreed: </b></h2>
												<div class='img-list'>${agreeImgs}</div>
											</div>
											<div class='place-disagrees'>
												<h2><b> Disagreed: </b></h2>
												<div class='img-list'>${disagreeImgs}</div>
											</div>
										</div>
									</div>
								</div>`
				favsList.push(entry)
			}
			$('#num-fav').html(favsList.length + ' places')

			// LOAD MORE PLACES
			if(favsList.length == 0){
				$("#favs-list").html("<div class='nothing-msg' style='width: 540px'> No places to show </div>")
				$('#middle > .column-content').css('overflow-y', 'hidden')
			}else{
				favsList.sort(placeListSort)
				$('#favs-list').html(favsList.map(place => place.html).join(''))

				if($('#middle > .column-content')[0].scrollHeight > $('#middle > .column-content').height())
					$('#middle > .column-content').css('overflow-y', 'scroll')
				else
					$('#middle > .column-content').css('overflow-y', 'hidden')
			}

			$('#favs-list .place-entry').click(function(e){
				if(!$('.place-disagrees img').is(e.target) && !$('.bookmark-button').is(e.target))
					getAndDisplayPlaceDetails($(this).attr('id').slice(4), 'favs')
			})

			setCandidatePingInteraction('favs')

			$("#favs-list .bookmark-button").click(function(){
				var id = $(this).attr("id").slice(10,)
				socket.emit('remove fav', id)
				for(var j = 0; j < favsList.length; j++){
					if(favsList[j].id === id){
						favsList.splice(j, 1)
						$("#fav-" + id).remove();
						$("#place-" + id + " .bookmark-button").attr('src', 'img/LIST_favoff.png')
						$('#num-fav').html(favsList.length + ' places')
						if($('#middle > .column-content')[0].scrollHeight <= $('#middle > .column-content').height())
							$('#middle > .column-content').css('overflow-y', 'hidden')
						break;
					}
				}
			})

			$('#favs-list .bookmark-button').mouseover(function(e){
				$('.ping-tooltip').html(`Remove this place from Group Bookmark`)
				$('.ping-tooltip').css({left: e.pageX + 15 + 'px', top: e.pageY + 'px'})
				$('.ping-tooltip').css('visibility', 'visible')
			}).mouseout(function(){
				$('.ping-tooltip').css('visibility', 'hidden')
			})

			getLocations();
		}
	})
}

function changeMemberAgreement(member, isNew){
	for(var i = 0; i < placesList.length; i++){
		var place = placesList[i]
		var change = false;

		if(!isNew){
			var agree = (!member.top || member.top.includes(place.top)) && (member.rating == -1 || member.rating <= place.rating) && 
						(!member.price || (member.price.min.length <= place.price && place.price <= member.price.max.length)) &&
						(!member.reviews || member.reviews.min <= place.reviews) &&
						(!member.cities || member.cities.includes(place.city))

			var disagreedIndex = place.disagree.findIndex(entry => member.id === entry.id)
			if(disagreedIndex != -1 && agree){
				var removed = place.disagree.splice(disagreedIndex, 1)
				place.agree.push(removed[0])
				change = true;
			}else if(!agree){
				var agreedIndex = place.agree.findIndex(entry => member.id === entry.id)
				if(agreedIndex != -1){
					var removed = place.agree.splice(agreedIndex, 1)
					place.disagree.push(removed[0])
					change = true
				}
			}
		}else{
			var memberIndex = members.findIndex(entry => entry.id === member.id)
			place.agree.push({id: member.id, filename: member.filename, index: memberIndex})
			change = true;
		}

		var ratingHtml = ''
		var left = place.rating/1
		for(j = 0; j < 5; j++){
			if(left == 0.5){
				ratingHtml += "<span><img src='img/List_star_dot5.png'></span>"
				left -= 0.5
			}else if(left == 0)
				ratingHtml += "<span><img src='img/List_star_0.png'></span>"
			else{
				ratingHtml += "<span><img src='img/List_star_1.png'></span>"
				left--;
			}

		}

		if(change){
			place.html = `<div class='place-entry'>
							<div class='place-img-section'>
								<img src='${place.photo}0.jpg'/>
								<input type='checkbox'><span> Add this to group bookmark </span>
							</div>
							<div class='place-info-section'>
								<h1>${topNames[place.top.split('_')[1]]}</h1>
								<h1><b>${place.name} | ${'$'.repeat(place.price)}</b></h1>
								<div class='place-reviews'>
									${ratingHtml}
									<span>${place.reviews} reviews</span>
								</div>
								<h2>${place.address} | ${getCityName(place.city)}</h2>
								<div class='place-agreement-info'>
									<div class='place-agrees'>
										<h2><b> Agreed: </b></h2>
										<div class='img-list'>${place.agree.map(entry => `<img src="profile_imgs/${entry.filename}" style="border-color: ${colors[entry.index]}">`).join('')}</div>
									</div>
									<div class='place-disagrees'>
										<h2><b> Disagreed: </b></h2>
										<div class='img-list'>${place.disagree.map(entry => `<img src="profile_imgs/${entry.filename}" style="border-color: ${colors[entry.index]}" data-placeid="${place.id}" data-userid='${member.id}'>`).join('')}</div>
									</div>
								</div>
							</div>
						</div>`
		}
	}
	$('#places-list').html(placesList.slice(0, placesLoaded).map(place => place.html).join(''))
	setCandidatePingInteraction('places')
}


function placeListSort(first, second){
	if(first.agree.length == second.agree.length){
		if(first.rating == second.rating){
			return second.reviews - first.reviews
		}else
			return second.rating - first.rating
	}else
		return second.agree.length - first.agree.length
}

// PINGS
function getPings(){
	$.ajax({
		type: 'GET',
		url: "/get_pings",
		dataType: 'json',
		success: function(data){
			var receivedPings = 0;
			var sentPings = 0;
			for(var i = 0; i < data.length; i++){
				var ping = data[i]
				if(ping.ping_accepted == null && ping.ping_from_id !== userCDQ.id){
					ping.ping_cdq_action = JSON.parse(ping.ping_cdq_action)
					var category = Object.keys(ping.ping_cdq_action)[0]
					var option = ping.ping_cdq_action[category]

					var senderIndex = members.findIndex(member => member.id === ping.ping_from_id)

					var classStr = 'ping-' + category + '-'
					var descriptionHtml = ''
					if(category === 'top'){
						classStr += option
						descriptionHtml += `<b>${topNames[option.split('_')[1]]}</b> in your <b>Place Categories</b>`
					}else if(category === 'price'){
						classStr += option.length
						descriptionHtml += `<b>${option}</b> in your <b>Price Range</b>`
					}else if(category === 'rating'){
						classStr += option
						descriptionHtml += `<b>${option}</b> in your <b>Ratings</b>`
					}else if(category === 'review'){
						classStr += option
						if(option == 1001)
							descriptionHtml += `<b>Over 1000</b> in your <b> Number of Reviews</b>`
						else
							descriptionHtml += `<b>${option}</b> in your <b> Number of Reviews</b>`
					}else if(category === 'city'){
						classStr += option
						descriptionHtml += `<b>${getCityName(option)}</b> in your <b>Cities</b>`
					}else if(category === 'datetime'){
						classStr += option
						descriptionHtml += `<b>${option.slice(0,4)}-${option.slice(4,6)}-${option.slice(6,8)} ${option.slice(8,10)}:${option.slice(10,12)}</b> in your <b>Date/Time</b>`
					}

					$('#received-pings').prepend(`<div class='ping-entry ${classStr}' data-sender='${ping.ping_from_id}'>
													<div class='msg-pic-section'><img src='profile_imgs/${members[senderIndex].filename}' style='border-color:${colors[senderIndex]}'/></div>
													<div class='ping-text-section'>
														<h1><b style='color:${colors[senderIndex]}'>${members[senderIndex].firstname} ${members[senderIndex].lastname}</b> pinged you to: </br>
															include ${descriptionHtml}.</h1>
														<div>
															<span class='btn' onclick="acceptPing('${category}', '${option}')">ACCEPT</span>
															<span class='btn' onclick="rejectPing('${ping.ping_from_id}', '${category}', '${option}')">REJECT</span>
														</div>										
													</div>
												</div>`);
					receivedPings++
				}else if(ping.ping_from_id === userCDQ.id){
					ping.ping_cdq_action = JSON.parse(ping.ping_cdq_action)
					var category = Object.keys(ping.ping_cdq_action)[0]
					var option = ping.ping_cdq_action[category]

					var receiverIndex = members.findIndex(member => member.id === ping.ping_to_id)

					var classStr = 'ping-' + category + '-'
					var descriptionHtml = ''
					if(category === 'top'){
						classStr += option
						descriptionHtml += `<b>${topNames[option.split('_')[1]]}</b> in <b>Place Categories</b>`
					}else if(category === 'price'){
						classStr += option.length
						descriptionHtml += `<b>${option}</b> in <b>Price Range</b>`
					}else if(category === 'rating'){
						classStr += option
						descriptionHtml += `<b>${option}</b> in <b>Ratings</b>`
					}else if(category === 'review'){
						classStr += option
						if(option == 1001)
							descriptionHtml += `<b>Over 1000</b> in <b> Number of Reviews</b>`
						else
							descriptionHtml += `<b>${option}</b> in <b> Number of Reviews</b>`
					}else if(category === 'datetime'){
						classStr += option
						descriptionHtml += `<b>${option.slice(0,4)}-${option.slice(4,6)}-${option.slice(6,8)} ${option.slice(8,10)}:${option.slice(10,12)}</b> in <b>Date/Time</b>`
					}

					var status;
					if(ping.ping_accepted == null){
						status = 'Not accepted or rejected yet'
						$('[id^=' + classStr + '-' + ping.ping_to_id.split('@')[0] + ']').attr('href', 'img/CDQ_ping_TBD.png')
					}else if(ping.ping_accepted == 1)
						status = 'Accepted'
					else
						status = 'Rejected'

					$('#sent-pings').prepend(`<div class='ping-entry ${classStr}' data-receiver='${ping.ping_to_id}'>
													<div class='msg-pic-section'><img src='profile_imgs/${members[receiverIndex].filename}' style='border-color:${colors[receiverIndex]}'/></div>
													<div class='ping-text-section'>
														<h1>You asked <b style='color:${colors[receiverIndex]}'>${members[receiverIndex].firstname} ${members[receiverIndex].lastname}</b> </br>
															to include ${descriptionHtml}.</h1>
														<h1 style='margin-top: 10px'> <b>Status:</b> </br>
															 <span class='status'>${status}</span></h1>								
													</div>
												</div>`);
					sentPingsList.push({id: ping.ping_to_id, category: category, option: option, accepted: ping.ping_accepted});
					sentPings++;
				}
			}
			if(receivedPings > 0){
				$('#received-pings .nothing-msg').hide()
				$('#ping-unanswered').html('(' + receivedPings + ' unanswered)')
			}
			if(sentPings > 0)
				$('#sent-pings .nothing-msg').hide()
		}
	})
}

function getSearchSuggestions(){
	$.ajax({
		type: 'POST',
		url: '/get_search_suggestions',
		data: JSON.stringify({str: $('.input-search').val()}),
		dataType: 'json',
		contentType: 'application/json',
		success: function(list){
			$('#search-suggestions').html(list.map(str => '<option value=' + str + '>').join(''))
		}
	})
}

function setCandidatePingInteraction(type){
	$('#' + type + '-list .place-disagrees img').click(function(){
		var placeID = $(this).data('placeid')
		var memberID = $(this).data('userid')
		var place = placesList.find(entry => entry.id === placeID)
		var member = members.find(entry => entry.id === memberID)
		var pingInfo = {}
		if(!member.top.includes(place.top))
			pingInfo.top = place.top
		if(place.price > member.price.max.length || place.price < member.price.min.length)
			pingInfo.price = place.price
		if(place.rating/1 < member.rating)
			pingInfo.rating = place.rating

		var placeReviews = {}
		if(place.reviews >= 1000) 
			placeReviews = {max: 1001, min: 1000}
		else if(place.reviews >= 500)
			placeReviews = {max: 1000, min: 500}
		else if(place.reviews >= 100)
			placeReviews = {max: 500, min: 100}
		else if(place.reviews >= 50)
			placeReviews = {max: 100, min: 50}
		else
			placeReviews = {max: 50, min: 0}
		if(placeReviews.max > member.reviews.max)
			pingInfo.review = placeReviews.max
		else if(placeReviews.min < member.reviews.min)
			pingInfo.review = placeReviews.min

		var categories = Object.keys(pingInfo)
		pingInfo.id = memberID
		for(var i = 0; i < categories.length; i++){
			var category = categories[i]
			var option = pingInfo[categories[i]]

			var similarExists = false;
			for(var j = 0; j < sentPingsList.length; j++){
				var ping = sentPingsList[j]
				if(ping.id === pingInfo.id && ping.category === category && ping.option === option && ping.accepted == null)
					similarExists = true
			}
			if(!similarExists){
				var receiverIndex = members.findIndex(member => member.id === memberID)

				var classStr = 'ping-' + category + '-'
				var descriptionHtml = ''
				if(category === 'top'){
					classStr += option
					descriptionHtml += `<b>${topNames[option.split('_')[1]]}</b> in <b>Place Categories</b>`
				}else if(category === 'price'){
					classStr += option.length
					descriptionHtml += `<b>${option}</b> in <b>Price Range</b>`
				}else if(category === 'rating'){
					classStr += option
					descriptionHtml += `<b>${option}</b> in <b>Ratings</b>`
				}else if(category === 'review'){
					classStr += option
					if(option <= members[receiverIndex].reviews.min)
						option = indexToReview(reviewToIndex(option) + 1)
					if(option == 1001)
						descriptionHtml += `<b>Over 1000</b> in <b>Number of Reviews</b>`
					else
						descriptionHtml += `<b>${option}</b> in <b>Number of Reviews</b>`
				}else if(category === 'city'){
					classStr += option
					descriptionHTml += `<b>${getCityName(option)}</b> in <b>Cities</b>`
				}

				$('#sent-pings').prepend(`<div class='ping-entry ${classStr}' data-receiver='${memberID}'>
											<div class='msg-pic-section'><img src='profile_imgs/${members[receiverIndex].filename}' style='border-color:${colors[receiverIndex]}'/></div>
											<div class='ping-text-section'>
												<h1>You asked <b style='color:${colors[receiverIndex]}'>${members[receiverIndex].firstname} ${members[receiverIndex].lastname}</b> </br>
													to include ${descriptionHtml}.</h1>	
												<h1 style='margin-top: 10px'> <b>Status:</b></br>
													 <span class='status'>Not accepted or rejected yet</span></h1>						
											</div>
										</div>`);
				$('#sent-pings .nothing-msg').hide()
				sentPingsList.push({id: pingInfo.id, category: category, option: option, accepted: null})
			}
		}
		socket.emit('new ping candidate', pingInfo)
	})

	$('#' + type + '-list .place-disagrees img').mouseover(function(e){
		var place = placesList.find(entry => entry.id === $(this).data('placeid'))
		var member = members.find(member => member.id === $(this).data('userid'))
		var placeName = place.name
		var userName = member.firstname[0] + '.' + member.lastname[0] + '.'

		$('.ping-tooltip').html(`Ask ${name} to agree on "${placeName}"`)
		$('.ping-tooltip').css({left: e.pageX + 15 + 'px', top: e.pageY + 'px'})
		$('.ping-tooltip').css('visibility', 'visible')
	}).mouseout(function(){
		$('.ping-tooltip').css('visibility', 'hidden')
	})
}


function getAndDisplayPlaceDetails(placeID, type){
	var place = type === 'places' ? placesList.find(place => place.id === placeID) : favsList.find(place => place.id === placeID)

	displayPlaceDetails(place)
}

function displayPlaceDetails(place){
	$('.place-detail').data('id', place.id)
	$('#place-detail-photo').data('index', 0)
	$('#place-detail-photo').attr('src', place.photo + '0.jpg')
	mymap.setView([parseFloat(place.lat), parseFloat(place.lng)], 13);
	marker.setLatLng([parseFloat(place.lat), parseFloat(place.lng)])
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.streets',
	    accessToken: 'pk.eyJ1IjoidHNvb2siLCJhIjoiY2pmcWthc2QzMmFxajMzbXN0YjN1c2h1NyJ9.oePShXxHTrQVXZDhjJWoPg'
	}).addTo(mymap);

	$('#place-detail-name').html(place.name)

	var left = place.rating/1
	var ratingImgs = ''
	for(var i = 0; i < 5; i++){
		if(left == 0.5){
			ratingImgs += "<span><img src='img/List_star_dot5.png'></span>"
			left -= 0.5
		}else if(left == 0){
			ratingImgs += "<span><img src='img/List_star_0.png'></span>"
		}else{
			ratingImgs += "<span><img src='img/List_star_1.png'></span>"
			left -= 1
		}
	}

	$('#place-detail-rating').html('<span>RATINGS</span> ' + ratingImgs)
	$('#place-detail-reviews').html('<span>POPULARITY</span> ' + place.reviews + ' ratings')
	$('#place-detail-top').html('<span>CATEGORY</span> ' + topNames[place.top.split('_')[1]])
	$('#place-detail-price').html('<span>PRICE RANGE</span> ' + '$'.repeat(place.price))
	$('#place-detail-address').html('<span>ADDRESS</span> ' + place.address)
	$('#place-detail-phone').html('<span>PHONE</span> ' + place.phone)

	var reviewInfo = parseReviewInfo(place.reviewInfo)
	$('#place-detail-review-text').html(`"${reviewInfo.text}" by <b>${reviewInfo.author}</b> on <b>${getDate(reviewInfo.date).slice(0,10)}</b>`)

	var openDays = getOpenDays(place.open_hours)
	var days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
	var str = ''
	for(var i = 0; i < days.length; i++){
		if(openDays[i]){
			if(str === '')
				str += days[i]
			else
				str += ', ' + days[i]
		}

	}
	$('#place-detail-hours').html(str)

	$('#place-detail-agree').html(place.agree.map(member => `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[member.index]}">`).join(''))
	$('#place-detail-disagree').html(place.disagree.map(member => `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[member.index]}">`).join(''))

	$('.overlay').fadeIn()
}

function changeDetailImage(){
	var place = searchPlace ? searchPlace : placesList.find(place => place.id === $('.place-detail').data('id'))

	var index = $('#place-detail-photo').data('index')/1
	index = index + 1 == 10 ? 0 : index + 1
	var img = new Image()
	img.onload = function(){
		$('#place-detail-photo').attr('src', place.photo + index + '.jpg')
		$('#place-detail-photo').data('index', index)
	}
	img.onerror = function(){
		$('#place-detail-photo').attr('src', place.photo + '0.jpg')
		$('#place-detail-photo').data('index', 0)
	}
	img.src = place.photo + index + '.jpg'
}


// city CDQ functions
function getCityName(id){
	var arr = id.slice(2).split('_').map(str => str[0].toUpperCase() + str.slice(1))
	return arr.join(' ')
}

function parseReviewInfo(str){
	var returnObj = {author: null, text: null, date: null}
	str = str.substring(2, str.indexOf('}'))
	var array = str.split(', ')
	var temp = array[1].split(': ')
	returnObj.author = temp[1].substring(2, temp[1].length - 1)

	var index = str.indexOf("u'time'")
	var t = new Date(1970, 0, 1);
    t.setSeconds(str.substring(index + 9, str.indexOf(',', index + 10))/1);
    returnObj.date = t

	var index = str.indexOf("u'text'")
	var quotationType = str.charAt(index + 10)
	returnObj.text = str.substring(index + 11, str.indexOf(quotationType, index + 11))
	returnObj.text = unescape(JSON.parse(`"${returnObj.text}"`))

	return returnObj
}

function getOpenDays(str){
	return [str.indexOf('Monday: Closed') == -1, str.indexOf('Tuesday: Closed') == -1, str.indexOf('Wednesday: Closed') == -1, 
			str.indexOf('Saturday: Closed') == -1, str.indexOf('Friday: Closed') == -1, str.indexOf('Saturday: Closed') == -1, 
			str.indexOf('Sunday: Closed') == -1]
}

function verify_datetime(){
	if($("#input-date").val()!="" && $("#input-date")[0].valueAsNumber/86400000 >= Math.floor(new Date()/86400000) &&
	   $("#input-time").val()!="" && !datetimesList.includes(formatDateTime($("#input-date").val(), $("#input-time").val())))
		$("#add-datetime").attr("class", "btn");
	else if($("#add-datetime").attr("class", "btn"))
		$("#add-datetime").attr("class", "btn_dis")
}

function formatDateTime(date, time){
	return date.replace(/-/g, '') + time.replace(/:/g, '')
}

function setPingHandlers(){
	// TESTING PINGS
	$('.test-ping').click(function(){
		if($(this).css('opacity') === '1' && $(this).parent().css('opacity') === '1' && $(this).attr('href') !== 'img/CDQ_ping_TBD.png'){
			var data = $(this).attr('id').split('-')
			if(data[1] === 'price')
				data[2] = '$'.repeat(data[2])

			var id = data[3]
			var category = data[1]
			var option = data[2]

			$(this).attr('href', 'img/CDQ_ping_TBD.png')
			var receiverIndex = members.findIndex(member => member.id === id)

			var classStr = 'ping-' + category + '-'
			var optionStr = option
			var descriptionHtml = ''
			if(category === 'top'){
				classStr += option
				optionStr = topNames[option.split('_')[1]]
				descriptionHtml = `in <b>Place Categories</b>`
			}else if(category === 'price'){
				classStr += option.length
				descriptionHtml += `in <b>Price Range</b>`
			}else if(category === 'rating'){
				classStr += option
				descriptionHtml += `in <b>Ratings</b>`
			}else if(category === 'review'){
				classStr += option
				if(option <= members[receiverIndex].reviews.min)
					option = indexToReview(reviewToIndex(option) + 1)
				if(option == 1001)
					optionStr = 'Over 1000'
				else
					optionStr = option
				descriptionHtml += `in <b>Number of Reviews</b>`
			}else if(category === 'city'){
				classStr += option
				optionStr = getCityName(option)
				descriptionHtml += `in <b>Cities</b>`
			}else if(category === 'datetime'){
				classStr += option
				optionStr = `${option.slice(0,4)}-${option.slice(4,6)}-${option.slice(6,8)} ${option.slice(8,10)}:${option.slice(10,12)}`
				descriptionHtml += `in <b>Date/Time</b>`
			}
			descriptionHtml = `<b>${optionStr}</b> ${descriptionHtml}`
			$('.ping-tooltip').html(`You asked ${members[receiverIndex].firstname[0]}.${members[receiverIndex].lastname[0]}. to agree on "${optionStr}"`)

			$('#sent-pings').prepend(`<div class='ping-entry ${classStr}' data-receiver='${id}'>
										<div class='msg-pic-section'><img src='profile_imgs/${members[receiverIndex].filename}' style='border-color:${colors[receiverIndex]}'/></div>
										<div class='ping-text-section'>
											<h1>You asked <b style='color:${colors[receiverIndex]}'>${members[receiverIndex].firstname} ${members[receiverIndex].lastname}</b> </br>
												to include ${descriptionHtml}.</h1>	
											<h1 style='margin-top: 10px'> <b>Status:</b></br>
												 <span class='status'>Not accepted or rejected yet</span></h1>						
										</div>
									</div>`);
			$('#sent-pings .nothing-msg').hide()
			socket.emit('new ping', {id: id, category: category, option: option})
		}
	})

	$('.test-ping').mouseover(function(e){
		if($(this).css('opacity') === '1' && $(this).parent().css('opacity') === '1'){
			var data = $(this).attr('id').split('-')
			var type = data[1]
			var member = members.find(member => member.id === data[3])
			var name = member.firstname[0] + '.' + member.lastname[0] + '.'
			var option = ''
			if(type === 'top'){
				option = topNames[data[2].split('_')[1]]
			}else if(type === 'price'){
				option = '$'.repeat(data[2]/1)
			}else if(type === 'rating'){
				option = data[2]
			}else if(type === 'review'){
				if(member.reviews.min >= data[2])
					option = indexToReview(reviewToIndex(data[2]/1) + 1)
				else if(member.reviews.max < data[2])
					option = data[2]
				if(option == 1001)
					option = "Over 1000"
			}else if(type === 'city'){
				option = getCityName(data[2])
			}else if(type === 'datetime'){
				option = `${data[2].slice(0,4)}-${data[2].slice(4,6)}-${data[2].slice(6,8)} ${data[2].slice(8,10)}:${data[2].slice(10,12)}`
			}

			if($(this).attr('href') === 'img/CDQ_ping.png')
				$('.ping-tooltip').html(`Ask ${name} to agree on "${option}"`)
			else
				$('.ping-tooltip').html(`You asked ${name} to agree on "${option}"`)
			$('.ping-tooltip').css({left: e.pageX + 15 + 'px', top: e.pageY + 'px'})
			$('.ping-tooltip').css('visibility', 'visible')
		}
	}).mouseout(function(){
		$('.ping-tooltip').css('visibility', 'hidden')
	})
}

function setDatetimeCheckboxHandler(){
	$('#datetime-svg-container .check-box, #datetime-svg-container image').click(function(){
	var datetime = $(this).parent().attr('id').slice(15)

	if(userCDQ.datetime !== false && userCDQ.datetime.indexOf(datetime) != -1){
		userCDQ.datetime.splice(userCDQ.datetime.indexOf(datetime), 1)
		if(datetimeAgreements[datetime] == (groupSize - datetimeAgreements.notCare))
			datetimeAgreed--;
		datetimeAgreements[datetime]--
		socket.emit('datetime change', {datetimeId: datetime, change: -1})
		updateDatetimeAgreement(datetime)
		if(datetimeAgreements[datetime] == 0)
			clearDisagreedDatetime();
		

		$('#datetime-group-' + datetime + ' .check-mark').css('opacity', 0)

		for(var i = 1; i < members.length; i++){
			$('#datetime-group-' + datetime + ' > .datetime-members-sel image:nth-child(' + (2*i) + ')').css({'opacity': 0, 'cursor': 'auto'})
		}
	}else{
		
		if($('#datetime-no-pref').is(":checked")){
			$('#datetime-svg .check-box').css('fill', '#FFF')
			$('#datetime-svg .check-nopref').css('opacity', 0)
			$('#datetime-no-pref').prop('checked', false)
			socket.emit('datetime change all', {change: -1})
			updateDatetimeAgreementAll(-1, false)
			userCDQ.datetime = []
		}
		userCDQ.datetime.push(datetime)
		
		datetimeAgreements[datetime]++;
		if(datetimeAgreements[datetime] == (groupSize - datetimeAgreements.notCare))
			datetimeAgreed++;
		socket.emit('datetime change', {datetimeId: datetime, change: 1})
		updateDatetimeAgreement(datetime)

		$('#datetime-group-' + datetime + ' .check-mark').css('opacity', 1)

		for(var i = 1; i < members.length; i++){
			var member = members[i]
			var isSelected = member.datetime === false || member.datetime.indexOf(datetime) != -1
			if(!isSelected){
				$('#datetime-group-' + datetime + ' > .datetime-members-sel image:nth-child(' + (2*i) + ')').css('opacity', 1)
				if($('#datetime-show-all').is(':checked'))
					$('#datetime-group-' + datetime + ' > .datetime-members-sel image:nth-child(' + (2*i) + ')').css('cursor', 'pointer')
			}
		}
	}
})
}