/* Mongolian DeadBeef by Marcello Bastea-Forte - zlib license */

// based on http://bsonspec.org/#/specification

var Long = require('./extern/long').Long,
    IEEE754 = require('./extern/buffer_ieee754'),
    toSource = require('tosource')


var FLOAT_TYPE             = 1
var STRING_TYPE            = 2
var EMBEDDED_DOCUMENT_TYPE = 3
var ARRAY_TYPE             = 4
var BINARY_TYPE            = 5
var UNDEFINED_TYPE         = 6 // deprecated
var OBJECT_ID_TYPE         = 7
var BOOLEAN_TYPE           = 8
var DATE_TIME_TYPE         = 9
var NULL_TYPE              = 0x0A
var REG_EXP_TYPE           = 0x0B
var DB_REF_TYPE            = 0x0C // deprecated
var CODE_TYPE              = 0x0D
var SYMBOL_TYPE            = 0x0E
var CODE_WITH_SCOPE_TYPE   = 0x0F
var INT32_TYPE             = 0x10
var TIMESTAMP_TYPE         = 0x11
var INT64_TYPE             = 0x12
var MIN_KEY                = 0xFF
var MAX_KEY                = 0x7F

var BINARY_GENERIC_SUBTYPE      = 0x00
var BINARY_FUNCTION_SUBTYPE     = 0x01
var BINARY_OLD_SUBTYPE          = 0x02
var BINARY_UUID_SUBTYPE         = 0x03
var BINARY_MD5_SUBTYPE          = 0x05
var BINARY_USER_DEFINED_SUBTYPE = 0x80

exports.parse = function(buffer) {
    return new BSONParser(buffer, false)
}

exports.serialize = function(object) {
    var buffers = new BSONSerializer(object, [], true)
    var finalSize = 0
    buffers.forEach(function(buffer) { finalSize += buffer.length })
    var finalBuffer = new Buffer(finalSize)
    var offset = 0
    buffers.forEach(function(buffer) {
        buffer.copy(finalBuffer, offset, 0)
        offset += buffer.length
    })
    return finalBuffer
}

var BSONSerializer = function(object) {
    this.buffers = []

    if (Array.isArray(object)) {
        object.forEach(function(element, name) {
            this.writeElement(String(name), element)
        }, this)
    } else {
        for (var key in object) this.writeElement(key, object[key])
    }

    this.writeByte(0)

    var finalSize = 4
    this.buffers.forEach(function(buffer) { finalSize += buffer.length })

    // Write the int to the front of the buffers
    this.writeInt(finalSize)
    this.buffers.unshift(this.buffers.pop())

    return this.buffers
}
BSONSerializer.prototype.writeElement = function(name, element) {
    switch (typeof element) {
        case 'string':
            this.writeByte(STRING_TYPE)
            this.writeCString(name)
            this.writeString(element)
            break

        case 'function':
            if (element instanceof RegExp) {
                this.writeByte(REG_EXP_TYPE)
                this.writeCString(name)
                this.writeCString(element.source)
                this.writeCString((element.global       ? 'g' : '') +
                                  (element.ignoreCase   ? 'i' : '') +
                                  (element.multiline    ? 'm' : ''))
            } else {
                if (typeof (element.scope) == 'object') {
                    this.writeByte(CODE_WITH_SCOPE_TYPE)
                    this.writeCString(name)
                    // We need to compute the size of the int + code + scope sub document before "writing" anything
                    var codeBuffer = new Buffer(element.toString(), 'utf8')
                    var scopeBuffers = new BSONSerializer(element.scope)
                    var codeWithScopeFinalSize = 4 + 4 + codeBuffer.length
                    scopeBuffers.forEach(function(buffer) { codeWithScopeFinalSize += buffer.length })
                    this.writeInt(codeWithScopeFinalSize)
                    this.writeInt(codeBuffer.length + 1)
                    this.buffers.push(codeBuffer,new Buffer([0]))
                    this.buffers.push.apply(this.buffers, scopeBuffers)
                } else {
                    this.writeByte(CODE_TYPE)
                    this.writeCString(name)
                    this.writeString(element.toString())
                }
            }
            break
        case 'number':
            // TODO: handle >32bit longs that aren't doubles?
            if (~~element === element) { // Integer?
                this.writeByte(INT32_TYPE)
                this.writeCString(name)
                this.writeInt(element)
            } else {
                this.writeByte(FLOAT_TYPE)
                this.writeCString(name)
                this.writeDouble(element)
            }
            break
        case 'undefined':
            this.writeByte(UNDEFINED_TYPE)
            this.writeCString(name)
            break
        case 'object':
            if (element === null) {
                this.writeByte(NULL_TYPE)
                this.writeCString(name)
            } else if (element instanceof Long) {
                this.writeByte((element instanceof Timestamp) ? TIMESTAMP_TYPE : INT64_TYPE)
                this.writeCString(name)
                this.writeInt(element.low_)
                this.writeInt(element.high_)
            } else if (element instanceof ObjectId) {
                this.writeByte(OBJECT_ID_TYPE)
                this.writeCString(name)
                this.buffers.push(element.bytes)
            } else if (element instanceof Buffer) {
                this.writeByte(BINARY_TYPE)
                this.writeCString(name)
                this.writeInt(element.length) // Just the length of the binary
                this.writeByte(element.subtype || BINARY_GENERIC_SUBTYPE)
                this.buffers.push(element)
            } else if (element instanceof Date) {
                this.writeByte(DATE_TIME_TYPE)
                this.writeCString(name)
                this.writeLong(Long.fromNumber(element.getTime()))
            } else if (Array.isArray(element)) {
                this.writeByte(ARRAY_TYPE)
                this.writeCString(name)
                this.buffers.push.apply(this.buffers, new BSONSerializer(element))
            } else {
                this.writeByte(EMBEDDED_DOCUMENT_TYPE)
                this.writeCString(name)
                this.buffers.push.apply(this.buffers, new BSONSerializer(element))
            }
            break
        case 'boolean':
            this.writeByte(BOOLEAN_TYPE)
            this.writeCString(name)
            this.writeByte(element ? 1 : 0)
            break
        default:
            throw new Error("Unrecognized object type: "+typeof element)
    }
}

BSONSerializer.prototype.writeByte = function(b) {
    this.buffers.push(new Buffer([b]))
}
BSONSerializer.prototype.writeCString = function(string) {
    var buffer = new Buffer(string, 'utf8')
    for (var i=0; i<buffer.length; i++) if (buffer[i] === 0) throw new Error("Illegal c-string: 0 char not allowed")
    this.buffers.push(buffer, new Buffer([0]))
}
BSONSerializer.prototype.writeString = function(string) {
    var buffer = new Buffer(string, 'utf8')
    this.writeInt(buffer.length + 1) // include \x00 character in count
    this.buffers.push(buffer, new Buffer([0]))
}
BSONSerializer.prototype.writeInt = function(num) {
    this.buffers.push(new Buffer([
        (num) & 0xff,
        (num>>8) & 0xff,
        (num>>16) & 0xff,
        (num>>24) & 0xff
    ]))
}
BSONSerializer.prototype.writeDouble = function(num) {
    var buffer = new Buffer(8)
    IEEE754.writeIEEE754(buffer, num, 0, 'little', 52, 8)
    this.buffers.push(buffer)
}
BSONSerializer.prototype.writeLong = function(num) {
    this.writeInt(num.low_)
    this.writeInt(num.high_)
}

var BSONParser = function(buffer, array) {
    this.offset = 0
    this.buffer = buffer
    var length = this.readInt()

    // Check for too-short buffer
    if (buffer.length < length) throw new Error("Incomplete BSON buffer (expected "+length+" bytes)")

    // Protect the buffer from overruns
    if (buffer.length > length) this.buffer = buffer.slice(0, length)

    var object = array ? [] : {}
    while (this.offset < length) {
        var type = this.readByte()
        if (type == 0) break
        var name = this.readCString()
        object[name] = this.readElement(type)
    }

    return object
}

var FUNCTION_MATCH = /^\s*function(?:\s+\S+)?\s*\(([^\)]*)\)\s*\{([\s\S]*)\}\s*$/

BSONParser.prototype.readElement = function(type) {
    switch (type) {
        case FLOAT_TYPE:
            return this.readDouble()
        case INT32_TYPE:
            return this.readInt()
        case INT64_TYPE:
            return this.readLong()
        case STRING_TYPE:
            return this.readString()
        case EMBEDDED_DOCUMENT_TYPE:
            return this.readEmbeddedObject(false)
        case ARRAY_TYPE:
            return this.readEmbeddedObject(true)
        case BINARY_TYPE:
            return this.readBinary()
        case OBJECT_ID_TYPE:
            return this.readObjectId()
        case BOOLEAN_TYPE:
            return (this.readByte() == 1)
        case DATE_TIME_TYPE:
            return new Date(this.readLong().toNumber())
        case REG_EXP_TYPE:
            return new RegExp(this.readCString(), this.readCString())
        case DB_REF_TYPE:
            return new DBRef(this.readString(), this.readObjectId())
        case CODE_TYPE:
            return this.readCode()
        case SYMBOL_TYPE:
            return this.readString()
        case CODE_WITH_SCOPE_TYPE:
            return this.readCodeWithScope()
        case TIMESTAMP_TYPE:
            return this.readTimestamp()
        case UNDEFINED_TYPE:
            return undefined
        case NULL_TYPE:
        case MIN_KEY:
        case MAX_KEY:
            return null
    }
    throw new Error("Unknown BSON type: "+type)
}

BSONParser.prototype.readInt = function() {
    // Little-endian
    return (this.buffer[this.offset++]) |
           (this.buffer[this.offset++] << 8) |
           (this.buffer[this.offset++] << 16) |
           (this.buffer[this.offset++] << 24)
}

BSONParser.prototype.readLong = function() {
    var low = this.readInt()
    var high = this.readInt()
    return new Long(low, high)
}

BSONParser.prototype.readDouble = function() {
    var value = IEEE754.readIEEE754(this.buffer, this.offset, 'little', 52, 8)
    this.offset += 8
    return value
}

BSONParser.prototype.readEmbeddedObject = function(array) {
    var length = this.readInt()
    this.offset -= 4 // rewind int
    return new BSONParser(this.buffer.slice(this.offset, this.offset += length), array)
}

BSONParser.prototype.readCString = function() {
    for (var i=this.offset; i<this.buffer.length; i++) {
        if (this.buffer[i] === 0) {
            var string = this.buffer.toString('utf8', this.offset, i)
            this.offset = i + 1
            return string
        }
    }
    throw new Error("Unterminated c-string!")
}

BSONParser.prototype.readString = function() {
    var length = this.readInt()
    if (length > this.buffer.length - this.offset) throw new Error("Invalid string ("+length+" extends past end of data)")
    var string = this.buffer.toString('utf8', this.offset, this.offset + length - 1)
    this.offset += length
    return string
}
BSONParser.prototype.readObjectId = function() {
    return new ObjectId(this.buffer.slice(this.offset, this.offset += 12))
}
BSONParser.prototype.readByte = function() {
    return this.buffer[this.offset++]
}
BSONParser.prototype.readBinary = function() {
    var length = this.readInt()
    var subtype = this.readByte()
    var binary = new Buffer(length)
    this.buffer.copy(binary, 0, this.offset, this.offset += length)
    binary.subtype = subtype
    return binary
}
BSONParser.prototype.readTimestamp = function() {
    return new Timestamp(this.readInt(), this.readInt())
}

function makeFunction(code, scope) {
    var f
    try {
        var args = [], funcParts = FUNCTION_MATCH.exec(code)
        if (funcParts) {
            args = funcParts[1].split(',').map(function(name) { return name.trim() })
            code = funcParts[2]
        }
        if (scope) code = "with("+toSource(scope)+"){"+code+"}"
        f = new Function(args, code)
    } catch (e) {
        f = {}
    }
    f.code = code
    if (scope) f.scope = scope
    return f
}
BSONParser.prototype.readCode = function() {
    var func = this.readString()
    return makeFunction(func)
}
BSONParser.prototype.readCodeWithScope = function() {
    this.readInt()
    var code = this.readString()
    var scope = this.readEmbeddedObject()
    return makeFunction(code,scope)
}

var ObjectId = exports.ObjectId = function (bytes) {
    this.bytes = bytes
}

exports.Long = Long
var Timestamp = exports.Timestamp = function(low, high) {
    Long.call(this, low, high)
}
require('util').inherits(Timestamp, Long)