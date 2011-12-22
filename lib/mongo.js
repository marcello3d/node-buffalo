/* Buffalo by Marcello Bastea-Forte - zlib license */

var BSON = require('./bson')
var Long = BSON.Long
var binary = require('./binary')

// Op-codes (message types)
var OP_REPLY =          1
var OP_MSG =            1000
var OP_UPDATE =         2001
var OP_INSERT =         2002
var OP_GET_BY_OID =     2003 // not used anymore
var OP_QUERY =          2004
var OP_GET_MORE =       2005
var OP_DELETE =         2006
var OP_KILL_CURSORS =   2007

// Query flags
exports.QUERY_NONE              = 0
//exports.QUERY_RESERVED          = 1<<0
exports.QUERY_TAILABLE_CURSOR   = 1<<1
exports.QUERY_SLAVE             = 1<<2
//exports.QUERY_OPLOG_REPLY       = 1<<3
exports.QUERY_NO_CURSOR_TIMEOUT = 1<<4
exports.QUERY_AWAIT_DATA        = 1<<5
exports.QUERY_EXHAUST           = 1<<6
exports.QUERY_PARTIAL           = 1<<7

// Insert flags
var DB_CONTINUE_ON_ERROR        = 1

// Update flags
var DB_UPSERT                   = 1
var DB_MULTI_UPDATE             = 2

// Response flags

/** getMore is called but the cursor id is not valid at the server. Returned with zero results. */
exports.RESPONSE_CURSOR_NOT_FOUND   = 1<<0

/** Query failed. Results consist of one document containing an "$err" field describing the failure. */
exports.RESPONSE_QUERY_FAILURE      = 2<<0

/** Drivers should ignore this. Only mongos will ever see this  when it needs to update config from the server. */
//exports.RESPONSE_SHARD_CONFIG_STALE = 3<<0

/** Server supports the AwaitData Query option. If it doesn't, a client should sleep a little between getMore's of a Tailable cursor. Mongod version 1.6 supports AwaitData and thus always sets AwaitCapable. */
exports.RESPONSE_AWAIT_CAPABLE      = 4<<0

// header
//      int32 size
//      int32 request id
//      int32 0
//      int32 op code
// command

function writeHeader(buffer, offset, size, opCode) {
    offset = binary.writeInt(buffer, offset, size)
    offset = binary.writeInt(buffer, offset, 0)
    offset = binary.writeInt(buffer, offset, 0)
    offset = binary.writeInt(buffer, offset, opCode)
    return offset
}

exports.setRequestId = function(buffer, requestId) {
    binary.writeInt(buffer, 4,  requestId)
}

// MsgHeader header;             // standard message header
// int32     ZERO;               // 0 - reserved for future use
// cstring   fullCollectionName; // "dbname.collectionname"
// int32     flags;              // bit vector. see below
// BSON      spec;               // the query to select the document
// BSON      document;           // the document data to update with or insert

exports.serializeUpdate = function(fullCollectionName, spec, document, upsert, multiUpdate) {
    var specSize = BSON.calculate(spec)
    var documentSize = BSON.calculate(document)
    var size = 16 + // header
               4 + // reserved 0
               Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // flags
               specSize +
               documentSize
    
    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, OP_UPDATE)
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
//     int32     - flags - bit vector of query options
//     cstring   - fullCollectionName e.g. "dbname.collectionname"
//     BSON[]    - one or more documents to insert into the collection

exports.serializeInsert = function(fullCollectionName, documents, continueOnError) {
    var documentSizes = new Array(documents.length)
    var size = 16 + // header
               4 + // reserved
               Buffer.byteLength(fullCollectionName, 'utf8') + 1

    var i
    for (i=documents.length; --i>=0;) {
        size += (documentSizes[i] = BSON.calculate(documents[i]))
    }

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, OP_INSERT)
    offset = binary.writeInt(buffer, offset, continueOnError ? DB_CONTINUE_ON_ERROR : 0)
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
exports.serializeQuery = function(fullCollectionName, flags, skip, limit, query, fields) {
    var querySize = BSON.calculate(query)
    var size = 16 + // header
               4 + // flags
               Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // number to skip
               4 + // number to return
               querySize +
               (fields ? BSON.calculate(fields) : 0)

    var buffer = new Buffer(size)
    var offset = writeHeader(buffer, 0, size, OP_QUERY)
    offset = binary.writeInt(buffer, offset, flags  )
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
    var offset = writeHeader(buffer, 0, size, OP_GET_MORE)
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
    var offset = writeHeader(buffer, 0, size, OP_DELETE)
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
    var offset = writeHeader(buffer, 0, size, OP_KILL_CURSORS)
    offset = binary.writeInt(buffer, offset, 0) // bson spec: 0 reserved for future use
    offset = binary.writeInt(buffer, offset, cursors.length)
    for (var i=0; i<cursors.length; i++) {
        offset = binary.writeLong(buffer, offset, cursors[i])
    }

    return buffer
}


// header
//      int32 size
//      int32 request id
//      int32 0
//      int32 op code
// command

// MsgHeader header;         // standard message header
// int32     responseFlags;  // bit vector - see details below
// int64     cursorID;       // cursor id if client needs to do get more's
// int32     startingFrom;   // where in the cursor this reply is starting
// int32     numberReturned; // number of documents in the reply
// document* documents;      // documents
function Response(buffer, offset, size) {
    function readInt() {
        return (buffer[offset++]) |
               (buffer[offset++] << 8) |
               (buffer[offset++] << 16) |
               (buffer[offset++] << 24)
    }

    offset = offset || 0

    var remaining = readInt()
    if (size && remaining != size) {
        throw new Error("Unexpected message size")
    }
    if (remaining > buffer.length - offset + 4) {
        throw new Error("Buffer is not large enough. Expected " +remaining+", have "+(buffer.length-offset+4))
    }
    if (remaining < 36) {
        throw new Error("Invalid message: "+remaining+" < 36 bytes")
    }
    this.requestId = readInt()
    this.responseTo = readInt()
    if (readInt() != OP_REPLY) {
        throw new Error("Message is not an OP_REPLY")
    }
    this.flags = readInt()
    this.cursor = new Long(readInt(), readInt())
    this.index = readInt()
    var documents = this.documents = []
    documents.length = readInt()
    remaining -= 36
    for (var i=0; i<documents.length; i++) {
        var docSize = readInt()
        if (docSize > remaining) {
            throw new Error("Invalid response, attempting to read "+docSize+" byte document with only "+remaining+" byte(s) remaining")
        }
        offset -= 4
        documents[i] = BSON.parse(buffer, offset)
        offset += docSize
        remaining -= docSize
    }
}
exports.Response = Response