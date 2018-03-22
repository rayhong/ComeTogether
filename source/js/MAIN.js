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

// index 0: $$$$, index 3: $, index 4: notCare
var priceAgreements = [0, 0, 0, 0, 0]
// index 0: 5-4, index 4: 1-0, index 5: notCare
var ratingAgreements = [0, 0, 0, 0, 0, 0]
// index 0: Over 1000-1000, index 4: 50-0, index 5: notCare
var reviewAgreements = [0, 0, 0, 0, 0, 0]

var placesList = [];
var placesLoaded = 0;

var pingList = []

var inputHeight = 29;
var currentMsgIndex;

var numQueued = 0;

var socket = io();

$(document).ready(function(){
	$('#top-show-all').prop('checked', false)
	$('#top-show-categories').prop('checked', false)
	$('#price-show-all').prop('checked', false)

	$('#ego-radio').prop('checked', true)
	$('#chat-radio').prop('checked', true)

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
			members.unshift(userCDQ)
			compileMembersCDQ(members)

			// set width of left
			$('.bar-content').width(260 + (groupSize-1)*30 + 600 + 400)
			$('#content-area').width(260 + (groupSize-1)*30 + 600 + 400)
			$('#left').width(200 + (groupSize-1)*30)
			$('#btn-area').width(240 + (groupSize-1)*30)

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
										<image href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
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
										<image href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
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
										<image href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
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
										<image href="img/CDQ_check.png" x='172' y='${j*26 + yPosition + 6}' height='13px' width='19px' style='opacity: 0'/>
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
			$('.check-box, image').click(function(){
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

					$('#top-group-' + top + ' image').css('opacity', 0)
					for(var i = 1; i < members.length; i++){
						$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*i) + ')').css('opacity', 0)
					}

					getLocations()
				}else{
					if($('#top-no-pref').is(":checked")){
						$('.check-box').css('fill', '#FFF')
						$('#top-no-pref').prop('checked', false)
						updateTopAgreementAll(-1, false)
						socket.emit('top change all', {change: -1})
						userCDQ.top = []

						// todo
						placesList = []
					}
					userCDQ.top.push(topId)
					topList[top]++;
					if(topList[top] == (groupSize - topAgreements.notCare))
						topAgreed++;
					socket.emit('top change', {topId: topId, change: 1})
					updateTopAgreement(category, top)

					$('#top-group-' + top + ' image').css('opacity', 1)
					for(var i = 1; i < members.length; i++){
						var member = members[i]
						var isSelected = member.top === false || member.top.indexOf(topId) != -1
						if(!isSelected)
							$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*i) + ')').css('opacity', 1)
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

			if(members[0].top !== false){
				$('#top-no-pref').prop('checked', false)
				var locCategories = Object.keys(topAgreements)
				for(i = 0; i < locCategories.length - 1; i++){
					var category = locCategories[i]
					var topKeyList = Object.keys(topAgreements[category])
					for(j = 0; j < topKeyList.length; j++){
						var top = topKeyList[j]
						var topId = category + "_" + top
						if(members[0].top.indexOf(topId) != -1){
							$('#top-group-' + top + ' image').css('opacity', 1)
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
				var topKeyList = Object.keys(topAgreements[category])
				for(j = 0; j < topKeyList.length; j++){
					var top = topKeyList[j]
					var topId = category + "_" + top
					var userSelected = userCDQ.top && userCDQ.top.includes(topId)
					var groupHtml = ''
					for(k = 1; k < members.length; k++){
						var member = members[k]
						var isSelected = member.top === false || member.top.indexOf(topId) != -1
						groupHtml += `<rect class='criteria-rect' x='${201 + (k-1)*30}' y='${$('#top-group-' + top + ' > #right-rect').attr('y')}' width='30' height='26' 
											style='fill:${colors[k]}; ${isSelected ? '' : 'opacity: 0'}'/>
									  <circle id='${'ping-top-' + topId + '-' + member.id}' class='test-ping' cx='${201 + (k-1)*30 + 15}' 
									  		  cy='${$('#top-group-' + top + ' > #right-rect').attr('y')/1 + 13}' r='5' 
									 		  style='fill:#1f77b5; ${(isSelected || !userSelected) ? 'opacity: 0' : ''}'/>`

					}
					$('#top-group-' + top + ' > .top-members-sel').html(groupHtml)
				}
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
				for(j = 0; j < 4; j++){
					membersSelHtml += `<rect class='criteria-rect' x='${171 + i*30}' y='${6}' width='30' height='${4*26}' fill-opacity='0' stroke-opacity='0.1'/>
									   <circle id='${'ping-price-' + priceIndexToString(j).length + '-' + members[i].id}' class='test-ping' cx='${201 + (i-1)*30 + 15}' 
								  		 	   cy='${j*26 + 18}' r='5' style='fill:#1f77b5; opacity: ${j >= maxIndex && j <= minIndex ? 1 : 0}'/>`
				}
				if(members[i].price){
					membersSelHtml += `<rect x='${176 + i*30}' y='${6 + maxIndex*26}' width='20' fill='${colors[i]}' 
											 height='${(stringToPriceIndex(members[i].price.min) - stringToPriceIndex(members[i].price.max) + 1) * 26}'/>`
				}else
					membersSelHtml += `<rect x='${176 + i*30}' y='${6}' width='20' height='${4*26}' fill='${colors[i]}'/>`
			}
			$('#price-members-sel').html(membersSelHtml)


			// TESTING PINGS
			$('.test-ping').click(function(){
				if($(this).css('opacity') === '1' && $(this).parent().css('opacity') === '1'){
					var data = $(this).attr('id').split('-')
					if(data[1] === 'price')
						data[2] = '$'.repeat(data[2])
					console.log('Sending ping to ' + data[3] + ' to choose ' + data[2] + ' in ' + data[1])
					socket.emit('new ping', {id: data[3], category: data[1], option: data[2]})
				}
			})


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

			if(members[0].reviews){
				var minIndex = reviewToIndex(members[0].reviews.min)
				var maxIndex = reviewToIndex(members[0].reviews.max)
				$('#review-no-pref').prop('checked', false)
				$('#review-sel-area').css('fill', '#AEC7E8')
				$('#review-sel-area-agreed').css('fill', '#1F77B5')
				$('#review-sel-area').attr({'height': (minIndex - maxIndex)*26, 'y': 6 + maxIndex*26})
				$('#review-top-handle').attr('y', 1 + maxIndex*26)
				$('#review-bot-handle').attr('y', 1 + minIndex*26)
			}

			// PLACE LIST: get data, store data and display
			getLocations()

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
		window.location.href = 'http://127.0.0.1:8000';
	})

	$(window).resize(function(){
		var windowHeight = $(window).height();
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

	var preferences = {topList: userCDQ.top, price: userCDQ.price, rating: userCDQ.rating, reviews: userCDQ.reviews}
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
									(!member.reviews || member.reviews.min <= entry.reviews)
						if(member.reviews && member.reviews.max != 1001)
							agree = agree && (entry.reviews <= member.reviews.max)

						if(agree){
							entry.agree.push({id: member.id, filename: member.filename, index: j})
							agreeImgs += `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[j]}">`
						}else{
							entry.disagree.push({id: member.id, filename: member.filename, index: j})
							disagreeImgs += `<img src="profile_imgs/${member.filename}" style="border-color: ${colors[j]}">`
						}
					}

					var ratingHtml = ''
					var left = entry.rating/1
					for(j = 0; j < 5; j++){
						if(left == 0.5){
							ratingHtml += "<span><img src='img/List_star_0.png'></span>"
							left -= 0.5
						}else if(left == 0)
							ratingHtml += "<span><img src='img/List_star_dot5.png'></span>"
						else{
							ratingHtml += "<span><img src='img/List_star_1.png'></span>"
							left--;
						}

					}

					entry.html = `<div class='place-entry'>
										<div class='place-img-section'>
											<img src='${entry.photo}0.jpg'/>
											<input type='checkbox'><span> Add this to group archive </span>
										</div>
										<div class='place-info-section'>
											<h1>${topNames[entry.top.split('_')[1]]}</h1>
											<h1><b>${entry.name} | ${'$'.repeat(entry.price)}</b></h1>
											<div class='place-reviews'>
												${ratingHtml}
												<span>${entry.reviews} reviews</span>
											</div>
											<h2>${entry.address} | ...</h2>
											<div class='place-agreement-info'>
												<div class='place-disagrees'>
													<h2><b> Disagree: </b></h2>
													<div class='img-list'>${disagreeImgs}</div>
												</div>
												<div class='place-agrees'>
													<h2><b> Agree: </b></h2>
													<div class='img-list'>${agreeImgs}</div>
												</div>
											</div>
										</div>
									</div>`
					placesList.push(entry)
				}
				$('#num-ego-cen').html('(' + placesList.length + ' places)')

				// LOAD MORE PLACES
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

				if($('#middle > .column-content')[0].scrollHeight > $('#middle > .column-content').height())
					$('#middle > .column-content').css('overflow-y', 'scroll')
			}
		}
	})
}

function removeLocations(obj){
	if(obj.top){
		for(var i = 0; i < placesList.length;){
			var entry = placesList[i]
			if(entry.top === obj.top)
				placesList.splice(i, 1)
			else
				i++
		}
	}else if(obj.price){
		var max = obj.price.max.length
		var min = obj.price.min.length
		for(var i = 0; i < placesList.length;){
			var entry = placesList[i]
			if(min <= entry.price && entry.price <= max)
				placesList.splice(i, 1)
			else
				i++
		}
	}else if(obj.rating){
		for(var i = 0; i < placesList.length;){
			var entry = placesList[i]
			if(entry.rating < obj.rating)
				placesList.splice(i, 1)
			else
				i++
		}
	}else if(obj.reviews){
		for(var i = 0; i < placesList.length;){
			var entry = placesList[i]
			if(obj.reviews.min <= entry.reviews && (obj.reviews.max == 1001 || entry.reviews <= obj.reviews.max))
				placesList.splice(i, 1)
			else
				i++
		}
	}

	$('#num-ego-cen').html('(' + placesList.length + ' places)')

	// LOAD MORE PLACES
	if(placesList.length > 20){
		placesLoaded = 20
		$('#places-list').html(placesList.slice(0,20).map(place => place.html).join(''))
	}else{
		placesLoaded = placesList.length
		$('#load-more-places').hide()
		$('#places-list').html(placesList.map(place => place.html).join(''))
	}

	if($('#middle > .column-content')[0].scrollHeight <= $('#middle > .column-content').height())
		$('#middle > .column-content').css('overflow-y', 'hidden')
}

function changeMemberAgreement(member, isNew){
	for(var i = 0; i < placesList.length; i++){
		var place = placesList[i]
		var change = false;

		if(!isNew){
			var agree = (!member.top || member.top.includes(place.top)) && (member.rating == -1 || member.rating <= place.rating) && 
						(!member.price || (member.price.min.length <= place.price && place.price <= member.price.max.length)) &&
						(!member.reviews || member.reviews.min <= place.reviews)

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
				ratingHtml += "<span><img src='img/List_star_0.png'></span>"
				left -= 0.5
			}else if(left == 0)
				ratingHtml += "<span><img src='img/List_star_dot5.png'></span>"
			else{
				ratingHtml += "<span><img src='img/List_star_1.png'></span>"
				left--;
			}

		}

		if(change){
			place.html = `<div class='place-entry'>
							<div class='place-img-section'>
								<img src='${place.photo}0.jpg'/>
								<input type='checkbox'><span> Add this to group archive </span>
							</div>
							<div class='place-info-section'>
								<h1>${topNames[place.top.split('_')[1]]}</h1>
								<h1><b>${place.name} | ${'$'.repeat(place.price)}</b></h1>
								<div class='place-reviews'>
									${ratingHtml}
									<span>${place.reviews} reviews</span>
								</div>
								<h2>${place.address} | ...</h2>
								<div class='place-agreement-info'>
									<div class='place-disagrees'>
										<h2><b> Disagree: </b></h2>
										<div class='img-list'>${place.disagree.map(entry => `<img src="profile_imgs/${entry.filename}" style="border-color: ${colors[entry.index]}">`).join('')}</div>
									</div>
									<div class='place-agrees'>
										<h2><b> Agree: </b></h2>
										<div class='img-list'>${place.agree.map(entry => `<img src="profile_imgs/${entry.filename}" style="border-color: ${colors[entry.index]}">`).join('')}</div>
									</div>
								</div>
							</div>
						</div>`
		}
	}
	$('#places-list').html(placesList.map(place => place.html).join(''))
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
// [todo] need to display it
function getPings(){
	$.ajax({
		type: 'GET',
		url: "/get_pings",
		dataType: 'json',
		success: function(data){
			for(var i = 0; i < data.length; i++){
				var ping = data[i]
				if(ping.ping_accepted == null){
					ping.ping_cdq_action = JSON.parse(ping.ping_cdq_action)
					var category = Object.keys(ping.ping_cdq_action)[0]
					var option = ping.ping_cdq_action[category]

					var senderIndex = members.findIndex(member => member.id === ping.ping_from_id)

					var classStr = 'ping-' + category + '-'
					var descriptionHtml = ''
					if(category === 'top'){
						classStr += option
						descriptionHtml += `<b>${topNames[option.split('_')[1]]}</b> in your <b>Place Categories</b></h1>`
					}else if(category === 'price'){
						classStr += option.length
						descriptionHtml += `<b>${option}</b> in your <b>Price Range</b></h1>`
					}

					$('#ping-container').append(`<div class='ping-entry ${classStr}' data-sender='${ping.ping_from_id}'>
													<div class='msg-pic-section'><img src='profile_imgs/${members[senderIndex].filename}' style='border-color:${colors[senderIndex]}'/></div>
													<div class='ping-text-section'>
														<h1><b style='color:${colors[senderIndex]}'>${members[senderIndex].firstname} ${members[senderIndex].lastname}</b> asked you to include </br>
														${descriptionHtml}
														<button class='accept-ping-btn' onclick="acceptPing('${category}', '${option}')">Accept</button>
														<button class='accept-ping-btn' onclick="rejectPing('${ping.ping_from_id}', '${category}', '${option}')">Reject</button>												
													</div>
												</div>`);
				}
			}
			if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
				$('#right > .column-content').css('overflow-y', 'scroll')
			if(data.length > 0)
				$('#ping-container .nothing-msg').hide()
		}
	})
}