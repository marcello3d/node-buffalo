/* Buffalo by Marcello Bastea-Forte - zlib license */

var crypto = require('crypto')
var os = require('os')

var binary = require('./binary')

// Generate machine hash
//  from docs: This is the first three bytes of the (md5) hash of the machine host name, or of the mac/network address,
//     or the virtual machine id.

var machineHash = crypto.createHash('md5').update(os.hostname()).digest('binary')

// Pre-cache the machine hash / pid
var machineAndPid = [
    machineHash[0],
    machineHash[1],
    machineHash[2],
    (process.pid) & 0xFF,
    (process.pid >> 8) & 0xFF
]

// ObjectId increment
var inc = 1

// 32 bit time
// 24 bit machine id
// 16 bit pid
// 24 bit increment
var ObjectId = exports.ObjectId = function (bytes) {
    if (Buffer.isBuffer(bytes)) {
        if (bytes.length != 12) throw new Error("Buffer-based ObjectId must be 12 bytes")
        this.bytes = bytes
    } else if (typeof bytes == 'string') {
        if (bytes.length != 24) throw new Error("String-based ObjectId must be 24 bytes")
        if (/^[0-9A-F]{24}$/i.test(bytes)) throw new Error("String-based ObjectId must in hex-format")
        this.bytes = new Buffer(bytes, 'hex')
    } else if (typeof bytes !== 'undefined') {
        throw new Error("Unrecognized type: "+bytes)
    } else {
        var timestamp = (Date.now() / 1000) & 0xFFFFFFFF
        inc = ~~inc+1 // keep as integer
        this.bytes = new Buffer([
            timestamp>>24,
            timestamp>>16,
            timestamp>>8,
            timestamp,
            machineAndPid[0],
            machineAndPid[1],
            machineAndPid[2],
            machineAndPid[3],
            machineAndPid[4],
            inc>>16,
            inc>>8,
            inc
        ])
    }
}
ObjectId.prototype.hex = function() {
    return this.bytes.toString('hex')
}
ObjectId.prototype.toString = function() {
    return "[ObjectId +"+this.hex()+"]"
}
