var currentDir = __dirname;

module.exports = [
	{
		'app': currentDir + '/../../platforms/ios/build/device/PerfSample.app',
		'bundleId': 'com.brucelefebvre.PGAppPerf',
		'platformName': 'iOS',
		'platformVersion': '<your device version>',
		'deviceName': '<your device name>',
		'udid': '<your device UDID>',
		'autoWebview': true
	}
];