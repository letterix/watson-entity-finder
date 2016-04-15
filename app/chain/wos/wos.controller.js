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
  .then(function (param){
    var records = param["soap:Envelope"]["soap:Body"][0]["ns2:searchResponse"][0]["return"][0]["records"];
    var formatedRecords = [];
    for (var i = 0; i<records.length; i++){
      var record = {};
      record.title=findLabelValue(records[i]["title"], "Title");
      record.source=findLabelValue(records[i]["source"], "SourceTitle");
      record.authors=findLabelValue(records[i]["authors"], "Authors");
      record.issn=findLabelValue(records[i]["other"], "Identifier.Issn");
      formatedRecords[i] = record;
    }
    console.log(formatedRecords);
    return formatedRecords;
  });
};

function findLabelValue(list, label){
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
    return "Missing";
}
