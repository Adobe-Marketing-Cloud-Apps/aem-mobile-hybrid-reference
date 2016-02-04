#!/usr/bin/env node

module.exports = function(context) {

    var childProcess = require('child_process');

    //uninstall the app on a running ios sim if platform is "ios" and user hasn't disabled this hook with the --no_uninstall flag
    if (context.opts.platforms == "ios" && context.cmdLine.indexOf("--no_uninstall") == -1) {
        console.log("Attempting to uninstall app from a booted ios sim");
        try {
           childProcess.execSync("xcrun simctl uninstall booted com.adobe.aem.app.hybridreference");
        } catch (er) {

        }

    }

    return;
}

