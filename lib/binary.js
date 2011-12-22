/* Buffalo by Marcello Bastea-Forte - zlib license */

var IEEE754 = require('./extern/buffer_ieee754')

exports.writeCString = function(buffer, offset, string) {
    offset += buffer.write(string, offset, 'utf8')
    buffer[offset++] = 0
    return offset
}
exports.writeString = function(buffer, offset, string) {
    offset = exports.writeInt(buffer, offset, Buffer.byteLength(string) + 1) // include \x00 character in count
    return exports.writeCString(buffer, offset, string)
}
exports.writeInt = function(buffer, offset, num) {
    buffer[offset++] = (num) & 0xff
    buffer[offset++] = (num>>8) & 0xff
    buffer[offset++] = (num>>16) & 0xff
    buffer[offset++] = (num>>24) & 0xff
    return offset
}
exports.writeInt3 = function(buffer, offset, num) {
    buffer[offset++] = (num) & 0xff
    buffer[offset++] = (num>>8) & 0xff
    buffer[offset++] = (num>>16) & 0xff
    return offset
}
exports.writeDouble = function(buffer, offset, num) {
    IEEE754.writeIEEE754(buffer, num, offset, 'little', 52, 8)
    return offset + 8
}
exports.writeLong = function(buffer, offset, num) {
    offset = exports.writeInt(buffer, offset, num.low_)
    return exports.writeInt(buffer, offset, num.high_)
}