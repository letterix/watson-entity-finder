/*eslint-env node */
'use strict';

define('SUCCESS_DELETE', 'The item was removed successfully.');
define('SUCCESS_UPDATE', 'The item was updated successfully.');
define('SUCCESS_UPLOAD', 'The file was uploaded successfully.');
define('NO_SUCH_ITEM', 'No item with the given id was found.');
define('INVALID_JSON', 'invalid json');
define('INVALID_JSON_OBJECT', 'Invalid JSON object.');
define('INVALID_RESPONSE', 'Invalid response format.');
define('UNAUTHORIZED', 'Unauthorized access.');
define('FAILED_HTTP', 'The HTTP request could not be performed.');
define('UNEXPECTED_STATUS', 'Unexpected status code: ');
define('FILE_TOO_LARGE', 'The file uploaded was too large.');
define('BAD_FILE_FORMAT', 'Invalid file format.');

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}