exports.getBrowser = function(){
	if (typeof process.argv[2] !== 'undefined') {
    	return process.argv[2];
	} else {
		return "iphone-6s-9.3";
	}
};