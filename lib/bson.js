/* Buffalo by Marcello Bastea-Forte - zlib license */

// based on http://bsonspec.org/#/specification

var Long = require('./extern/long').Long
var IEEE754 = require('./extern/buffer_ieee754')
var toSource = require('tosource')
var binary = require('./binary')
var ObjectId = require('./objectid')
var DBRef = require('./dbref')
var Timestamp = require('./timestamp')

exports.DBRef = DBRef
exports.ObjectId = ObjectId
exports.Long = Long
exports.Timestamp = Timestamp
exports.mongo = require('./mongo')

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

exports.parse = function(buffer, offset) {
    return parse(buffer, offset || 0, false)
}

exports.serialize = function(object, buffer, offset) {
    buffer = buffer || new Buffer(calculate(object))
    serialize(buffer, offset || 0, object)
    return buffer
}


var calculate = exports.calculate = function(object) {
    var count = 4 // size
    // elements
    if (Array.isArray(object)) {
        for (var i=0; i<object.length; i++) {
            count += calculateElement(String(i), object[i])
        }
    } else {
        for (var key in object) {
            count += calculateElement(key, object[key])
        }
    }
    return count + 1 // zero
}
function calculateElement(name, element) {
    if (element instanceof RegExp) {
        return 1 + // type
            Buffer.byteLength(name, 'utf8') + 1 + // cstring name
            Buffer.byteLength(element.source, 'utf8') + 1 + // cstring regexp source
            (element.global ? 1 : 0) + (element.ignoreCase ? 1 : 0) + (element.multiline ? 1 : 0) + 1 // regexp flags cstring
    }
    switch (typeof element) {
        case 'string':
            return 1 + // type
                Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                4 + Buffer.byteLength(element, 'utf8') + 1 // string

        case 'function':
            if (element.scope) {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    4 + // size of self + code + scope
                    4 + Buffer.byteLength(element.toString(), 'utf8') + 1 + // string code
                    calculate(element.scope) // scope object
            } else {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 +  // cstring name
                    4 + Buffer.byteLength(element.toString(), 'utf8') + 1 // string code
            }
        case 'number':
            // TODO: handle >32bit longs that aren't doubles?
            if (~~element === element) { // Integer?
                return 1 +  // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    4 // 32bit int
            } else {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    8 // 64bit float
            }
        case 'undefined':
            return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 // cstring name
        case 'object':
            if (element === null) {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 // cstring name
            } else if (element instanceof Long) {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    8 // 64bit int
            } else if (element instanceof ObjectId) {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    element.bytes.length // object id
            } else if (element instanceof Buffer) {
                return 1 +  // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    4 + // buffer length
                    1 + // subtype
                    element.length // buffer contents
            } else if (element instanceof Date) {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    8 // 64bit int
            } else {
                return 1 + // type
                    Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                    calculate(element) // sub-document
            }
        case 'boolean':
            return 1 + // type
                Buffer.byteLength(name, 'utf8') + 1 + // cstring name
                1 // true/false
    }        
    throw new Error("Unrecognized object type: "+typeof element)
}

function serialize(buffer, offset, object) {
    var start = offset
    offset += 4
    if (Array.isArray(object)) {
        for (var i=0; i<object.length; i++) {
            offset = writeElement(buffer, offset, String(i), object[i])
        }
    } else {
        for (var key in object) {
            offset = writeElement(buffer, offset, key, object[key])
        }
    }

    buffer[offset++] = 0

    binary.writeInt(buffer, start, offset - start)
    
    return offset
}
function writeElement(buffer, offset, name, element) {
    if (element instanceof RegExp) {
        buffer[offset++] = REG_EXP_TYPE
        offset = binary.writeCString(buffer, offset, name)
        offset = binary.writeCString(buffer, offset, element.source)
        offset = binary.writeCString(buffer, offset, (element.global     ? 'g' : '') +
                                              (element.ignoreCase ? 'i' : '') +
                                              (element.multiline  ? 'm' : ''))
    } else switch (typeof element) {
        case 'string':
            buffer[offset++] = STRING_TYPE
            offset = binary.writeCString(buffer, offset, name)
            offset = binary.writeString(buffer, offset, element)
            break
        case 'function':
            if (element.scope) {
                buffer[offset++] = CODE_WITH_SCOPE_TYPE
                offset = binary.writeCString(buffer, offset, name)
                var sizeOffset = offset
                offset += 4
                offset = binary.writeString(buffer, offset, element.toString())
                offset = serialize(buffer, offset, element.scope)
                // go back and fill in the size (size int + code + scope), don't update offset
                binary.writeInt(buffer, sizeOffset, offset - sizeOffset)
            } else {
                buffer[offset++] = CODE_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = binary.writeString(buffer, offset, element.toString())
            }
            break
        case 'number':
            // TODO: handle >32bit longs that aren't doubles? Or is that too magical?
            if (~~element === element) { // Integer?
                buffer[offset++] = INT32_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = binary.writeInt(buffer, offset, element)
            } else {
                buffer[offset++] = FLOAT_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = binary.writeDouble(buffer, offset, element)
            }
            break
        case 'undefined':
            buffer[offset++] = UNDEFINED_TYPE
            offset = binary.writeCString(buffer, offset, name)
            break
        case 'object':
            if (element === null) {
                buffer[offset++] = NULL_TYPE
                offset = binary.writeCString(buffer, offset, name)
            } else if (element instanceof Long) {
                buffer[offset++] = (element instanceof Timestamp) ? TIMESTAMP_TYPE : INT64_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = binary.writeInt(buffer, offset, element.low_)
                offset = binary.writeInt(buffer, offset, element.high_)
            } else if (element instanceof ObjectId) {
                buffer[offset++] = OBJECT_ID_TYPE
                offset = binary.writeCString(buffer, offset, name)
                element.bytes.copy(buffer, offset)
                offset += element.bytes.length
            } else if (element instanceof Buffer) {
                buffer[offset++] = BINARY_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = binary.writeInt(buffer, offset, element.length) // Just the length of the binary
                buffer[offset++] = element.subtype || BINARY_GENERIC_SUBTYPE
                element.copy(buffer, offset)
                offset += element.length
            } else if (element instanceof Date) {
                buffer[offset++] = DATE_TIME_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = binary.writeLong(buffer, offset, Long.fromNumber(element.getTime()))
            } else if (Array.isArray(element)) {
                buffer[offset++] = ARRAY_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = serialize(buffer, offset, element)
            } else {
                buffer[offset++] = EMBEDDED_DOCUMENT_TYPE
                offset = binary.writeCString(buffer, offset, name)
                offset = serialize(buffer, offset, element)
            }
            break
        case 'boolean':
            buffer[offset++] = BOOLEAN_TYPE
            offset = binary.writeCString(buffer, offset, name)
            buffer[offset++] = element ? 1 : 0
            break
        default:
            throw new Error("Unrecognized object type: "+typeof element)
    }
    return offset
}



var FUNCTION_MATCH = /^\s*function(?:\s+\S+)?\s*\(([^\)]*)\)\s*\{([\s\S]*)\}\s*$/

function parse(buffer, offset, isArray) {
    var length = readInt()
    
    // Check for too-short buffer
    if (buffer.length - offset + 4 < length) throw new Error("Incomplete BSON buffer (got "+(buffer.length - offset + 4)+" bytes, expected "+length+")")

    var object = isArray ? new Array : new Object
    while (true) {
        var type = buffer[offset++]
        if (type == 0) break
        var name = readCString()
        switch (type) {
            case FLOAT_TYPE:
                object[name] = IEEE754.readIEEE754(buffer, offset, 'little', 52, 8)
                offset += 8
                break
            case INT32_TYPE:
                object[name] = readInt()
                break
            case INT64_TYPE:
                object[name] = new Long(readInt(), readInt())
                break
            case STRING_TYPE:    
            case SYMBOL_TYPE:
                object[name] = readString()
                break
            case EMBEDDED_DOCUMENT_TYPE:
                object[name] = readEmbeddedObject(false)
                break
            case ARRAY_TYPE:
                object[name] = readEmbeddedObject(true)
                break
            case BINARY_TYPE:
                var binaryLength = readInt()
                var subtype = buffer[offset++]
                var binary = new Buffer(binaryLength)
                buffer.copy(binary, 0, offset, offset += binaryLength)
                binary.subtype = subtype
                object[name] = binary
                break
            case OBJECT_ID_TYPE:
                var objectIdBuffer = new Buffer(12)
                buffer.copy(objectIdBuffer, 0, offset, offset +=12)
                object[name] = new ObjectId(objectIdBuffer)
                break
            case BOOLEAN_TYPE:
                object[name] = buffer[offset++] == 1
                break
            case DATE_TIME_TYPE:
                object[name] = new Date(new Long(readInt(), readInt()).toNumber())
                break
            case REG_EXP_TYPE:
                object[name] = new RegExp(readCString(), readCString())
                break
            case DB_REF_TYPE:
                var dbrefName = readString()
                var dbrefObjectId = new Buffer(12)
                buffer.copy(dbrefObjectId, 0, offset, offset +=12)
                object[name] = new DBRef(dbrefName, new ObjectId(dbrefObjectId))
                break
            case CODE_TYPE:
                object[name] = makeFunction(readString())
                break
            case CODE_WITH_SCOPE_TYPE:
                readInt() // ignoring the size, we don't need it
                object[name] = makeFunction(readString(), readEmbeddedObject())
                break
            case TIMESTAMP_TYPE:
                object[name] = new Timestamp(readInt(), readInt())
                break
            case UNDEFINED_TYPE:
                object[name] = undefined
                break
            case NULL_TYPE:
            case MIN_KEY:
            case MAX_KEY:
                object[name] = null
                break
            default:                
                throw new Error("Unknown BSON type: "+type)
        }    
    }
    
    function readEmbeddedObject(isArray) {
        var embeddedLength = readInt()
        offset -= 4 // rewind int size (since parse will read it again)
        var object = parse(buffer, offset, isArray)
        offset += embeddedLength
        return object
    }

    function readInt() {
        // Little-endian
        return (buffer[offset++]) |
               (buffer[offset++] << 8) |
               (buffer[offset++] << 16) |
               (buffer[offset++] << 24)
    }
    function readCString() {
        for (var i=offset; i<buffer.length; i++) {
            if (buffer[i] === 0) {
                return buffer.toString('utf8', offset, (offset = i + 1) - 1)
            }
        }
        throw new Error("Unterminated c-string!")
    }
    function readString() {
        var length = readInt()
        return buffer.toString('utf8', offset, (offset += length) - 1)
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

    return object
}
