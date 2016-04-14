/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var wosResource = require('./wos.resource');
var errorHandler = require('../../handler/error.handler.js');
var xml = require('xml');
var sid = '';

exports.search = function() {
      var soapSearchMessage = [{
          'soapenv:Envelope': [
            {  '_attr': {
                  'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
                  'xmlns:woksearchlite': 'http://woksearchlite.v3.wokmws.thomsonreuters.com'
                  }
            },
            {  'soapenv:Header': {}
            },
            {  'soapenv:Body': [{
                  'woksearchlite:search': [
                    {'queryParameters': [
                          {'databaseId':'WOS'},
                          {'userQuery':'TS=Cancer'},//Put search parameters here
                          {'queryLanguage':'en'}
                          ]
                    },
                    {'retrieveParameters': [
                          {'firstRecord':'1'},//The first record to return.
                          {'count':'100'},    //The number of records to return.
                          ]
                    },
                  ]
              }]
            }
          ]
      }];

      var soapString = xml(soapSearchMessage, {});

      return wosResource.search(soapString);
  };
