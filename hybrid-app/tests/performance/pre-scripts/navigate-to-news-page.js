module.exports = function() {
	return function(browser) {
		// Locate the menu button
		var preScriptPromise = browser.elementsByCssSelector("button.ion-navicon")
			.then(function(menuButtons) {
				// Tap menubutton
				return menuButtons[1].tap();
			})
			.then(function() {
				// Sleep 1 second
				return browser.sleep(1000);
			})
			.then(function() {
				// Find the News and Events menu item
				return browser.elementByCssSelector("a[href='#/app/news']")
			})
			.then(function(newsAndEventsItem) {
				// Tap News and Events menu item
				return newsAndEventsItem.tap();
			})
			.then(function() {
				// Sleep 1 second
				return browser.sleep(1000);
			});
		
		// General event logging
		browser.on('status', function(info){
			console.log('\x1b[36m%s\x1b[0m', info);
		});

		return preScriptPromise;
	}
};