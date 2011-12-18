/* Buffalo by Marcello Bastea-Forte - zlib license */

var BSON = require('./bson')
var binary = require('./binary')

var OP_REPLY =          1
var OP_MSG =            1000
var OP_UPDATE =         2001
var OP_INSERT =         2002
var OP_GET_BY_OID =     2003
var OP_QUERY =          2004
var OP_GET_MORE =       2005
var OP_DELETE =         2006
var OP_KILL_CURSORS =   2007


var OPTS_NONE               = 0
var OPTS_TAILABLE_CURSOR    = 2
var OPTS_SLAVE              = 4
var OPTS_OPLOG_REPLY        = 8
var OPTS_NO_CURSOR_TIMEOUT  = 16
var OPTS_AWAIT_DATA         = 32
var OPTS_EXHAUST            = 64

var DB_UPSERT           = 1
var DB_MULTI_UPDATE     = 2

// header
//      int32 size
//      int32 request id
//      int32 0
//      int32 op code
// command

function writeHeader(buffer, offset, size, requestId, opCode) {
    offset = binary.writeInt(buffer, 0,  size)
    offset = binary.writeInt(buffer, 4,  requestId)
    offset = binary.writeInt(buffer, 8,  0)
    offset = binary.writeInt(buffer, 12, opCode)
    return offset
}


// MsgHeader header;             // standard message header
// int32     ZERO;               // 0 - reserved for future use
// cstring   fullCollectionName; // "dbname.collectionname"
// int32     flags;              // bit vector. see below
// BSON      spec;               // the query to select the document
// BSON      document;           // the document data to update with or insert

exports.serializeUpdate = function(fullCollectionName, upsert, multiUpdate, spec, document) {
    var specSize = BSON.calculate(spec)
    var documentSize = BSON.calculate(document)
    var size = 16 + // header
               4 + // reserved 0
               Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // flags
               specSize +
               documentSize
    
    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, 0, OP_UPDATE)
    offset = binary.writeInt(buffer, offset, 0) // bson spec: 0 reserved for future use
    offset = binary.writeCString(buffer, offset, fullCollectionName)
    var flags = (upsert ? DB_UPSERT : 0) |
                (multiUpdate ? DB_MULTI_UPDATE : 0)
    offset = binary.writeInt(buffer, offset, flags)
    BSON.serialize(spec, buffer, offset)
    offset += specSize
    BSON.serialize(document, buffer, offset)

    return buffer
}

//     header    - standard message header
//     int32     -
//     cstring   - fullCollectionName e.g. "dbname.collectionname"
//     BSON[]    - one or more documents to insert into the collection

exports.serializeInsert = function(fullCollectionName, documents) {
    var documentSizes = new Array(documents.length)
    var size = 16 + // header
               4 + // reserved
               Buffer.byteLength(fullCollectionName, 'utf8') + 1

    var i
    for (i=documents.length; --i>=0;) {
        size += (documentSizes[i] = BSON.calculate(documents[i]))
    }

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, 0, OP_INSERT)
    offset = binary.writeInt(buffer, offset, 0) // bson spec: 0 reserved for future use
    offset = binary.writeCString(buffer, offset, fullCollectionName)

    for (i=0; i<documents.length; i++) {
        BSON.serialize(documents[i], buffer, offset)
        offset += documentSizes[i]
    }

    return buffer
}

//   MsgHeader header;                 // standard message header
//   int32     opts;                   // query options.  See below for details.
//   cstring   fullCollectionName;     // "dbname.collectionname"
//   int32     numberToSkip;           // number of documents to skip when returning results
//   int32     numberToReturn;         // number of documents to return in the first OP_REPLY
//   BSON      query ;                 // query object.  See below for details.
// [ BSON      returnFieldSelector; ]  // OPTIONAL : selector indicating the fields to return.  See below for details.
exports.serializeQuery = function(fullCollectionName, options, skip, limit, query, fields) {
    var querySize = BSON.calculate(query)
    var size = 16 + // header
               4 + // options
               Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // number to skip
               4 + // number to return
               querySize +
               (fields ? BSON.calculate(fields) : 0)

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, 0, OP_UPDATE)
    offset = binary.writeInt(buffer, offset, options)
    offset = binary.writeCString(buffer, offset, fullCollectionName)
    offset = binary.writeInt(buffer, offset, skip)
    offset = binary.writeInt(buffer, offset, limit)
    BSON.serialize(query, buffer, offset)
    if (fields) {
        offset += querySize
        BSON.serialize(fields, buffer, offset)
    }

    return buffer
}

//   MsgHeader header;             // standard message header
//   int32 0
//   collectionName 
//   numberToReturn
//   long - cursorId
exports.serializeGetMore = function(fullCollectionName, numberToReturn, cursorId) {
    var size = 16 + // header
               4 + // reserved 0
               Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // numberToReturn
               8 // cursorId

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, 0, OP_UPDATE)
    offset = binary.writeInt(buffer, offset, 0) // bson spec: 0 reserved for future use
    offset = binary.writeCString(buffer, offset, fullCollectionName)
    offset = binary.writeInt(buffer, offset, numberToReturn)
    offset = binary.writeLong(buffer, offset, cursorId)
    
    return buffer
}

//     header      - standard message header
//     int32       - 0 reserved for future use
//     cstring     - fullCollectionName e.g. "dbname.collectionname"
//     int32       - 0 reserved for future use
//     mongo.BSON  - query object
exports.serializeDelete = function(fullCollectionName, query) {
    var size = 16 + // header
               4 + // reserved 0
               Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // reserved 0
               BSON.calculate(query)

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, 0, OP_UPDATE)
    offset = binary.writeInt(buffer, offset, 0) // bson spec: 0 reserved for future use
    offset = binary.writeCString(buffer, offset, fullCollectionName)
    offset = binary.writeInt(buffer, offset, 0)
    BSON.serialize(query, buffer, offset)

    return buffer
}

// MsgHeader header;                 // standard message header
// int32     ZERO;                   // 0 - reserved for future use
// int32     numberOfCursorIDs;      // number of cursorIDs in message
// int64[]   cursorIDs;                // array of cursorIDs to close
exports.serializeKillCursors = function(cursors) {
    var size = 16 + // header
               4 + // reserved 0
               4 + // number of cursor ids
               8 * cursors.length

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, 0, OP_UPDATE)
    offset = binary.writeInt(buffer, offset, 0) // bson spec: 0 reserved for future use
    offset = binary.writeInt(buffer, offset, cursors.length)
    for (var i=0; i<cursors.length; i++) {
        offset = binary.writeLong(cursors[i])
    }

    return buffer
}