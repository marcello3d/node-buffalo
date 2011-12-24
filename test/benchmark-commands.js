var buffalo = require('../buffalo')

var buffaloCommands = buffalo.mongo
var buffaloLong = buffalo.Long

var mongodb = require('mongodb')
var mongoLong = mongodb.Long

var COUNT = 10000

var x, start, end, i

function testCommandsBuffalo() {

    buffaloCommands.serializeUpdate('db.collection', {}, {}, false, false)
    buffaloCommands.serializeUpdate('db.collection', {}, {}, true, false)
    buffaloCommands.serializeUpdate('db.collection', {}, {}, false, true)
    buffaloCommands.serializeUpdate('db.collection', {}, {}, true, true)
    buffaloCommands.serializeUpdate('db.collection', {foo:1}, {bar:2}, false, false)
    buffaloCommands.serializeUpdate('db.collection', {bar:0}, {$set:{bar:1}}, false, false)
    buffaloCommands.serializeUpdate('db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
    buffaloCommands.serializeUpdate('db.collection', {foo:1}, {bar:2}, true, false)
    buffaloCommands.serializeUpdate('db.collection', {bar:0}, {$set:{bar:1}}, true, false)
    buffaloCommands.serializeUpdate('db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
    buffaloCommands.serializeUpdate('db.col3lection', {}, {}, false, false)
    buffaloCommands.serializeUpdate('db.col4lection', {}, {}, true, false)
    buffaloCommands.serializeUpdate('db.col5lection', {}, {}, false, true)
    buffaloCommands.serializeUpdate('db.col6lection', {}, {}, true, true)
    buffaloCommands.serializeUpdate('db.col7lection', {foo:1}, {bar:2}, false, false)
    buffaloCommands.serializeUpdate('db.col8lection', {bar:0}, {$set:{bar:1}}, false, false)
    buffaloCommands.serializeUpdate('db.col9lection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
    buffaloCommands.serializeUpdate('db.col0lection', {foo:1}, {bar:2}, true, false)
    buffaloCommands.serializeUpdate('db.collection', {bar:0}, {$set:{bar:1}}, true, false)
    buffaloCommands.serializeUpdate('db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)

    buffaloCommands.serializeInsert('db.col', [{one:1,two:2}], false)
    buffaloCommands.serializeInsert('db.col', [{one:1,two:2}], true)
    buffaloCommands.serializeInsert('db.col', [{one:1,two:2},{three:3,four:4}], true)
    buffaloCommands.serializeInsert('db.col', [{one:1,two:2},{three:3,four:4}], false)

    buffaloCommands.serializeQuery('db.foo', 0, 0, 0, {foo:1})
    buffaloCommands.serializeQuery('db.foo', 0, 0, 0, {foo:1}, {foo:1})
    buffaloCommands.serializeQuery('db.foo', 0, 1, 2, {foo:1})
    buffaloCommands.serializeQuery('db.foo', 0, 1, 2, {foo:1}, {foo:1})
    buffaloCommands.serializeQuery('db.foo', 0, 1, 2, {foo:1})
    buffaloCommands.serializeQuery('db.foo', 0, 1, 2, {foo:1}, {foo:1})

    buffaloCommands.serializeGetMore('db.bar', 10, new buffaloLong(0))
    buffaloCommands.serializeGetMore('db.bar', 10, new buffaloLong(10))
    buffaloCommands.serializeGetMore('db.bar', 10, new buffaloLong(10,10))
    buffaloCommands.serializeGetMore('db.bar', 10000, new buffaloLong(0))
    buffaloCommands.serializeGetMore('db.bar', 10000, new buffaloLong(10))
    buffaloCommands.serializeGetMore('db.bar', 10000, new buffaloLong(10,10))

    buffaloCommands.serializeDelete('db.foo', {foo:1})
    buffaloCommands.serializeDelete('db.foo', {})

    buffaloCommands.serializeKillCursors(db, [new buffaloLong(0)])
    buffaloCommands.serializeKillCursors(db, [new buffaloLong(1,10)])
    buffaloCommands.serializeKillCursors(db, [new buffaloLong(0),new buffaloLong(1,10)])
    buffaloCommands.serializeKillCursors(db, [new buffaloLong(0),new buffaloLong(1,10),new buffaloLong(50,50)])

}

function MongoResponse(buffer, offset, size) {
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


var db = {
    bson_serializer:mongodb.BSONPure,
    bson_deserializer:mongodb.BSONPure
}

function serializeUpdate(fullCollectionName, spec, document, upsert, multiUpdate) {
    return new mongodb.UpdateCommand(db, fullCollectionName, spec, document, {
        upsert: upsert,
        multi: multiUpdate
    }).toBinary()
}
function serializeInsert(fullCollectionName, documents, continueOnError) {
    var checkKeys = false
    var insert = new mongodb.InsertCommand(db, fullCollectionName, checkKeys, {
        keepGoing:continueOnError
    })
    insert.documents = documents
    return insert.toBinary()
}
function testCommandsMongoNative() {
    serializeUpdate('db.collection', {}, {}, false, false)
    serializeUpdate('db.collection', {}, {}, true, false)
    serializeUpdate('db.collection', {}, {}, false, true)
    serializeUpdate('db.collection', {}, {}, true, true)
    serializeUpdate('db.collection', {foo:1}, {bar:2}, false, false)
    serializeUpdate('db.collection', {bar:0}, {$set:{bar:1}}, false, false)
    serializeUpdate('db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
    serializeUpdate('db.collection', {foo:1}, {bar:2}, true, false)
    serializeUpdate('db.collection', {bar:0}, {$set:{bar:1}}, true, false)
    serializeUpdate('db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
    serializeUpdate('db.col3lection', {}, {}, false, false)
    serializeUpdate('db.col4lection', {}, {}, true, false)
    serializeUpdate('db.col5lection', {}, {}, false, true)
    serializeUpdate('db.col6lection', {}, {}, true, true)
    serializeUpdate('db.col7lection', {foo:1}, {bar:2}, false, false)
    serializeUpdate('db.col8lection', {bar:0}, {$set:{bar:1}}, false, false)
    serializeUpdate('db.col9lection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
    serializeUpdate('db.col0lection', {foo:1}, {bar:2}, true, false)
    serializeUpdate('db.collection', {bar:0}, {$set:{bar:1}}, true, false)
    serializeUpdate('db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)

    serializeInsert('db.col', [{one:1,two:2}], false)
    serializeInsert('db.col', [{one:1,two:2}], true)
    serializeInsert('db.col', [{one:1,two:2},{three:3,four:4}], true)
    serializeInsert('db.col', [{one:1,two:2},{three:3,four:4}], false)

    new mongodb.QueryCommand(db, 'db.foo', 0, 0, 0, {foo:1}).toBinary()
    new mongodb.QueryCommand(db, 'db.foo', 0, 0, 0, {foo:1}, {foo:1}).toBinary()
    new mongodb.QueryCommand(db, 'db.foo', 0, 1, 2, {foo:1}).toBinary()
    new mongodb.QueryCommand(db, 'db.foo', 0, 1, 2, {foo:1}, {foo:1}).toBinary()
    new mongodb.QueryCommand(db, 'db.foo', 0, 1, 2, {foo:1}).toBinary()
    new mongodb.QueryCommand(db, 'db.foo', 0, 1, 2, {foo:1}, {foo:1}).toBinary()

    new mongodb.GetMoreCommand(db, 'db.bar', 10, new mongoLong(0)).toBinary()
    new mongodb.GetMoreCommand(db, 'db.bar', 10, new mongoLong(10)).toBinary()
    new mongodb.GetMoreCommand(db, 'db.bar', 10, new mongoLong(10,10)).toBinary()
    new mongodb.GetMoreCommand(db, 'db.bar', 10000, new mongoLong(0)).toBinary()
    new mongodb.GetMoreCommand(db, 'db.bar', 10000, new mongoLong(10)).toBinary()
    new mongodb.GetMoreCommand(db, 'db.bar', 10000, new mongoLong(10,10)).toBinary()

    new mongodb.DeleteCommand(db,'db.foo', {foo:1}).toBinary()
    new mongodb.DeleteCommand(db,'db.foo', {}).toBinary()

    new mongodb.KillCursorCommand(db, [new mongoLong(0)]).toBinary()
    new mongodb.KillCursorCommand(db, [new mongoLong(1,10)]).toBinary()
    new mongodb.KillCursorCommand(db, [new mongoLong(0),new mongoLong(1,10)]).toBinary()
    new mongodb.KillCursorCommand(db, [new mongoLong(0),new mongoLong(1,10),new mongoLong(50,50)]).toBinary()
}



function testResponse(base64, requestId, responseTo, flags, cursor, index, documents) {
    var buffer = new Buffer(base64,'base64')
    exports['testing response: '+base64] = function(test) {
        var a = new buffalo1.Response(buffer)
        var b = new buffalo2.Response(buffer)
        test.done()
    }
}

var replies = [
  "CwEAAJNdBQABAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAA5wAAAAJzZXROYW1lAAYAAABtb25nbwAIaXNtYXN0ZXIAAQhzZWNvbmRhcnkAAARob3N0cwAzAAAAAjAAEAAAAGxvY2FsaG9zdDoyNzAxNwACMQAQAAAAbG9jYWxob3N0OjI3MDE4AAAEYXJiaXRlcnMAHAAAAAIwABAAAABsb2NhbGhvc3Q6MjcwMTkAAAJwcmltYXJ5ABAAAABsb2NhbGhvc3Q6MjcwMTcAAm1lABAAAABsb2NhbGhvc3Q6MjcwMTcAEG1heEJzb25PYmplY3RTaXplAAAAAAEBb2sAAAAAAAAA8D8A",
  "CwEAAG1WBQACAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAA5wAAAAJzZXROYW1lAAYAAABtb25nbwAIaXNtYXN0ZXIAAAhzZWNvbmRhcnkAAQRob3N0cwAzAAAAAjAAEAAAAGxvY2FsaG9zdDoyNzAxOAACMQAQAAAAbG9jYWxob3N0OjI3MDE3AAAEYXJiaXRlcnMAHAAAAAIwABAAAABsb2NhbGhvc3Q6MjcwMTkAAAJwcmltYXJ5ABAAAABsb2NhbGhvc3Q6MjcwMTcAAm1lABAAAABsb2NhbGhvc3Q6MjcwMTgAEG1heEJzb25PYmplY3RTaXplAAAAAAEBb2sAAAAAAAAA8D8A",
  "UQAAAJRdBQADAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAALQAAAAJkcm9wcGVkAA8AAABtb25nb2xpYW5fdGVzdAABb2sAAAAAAAAA8D8A",
  "YwAAAJpdBQAEAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAPwAAABBuAAAAAAASbGFzdE9wAAEAAAAIuO5OEGNvbm5lY3Rpb25JZADhAAAACmVycgABb2sAAAAAAAAA8D8A",
  "UAAAAJxdBQAFAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAALAAAAAJuYW1lAAwAAABoZWxsbyB3b3JsZAAHX2lkAE7uuAfJLuEAAAAAAQA=",
  "nQAAAKhdBQARAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAADAAAAIwAAAAJuYW1lABQAAABtb25nb2xpYW5fdGVzdC50ZXN0AAAtAAAAAm5hbWUAHgAAAG1vbmdvbGlhbl90ZXN0LnN5c3RlbS5pbmRleGVzAAApAAAAAm5hbWUAGgAAAG1vbmdvbGlhbl90ZXN0LnRlc3QuJF9pZF8AAA==",
  "WA4AAMhdBQAYAAAAAQAAAAgAAAAuFH9UfpvXVAAAAABlAAAAJAAAABBpAAAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAUAJAAAABBpAAEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAYAJAAAABBpAAIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAcAJAAAABBpAAMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAgAJAAAABBpAAQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAkAJAAAABBpAAUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAoAJAAAABBpAAYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAsAJAAAABBpAAcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAwAJAAAABBpAAgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAA0AJAAAABBpAAkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAA4AJAAAABBpAAoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAA8AJAAAABBpAAsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABAAJAAAABBpAAwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABEAJAAAABBpAA0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABIAJAAAABBpAA4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABMAJAAAABBpAA8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABQAJAAAABBpABAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABUAJAAAABBpABEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABYAJAAAABBpABIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABcAJAAAABBpABMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABgAJAAAABBpABQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABkAJAAAABBpABUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABoAJAAAABBpABYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABsAJAAAABBpABcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABwAJAAAABBpABgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAB0AJAAAABBpABkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAB4AJAAAABBpABoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAB8AJAAAABBpABsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACAAJAAAABBpABwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACEAJAAAABBpAB0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACIAJAAAABBpAB4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACMAJAAAABBpAB8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACQAJAAAABBpACAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACUAJAAAABBpACEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACYAJAAAABBpACIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACcAJAAAABBpACMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACgAJAAAABBpACQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACkAJAAAABBpACUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACoAJAAAABBpACYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACsAJAAAABBpACcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACwAJAAAABBpACgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAC0AJAAAABBpACkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAC4AJAAAABBpACoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAC8AJAAAABBpACsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADAAJAAAABBpACwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADEAJAAAABBpAC0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADIAJAAAABBpAC4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADMAJAAAABBpAC8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADQAJAAAABBpADAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADUAJAAAABBpADEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADYAJAAAABBpADIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADcAJAAAABBpADMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADgAJAAAABBpADQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADkAJAAAABBpADUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADoAJAAAABBpADYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADsAJAAAABBpADcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADwAJAAAABBpADgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAD0AJAAAABBpADkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAD4AJAAAABBpADoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAD8AJAAAABBpADsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEAAJAAAABBpADwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEEAJAAAABBpAD0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEIAJAAAABBpAD4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEMAJAAAABBpAD8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEQAJAAAABBpAEAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEUAJAAAABBpAEEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEYAJAAAABBpAEIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEcAJAAAABBpAEMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEgAJAAAABBpAEQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEkAJAAAABBpAEUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEoAJAAAABBpAEYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEsAJAAAABBpAEcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEwAJAAAABBpAEgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAE0AJAAAABBpAEkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAE4AJAAAABBpAEoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAE8AJAAAABBpAEsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFAAJAAAABBpAEwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFEAJAAAABBpAE0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFIAJAAAABBpAE4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFMAJAAAABBpAE8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFQAJAAAABBpAFAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFUAJAAAABBpAFEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFYAJAAAABBpAFIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFcAJAAAABBpAFMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFgAJAAAABBpAFQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFkAJAAAABBpAFUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFoAJAAAABBpAFYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFsAJAAAABBpAFcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFwAJAAAABBpAFgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAF0AJAAAABBpAFkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAF4AJAAAABBpAFoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAF8AJAAAABBpAFsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGAAJAAAABBpAFwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGEAJAAAABBpAF0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGIAJAAAABBpAF4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGMAJAAAABBpAF8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGQAJAAAABBpAGAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGUAJAAAABBpAGEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGYAJAAAABBpAGIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGcAJAAAABBpAGMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGgAJAAAABBpAGQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGkA",
  "QAAAAMpdBQAaAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAQI9AAW9rAAAAAAAAAPA/AA==",
  "QAAAAMtdBQAbAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAQI9AAW9rAAAAAAAAAPA/AA==",
  "QAAAAMxdBQAcAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAQI9AAW9rAAAAAAAAAPA/AA==",
  "QAAAAM1dBQAdAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAAElAAW9rAAAAAAAAAPA/AA==",
  "sgAAAGJeBQBIAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAjgAAAAdfaWQATu64Qsku4QAAACsJEGNodW5rU2l6ZQAAAAQAEGxlbmd0aAAMAAAAAmZpbGVuYW1lAAQAAABmb28AAm1kNQAhAAAAODZmYjI2OWQxOTBkMmM4NWY2ZTA0NjhjZWNhNDJhMjAACmNvbnRlbnRUeXBlAAl1cGxvYWREYXRlAEHCf1Q0AQAAAA==",
  "YwAAAIZeBQBVAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAPwAAABBuAAAAAAASbGFzdE9wAAIAAABWuO5OEGNvbm5lY3Rpb25JZADnAAAACmVycgABb2sAAAAAAAAA8D8A",
  "RQAAAKBeBQBeAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAIQAAAAFyZXR2YWwAAAAAAAAAJkABb2sAAAAAAAAA8D8A"
].map(function(base64) {
    return new Buffer(base64, 'base64')
})


function testReplyBuffalo() {
    for (var i=replies.length; --i>=0;) {
        new buffaloCommands.Response(replies[i])
    }
}
function testReplyMongoNative() {
    for (var i=replies.length; --i>=0;) {
        var reply = new mongodb.MongoReply
        var message = replies[i]
        reply.parseHeader(message, mongodb.BSONPure)
        reply.parseBody(message, mongodb.BSONPure, null, function(){})
    }
}

start = Date.now()
for (i=COUNT; --i>=0; ) {
    testCommandsBuffalo()
}
end = Date.now()
console.log(COUNT + "x serialize sample commands with buffalo         time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = Date.now()
for (i=COUNT; --i>=0; ) {
    testCommandsMongoNative()
}
end = Date.now()
console.log(COUNT + "x serialize sample commands with mongodbnative   time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = Date.now()
for (i=COUNT; --i>=0; ) {

    testReplyBuffalo()
}
end = Date.now()
console.log(COUNT + "x parse sample replies with buffalo              time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = Date.now()
for (i=COUNT; --i>=0; ) {

    testReplyMongoNative()
}
end = Date.now()
console.log(COUNT + "x parse sample replies with mongodbnative        time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")

