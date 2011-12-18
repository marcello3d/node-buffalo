/* Buffalo by Marcello Bastea-Forte - zlib license */

var util = require('util')

var Timestamp = exports.Timestamp = function(low, high) {
    Long.call(this, low, high)
}
util.inherits(Timestamp, Long)