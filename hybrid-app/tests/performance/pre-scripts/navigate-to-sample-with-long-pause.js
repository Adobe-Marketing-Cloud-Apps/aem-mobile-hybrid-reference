module.exports = function(linkHref) {
	return function(browser) {
		var preScriptPromise = browser.elementByCssSelector("a[href*='" + linkHref + "']")
			.then(function(sampleLink) {
				// Tap sampleLink
				return sampleLink.tap();
			})
			.then(function() {
				// Sleep 5 seconds
				return browser.sleep(5000);
			});
		
		// General event logging
		browser.on('status', function(info){
			console.log('\x1b[36m%s\x1b[0m', info);
		});

		return preScriptPromise;
	}
};