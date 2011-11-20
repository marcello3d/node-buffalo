var BSON = require('./bson.js')


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

var DB_UPSERT           = 0
var DB_MULTI_UPDATE     = 1

// header
//      int32 size
//      int32 request id
//      int32 0
//      int32 op code
// command

function writeHeader(size, requestId, opCode) {
    
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
               4 + Buffer.byteLength(fullCollectionName, 'utf8') + 1 +
               4 + // flags
               specSize +
               documentSize
    
    var buffer = new Buffer(size)
//    buffer.
//    BSON.serialize(buffer, )
}

//     header    - standard message header
//     int32     - 0 reserved for future use
//     cstring   - fullCollectionName e.g. "dbname.collectionname"
//     BSON[]    - one or more documents to insert into the collection

exports.serializeInsert = function(fullCollectionName, documents) {
    var documentSizes = new Array(documents.length)
    var size = 16 + // header
               4 + // reserved
               4 + Buffer.byteLength(fullCollectionName, 'utf8') + 1

    for (var i=documents.length; --i>=0;) {
        size += (documentSizes[i] = BSON.calculate(documents[i]))
    }

}
exports.serializeGetByOid = function() {
    
}

//   MsgHeader header;                 // standard message header
//   int32     opts;                   // query options.  See below for details.
//   cstring   fullCollectionName;     // "dbname.collectionname"
//   int32     numberToSkip;           // number of documents to skip when returning results
//   int32     numberToReturn;         // number of documents to return in the first OP_REPLY
//   BSON      query ;                 // query object.  See below for details.
// [ BSON      returnFieldSelector; ]  // OPTIONAL : selector indicating the fields to return.  See below for details.
exports.serializeQuery = function() {
    
}

//   int32 0
//   collectionName 
//   numberToReturn
//   long - cursorId
exports.serializeGetMore = function() {
    
}

//     header      - standard message header
//     int32       - 0 reserved for future use
//     cstring     - fullCollectionName e.g. "dbname.collectionname"
//     int32       - 0 reserved for future use
//     mongo.BSON  - query object
exports.serializeDelete = function() {
    
}

// MsgHeader header;                 // standard message header
// int32     ZERO;                   // 0 - reserved for future use
// int32     numberOfCursorIDs;      // number of cursorIDs in message
// int64[]   cursorIDs;                // array of cursorIDs to close
exports.serializeKillCursors = function(cursors) {
    
}