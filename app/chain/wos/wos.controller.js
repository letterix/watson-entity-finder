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

exports.search = function(params) {
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
                          {'userQuery':'TS='+params.substring(6)},//Put search parameters here
                          {'queryLanguage':'en'}
                          ]
                    },
                    {'retrieveParameters': [
                          {'firstRecord':'1'},
                          {'count':'100'},    //The number of records to return.
                          ]
                    },
                  ]
              }]
            }
          ]
      }];
      var soapString = xml(soapSearchMessage, {});
  return wosResource.search(soapString)
  .then(formatWosOutput);
}

// PRIVATE METHODS
// ====================================================

function formatWosOutput(soapMessage){
    var records = soapMessage["soap:Envelope"]["soap:Body"][0]["ns2:searchResponse"][0]["return"][0]["records"];
    var formatedRecords = [];
    for (var i = 0; i<records.length; i++){
      var record = {};
      record.title=findLabelValue(records[i]["title"], "Title");
      if(record.title == undefined){
        break;
      }
      record.source=findLabelValue(records[i]["source"], "SourceTitle");
      if(record.source == undefined){
        break;
      }
      record.authors=findLabelValue(records[i]["authors"], "Authors");
      if(record.authors == undefined){
        break;
      }
      record.issn=findLabelValue(records[i]["other"], "Identifier.Issn");
      if(record.issn == undefined){
        break;
      }
      formatedRecords[i] = record;
    }
  return formatedRecords;
}

function findLabelValue(list, label){
    if(list==undefined){
      return undefined;
    };
    for(var i = 0; i < list.length; i++){
      if (list[i]["label"][0]===label){
        if(list[i]["value"].length == 1){
          return list[i]["value"][0];
        }
        else {
          return list[i]["value"];
        }
      }
    }
  return undefined;
}
