var browserPerf = require('browser-perf');

module.exports = [
	// Fire scroll action 
	browserPerf.actions.scroll({
		// Find the scrollable element (ion-content in this case).
		// Note the [0]: we're scrolling the first item we find
		scrollElement: "document.querySelectorAll('ion-content.scroll-content')[0]"
	})
];

