/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var wosResource = require('./wos.resource');
var errorHandler = require('../../handler/error.handler.js');
var xml = require('xml');
var config = require('config');
var soapSearchUrl = config.RESOURCE_WOS_SOAP_SEARCH;
var soapEnv = config.RESOURCE_WOS_SOAPENV;

exports.search = function() {
      var soapSearchMessage = [{
          'soapenv:Envelope': [
            {  '_attr': {
                  'xmlns:soapenv': soapEnv,
                  'xmlns:woksearchlite': soapSearchUrl
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
