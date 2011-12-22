/* Buffalo by Marcello Bastea-Forte - zlib license */

// This file provides a buffalo style interface from mongodb native
var mongodb = require('mongodb')

var db = {
    bson_serializer:mongodb.BSONPure,
    bson_deserializer:mongodb.BSONPure
}

exports.serializeUpdate = function(fullCollectionName, spec, document, upsert, multiUpdate) {
    return new mongodb.UpdateCommand(db, fullCollectionName, spec, document, {
        upsert: upsert,
        multi: multiUpdate
    }).toBinary()
}
exports.serializeInsert = function(fullCollectionName, documents, continueOnError) {
    var checkKeys = false
    var insert = new mongodb.InsertCommand(db, fullCollectionName, checkKeys, {
        keepGoing:continueOnError
    })
    insert.documents = documents
    return insert.toBinary()
}
exports.serializeQuery = function(fullCollectionName, options, skip, limit, query, fields) {
    return new mongodb.QueryCommand(db, fullCollectionName, options, skip, limit, query, fields).toBinary()
}
exports.serializeGetMore = function(fullCollectionName, numberToReturn, cursorId) {
    return new mongodb.GetMoreCommand(db, fullCollectionName, numberToReturn, cursorId).toBinary()
}
exports.serializeDelete = function(fullCollectionName, query) {
    return new mongodb.DeleteCommand(db, fullCollectionName, query).toBinary()
}
exports.serializeKillCursors = function(cursors) {
    return new mongodb.KillCursorCommand(db, cursors).toBinary()
}
exports.Response = function(buffer, offset, size) {
    offset = offset || 0
    var reply = new mongodb.MongoReply
    var message = buffer.slice(offset,size)
    reply.parseHeader(message, mongodb.BSONPure)
    reply.parseBody(message, mongodb.BSONPure, null)
    return {
        requestId:reply.requestId,
        responseTo:reply.responseTo,
        flags:reply.responseFlag,
        cursor:reply.cursorId,
        index:reply.startingFrom,
        documents:reply.documents
    }
}