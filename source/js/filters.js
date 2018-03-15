$(document).ready(function(){
	// clear or fill the list of objects user agrees with
	// update agreement display accordingly
	$('#top-no-pref').change(function(){
		var change = 0;
		if(this.checked){
			$('.check-box').css('fill', '#F0F0F0')
			updateTopAgreementAll(1, false);
			socket.emit('top change all', {change: 1})
			userCDQ.top = false;
		}else{
			$('.check-box').css('fill', '#FFF')
			updateTopAgreementAll(-1, false);
			socket.emit('top change all', {change: -1})
			userCDQ.top = []
		}
	})

	// if user clicks on a selection handle, store its information
	var $dragging = null;
    $('.select-handle').on("mousedown", function (e) {
    	e.preventDefault();
        $dragging = $(e.target);
    });
    $(document).on("mouseup", function (e) {
        $dragging = null;
    });

    // if user moves mouse when a selection handle has been clicked on previously
    $(document.body).on("mousemove", function(e) {
        if ($dragging) {
        	e.preventDefault();
        	// expected new position of select handle
        	var newPosition = 26*Math.round((e.pageY-$dragging.parent().position().top-5)/26)+1

        	// if the handle is for the ratings criteria
        	if($dragging.attr('id') === 'rating-handle'){
        		// if mouse is in a location outside of the selection area
				if(newPosition < 27)
					newPosition = 27
				else if(newPosition > 131)
					newPosition = 131
				// if its a new position, update display to show changes and update local objects
				if($dragging.attr('y') != newPosition){
					var oldRating = 0;
					if($('#rating-no-pref').is(':checked')){
						$('#rating-no-pref').prop('checked', false)
						$('#rating-sel-area').css('fill', '#AEC7E8')
						$('#rating-sel-area-agreed').css('fill', '#1F77B5')
						userCDQ.rating = 4 - ((newPosition-1)/26 - 1)
						ratingAgreements[5]--;
						updateRatingAgreement(5, userCDQ.rating)
					}else{
						oldRating = userCDQ.rating
						updateRatingAgreement(userCDQ.rating, 4 - ((newPosition - 1)/26 - 1))
						userCDQ.rating = 4 - ((newPosition - 1)/26 - 1)
					}
					$('#rating-sel-area').attr('height', (minToRatingIndex(userCDQ.rating)+1)*26)
					socket.emit('rating change', userCDQ.rating)
					$dragging.attr('y', newPosition)

					if(oldRating > userCDQ.rating)
						getLocations({topList: userCDQ.top, price: userCDQ.price, rating: {max: oldRating, min: userCDQ.rating}, reviews: userCDQ.reviews})
					else
						removeLocations({rating: userCDQ.rating})
				}
        	}else if(($dragging.attr('id') === 'top-handle') || ($dragging.attr('id') === 'bot-handle')){
        		changePriceDisplay($dragging, newPosition)
			}else{
				changeReviewDisplay($dragging, newPosition)
			}
	    }
    });

    // if user click on slider area of price range
    // change the position slider and agreement display of price range
    // (code is similar to when dragging)
    $('#price-slider-area').on('click', function(e){
    	var cursorPosition = e.pageY-$(this).parent().position().top-5
    	var newPosition = 26*Math.round(cursorPosition/26)+1
    	var target;
		if(Math.abs($('#top-handle').attr('y') - cursorPosition) < Math.abs($('#bot-handle').attr('y') - cursorPosition))
			target = $('#top-handle')
		else
			target = $('#bot-handle')

		changePriceDisplay(target, newPosition)
    })

    // if user click on slider area of ratings
    // change the position slider and agreement display of ratings
    $('#rating-slider-area').on('click', function(e){
    	var newPosition = 26*Math.round((e.pageY-$(this).parent().position().top-5)/26)+1
		if($('#rating-handle').attr('y') != newPosition){
			if(newPosition < 27)
				newPosition = 27
			else if(newPosition > 131)
				newPosition = 131

			var oldRating = 0;
			if($('#rating-no-pref').is(':checked')){
				$('#rating-no-pref').prop('checked', false)
				$('#rating-sel-area').css('fill', '#AEC7E8')
				$('#rating-sel-area-agreed').css('fill', '#1F77B5')
				userCDQ.rating = 4 - ((newPosition-1)/26 - 1)
				ratingAgreements[5]--;
				updateRatingAgreement(5, userCDQ.rating)
			}else{
				oldRating = userCDQ.rating
				updateRatingAgreement(userCDQ.rating, 4 - ((newPosition - 1)/26 - 1))
				userCDQ.rating = 4 - ((newPosition - 1)/26 - 1)
			}
			$('#rating-sel-area').attr('height', (minToRatingIndex(userCDQ.rating)+1)*26)
			socket.emit('rating change', userCDQ.rating)
			$('#rating-handle').attr('y', newPosition)
			if(oldRating > userCDQ.rating)
				getLocations({topList: userCDQ.top, price: userCDQ.price, rating: {max: oldRating, min: userCDQ.rating}, reviews: userCDQ.reviews})
			else
				removeLocations({rating: userCDQ.rating})
		}
    })

    // if user click on slider area of reviews
    // change the position slider and agreement display of ratings
    $('#review-slider-area').on('click', function(e){
       	var cursorPosition = e.pageY-$(this).parent().position().top-5
    	var newPosition = 26*Math.round(cursorPosition/26)+1
    	var target;
		if(Math.abs($('#review-top-handle').attr('y') - cursorPosition) < Math.abs($('#review-bot-handle').attr('y') - cursorPosition))
			target = $('#review-top-handle')
		else
			target = $('#review-bot-handle')

		changeReviewDisplay(target, newPosition)
	})

    // if user checks, set user's selected price range to be the whole range
    // update display and local objects accordingly
    $('#price-no-pref').change(function(){
    	if(this.checked){
    		$('#price-sel-area').css('fill', '#D8D8D8');
    		$('#price-sel-area').attr('y', 6)
    		$('#price-sel-area').attr('height', 26*4)
    		$('#top-handle').attr('y', 1)
    		$('#bot-handle').attr('y', 1 + 26*4)
      		$('#price-sel-area-agreed').css('fill', '#D8D8D8')
    		var topFound = false
    		var totalAgreed = 0;
    		for(i = 0; i < 4; i++){
    			if((priceAgreements[i] + priceAgreements[4]) == groupSize){
    				if(!topFound){
    					$('#price-sel-area-agreed').attr('y', i*26 + 6)
    					topFound = true;
    				}
    				totalAgreed++;
    				if(i == 3)
    					$('#price-sel-area-agreed').attr('height', totalAgreed*26)
    			}else if((priceAgreements[i] + priceAgreements[4]) != 5 && totalAgreed != 0){
    				$('#price-sel-area-agreed').attr('height', totalAgreed*26)
    				break;
    			}
    		}
    		priceAgreements[4]++;
    		var startIndex = stringToPriceIndex(userCDQ.price.max)
    		var endIndex = stringToPriceIndex(userCDQ.price.min)
    		for(i = startIndex; i < endIndex + 1; i++)
    			priceAgreements[i]--
			updatePriceAgreement(true)
			socket.emit('price change', {noPref: true})
    		userCDQ.price = false
    		placesList = []
    		getLocations({topList: userCDQ.top, price: userCDQ.price, rating: userCDQ.rating, reviews: userCDQ.reviews})
    	}else{
			$('#price-sel-area').css('fill', '#AEC7E8')
			$('#price-sel-area-agreed').css('fill', '#1F77B5')
    		priceAgreements[4]--;
    		for(i = 0; i < 4; i++)
    			priceAgreements[i]++
			updatePriceAgreement(true)
			socket.emit('price change', {noPref: false, min: '$', max: '$$$$'})
			userCDQ.price = {min: '$', max: '$$$$'}
    	}
    })

    // if user checks, set user's selected ratings to be the whole range
    // update display and local objects accordingly
    $('#rating-no-pref').change(function(){
    	if(this.checked){
    		var oldRating = userCDQ.rating
    		$('#rating-sel-area').css('fill', '#D8D8D8');
    		$('#rating-handle').attr('y', 1 + 26*5)
    		$('#rating-sel-area-agreed').css('fill', '#D8D8D8')
    		ratingAgreements[5]++
    		for(i = 0; i < minToRatingIndex(userCDQ.rating) + 1; i++)
    			ratingAgreements[i]--
    		$('#rating-sel-area').attr('height', 5*26)
    		updateRatingAgreement(-1)
    		socket.emit('rating change', -1)
    		userCDQ.rating = -1
    		getLocations({topList: userCDQ.top, price: userCDQ.price, rating: {max: oldRating, min: 0}, reviews: userCDQ.reviews})
    	}else{
    		$('#rating-sel-area').css('fill', '#AEC7E8')
			$('#rating-sel-area-agreed').css('fill', '#1F77B5')
    		ratingAgreements[5]--;
    		for(i = 0; i < 5; i++)
    			ratingAgreements[i]++
    		$('#rating-sel-area').attr('height', 5*26)
			updateRatingAgreement(-1)
			socket.emit('rating change', 0)
			userCDQ.rating = 0
    	}
    })

    // if user checks, set user's selected reviews to be whole range
    $('#review-no-pref').change(function(){
    	if(this.checked){
    		$('#review-sel-area').css('fill', '#D8D8D8');
    		$('#review-sel-area').attr('y', 6)
    		$('#review-sel-area').attr('height', 26*5)
    		$('#review-top-handle').attr('y', 1)
    		$('#review-bot-handle').attr('y', 1 + 26*5)
      		$('#review-sel-area-agreed').css('fill', '#D8D8D8')
    		var topFound = false
    		var totalAgreed = 0;
    		for(i = 0; i < 5; i++){
    			if((reviewAgreements[i] + reviewAgreements[5]) == groupSize){
    				if(!topFound){
    					$('#review-sel-area-agreed').attr('y', i*26 + 6)
    					topFound = true;
    				}
    				totalAgreed++;
    				if(i == 4)
    					$('#review-sel-area-agreed').attr('height', totalAgreed*26)
    			}else if((reviewAgreements[i] + reviewAgreements[5]) != 5 && totalAgreed != 0){
    				$('#review-sel-area-agreed').attr('height', totalAgreed*26)
    				break;
    			}
    		}
    		reviewAgreements[5]++;
    		var startIndex = reviewToIndex(userCDQ.reviews.max)
    		var endIndex = reviewToIndex(userCDQ.reviews.min)
    		for(i = startIndex; i < endIndex; i++)
    			reviewAgreements[i]--
			updateReviewAgreement(true, 0, 0)
			socket.emit('review change', {noPref: true})
    		userCDQ.reviews = false
    		placesList = []
    		getLocations({topList: userCDQ.top, price: userCDQ.price, rating: userCDQ.rating, reviews: userCDQ.reviews})
    	}else{
			$('#review-sel-area').css('fill', '#AEC7E8')
			$('#review-sel-area-agreed').css('fill', '#1F77B5')
    		reviewAgreements[5]--;
    		for(i = 0; i < 5; i++)
    			reviewAgreements[i]++
			updateReviewAgreement(true, 0, 0)
			socket.emit('review change', {noPref: false, min: 0, max: 1001})
			userCDQ.reviews = {min: 0, max: 1001}
    	}
    })

    // if user checked, show the top preferences of all the members in the group
    // else, hide the preferences and display concise information
    $('#top-show-all').change(function(){
    	var name;
    	var locCategories = Object.keys(topAgreements)
    	if(this.checked){
    		for(var i = 0; i < locCategories.length - 1; i++){
    			var category = locCategories[i]
    			var topKeyList = Object.keys(topAgreements[category])
    			for(var j = 0; j < topKeyList.length; j++){
    				var top = topKeyList[j]
    				if((topAgreements[category][top] + topAgreements.notCare) != groupSize){
		    			$('#top-group-' + top + ' > #right-rect').addClass('show-all-rect')
		    			$('#top-group-' + top + ' > #right-text').css({opacity: '0', transition: '0.2s'})
		    			$('#top-group-' + top + ' > .top-members-sel').css('opacity', '1')
 				   		$('#top-group-' + top + ' .test-ping').css('cursor', 'pointer')
    				}
    			}
    		}
    	}else{
    		for(var i = 0; i < locCategories.length - 1; i++){
    			var category = locCategories[i]
    			var topKeyList = Object.keys(topAgreements[category])
    			for(var j = 0; j < topKeyList.length; j++){
    				var top = topKeyList[j]
	    			if((topAgreements[category][top] + topAgreements.notCare) != groupSize){
		    			$('#top-group-' + top + ' > #right-rect').removeClass('show-all-rect')
		    			$('#top-group-' + top + ' > #right-text').css({opacity: '1', transition: '0.2s'})
		    			$('#top-group-' + top + ' > .top-members-sel').css('opacity', '0')
 				   		$('#top-group-' + top + ' .test-ping').css('cursor', 'default')
		    		}
		    	}
    		}
    	}
    })

    // if user checked, show the price preferences of all the members in the group
    // else, hide the preferences and display concise information
    $('#price-show-all').change(function(){
    	if(this.checked){
    		for(i = 0; i < priceAgreements.length - 1; i++){
    			$('#right-rect-price-' + i).addClass('show-all-rect')
    			$('#right-text-price-' + i).css({opacity: '0', transition: '0.2s'})
    			if(i <= stringToPriceIndex(userCDQ.price.min) && i >= stringToPriceIndex(userCDQ.price.max))
    				$('[id^=ping-price-' + (4-i) + ']').css('cursor', 'pointer')
    		}
    		$('#price-members-sel').css('opacity', '1')

    	}else{
    		for(i = 0; i < priceAgreements.length - 1; i++){
    			$('#right-rect-price-' + i).removeClass('show-all-rect')
    			$('#right-text-price-' + i).css('opacity', '1')
    		}
    		$('#price-members-sel').css('opacity', '0')
    		$('#price-members-sel .test-ping').css('cursor', 'auto')
    	}
    })

    // collapse or expand the specified criteria
    $('.collapse').click(function(){
    	var id = $(this).attr('id')
    	var criteriaName = id.slice(9, id.length)
    	if($(this).data('collapsed')){
    		$('#' + criteriaName + 's-svg-container').slideDown();
    		$(this).data('collapsed', false)
    		$(this).attr('src', 'img/CDQ_criterion_close@2x.png')
    	}else{
    		$('#' + criteriaName + 's-svg-container').slideUp();
    		$(this).data('collapsed', true)
    		$(this).attr('src', 'img/CDQ_criterion_open@2x.png')
    	}
    })

    $('#top-show-categories').change(function(){
    	if(this.checked){
			var locCategories = Object.keys(topAgreements)
			var totalAdded = 0;
			var added = 0;
			for(i = 0; i < locCategories.length - 1; i++){
				var category = locCategories[i]
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
		}else{
			clearDisagreedTop()
		}
	})
})

// updates the display of the members' individual preferences and agreements 
// for the given top option
function updateTopAgreement(category, top){
	if((topAgreements[category][top] + topAgreements.notCare) == groupSize){
		if($('#top-show-all').is(':checked')){
			$('#top-group-' + top + ' > #right-rect').removeClass('show-all-rect')
			$('#top-group-' + top + ' > #right-text').css({opacity: '1', transition: '0.2s'})
			$('#top-group-' + top + ' > .top-members-sel').css('opacity', '0')
		}
		$('#top-group-' + top + ' > #left-rect').addClass('agreed-rect')
		$('#top-group-' + top + ' > #right-rect').addClass('agreed-rect')
		$('#top-group-' + top + ' > #inner-border').css('opacity', 1)
		$('#top-group-' + top + ' > #left-text').removeClass('category-text').addClass('agreed-text')
		$('#top-group-' + top + ' > #right-text').removeClass('agreement-text').addClass('agreed-text').html('Yes!')
		if(userCDQ.top !== false){
			if(userCDQ.top.indexOf(category + "_" + top) != -1)
				$('#top-group-' + top + ' > .check-box').css('fill', '#1F77B5')
			else
				$('#top-group-' + top + ' > .check-box').css('fill', '#FFF')
		}
	}else{
		if($('#top-show-all').is(':checked')){
			$('#top-group-' + top + ' > #right-rect').addClass('show-all-rect')
			$('#top-group-' + top + ' > #right-text').css({opacity: '0', transition: '0.2s'})
			$('#top-group-' + top + ' > .top-members-sel').css('opacity', '1')
		}
		$('#top-group-' + top + ' > #left-rect').removeClass('agreed-rect')
		$('#top-group-' + top + ' > #right-rect').removeClass('agreed-rect')
		$('#top-group-' + top + ' > #inner-border').css('opacity', 0)
		$('#top-group-' + top + ' > #left-text').removeClass('agreed-text').addClass('category-text')
		$('#top-group-' + top + ' > #right-text').removeClass('agreed-text').addClass('agreement-text').html(`No ${groupSize > 2 ? '(' + (topAgreements[category][top] + topAgreements.notCare) + '/' + groupSize + ')' : ''}`)	
		if(userCDQ.top !== false){
			if(userCDQ.top.indexOf(category + "_" + top) != -1)
				$('#top-group-' + top + ' > .check-box').css('fill', '#AEC7E8')
			else
				$('#top-group-' + top + ' > .check-box').css('fill', '#FFF')
		}
	}
	if(topAgreed > 0){
		$('#top-disagreed-border').css('opacity', 0)
		$('#top-label').css('color', '#000')
		$('#top-svg text').removeClass('disagreed-text')
		$('#top-svg .agreement-rect').removeClass('disagreed-rect')
	}else{
		$('#top-disagreed-border').css('opacity', 1)
		$('#top-label').css('color', '#f00')
		$('#top-svg text').addClass('disagreed-text')
		$('#top-svg .agreement-rect').addClass('disagreed-rect')
	}
}

// updates the display of members' individual preferences and agreements of all top options
// it also increments or decreases the number of agreements for the global objects
function updateTopAgreementAll(change, memberID){
	var locCategories = Object.keys(topAgreements)
	var needClear = false;
	if(change > 0)
		topAgreements.notCare++
	else if(change < 0)
		topAgreements.notCare--
	topAgreed = 0;
	for(i = 0; i < locCategories.length - 1; i++){
		var category = locCategories[i]
		var topKeyList = Object.keys(topAgreements[category])
		for(j = 0; j < topKeyList.length; j++){
			var top = topKeyList[j]
			var topId = category + "_" + top
			if(change > 0){
				if((memberID && members[memberID].top.indexOf(topId) != -1) ||
					(!memberID && userCDQ.top.indexOf(topId) != -1)){
					topAgreements[category][top]--
					if(topAgreements[category][top] == 0)
						needClear = true;
				}
			}

			if(memberID){
				if(change >= 0){
					$('#top-group-' + top + ' > .top-members-sel rect:nth-child(' + (2*memberID-1) + ')').css('opacity', 1)
					$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*memberID) + ')').css('opacity', 0)
				}else{
					$('#top-group-' + top + ' > .top-members-sel rect:nth-child(' + (2*memberID-1) + ')').css('opacity', 0)
					if(userCDQ.top.includes(topId))
						$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*memberID) + ')').css('opacity', 1)
				}
			}else{
				if(change > 0){
					for(k = 1; k < members.length; k++){
						var member = members[k]
						var isSelected = !member.top || member.top.includes(topId)
						if(!isSelected)
							$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*k) + ')').css('opacity', 1)
					}
				}else{
					for(k = 1; k < members.length; k++){
						$('#top-group-' + top + ' > .top-members-sel circle:nth-child(' + (2*k) + ')').css('opacity', 0)
					}
				}
			}

			if((topAgreements[category][top] + topAgreements.notCare) == groupSize){
				topAgreed++;
				if($('#top-show-all').is(':checked')){
					$('#top-group-' + top + ' > #right-rect').removeClass('show-all-rect')
					$('#top-group-' + top + ' > #right-text').css({opacity: '1', transition: '0.2s'})
					$('#top-group-' + top + ' > .top-members-sel').css('opacity', '0')
				}
				$('#top-group-' + top + ' > #left-rect').addClass('agreed-rect')
				$('#top-group-' + top + ' > #right-rect').addClass('agreed-rect')
				$('#top-group-' + top + ' > #inner-border').css('opacity', 1)
				$('#top-group-' + top+ ' > #left-text').removeClass('category-text').addClass('agreed-text')
				$('#top-group-' + top + ' > #right-text').removeClass('agreement-text').addClass('agreed-text').html('Yes!')
				if(userCDQ.top !== false && memberID){
					if(userCDQ.top.indexOf(topId) != -1)
						$('#top-group-' + top + ' > .check-box').css('fill', '#1F77B5')
					else
						$('#top-group-' + top + ' > .check-box').css('fill', '#FFF')
				}
			}else{
				if($('#top-show-all').is(':checked')){
					$('#top-group-' + top + ' > #right-rect').addClass('show-all-rect')
					$('#top-group-' + top + ' > #right-text').css({opacity: '0', transition: '0.2s'})
					$('#top-group-' + top + ' > .top-members-sel').css('opacity', '1')
				}
				$('#top-group-' + top + ' > #left-rect').removeClass('agreed-rect')
				$('#top-group-' + top + ' > #right-rect').removeClass('agreed-rect')
				$('#top-group-' + top + ' > #inner-border').css('opacity', 0)
				$('#top-group-' + top + ' > #left-text').removeClass('agreed-text').addClass('category-text')
				$('#top-group-' + top + ' > #right-text').removeClass('agreed-text').addClass('agreement-text').html(`No ${groupSize > 2 ? '(' + (topAgreements[category][top] + topAgreements.notCare) + '/' + groupSize + ')' : ''}`)
				if(userCDQ.top !== false && memberID){
					if(userCDQ.top.indexOf(topId) != -1)
						$('#top-group-' + top + ' > .check-box').css('fill', '#AEC7E8')
					else
						$('#top-group-' + top + ' > .check-box').css('fill', '#FFF')
				}
			}
		}
	}

	if(topAgreed > 0){
		$('#top-disagreed-border').css('opacity', 0)
		$('#top-label').css('color', '#000')
		$('#top-svg text').removeClass('disagreed-text')
		$('#top-svg .agreement-rect').removeClass('disagreed-rect')
	}else{
		$('#top-disagreed-border').css('opacity', 1)
		$('#top-label').css('color', '#f00')
		$('#top-svg text').addClass('disagreed-text')
		$('#top-svg .agreement-rect').addClass('disagreed-rect')
	}

	if(needClear)
		clearDisagreedTop();
}

// changes the display of price sliders and agreement 
function changePriceDisplay(target, newPosition){
	if(target.attr('id') === 'top-handle' && $('#bot-handle').attr('y') > newPosition){
		if(newPosition < 1)
			newPosition = 1
		// if its a new position, update display to show changes and update local objects
		if(target.attr('y') != newPosition){
			var oldMax;
			if($('#price-no-pref').is(':checked')){
				$('#price-no-pref').prop('checked', false);
				$('#price-sel-area').css('fill', '#AEC7E8')
				$('#price-sel-area-agreed').css('fill', '#1F77B5')
				userCDQ.price = {min: '$', max: priceIndexToString((newPosition-1)/26)}
				target.attr('y', newPosition)
				for(i = 0; i < 4; i++)
					priceAgreements[i]++
				priceAgreements[4]--
				oldMax = '$$$$';
			}else{
				oldMax = userCDQ.price.max
				userCDQ.price.max = priceIndexToString((newPosition-1)/26)
				target.attr('y', newPosition)
			}
			$('#price-sel-area').attr('height', $('#price-sel-area').attr('height') - (newPosition + 5 - $('#price-sel-area').attr('y')))		
			$('#price-sel-area').attr('y', newPosition + 5)
			socket.emit('price change', {noPref: false, min: userCDQ.price.min, max: userCDQ.price.max})
			updatePriceAgreement(true, oldMax, userCDQ.price.max)

			if(userCDQ.price.max.length > oldMax.length){
				if(userCDQ.price.max.length - oldMax.length > 1)
					getLocations({topList: userCDQ.top, price: {max: userCDQ.price.max, min: oldMax + '$'}, 
								  rating: userCDQ.rating, reviews: userCDQ.reviews})
				else
					getLocations({topList: userCDQ.top, price: {max: userCDQ.price.max, min: userCDQ.price.max}, 
								  rating: userCDQ.rating, reviews: userCDQ.reviews})
			}else{
				if(oldMax.length - userCDQ.price.max.length > 1)
					removeLocations({price: {max: oldMax, min: userCDQ.price.max + '$'}})
				else
					removeLocations({price: {max: oldMax, min: oldMax}})
			}
		}
	// if its the bottom handle moving and the new location does not overlap with the top handle
	}else if(target.attr('id') === 'bot-handle' && $('#top-handle').attr('y') < newPosition){
		if(newPosition > 105)
			newPosition = 105
		// if its a new position, update display to show changes and update local objects
		if(target.attr('y') != newPosition){
			var oldMin;
			if($('#price-no-pref').is(':checked')){
				$('#price-no-pref').prop('checked', false);
				$('#price-sel-area').css('fill', '#AEC7E8')
				$('#price-sel-area-agreed').css('fill', '#1F77B5')
				userCDQ.price = {min: priceIndexToString((newPosition-1)/26 - 1), max: '$$$$'}
				target.attr('y', newPosition)
				for(i = 0; i < 4; i++)
					priceAgreements[i]++
				priceAgreements[4]--
				oldMin = '$'
			}else{
				oldMin = userCDQ.price.min
				userCDQ.price.min = priceIndexToString((newPosition-1)/26 - 1)
				target.attr('y', newPosition)
			}
			$('#price-sel-area').attr('height', newPosition + 5 - $('#price-sel-area').attr('y'))
			socket.emit('price change', {noPref: false, min: userCDQ.price.min, max: userCDQ.price.max})
			updatePriceAgreement(false, oldMin, userCDQ.price.min)

			if(userCDQ.price.min.length < oldMin.length){
				if(oldMin.length - userCDQ.price.min.length > 1)
					getLocations({topList: userCDQ.top, price: {max: oldMin.slice(1), min: userCDQ.price.min}, 
								  rating: userCDQ.rating, reviews: userCDQ.reviews})
				else
					getLocations({topList: userCDQ.top, price: {max: userCDQ.price.min, min: userCDQ.price.min}, 
								  rating: userCDQ.rating, reviews: userCDQ.reviews})
			}else{
				if(userCDQ.price.min.length - oldMin.length > 1)
					removeLocations({price: {max: userCDQ.price.min.slice(1), min: oldMin}})
				else
					removeLocations({price: {max: oldMin, min: oldMin}})
			}
		}
	}

	var minIndex = stringToPriceIndex(userCDQ.price.min)
	var maxIndex = stringToPriceIndex(userCDQ.price.max)
	for(var i = 0; i < 4; i++){
		if(i <= minIndex && i >= maxIndex){
			$('[id^=ping-price-' + (4-i) + ']').css('opacity', 1)
			if($('#price-show-all').is(':checked'))
				$('[id^=ping-price-' + (4-i) + ']').css('cursor', 'pointer')
		}else{
			$('[id^=ping-price-' + (4-i) + ']').css('opacity', 0)
			if($('#price-show-all').is(':checked'))
				$('[id^=ping-price-' + (4-i) + ']').css('cursor', 'auto')
		}
	}
}

// updates the display of the agreement area for the price range category
function updatePriceAgreement(isTop, oldStr, newStr){
	if(oldStr && newStr){
		var oldIndex = stringToPriceIndex(oldStr)
		var newIndex = stringToPriceIndex(newStr)
		if(isTop)
			if(oldIndex < newIndex)
				for(i = oldIndex; i < newIndex; i++)
					priceAgreements[i]--;
			else
				for(i = newIndex; i < oldIndex; i++)
					priceAgreements[i]++;
		else
			if(oldIndex < newIndex)
				for(i = oldIndex + 1; i < newIndex + 1; i++)
					priceAgreements[i]++;
			else
				for(i = newIndex + 1; i < oldIndex + 1; i++)
					priceAgreements[i]--
	}

	var rangeAgreed = 0;
	for(i = 0; i < priceAgreements.length - 1; i++){
		if((priceAgreements[i] + priceAgreements[4]) == groupSize){
			$('#left-rect-price-' + i).addClass('agreed-rect')
			$('#right-rect-price-' + i).addClass('agreed-rect')
			$('#left-text-price-' + i).removeClass('category-text').addClass('agreed-text')
			$('#right-text-price-' + i).removeClass('agreement-text').addClass('agreed-text').html('Yes!')
			rangeAgreed++;
		}else{
			$('#left-rect-price-' + i).removeClass('agreed-rect')
			$('#right-rect-price-' + i).removeClass('agreed-rect')
			$('#left-text-price-' + i).addClass('category-text').removeClass('agreed-text')
			$('#right-text-price-' + i).addClass('agreement-text').removeClass('agreed-text').html(`No ${groupSize > 2 ? '(' + (priceAgreements[i] + priceAgreements[4]) + '/' + groupSize + ')' : ''}`)
			if(rangeAgreed > 0){
				$('#price-label').css('color', '#000')
				$('#prices-svg text').removeClass('disagreed-text')
				$('#prices-svg .agreement-rect').removeClass('disagreed-rect')
				$('#price-inner-border').attr('height', rangeAgreed*26 - 2)
				$('#price-inner-border').attr('y', (i-rangeAgreed)*26 + 7)
				$('#price-disagreed-border').css('opacity', 0)

				// change the height and position of the agreed portion of the selection area
				var areaTopIndex = ($('#top-handle').attr('y')-1)/26;
				var areaBotIndex = ($('#bot-handle').attr('y')-1)/26;
				if(i - rangeAgreed > areaTopIndex)
					areaTopIndex = i - rangeAgreed
				$('#price-sel-area-agreed').attr('y', areaTopIndex*26 + 6)
				if(i < areaBotIndex)
					areaBotIndex = i
				$('#price-sel-area-agreed').attr('height', (areaBotIndex-areaTopIndex)*26)

				rangeAgreed = -1;
			}
		}
	}

	if(rangeAgreed > 0){
		$('#price-label').css('color', '#000')
		$('#prices-svg text').removeClass('disagreed-text')
		$('#price-inner-border').attr('height', rangeAgreed*26 - 2)
		$('#price-inner-border').attr('y', (4-rangeAgreed)*26 + 7)
		$('#price-disagreed-border').css('opacity', 0)
		$('#prices-svg .agreement-rect').removeClass('disagreed-rect')

		// change the height and position of the agreed portion of the selection area
		var areaTopIndex = ($('#top-handle').attr('y')-1)/26;
		var areaBotIndex = ($('#bot-handle').attr('y')-1)/26;
		if(4 - rangeAgreed > areaTopIndex)
			areaTopIndex = 4 - rangeAgreed
		$('#price-sel-area-agreed').attr('y', areaTopIndex*26 + 6)
		if(4 > areaBotIndex)
			areaBotIndex = 4
		$('#price-sel-area-agreed').attr('height', (areaBotIndex-areaTopIndex)*26)				

	}else if(rangeAgreed == 0){
		$('#price-label').css('color', '#F00')
		$('#prices-svg text').addClass('disagreed-text')
		$('#price-disagreed-border').css('opacity', 1)
		$('#price-inner-border').attr('height', 0)
		$('#prices-svg .agreement-rect').addClass('disagreed-rect')
		$('#price-sel-area-agreed').attr('height', 0)
		if(isTop){
			$('#price-inner-border').attr('y', $('#top-handle').attr('y')/1 + 5)
			$('#price-sel-area-agreed').attr('y', $('#top-handle').attr('y')/1 + 5)
		}else{
			$('#price-inner-border').attr('y', $('#bot-handle').attr('y')/1 + 5)
			$('#price-sel-area-agreed').attr('y', $('#bot-handle').attr('y')/1 + 5)
		}
	}
}

// update the display of the agreement area and selected area of the ratings category
function updateRatingAgreement(oldRating, newRating){
	var oldIndex = minToRatingIndex(oldRating)
	var newIndex = minToRatingIndex(newRating)
	if(oldIndex < newIndex)
		for(i = oldIndex + 1; i < newIndex + 1; i++)
			ratingAgreements[i]++;
	else
		for(i = newIndex + 1; i < oldIndex + 1; i++)
			ratingAgreements[i]--;

	var disagreement = false
	for(i = 0; i < ratingAgreements.length - 1; i++){
		if((ratingAgreements[i] + ratingAgreements[5]) == groupSize){
			$('#left-rect-rating-' + i).addClass('agreed-rect')
		}else{
			$('#left-rect-rating-' + i).removeClass('agreed-rect')
			if(!disagreement){
				disagreement = true;
				$('#right-rect-agreed').attr('height', 26*i)
				$('#right-rect-disagreed').attr({'height': 26*(5-i), 'y': 6 + i*26})
				$('#right-text-agreed').attr('y', 6 + 13*i)
				$('#right-text-disagreed').attr('y', 26*i + 13*(5-i) + 6).css('opacity', 1)
				$('#rating-inner-border').attr('height', i*26 - 2)
				$('#rating-sel-area-agreed').attr('height', i*26)
			}
		}
	}
	if(!disagreement){
		$('#right-rect-agreed').attr('height', 26*5)
		$('#right-rect-disagreed').attr({'height': 0, 'y': 6 + 5*26})
		$('#right-text-agreed').attr('y', 6 + 13*5)
		$('#right-text-disagreed').attr('y', 26*5 + 6).css('opacity', 0)
		$('#rating-inner-border').attr('height', 5*26 - 2)
		$('#rating-sel-area-agreed').attr('height', 5*26)
	}
}


function changeReviewDisplay(target, newPosition){
	// if its the top handle moving and the new location does not overlap with the bottom handle
	if(target.attr('id') === 'review-top-handle' && $('#review-bot-handle').attr('y') > newPosition){
		if(newPosition < 1)
			newPosition = 1
		// if its a new position, update display to show changes and update local objects
		if(target.attr('y') != newPosition){
			var oldMax;
			if($('#review-no-pref').is(':checked')){
				$('#review-no-pref').prop('checked', false);
				$('#review-sel-area').css('fill', '#AEC7E8')
				$('#review-sel-area-agreed').css('fill', '#1F77B5')
				userCDQ.reviews = {min: 0, max: indexToReview((newPosition-1)/26)}
				target.attr('y', newPosition)
				for(i = 0; i < 5; i++)
					reviewAgreements[i]++
				reviewAgreements[5]--
				oldMax = 1001;
			}else{
				oldMax = userCDQ.reviews.max
				userCDQ.reviews.max = indexToReview((newPosition-1)/26)
				target.attr('y', newPosition)
			}
			$('#review-sel-area').attr('height', $('#review-sel-area').attr('height') - (newPosition + 5 - $('#review-sel-area').attr('y')))		
			$('#review-sel-area').attr('y', newPosition + 5)
			socket.emit('review change', {noPref: false, min: userCDQ.reviews.min, max: userCDQ.reviews.max})
			updateReviewAgreement(true, oldMax, userCDQ.reviews.max)

			if(userCDQ.reviews.max > oldMax){
				getLocations({topList: userCDQ.top, price: userCDQ.price, 
							  rating: userCDQ.rating, reviews: {max: userCDQ.reviews.max, min: oldMax + 1}})
			}else{
				removeLocations({reviews: {max: oldMax, min: userCDQ.reviews.max + 1}})
			}
		}
	// if its the bottom handle moving and the new location does not overlap with the top handle
	}else if(target.attr('id') === 'review-bot-handle' && $('#review-top-handle').attr('y') < newPosition){
		if(newPosition > 131)
			newPosition = 131
		// if its a new position, update display to show changes and update local objects
		if(target.attr('y') != newPosition){
			var oldMin;
			if($('#review-no-pref').is(':checked')){
				$('#review-no-pref').prop('checked', false);
				$('#review-sel-area').css('fill', '#AEC7E8')
				$('#review-sel-area-agreed').css('fill', '#1F77B5')
				userCDQ.reviews = {min: indexToReview((newPosition-1)/26), max: 1001}
				target.attr('y', newPosition)
				for(i = 0; i < 5; i++)
					reviewAgreements[i]++
				reviewAgreements[5]--
				oldMin = 0
			}else{
				oldMin = userCDQ.reviews.min
				userCDQ.reviews.min = indexToReview((newPosition-1)/26)
				target.attr('y', newPosition)
			}
			$('#review-sel-area').attr('height', newPosition + 5 - $('#review-sel-area').attr('y'))
			socket.emit('review change', {noPref: false, min: userCDQ.reviews.min, max: userCDQ.reviews.max})
			updateReviewAgreement(false, oldMin, userCDQ.reviews.min)

			if(userCDQ.reviews.min < oldMin){
				getLocations({topList: userCDQ.top, price: userCDQ.price, 
							  rating: userCDQ.rating, reviews: {max: oldMin - 1, min: userCDQ.reviews.min}})
			}else{
				removeLocations({reviews: {max: userCDQ.reviews.min - 1, min: oldMin}})
			}
		}
	}
}

function updateReviewAgreement(isTop, oldReview, newReview){
	var oldIndex = reviewToIndex(oldReview)
	var newIndex = reviewToIndex(newReview)
	if(isTop)
		if(oldIndex < newIndex)
			for(i = oldIndex; i < newIndex; i++)
				reviewAgreements[i]--;
		else
			for(i = newIndex; i < oldIndex; i++)
				reviewAgreements[i]++;
	else
		if(oldIndex < newIndex)
			for(i = oldIndex; i < newIndex; i++)
				reviewAgreements[i]++;
		else
			for(i = newIndex; i < oldIndex; i++)
				reviewAgreements[i]--

	// change display for review range users agree in (including selectionm area and agreed area)
	var rangeAgreed = 0;
	for(i = 0; i < reviewAgreements.length - 1; i++){
		if((reviewAgreements[i] + reviewAgreements[5]) == groupSize){
			$('#left-rect-review-' + i).addClass('agreed-rect')
			rangeAgreed++;
		}else{
			$('#left-rect-review-' + i).removeClass('agreed-rect')
			if(rangeAgreed > 0){
				$('#reviews-svg #right-rect-agreed').attr({'height': 26*rangeAgreed, 'y': 26*(i-rangeAgreed) + 6})
				$('#reviews-svg #right-rect-disagreed-top').attr({'height': 26*(i-rangeAgreed)})
				$('#reviews-svg #right-rect-disagreed-bot').attr({'y': 26*i + 6, 'height': 26*(5-i)})
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
	$('#review-disagreed-border').css('opacity', 0)
	$('#reviews-svg text').removeClass('disagreed-text')
	$('#reviews-svg .agreement-rect').removeClass('disagreed-rect')
	$('#review-label').css('color', '#000')
	if(rangeAgreed > 0){
		$('#reviews-svg #right-rect-agreed').attr({'height': 26*rangeAgreed, 'y': 26*(5-rangeAgreed) + 6})
		$('#reviews-svg #right-rect-disagreed-top').attr({'height': 26*(5-rangeAgreed)})
		$('#reviews-svg #right-rect-disagreed-bot').attr({'y': 26*5 + 6, 'height': 0})
		$('#reviews-svg #right-text-agreed').attr({'y': 26*(5-rangeAgreed) + 6 + 13*rangeAgreed}).css('opacity', 1)
		$('#reviews-svg #right-text-disagreed-top').attr({'y': 13*(5-rangeAgreed) + 6}).css('opacity', 1)
		$('#reviews-svg #right-text-disagreed-bot').attr({'y': 26*5 + 6}).css('opacity', 0)
		$('#reviews-svg #review-inner-border').attr({'y': (5-rangeAgreed)*26 + 7, 'height': rangeAgreed*26 - 2})
		$('#reviews-svg #review-sel-area-agreed').attr({'y': (5-rangeAgreed)*26 + 6, 'height': rangeAgreed*26})
		if(rangeAgreed == 5)
			$('#reviews-svg #right-text-disagreed-top').css('opacity', 0)
	}else if(rangeAgreed == 0){
		$('#review-label').css('color', '#F00')
		$('#reviews-svg #right-rect-disagreed-top').attr({'y': 6, 'height': 26*5})
		$('#reviews-svg #right-text-disagreed-top').attr({'y': 13*5 + 6}).css('opacity', 1)
		$('#reviews-svg #right-rect-disagreed-bot').attr('height', 0)
		$('#reviews-svg #right-text-disagreed-bot').css('opacity', 0)
		$('#reviews-svg #right-rect-agreed').attr('height', 0)
		$('#reviews-svg #right-text-agreed').css('opacity', 0)
		$('#review-disagreed-border').css('opacity', 1)
		$('#reviews-svg #review-inner-border').attr('height', 0)
		$('#reviews-svg #review-sel-area-agreed').attr('height', 0)
		$('#reviews-svg text').addClass('disagreed-text')
		$('#reviews-svg .agreement-rect').addClass('disagreed-rect')
	}
}

function clearDisagreedTop(){
	if(!$('#top-show-categories').is(':checked')){
		var locCategories = Object.keys(topAgreements)
		var totalRemoved = 0;
		var removed = 0;
		for(var i = 0; i < locCategories.length - 1; i++){
			var category = locCategories[i]
			if(removed > 0 || totalRemoved > 0){
				totalRemoved += removed;
				if($('#top-type-' + category).attr('transform'))
					$('#top-type-' + category).attr('transform', $('#top-type-' + category).attr('transform') + ' translate(0, ' + (-1*totalRemoved*26) + ')')
				else
					$('#top-type-' + category).attr('transform', 'translate(0, ' + (-1*totalRemoved*26) + ')')
				removed = 0;
			}
			var topKeyList = Object.keys(topAgreements[category])
			for(var j = 0; j < topKeyList.length; j++){
				var top = topKeyList[j]
				if(topAgreements[category][top] == 0){
					if($('#top-group-' + top).css('opacity') == 1){
						$('#top-group-' + top).css('opacity', 0)
						$('#top-group-' + top).attr('transform', '')
						removed++;
					}
				}else if(removed > 0){
					if($('#top-group-' + top).attr('transform'))
						$('#top-group-' + top).attr('transform', $('#top-group-' + top).attr('transform') + ' translate(0, ' + (-1*removed*26) + ')')
					else
						$('#top-group-' + top).attr('transform', 'translate(0, ' + (-1*removed*26) + ')')
				}
			}
			if(removed > 0){
				$('#top-type-'+category+' > #top-type-label').attr('height', $('#top-type-'+category+' > #top-type-label').attr('height') - removed*26)
				if($('#top-type-'+category+' > #top-type-label').attr('height') == 0)
					$('#top-type-'+category+' .category-label').hide()
				else if($('#top-type-'+category+' > #top-type-label').attr('height') == 26)
					$('#top-type-'+category+' .category-label:nth-child(3)').hide()
				$('#top-svg').attr('height', $('#top-svg').height() - removed*26)
				$('#top-disagreed-border').attr('height', $('#top-disagreed-border').attr('height') - removed*26)
			}
		}
	}
}

function stringToPriceIndex(str){
	return 4 - str.length;
}

function priceIndexToString(index){
	if(index == 0)
		return '$$$$'
	else if(index == 1)
		return '$$$'
	else if(index == 2)
		return '$$'
	else if(index == 3)
		return '$'
}

function minToRatingIndex(minRating){
	return 4-minRating;
}

function reviewToIndex(review){
	if(review == 1001)
		return 0
	else if(review == 1000)
		return 1
	else if(review == 500)
		return 2
	else if(review == 100)
		return 3
	else if(review == 50)
		return 4
	else
		return 5
}

function indexToReview(index){
	if(index == 0)
		return 1001
	else if(index == 1)
		return 1000
	else if(index == 2)
		return 500
	else if(index == 3)
		return 100
	else if(index == 4)
		return 50
	else
		return 0
}