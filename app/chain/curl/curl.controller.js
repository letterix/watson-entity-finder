/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var config = require('config');
var errorHandler = require('../../handler/error.handler.js');
var utils = require('../../utility/utils');
//var Curl = require('node-curl/lib/Curl')

// DOES EXPORT
// ====================================================
/*
exports.curl = function() {

    var p = console.log;

    var curl = new Curl();

    var url = 'www.yahoo.com';

    curl.setopt('URL', url);
    curl.setopt('CONNECTTIMEOUT', 2);

    // on 'data' must be returns chunk.length, or means interrupt the transfer
    curl.on('data', function(chunk) {
        p("receive " + chunk.length);
        return chunk.length;
    });

    curl.on('header', function(chunk) {
        p("receive header " + chunk.length);
        return chunk.length;
    })

    // curl.close() should be called in event 'error' and 'end' if the curl won't use any more.
    // or the resource will not release until V8 garbage mark sweep.
    curl.on('error', function(e) {
        p("error: " + e.message);
        curl.close();
    });


    curl.on('end', function() {
        p('code: ' + curl.getinfo('RESPONSE_CODE'));
        p('done.');
        curl.close();
    });

    curl.perform();
}
*/