#!/usr/bin/env node

module.exports = function(ctx) {
    // look for aem-merge argument
    if (ctx.cmdLine.indexOf('aem-merge') < 0) {
        return;
    }
    
    var childProcess = require('child_process');
    var shell = require('shelljs');

    //fetch content
    console.log("Fetching AEM content...");
    var fetch = childProcess.spawnSync('sh', ['scripts/fetch.sh'])
    if (fetch.status !== 0) {
      process.stderr.write(fetch.stderr);
      process.exit(fetch.status);
    } else {
      process.stdout.write(fetch.stdout);
      process.stderr.write(fetch.stderr);
    }

    //merge content
    var cp = shell.cp
      , rm = shell.rm;

    console.log("Merging AEM content...");
    rm('-rf', 'tmp/www/*.json');
    cp('-Rf', 'tmp/www', '');

    //clean up
    console.log("Cleaning up AEM merge...");
    rm('-rf', 'tmp/');

    console.log("AEM Merge...COMPLETE!");    
    
    return;
}

