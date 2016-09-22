var browserPerf = require('browser-perf');

// Indicate which browsers/devices should be tested. see browsers/iphone-real-device
// for an example of running on a physical iOS device
//var browsers = require('./browsers/iphone-real-device');
var browsers = require('./browsers/iphone-6s-plus-9.3');

// Details of the action to analyze
var scrollActions = require('./actions/scroll-ion-content');

// Track runtime metrics, exclude networking
var metrics = require('./metrics/metrics');
var util = require('util');

// Location of the sample to test
var preScript = require('./pre-scripts/navigate-to-news-page')();

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