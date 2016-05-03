/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');


/**
 * DESCRIPTION: A simple function that prints a given string once the nested function is called
 * Used to debug promise chains.
 *
 * @param String str: the string to print
 */
exports.printPromiseProgress = function(str) {
    return function() {
        console.log(str);
    }
};

/**
 * DESCRIPTION: A helper function that replaces all occurences of a string
 *
 * @param String string: the string to replace in
 * @param String find: the string to search for and replace
 * @param String string: the string to replace with
 * @returns: the resulting string
 */
exports.replaceAll = function(string, find, replace) {
    return string.split(find).join(replace);
};

/**
 * DESCRIPTION: A helper function that trims a string from special characters
 *
 * @param String string: the string to replace in
 * @returns: the resulting string
 */
exports.trimSpecialCharacters = function(string) {
    return string.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

// OBJECT MANIPULATION
// ====================================================

/**
 * DESCRIPTION: A function that converts each key-value pair in the params object
 * into an url encoded query part. Then sets the total resulting url as the uri field
 * on the options object
 *
 * @param Object params: a params object to be converted into an url query
 * @returns: the options object with the newly updated uri field
 */
exports.setUrlParamsForOptions = function(params, options) {
    return new Promise.reduce(Object.keys(params), function(acc, param) {
        return acc + encodeURIComponent(param)+ '=' + encodeURIComponent(params[param]) + '&';
    }, options.uri + '?')
    .then(function(res) {
        options.uri = res;
        return options;
    })
};

/**
 * DESCRIPTION: A simple function that returns all the values contained in an object
 *
 * @param Object map: the object containing the values
 * @returns: an array of the values contained in the map object
 */
exports.extractValuesFromMap = function(map) {
  return Promise.map(Object.keys(map), function(key) {return map[key]});
};

/**
 * DESCRIPTION: A function used to set the res param of the nested function
 * as the field value of the object param.
 * Frequently used in promise chains
 *
 * @param String field: the field to assign the value to for the object
 * @param Object object: the object to set the value for
 * @param res: the value to assign
 * @returns: the object with teh newly assigned value
 */
exports.setFieldForObject = function(field, object) {
    return function(res) {
        object[field] = res;
        return object;
    }
};

/**
 * DESCRIPTION: A function used to extract the value contained in the value object
 * by following the order of fields listed in the fieldList array.
 *
 * @param fieldList: the fields, in order, to index the value object with
 * @param Object value: the value object to index
 * @returns: the value contained in the value object at the inexed path
 */
exports.extractFieldValue = function(fieldList) {
    return function(value) {
        return new Promise(function(resolve) {
            fieldList.forEach(function(field) {
                value = value[field];
            });

            return resolve(value);
        });
    }
};

/**
 * DESCRIPTION: A function used to move the value contained in an object at a field
 * to another filed. In other words you rename the field for the object.
 *
 * @param String from: the field to read the value from
 * @param String to: the field to write the value at
 * @param Object obj: the object to rename the field for
 * @returns: the object with teh renamed field
 */
exports.renameFieldForObject = function(from, to) {
    return function(obj) {
        obj[to] = obj[from];
        delete obj[from];
        return obj;
    }
}

/**
 * DESCRIPTION: A function used to move all the fields from a nested object onto
 * the parent object.
 *
 * @param String field: the field at which the parent object containes the nested object
 * @param Object obj: the object to index and assign the fields for
 * @returns: the parent object with the new fields, without the nested object itself.
 */
exports.moveNestedObjFieldsToParent = function(field) {
    return function(obj) {
        return Promise.map(Object.keys(obj[field]), function(key) {
            obj[key] = obj[field][key];
        })
        .then(function() {
            delete obj[field];
            return obj;
        })
    }
};

/**
 * DESCRIPTION: A function used to move all the fields from the object with most fields,
 * to the object with the fewest number of fields.
 *
 * @param Object first: one of the objects to merge
 * @param Object secnd: one of the objects to merge
 * @returns: the object that the fields where written to
 */
exports.extendSmallestObject = function(first, second) {
    var from = Object.keys(first) > Object.keys(second) ? first : second;
    var to = Object.keys(first) < Object.keys(second) ? first : second;
    Object.keys(from).forEach(function(key) {
        to[key] = from[key];
    });
    return to;
};

/**
 * DESCRIPTION: A function used to move all the fields from one object to another
 *
 * @param Object from: the object to read the fields from
 * @param Object to: the object to write the fields to
 * @returns: the object that the fields where written to
 */
exports.moveFieldsFromObj = function(from, to) {
    Object.keys(from).forEach(function(key) {
        to[key] = from[key];
    });
    return to;
};


/**
 * DESCRIPTION: A function used to return the value of a field from an object
 *
 * @param field: the field to index the object with
 * @param Object obj: the object to index for the value
 * @returns: the value contained at the field for the object
 */
exports.extractFieldForObject = function(field) {
    return function(obj) {
        return obj[field];
    }
};


// ARRAY MANIPULATION
// ====================================================

/**
* DESCRIPTION: Takes a field and an array of objects and removes any double occuring objects,
* indexed by the indexField parameter. Further, if two objects are matching, the objects
* are merged into one with priority to the object with teh most fields.
*
* @param String indexField: the field to index each object with
* @param objects[]: the array of objects to merge into a set
* @return: An array containing only one of each object
*/
exports.getSetOfObjectsByField = function(indexField) {
    return function (objects) {
        return Promise.reduce(objects, function(map, object) {
            var key = exports.trimSpecialCharacters(object[indexField]);
            if (!map[key]) {
                map[key] = object;
                return map;
            } else {
                var object = exports.extendSmallestObject(map[key], object);
                map[key] = object;
                return map;
            }
        }, {})
        .then(exports.extractValuesFromMap);
    }
}

exports.getSetOfObjectsByField = function(indexField) {
    return function (objects) {
        return Promise.reduce(objects, function(map, object) {
            var key = exports.trimSpecialCharacters(object[indexField]);
            if (!map[key]) {
                map[key] = object;
                return map;
            } else {
                var object = exports.extendSmallestObject(map[key], object);
                map[key] = object;
                return map;
            }
        }, {})
        .then(exports.extractValuesFromMap);
    }
}

/**
 * DESCRIPTION: retrieves the first #num values in the list
 *
 * @param int num: the number of values to return
 * @param list[]: an array of values
 * @return: an array containing the #num first values
 */
exports.retrieveFirstNumValues = function(num) {
    return function(list) {
        return list.splice(0, num);
    }
}

/**
 * DESCRIPTION: A function used to combine a list of list of values into a signle list
 * of values.
 *
 * @param arrays[]: an array containg the arrays of values to combine
 * @returns: the combined list of values
 */
exports.flatten = function(arrays) {
    return [].concat.apply([], arrays);
};

/**
 * DESCRIPTION: A function used to created a csv string given a field and a list
 * of objects to index with the field.
 *
 * @param field: the field to index the objects with and use as values in the csv
 * @param list[]: a list of objects to index with the field
 * @returns: the csv string
 */
exports.getListCsv = function(field) {
    return function(list) {
        return Promise.reduce(list, function(csv, o) {
            csv += field ? o[field] : o;
            csv += ', ';
            return csv;
        }, '');
    }
};

/**
 * DESCRIPTION: A function used to sort an Array of objects given a field to sort by.
 *
 * @param list[]: the array of objects to sort
 * @param field: the field to sort each object by
 * @returns: the sorted array of objects
 */
exports.sortByField = function(field) {
    return function(list) {
        return new Promise(function(resolve) {
            list.sort(function(a, b) {
                if (a[field] < b[field]) {
                    return 1;
                }

                return -1;
            });

            return resolve(list);
        });
    }
};

// FILTERS
// ====================================================

/**
 * DESCRIPTION: A filter used to remove undefined objects
 *
 * @param Object obj: the object to check
 */
exports.undefinedFilter = function(obj) {
    return !!obj;
};

/**
 * DESCRIPTION: A filter used to remove objects with an undefined value for the field key
 *
 * @param String field: the field to check at on the object
 * @param Object obj: the object to check
 */
exports.undefinedFieldFilter = function(field) {
    return function(obj) {
        return !!obj[field];
    }
};
