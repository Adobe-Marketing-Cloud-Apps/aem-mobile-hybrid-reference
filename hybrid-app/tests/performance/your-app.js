var browserPerf = require('browser-perf');
var util = require('util');

// Indicate which browsers/devices should be tested. see browsers/iphone-real-device
// for an example of running on a physical iOS device
//var browsers = require('./browsers/iphone-real-device');
var browsers = require('./browsers/iphone-6s-9.3');

// The following built in browser-perf action will scroll your app, recording metrics while it does
var scrollActions = [browserPerf.actions.scroll()];
// The following action can be used if you're building an Ionic app
//var scrollActions = require('./actions/scroll-ion-content');

// Track runtime metrics, exclude networking
var metrics = require('./metrics/metrics');

// Uncomment the following lines to navigate to a page in your app before running the test. 
// You will also need to uncomment the preScript property of the options object (just below).
//var linkHref = 'fast/1-scroll/www/index.html';
//var preScript = require('./pre-scripts/navigate-to-sample')(linkHref);

var options = {
	// Use local Appium
	selenium: 'http://localhost:4723/wd/hub',
	browsers: browsers,
	// Use the preScript to navigate to the area we want to test
	//preScript: preScript,
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