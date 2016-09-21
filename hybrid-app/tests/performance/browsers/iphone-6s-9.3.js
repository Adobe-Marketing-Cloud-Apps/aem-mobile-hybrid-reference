var currentDir = __dirname;

module.exports = [
	{
		'app': currentDir + '/../../platforms/ios/build/emulator/PerfSample.app',
		'bundleId': 'com.brucelefebvre.PGAppPerf',
		'platformName': 'iOS',
		'platformVersion': '9.3',
		'deviceName': 'iPhone 6s',
		'autoWebview': true
	}
];