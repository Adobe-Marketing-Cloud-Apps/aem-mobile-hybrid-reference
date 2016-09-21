var perfjankie = require('perfjankie');
var browsers = require('../browsers/iphone-6s-9.3');
var actions = require('../actions/run-animations');
var metrics = require('../metrics/metrics');

var linkHref = 'fast/3-animate-2d-transform/www/index.html';
var preScript = require('../pre-scripts/navigate-to-sample')(linkHref);

perfjankie({
  "url": null, // URL of the page that you would like to test. Null for PhoneGap

  /* The next set of values identify the test */
  name: "PhoneGap day perf sample tests", // A friendly name for the URL. This is shown as component name in the dashboard
  suite: "Fast animation", // Displayed as the title in the dashboard. Only 1 suite name for all components
  time: new Date().getTime(), // Used to sort the data when displaying graph. Can be the time when a commit was made
  run: "commit#Hash", // A hash for the commit, displayed in the x-axis in the dashboard
  repeat: 3, // Run the tests 3 times. Default is 1 time

  /* Identifies where the data and the dashboard are saved */
  couch: {
    server: 'http://localhost:5984',    
    //requestOptions : { "proxy" : "http://someproxy" }, // optional, e.g. useful for http basic auth, see Please check [request] for more information on the defaults. They support features like cookie jar, proxies, ssl, etc.
    database: 'performance', 
    updateSite: !process.env.CI, // If true, updates the couchApp that shows the dashboard. Set to false in when running Continuous integration, run this the first time using command line. 
    onlyUpdateSite: false // No data to upload, just update the site. Recommended to do from dev box as couchDB instance may require special access to create views.
  },

	// The callback function, err is falsy if all of the following happen
	// 1. Browsers perf tests ran
	// 2. Data has been saved in couchDB
	// err is not falsy even if update site fails. 
  callback: function(err, res) {
  	if (err) {
  		return console.error(err);
  	}
  	console.log(res);
  },

  /* OPTIONS PASSED TO BROWSER-PERF  */
  // Properties identifying the test environment 
  // This can also be a ["chrome", "firefox"] or "chrome,firefox"
  browsers: browsers, // See browser perf browser configuration for all options. 

  // Prescript
  preScript: preScript,

  // Actions
  actions: actions,

  // Metrics
  metrics: metrics,

  selenium: {
    hostname: "localhost", // or localhost or hub.browserstack.com
    port: 4723,
  },

/*
  BROWSERSTACK_USERNAME: process.env.BROWSERSTACK_USERNAME, // If using browserStack
  BROWSERSTACK_KEY: process.env.BROWSERSTACK_KEY, // If using browserStack, this is automatically added to browsers object

  SAUCE_USERNAME: process.env.SAUCE_USERNAME, // If using Saucelabs
  SAUCE_ACCESSKEY: process.env.SAUCE_ACCESSKEY, // If using Saucelabs
*/

});
