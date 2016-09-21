var browserPerf = require('browser-perf');
var browsers = require('../browsers/iphone-6s-9.3');
var runAnimations = require('../actions/run-animations');
var metrics = require('../metrics/metrics');
var util = require('util');

// Location of the sample to test
var linkHref = 'fast/3-animate-2d-transform/www/index.html';
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
	actions: runAnimations
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