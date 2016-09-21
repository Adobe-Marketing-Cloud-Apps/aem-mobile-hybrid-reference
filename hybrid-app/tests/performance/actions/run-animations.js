var browserPerf = require('browser-perf');

module.exports = [
	function startAnimations(browser) {
		var actionPromise = browser.elementByCssSelector("#box1")
			.then(function(box1) {
				return box1.tap();
			})
			.then(function() {
				return browser.elementByCssSelector("#box2")
			})
			.then(function(box2) {
				return box2.tap();
			})
			.then(function() {
				return browser.elementByCssSelector("#box3")
			})
			.then(function(box3) {
				return box3.tap();
			})
			.then(function() {
				return browser.elementByCssSelector("#box4")
			})
			.then(function(box4) {
				return box4.tap();
			})
			.then(function() {
				// Let the animation run for a second
				return browser.sleep(2000);
			});

		return actionPromise;
	}
];

