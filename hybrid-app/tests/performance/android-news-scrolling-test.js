var browserPerf = require('browser-perf');
var browserSelector = require('./util/browser-selector');
var browsers = require('./browsers/' + browserSelector.getBrowser());
var scrollActions = require('./actions/scroll-ion-content');
var metrics = require('./metrics/metrics');
var util = require('util');

// Location of the sample to test
var preScript = require('./pre-scripts/navigate-to-news-page')();

var options = {
	// Use ChromeDriver port
	selenium: 'localhost:9515',
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
			// print error, but don't return
			console.error('Error: ' + util.inspect(err, {showHidden: false, depth: null}));
		}
		// else: success
		console.log("--- Begin test results ---");
		console.log(util.inspect(res, {showHidden: false, depth: null}));
		console.log("--- End test results ---");
	}, 
	options);
