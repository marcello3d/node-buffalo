/* Buffalo by Marcello Bastea-Forte - zlib license */

var util = require('util')
var Long = require('./extern/long').Long

module.exports = Timestamp

function Timestamp(low, high) {
    Long.call(this, low, high)
}
util.inherits(Timestamp, Long)