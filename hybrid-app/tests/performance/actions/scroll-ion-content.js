var browserPerf = require('browser-perf');

module.exports = [
	// Fire scroll action 
	browserPerf.actions.scroll({
		// Find the scrollable element (ion-content in this case).
		scrollElement: "document.querySelectorAll('ion-content.scroll-content.news')[0]"
	})
];

