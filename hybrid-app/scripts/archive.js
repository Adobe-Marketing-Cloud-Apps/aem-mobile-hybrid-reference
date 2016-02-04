#!/usr/bin/env node

var fs = require('fs');
var archiver = require('archiver');

var output = fs.createWriteStream('hybrid-app.zip');
var archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized.');
});

archive.on('error', function(err){
    throw err;
});

archive.pipe(output);

archive.bulk([
    { src: ['*.xml',
            '*.json',
            '*.project', 
            'res/**',
            'scripts/**',
            'scss/**',
            'www/**' ], 
     dest: 'hybrid-app', expand: true }
]);

archive.finalize();