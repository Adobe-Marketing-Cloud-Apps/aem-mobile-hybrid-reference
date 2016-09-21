var browserPerf = require('browser-perf');
var browsers = require('../browsers/iphone-6s-9.3');
var scrollActions = require('../actions/scroll-ion-content');
var metrics = require('../metrics/metrics');
var util = require('util');

// Location of the sample to test
var linkHref = 'slow/1-scroll/www/index.html';
var preScript = require('../pre-scripts/navigate-to-sample')(linkHref);

var options = {
	// Use local Appium
	selenium: 'http://localhost:4723/wd/hub',
	browsers: browsers,
	// Use the preScript to navigate to the area we want to test
	preScript: preScript,
	// Record the following metrics
	metrics: metrics,
	// Scroll a specific element for the test action
	actions: scrollActions
};

// First param is the URL to test - N/A for Cordova apps
browserPerf(null, 
	function(err, res){
		if (err) {
			return console.error('Error: ' + err);
		}
		// else: success
		console.log("--- Begin test results ---");
		console.log(util.inspect(res, {showHidden: false, depth: null}));
		console.log("--- End test results ---");
	}, 
	options);