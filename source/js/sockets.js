$(document).ready(function(){
	// SOCKET MANAGEMENT

	// new member enters the application
	socket.on('new member', function(data){
		var member = {top: false, price: false, rating: -1, reviews: false, id: data.id,
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

		$('#top-svg').attr('width', 202 + (groupSize-1)*30)
		$('#top-disagreed-border').attr('width',198 + (groupSize-1)*30)
		$('#top-svg #right-rect').attr('width', (groupSize-1)*30)
		$('#top-svg #inner-border').attr('width', (138 + (groupSize-1)*30))
		$('#top-svg #right-text').attr('x', (2*201 + (groupSize-1)*30)/2)
		var locCategories = Object.keys(topAgreements)
		for(i = 0; i < locCategories.length - 1; i++){
			var category = locCategories[i]
			var topKeyList = Object.keys(topAgreements[category])
			for(j = 0; j < topKeyList.length; j++){
				var top = topKeyList[j]
				var html = `<rect class='criteria-rect' x='${201 + (index-1)*30}' y='${$('#top-group-' + top + ' > #right-rect').attr('y')}' width='30' height='26' style='fill:${colors[index]}'/>
							<circle id='${'ping-' + category + '_' + top + '-' + member.id}' class='test-ping' cx='${201 + (index-1)*30 + 15}' cy='${$('#top-group-' + top + ' > #right-rect').attr('y')/1 + 13}' r='5' style='fill:#000; opacity: 0'}'/>`
				$('#top-group-' + top + ' > .top-members-sel').html($('#top-group-' + top + ' > .top-members-sel').html() + html)
			}
		}
		topAgreements.notCare++
		updateTopAgreementAll(0, index)

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

		changeMemberAgreement(member, true)
	})

	socket.on('top change', function(data){
		var category = data.topId.split('_')[0]
		var top = data.topId.split('_')[1]
		var memberIndex = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		if(data.change > 0){
			members[memberIndex].top.push(data.topId)
			var pastAgreedNum = topAgreements[category][top]
			topAgreements[category][top]++
			if(topAgreements[category][top] == (groupSize - topAgreements.notCare))
				topAgreed++;
			updateTopAgreement(category, top)
			$('#top-group-' + top + ' > .top-members-sel rect:nth-child(' + (2*memberIndex-1) + ')').css('opacity', 1)
			$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*memberIndex) + ')').css('opacity', 0)
			if(pastAgreedNum == 0 && !$('#top-show-categories').is(':checked')){
				$('#top-group-' + top).css('opacity', 1)
				var topKeyList = Object.keys(topAgreements[category])
				var numSpaces = 0;
				var index = topKeyList.indexOf(top)
				for(i = 0; i < index; i++){
					if(topAgreements[category][topKeyList[i]] > 0)
						numSpaces++;
				}
				var transform = numSpaces*26 - ($('#top-group-' + top + ' rect:first-child').attr('y') - $('#top-type-' + category + ' rect:first-child').attr('y'))
				$('#top-group-' + top).attr('transform', 'translate(0, ' + transform + ')')
				for(i = index + 1; i < topKeyList.length; i++){
					if(topAgreements[category][topKeyList[i]] > 0){
						if($('#top-group-' + topKeyList[i]).attr('transform'))
							$('#top-group-' + topKeyList[i]).attr('transform', $('#top-group-' + topKeyList[i]).attr('transform') + ' translate(0, ' + 26 + ')')
						else
							$('#top-group-' + topKeyList[i]).attr('transform', 'translate(0, ' + 26 + ')')
					}
				}

				$('#top-type-'+category+' > #top-type-label').attr('height', 26 + $('#top-type-'+category+' > #top-type-label').attr('height')/1)
				$('#top-type-'+category+' .category-label').show()
				$('#top-disagreed-border').attr('height', 26 + $('#top-disagreed-border').attr('height')/1)
				$('#top-svg').attr('height', 26 + $('#top-svg').height()/1)

				var locCategories = Object.keys(topAgreements)
				for(i = locCategories.indexOf(category) + 1; i < locCategories.length - 1; i++){
					if($('#top-type-' + locCategories[i]).attr('transform'))
						$('#top-type-' + locCategories[i]).attr('transform', $('#top-type-' + locCategories[i]).attr('transform') + ' translate(0, ' + 26 + ')')
					else
						$('#top-type-' + locCategories[i]).attr('transform', 'translate(0, ' + 26 + ')')
				}
			}
		}else{
			members[memberIndex].top.splice(members[memberIndex].top.indexOf(data.topId), 1)
			if(topAgreements[category][top] == (groupSize - topAgreements.notCare))
				topAgreed--
			topAgreements[category][top]--
			updateTopAgreement(category, top)
			$('#top-group-' + top + ' > .top-members-sel rect:nth-child(' + (2*memberIndex - 1) + ')').css('opacity', 0)
			if(userCDQ.top && userCDQ.top.includes(category + "_" + top))
				$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*memberIndex) + ')').css('opacity', 1)
			if(topAgreements[category][top] == 0 && !$('#top-show-categories').is(':checked'))
				clearDisagreedTop();
		}
		changeMemberAgreement(members[memberIndex])
	})

	socket.on('top change all', function(data){
		var memberIndex = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberIndex]
		updateTopAgreementAll(data.change, memberIndex)
		if(data.change > 0)
			members[memberIndex].top = false;
		else
			members[memberIndex].top = []
		changeMemberAgreement(members[memberIndex])
	})

	socket.on('price change', function(data){
		var memberIndex = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberIndex]
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
			$('#price-members-sel rect:nth-child(' + 9*memberIndex + ')').attr({y: startIndex*26 + 6, height: (endIndex - startIndex + 1)*26})
		}else{
			var userStart = stringToPriceIndex(member.price.max)
			var userEnd = stringToPriceIndex(member.price.min)
			for(i = userStart; i < userEnd + 1; i++){
				priceAgreements[i]--
			}
			priceAgreements[4]++
			member.price = false
			$('#price-members-sel rect:nth-child(' + 9*memberIndex + ')').attr({y: 6, height: 4*26})
		}

		updatePriceAgreement(true)
		changeMemberAgreement(members[memberIndex])
	})

	socket.on('rating change', function(data){
		var memberIndex = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberIndex]
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
		changeMemberAgreement(members[memberIndex])
	})

	socket.on('review change', function(data){
		var memberIndex = members.findIndex(function(member){
			return this.id === member.id
		}, {id: data.id})
		var member = members[memberIndex]
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
		changeMemberAgreement(members[memberIndex])
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
		if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
			$('#right > .column-content').css('overflow-y', 'scroll')
		$("#right .column-content").animate({scrollTop: $('#right .column-content').prop("scrollHeight")}, 500)
		$('#chat-container .nothing-msg').hide();
	})


	// PINGS
	socket.on('new ping', function(data){
		if(userCDQ.id === data.receiverID){
			var senderIndex = members.findIndex(member => member.id === data.senderID)

			var classStr = 'ping-' + data.category + '-'
			var descriptionHtml = ''
			if(data.category === 'top'){
				classStr += data.option
				descriptionHtml += `<b>${topNames[data.option.split('_')[1]]}</b> in your <b>Place Categories</b></h1>`
			}else if(data.category === 'price'){
				classStr += data.option.length
				descriptionHtml += `<b>${data.option}</b> in your <b>Price Range</b></h1>`
			}

			$('#ping-container').append(`<div class='ping-entry ${classStr}'>
											<div class='msg-pic-section'><img src='profile_imgs/${members[senderIndex].filename}' style='border-color:${colors[senderIndex]}'/></div>
											<div class='ping-text-section'>
												<h1><b style='color:${colors[senderIndex]}'>${members[senderIndex].firstname} ${members[senderIndex].lastname}</b> asked you to include </br>
												${descriptionHtml}
												<button class='accept-ping-btn' onclick="acceptPing('${data.category}', '${data.option.length}')">Accept</button>												
											</div>
										</div>`);

			if($('#right > .column-content')[0].scrollHeight > $('#right > .column-content').height())
				$('#right > .column-content').css('overflow-y', 'scroll')
			$('#ping-container .nothing-msg').hide()
		}
	})
})