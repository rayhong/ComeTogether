$(document).ready(function(){
	// SOCKET MANAGEMENT

	// new member enters the application
	socket.on('new member', function(data){
		var member = {place: false, price: false, rating: -1, reviews: false, id: data.id,
					firstname: data.firstname, lastname: data.lastname, filename: data.filename}

		var index = groupSize;
		members.push(member)
		groupSize++
		$('.bar-content').width(260 + (groupSize-1)*30 + 600 + 400)
		$('#content-area').width(260 + (groupSize-1)*30 + 600 + 400)
		$('#btn-area').width(240 + (groupSize-1)*30)
		$('#left').width(200 + (groupSize-1)*30)
		$('#all-agreed-label').width((groupSize-1)*30)

		$('#member-list').append(`<span>${member.firstname[0]}.${member.lastname[0]}.</span>`)
		$('#profile-pics').append(`<img src='profile_imgs/${member.filename}' style='border-color: ${colors[groupSize-1]}'/>`)

		$('#places-svg').attr('width', 202 + (groupSize-1)*30)
		$('#place-disagreed-border').attr('width',198 + (groupSize-1)*30)
		$('#places-svg #right-rect').attr('width', (groupSize-1)*30)
		$('#places-svg #inner-border').attr('width', (138 + (groupSize-1)*30))
		$('#places-svg #right-text').attr('x', (2*201 + (groupSize-1)*30)/2)
		var locCategories = Object.keys(placeAgreements)
		for(i = 0; i < locCategories.length - 1; i++){
			var category = locCategories[i]
			var todKeyList = Object.keys(placeAgreements[category])
			for(j = 0; j < todKeyList.length; j++){
				var tod = todKeyList[j]
				var html = `<rect class='criteria-rect' x='${201 + (index-1)*30}' y='${$('#place-group-' + tod + ' > #right-rect').attr('y')}' width='30' height='26' style='fill:${colors[index]}'/>`
				$('#place-group-' + tod + ' > .place-members-sel').html($('#place-group-' + tod + ' > .place-members-sel').html() + html)
			}
		}
		placeAgreements.notCare++
		updatePlaceAgreementAll(0, index)

		$('#prices-svg').attr('width', 202 + (groupSize-1)*30)
		for(i = 0; i < priceAgreements.length - 1; i++){
			$('#right-rect-price-' + i).attr('width', (groupSize-1)*30)
			$('#right-text-price-' + i).attr('x', (201*2 + (groupSize-1) * 30)/2)
		}
		$('#price-disagreed-border').attr('width', 198 + (groupSize-1)*30)
		$('#price-inner-border').attr('width', 198 + (groupSize-1)*30)
		var membersSelHtml = `<rect x='${201 + (index-1)*30 + 10}' y='6' width='20' height='${4*26}' fill='${colors[index]}'/>`
		$('#price-members-sel').html($('#price-members-sel').html() + membersSelHtml)
		priceAgreements[4]++
		updatePriceAgreement(true)

		$('#ratings-svg').attr('width', 202 + (groupSize-1)*30)
		$('#right-rect-agreed').attr('width', (groupSize-1)*30)
		$('#right-rect-disagreed').attr('width', (groupSize-1)*30)
		$('#right-text-agreed').attr('x', (201*2 + (groupSize-1) * 30)/2)
		$('#right-text-disagreed').attr('x', (201*2 + (groupSize-1) * 30)/2)
		$('#rating-inner-border').attr('width', 198 + (groupSize-1)*30)
		ratingAgreements[5]++
		updateRatingAgreement(0,0)

		$('#reviews-svg').attr('width', 202 + (groupSize-1)*30)
		$('#reviews-svg #right-rect-agreed').attr('width', (groupSize-1)*30)
		$('#reviews-svg #right-rect-disagreed-top').attr('width', (groupSize-1)*30)
		$('#reviews-svg #right-rect-disagreed-bot').attr('width', (groupSize-1)*30)
		$('#reviews-svg #right-text-agreed').attr('x', (201*2 + (groupSize-1) * 30)/2)
		$('#reviews-svg #right-text-disagreed-top').attr('x', (201*2 + (groupSize-1) * 30)/2)
		$('#reviews-svg #right-text-disagreed-bot').attr('x', (201*2 + (groupSize-1) * 30)/2)
		$('#review-inner-border').attr('width', 198 + (groupSize-1)*30)
		$('#review-disagreed-border').attr('width', 198 + (groupSize-1)*30)
		reviewAgreements[5]++
		updateReviewAgreement(true, 0, 0)
	})

	socket.on('place change', function(data){
		var category = data.todId.split('_')[0]
		var tod = data.todId.split('_')[1]
		var memberID = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		if(data.change > 0){
			members[memberID].place.push(data.todId)
			var pastAgreedNum = placeAgreements[category][tod]
			placeAgreements[category][tod]++
			if(placeAgreements[category][tod] == (groupSize - placeAgreements.notCare))
				placesAgreed++;
			updatePlaceAgreement(category, tod)
			$('#place-group-' + tod + ' > .place-members-sel rect:nth-child(' + memberID + ')').css('opacity', 1)
			if(pastAgreedNum == 0 && !$('#place-show-categories').is(':checked')){
				$('#place-group-' + tod).css('opacity', 1)
				var todKeyList = Object.keys(placeAgreements[category])
				var numSpaces = 0;
				var index = todKeyList.indexOf(tod)
				for(i = 0; i < index; i++){
					if(placeAgreements[category][todKeyList[i]] > 0)
						numSpaces++;
				}
				var transform = numSpaces*26 - ($('#place-group-' + tod + ' rect:first-child').attr('y') - $('#place-type-' + category + ' rect:first-child').attr('y'))
				$('#place-group-' + tod).attr('transform', 'translate(0, ' + transform + ')')
				for(i = index + 1; i < todKeyList.length; i++){
					if(placeAgreements[category][todKeyList[i]] > 0){
						if($('#place-group-' + todKeyList[i]).attr('transform'))
							$('#place-group-' + todKeyList[i]).attr('transform', $('#place-group-' + todKeyList[i]).attr('transform') + ' translate(0, ' + 26 + ')')
						else
							$('#place-group-' + todKeyList[i]).attr('transform', 'translate(0, ' + 26 + ')')
					}
				}

				$('#place-type-'+category+' > #place-type-label').attr('height', 26 + $('#place-type-'+category+' > #place-type-label').attr('height')/1)
				$('#place-disagreed-border').attr('height', 26 + $('#place-disagreed-border').attr('height')/1)
				$('#places-svg').attr('height', 26 + $('#places-svg').height()/1)

				var locCategories = Object.keys(placeAgreements)
				for(i = locCategories.indexOf(category) + 1; i < locCategories.length - 1; i++){
					if($('#place-type-' + locCategories[i]).attr('transform'))
						$('#place-type-' + locCategories[i]).attr('transform', $('#place-type-' + locCategories[i]).attr('transform') + ' translate(0, ' + 26 + ')')
					else
						$('#place-type-' + locCategories[i]).attr('transform', 'translate(0, ' + 26 + ')')
				}
			}
		}else{
			members[memberID].place.splice(members[memberID].place.indexOf(data.todId), 1)
			if(placeAgreements[category][tod] == (groupSize - placeAgreements.notCare))
				placesAgreed--
			placeAgreements[category][tod]--
			updatePlaceAgreement(category, tod)
			$('#place-group-' + tod + ' > .place-members-sel rect:nth-child(' + memberID + ')').css('opacity', 0)
			if(placeAgreements[category][tod] == 0 && !$('#place-show-categories').is(':checked'))
				clearDisagreedPlaces();
		}
	})

	socket.on('place change all', function(data){
		var memberID = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberID]
		updatePlaceAgreementAll(data.change, memberID)
		if(data.change > 0)
			members[memberID].place = false;
		else
			members[memberID].place = []
	})

	socket.on('price change', function(data){
		var memberID = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberID]
		if(!data.noPref){
			var startIndex = stringToPriceIndex(data.max)
			var endIndex = stringToPriceIndex(data.min)
			if(member.price != false){
				var userStart = stringToPriceIndex(member.price.max)
				var userEnd = stringToPriceIndex(member.price.min)
				for(i = 0; i < 4; i++){
					if(i >= userStart && i <= userEnd)
						priceAgreements[i]--
					if(i >= startIndex && i <= endIndex)
						priceAgreements[i]++
				}
				member.price = {min: data.min, max: data.max}
			}else{
				for(i = startIndex; i < endIndex + 1; i++){
					priceAgreements[i]++
				}
				member.price = {min: data.min, max: data.max}
				priceAgreements[4]--
			}
			$('#price-members-sel rect:nth-child(' + memberID + ')').attr('y', startIndex*26 + 6)
			$('#price-members-sel rect:nth-child(' + memberID + ')').attr('height', (endIndex - startIndex + 1)*26)			
		}else{
			var userStart = stringToPriceIndex(member.price.max)
			var userEnd = stringToPriceIndex(member.price.min)
			for(i = userStart; i < userEnd + 1; i++){
				priceAgreements[i]--
			}
			priceAgreements[4]++
			member.price = false
			$('#price-members-sel rect:nth-child(' + memberID + ')').attr('y', 6)
			$('#price-members-sel rect:nth-child(' + memberID + ')').attr('height', 4*26)		
		}

		updatePriceAgreement(true)
	})

	socket.on('rating change', function(data){
		var memberID = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberID]
		if(data.rating != -1){
			if(member.rating != -1){
				updateRatingAgreement(member.rating, data.rating)
			}else{
				ratingAgreements[5]--
				updateRatingAgreement(5, data.rating)
			}
			member.rating = data.rating
		}else{
			ratingAgreements[5]++
			for(i = 0; i < minToRatingIndex(member.rating) + 1; i++)
				ratingAgreements[i]--
			updateRatingAgreement(4, 4)
			member.rating = -1
		}
	})

	socket.on('review change', function(data){
		var memberID = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberID]
		if(!data.noPref){
			var startIndex = reviewToIndex(data.max)
			var endIndex = reviewToIndex(data.min)
			if(member.reviews != false){
				var userStart = reviewToIndex(member.reviews.max)
				var userEnd = reviewToIndex(member.reviews.min)
				for(i = 0; i < 5; i++){
					if(i >= userStart && i < userEnd)
						reviewAgreements[i]--
					if(i >= startIndex && i < endIndex)
						reviewAgreements[i]++
				}
				member.reviews = {min: data.min, max: data.max}
			}else{
				for(i = startIndex; i < endIndex; i++)
					reviewAgreements[i]++
				member.reviews = {min: data.min, max: data.max}
				reviewAgreements[5]--
			}	
		}else{
			var userStart = reviewToIndex(member.reviews.max)
			var userEnd = reviewToIndex(member.reviews.min)
			for(i = userStart; i < userEnd; i++)
				reviewAgreements[i]--
			reviewAgreements[5]++
			member.reviews = false	
		}

		updateReviewAgreement(true, 0, 0)
	})

	socket.on('new message', function(data){
		var date = new Date()
		var dateStr = getDate(date)
		var msgGroupId = 'msg-group-' + dateStr.slice(0, dateStr.length-6)
		var index = members.findIndex(function(member){
			return member.id === this.id;
		}, {id: data.id})
		if($('#' + msgGroupId).length == 0)
			$("#msg-list").append(`<div id='${msgGroupId}'><div class='date-separation'>${dateStr}</div></div>`)
		$("#" + msgGroupId).append(`<div class='msg-entry'>
										<div class='msg-pic-section'><img src='profile_imgs/${members[index].filename}' style='border-color:${colors[index]}'/></div>
										<div class='msg-text-section'>
											<h1>${members[index].firstname} ${members[index].lastname} <span class='msg-date'>${getTime(date)}</span></h1>
											<p>${data.msg}</p>
										</div>
									</div>`);
		$("#right .column-content").animate({scrollTop: $('#right .column-content').prop("scrollHeight")}, 500)
		$(this).val('')
	})
})