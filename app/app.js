/*eslint-env node*/

/**
 * Module dependencies.
 */

var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var compression = require('compression');
var express = require('express');
var cfenv = require('cfenv');

var watsonRoutes = require('./chain/watson/watson.routes')(express.Router());
<<<<<<< Upstream, based on 9aad068af7b282680b1eae236dc6965252e20782
var googleRoutes = require('./chain/google/google.routes')(express.Router());

// create a new express server
var app = express();

// open cors
app.options('*', cors({credentials: true, origin: true}));
app.use(cors({credentials: true, origin: true}));

// json
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// logging
app.use(morgan('dev'));

// gzip
app.use(compression());

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// ROUTES
// =============================================================================
app.use('/api/watson', watsonRoutes);
app.use('/api/google', googleRoutes);
=======

// create a new express server
var app = express();

// open cors
app.options('*', cors({credentials: true, origin: true}));
app.use(cors({credentials: true, origin: true}));

// json
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// logging
app.use(morgan('dev'));

// gzip
app.use(compression());

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// ROUTES
// =============================================================================
app.use('/api/watson', watsonRoutes);
>>>>>>> 597d5fb Initial setup of the application

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});