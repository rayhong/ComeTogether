// colors available to be assigned to members
var colors = ['#17537F', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7f7f7f', '#BCBD22', '#17becf']

// test variables and objects
var groupSize = 1;
var userCDQ;
var members;

// top id: type_category | placeAgreements[type][category] -> num of agreed
var placeAgreements = {res: {american: 0, cn: 0, fr: 0, in: 0, it: 0, jp: 0, mx: 0, med: 0, th: 0, veg: 0, vet: 0, fast: 0},
					   night: {bar: 0, beerg: 0, jazz: 0, karaoke: 0, comedy: 0, music: 0, dance: 0},
						notCare: 0}
var placeNames = {american: "American", cn: "Chinese", fr: "French", in: "Indian", it: "Italian", jp: "Japanese", mx: "Mexican", med: "Mediterranean",
				  th: "Thai", veg: "Vegan", vet: "Vegetarian", fast: "Fastfood", bar: "Bars", beerg: "Beer gardens", jazz: "Jazz & Blues", 
				  karaoke: "Karaoke", comedy: "Comedy Clubs", music: "Music Venues", dance: "Dance Clubs"}
var placesAgreed = 0;

// index 0: $$$$, index 3: $, index 4: notCare
var priceAgreements = [0, 0, 0, 0, 0]

// index 0: 5-4, index 4: 1-0, index 5: notCare
var ratingAgreements = [0, 0, 0, 0, 0, 0]

// index 0: Over 1000-1000, index 4: 50-0, index 5: notCare
var reviewAgreements = [0, 0, 0, 0, 0, 0]

var inputHeight = 29;

var socket = io();

var currentMsgIndex;

$(document).ready(function(){
	$('#place-show-all').prop('checked', false)
	$('#place-show-categories').prop('checked', false)
	$('#price-show-all').prop('checked', false)
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
			var locCategories = Object.keys(placeAgreements)
			var yPosition = 1
			for(var i = 0; i < locCategories.length - 1; i++){
				endHtml = ''
				var category = locCategories[i]
				var todKeyList = Object.keys(placeAgreements[category])
				svgHtml += `<g id='place-type-${category}'>`
				if(category === 'res')
					endHtml += `<text class='category-label' x='5' y='${yPosition + 18}'> Restaura-</text>
								<text class='category-label' x='5' y='${yPosition + 35}'>nts </text>`
				else
					endHtml += `<text class='category-label' x='5' y='${yPosition + 18}'> Night-</text>
								<text class='category-label' x='5' y='${yPosition + 35}'>lifes </text>`

				var notAdded = 0;
				for(var j = 0; j < todKeyList.length; j++){
					var tod = todKeyList[j]
					if(placeAgreements[category][tod] > 0){
						if((placeAgreements[category][tod] + placeAgreements.notCare) != groupSize){
							endHtml += `<g id='place-group-${tod}' transform='translate(0, ${-notAdded*26})'>
										<rect id='left-rect' class='criteria-rect' width='100' height='26' x='61' y='${yPosition + j*26}'/>
										<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}' style='opacity: 0'/>
										<text id='left-text' class='category-text' x='71' y='${j*26 + yPosition + 17}'>${placeNames[tod]}</text>
										<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (placeAgreements[category][tod] + placeAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
										<g class='place-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										</g>`
						}else{
							placesAgreed++;
							endHtml += `<g id='place-group-${tod}' transform='translate(0, ${-notAdded*26})'>
										<rect id='left-rect' class='criteria-rect agreed-rect' width='100' height='26' x='61' y='${j*26 + yPosition}'/>
										<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}'/>
										<text id='left-text' class='agreed-text' x='71' y='${j*26 + yPosition + 17}'>${placeNames[tod]}</text>
										<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>Yes!</text>
										<g class='place-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										</g>`
						}
					}else{
						if(placeAgreements.notCare == groupSize){
							placesAgreed++;
							endHtml += `<g id='place-group-${tod}' style='opacity: 0'>
										<rect id='left-rect' class='criteria-rect agreed-rect' width='100' height='26' x='61' y='${j*26 + yPosition}'/>
										<rect id='right-rect'class='criteria-rect agreement-rect agreed-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}'/>
										<text id='left-text' class='agreed-text' x='71' y='${j*26 + yPosition + 17}'>${placeNames[tod]}</text>
										<text id='right-text' class='agreed-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>Yes!</text>
										<g class='place-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										</g>`
						}else{		
							endHtml += `<g id='place-group-${tod}' style='opacity: 0'>
										<rect id='left-rect' class='criteria-rect' width='100' height='26' x='61' y='${yPosition + j*26}'/>
										<rect id='right-rect' class='criteria-rect agreement-rect' width='${(groupSize-1)*30}' height='26' x='201' y='${j*26 + yPosition}'/>
										<rect id='inner-border' class='agreed-inner-border' width='${138 + (groupSize-1)*30}' height='24' x='62' y='${j*26 + 1 + yPosition}' style='opacity: 0'/>
										<text id='left-text' class='category-text' x='71' y='${j*26 + yPosition + 17}'>${placeNames[tod]}</text>
										<text id='right-text' class='agreement-text' x='${(2*201 + (groupSize-1)*30)/2}' y='${j*26 + yPosition + 17}' text-anchor='middle'>No ${groupSize > 2 ? '(' + (placeAgreements[category][tod] + placeAgreements.notCare) + '/' + groupSize + ')' : ''} </text>
										<g class='place-members-sel' style="opacity: 0; transition: 0.2s"></g>
										<rect class='criteria-rect check-box' width='40' height='26' x='161' y='${j*26 + yPosition}'/>
										</g>`
						}
						notAdded++
					}
				}
				svgHtml += `<rect id='place-type-label' class='criteria-rect' x='1' width='60' y='${yPosition}' height='${26*(todKeyList.length-notAdded)}'/>`
				svgHtml +=  endHtml + '</g>'
				yPosition += 26*(todKeyList.length - notAdded)
			}
			// append place category svg to html
			$('#places-svg-container').append(`<svg id='places-svg' height='${yPosition+2}' width='${202 + (groupSize-1)*30}'>
										${svgHtml}
										<rect id='place-disagreed-border' class='disagreed-inner-border' x='2' y='1' width='${198 + (groupSize-1)*30}' height='${yPosition}' style='opacity: 0'></rect>
									</svg>`)

			// if user clicks on one of the checkbox for places
			// add or remove it from its prefered list of locations, change display accordingly
			$('.check-box').click(function(){
				var tod = $(this).parent().attr('id').slice(12)
				var category = $(this).parent().parent().attr('id').slice(11)
				var todList = placeAgreements[category]
				var todId = category + "_" + tod

				if(userCDQ.place !== false && userCDQ.place.indexOf(todId) != -1){
					userCDQ.place.splice(userCDQ.place.indexOf(todId), 1)
					if(todList[tod] == (groupSize - placeAgreements.notCare))
						placesAgreed--;
					todList[tod]--;
					socket.emit('place change', {todId: todId, change: -1})
					updatePlaceAgreement(category, tod)
					if(todList[tod] == 0)
						clearDisagreedPlaces();
				}else{
					if($('#place-no-pref').is(":checked")){
						$('.check-box').css('fill', '#FFF')
						$('#place-no-pref').prop('checked', false)
						updatePlaceAgreementAll(-1, false)
						socket.emit('place change all', {change: -1})
						userCDQ.place = []
					}
					userCDQ.place.push(todId)
					todList[tod]++;
					if(todList[tod] == (groupSize - placeAgreements.notCare))
						placesAgreed++;
					socket.emit('place change', {todId: todId, change: 1})
					updatePlaceAgreement(category, tod)
				}
			})

			// show that members disagreed completely
			if(placesAgreed == 0){
				$('#place-disagreed-border').css('opacity', 1)
				$('#place-label').css('color', '#f00')
				$('#places-svg text').addClass('disagreed-text')
				$('#places-svg .agreement-rect').addClass('disagreed-rect')
			}

			if(members[0].place !== false){
				$('#place-no-pref').prop('checked', false)
				var locCategories = Object.keys(placeAgreements)
				for(i = 0; i < locCategories.length - 1; i++){
					var category = locCategories[i]
					var todKeyList = Object.keys(placeAgreements[category])
					for(j = 0; j < todKeyList.length; j++){
						var tod = todKeyList[j]
						var todId = category + "_" + tod
						if(members[0].place.indexOf(todId) != -1){
							if(placeAgreements[category][tod] + placeAgreements.notCare == groupSize)
								$('#place-group-' + tod + ' > .check-box').css('fill', '#1F77B5')
							else
								$('#place-group-' + tod + ' > .check-box').css('fill', '#AEC7E8')
						}else{
							$('#place-group-' + tod + ' > .check-box').css('fill', '#FFF')
						}
					}
				}
			}

			// append rectangles to place category svg to display other members' preferences
			var locCategories = Object.keys(placeAgreements)
			for(i = 0; i < locCategories.length - 1; i++){
				var category = locCategories[i]
				var todKeyList = Object.keys(placeAgreements[category])
				for(j = 0; j < todKeyList.length; j++){
					var tod = todKeyList[j]
					var todId = category + "_" + tod
					var groupHtml = ''
					for(k = 1; k < members.length; k++){
						var member = members[k]
						if(member.place === false || member.place.indexOf(todId) != -1)
							groupHtml += `<rect class='criteria-rect' x='${201 + (k-1)*30}' y='${$('#place-group-' + tod + ' > #right-rect').attr('y')}' width='30' height='26' style='fill:${colors[k]}'/>`
						else
							groupHtml += `<rect class='criteria-rect' x='${201 + (k-1)*30}' y='${$('#place-group-' + tod + ' > #right-rect').attr('y')}' width='30' height='26' style='fill:${colors[k]}; opacity: 0'/>`
					}
					$('#place-group-' + tod + ' > .place-members-sel').html(groupHtml)
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

			if(members[0].price){
				var minIndex = stringToPriceIndex(members[0].price.min)
				var maxIndex = stringToPriceIndex(members[0].price.max)
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
				if(members[i].price){
					var minIndex = stringToPriceIndex(members[i].price.min)
					var maxIndex = stringToPriceIndex(members[i].price.max)
					membersSelHtml += `<rect x='${201 + (i-1)*30 + 10}' y='${6 + maxIndex*26}' width='20' height='${(minIndex - maxIndex + 1) * 26}' fill='${colors[i]}'/>`
				}else
					membersSelHtml += `<rect x='${201 + (i-1)*30 + 10}' y='${6}' width='20' height='${4*26}' fill='${colors[i]}'/>`
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

			$.ajax({
				type: 'GET',
				url: "/get_msgs",
				dataType: 'json',
				success: function(data){
					var msgs = data[0]
					currentMsgIndex = data[1]
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
	
	$('#home-btn').click(function(){
		window.location.href = `http://127.0.0.1:8000/`
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
		if(member.place === false)
			placeAgreements.notCare++;
		else{
			for(var j = 0; j < member.place.length; j++){
				var todId = member.place[j].split('_')
				placeAgreements[todId[0]][todId[1]]++;
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