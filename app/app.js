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
var alchemyRoutes = require('./chain/alchemy/alchemy.routes')(express.Router());
var scopusRoutes = require('./chain/scopus/scopus.routes')(express.Router());
var searchRoutes = require('./chain/search/search.routes')(express.Router());

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
app.use('/api/alchemy', alchemyRoutes);
app.use('/api/scopus', scopusRoutes);
app.use('/api/search', searchRoutes);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
