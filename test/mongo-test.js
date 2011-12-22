/* Buffalo by Marcello Bastea-Forte - zlib license */

var buffalo = require('../buffalo')
var Long = buffalo.Long

var buffalo1 = buffalo.mongo
var buffalo2 = null
try {
    buffalo2 = require('./mongodb-wrapper')
} catch (e) {}

function testBoth(name) {
    if (buffalo2) {
        var args = [].slice.call(arguments, 1)
        var functionCall = name + '(' + args.map(JSON.stringify).join(',') + ')'
        exports['testing ' + functionCall+' against mongodb-native'] = function(test) {
            var a = buffalo1[name].apply(buffalo1, args).toString('base64')
            var b = buffalo2[name].apply(buffalo2, args).toString('base64')
            test.equal(a, b)
            test.done()
        }
    }
}
function testBase64(name,args,base64) {
    var functionCall = name + '(' + args.map(JSON.stringify).join(',') + ')'
    exports['testing '+functionCall] = function(test) {
        var a = buffalo1[name].apply(buffalo1, args).toString('base64')
        test.equal(a,base64)
        test.done()
    }
}

function testResponse(base64, requestId, responseTo, flags, cursor, index, documents) {
    var buffer = new Buffer(base64,'base64')
    exports['testing response: '+base64] = function(test) {
        var a = new buffalo1.Response(buffer)

        test.equal(a.requestId, requestId)
        test.equal(a.responseTo, responseTo)
        test.equal(a.flags, flags)
        test.deepEqual(a.cursor, cursor)
        test.equal(a.index, index)
//        test.deepEqual(a.documents, documents)

        if (buffalo2) {
            var b = new buffalo2.Response(buffer)
            test.equal(a.requestId, b.requestId)
            test.equal(a.responseTo, b.responseTo)
            test.equal(a.flags, b.flags)
            test.deepEqual(a.cursor, b.cursor)
            test.equal(a.index, b.index)
        }

        test.done()
    }
}

testBoth('serializeUpdate', 'db.collection', {}, {}, false, false)
testBoth('serializeUpdate', 'db.collection', {}, {}, true, false)
testBoth('serializeUpdate', 'db.collection', {}, {}, false, true)
testBoth('serializeUpdate', 'db.collection', {}, {}, true, true)
testBoth('serializeUpdate', 'db.collection', {foo:1}, {bar:2}, false, false)
testBoth('serializeUpdate', 'db.collection', {bar:0}, {$set:{bar:1}}, false, false)
testBoth('serializeUpdate', 'db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
testBoth('serializeUpdate', 'db.collection', {foo:1}, {bar:2}, true, false)
testBoth('serializeUpdate', 'db.collection', {bar:0}, {$set:{bar:1}}, true, false)
testBoth('serializeUpdate', 'db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
testBoth('serializeUpdate', 'db.col3lection', {}, {}, false, false)
testBoth('serializeUpdate', 'db.col4lection', {}, {}, true, false)
testBoth('serializeUpdate', 'db.col5lection', {}, {}, false, true)
testBoth('serializeUpdate', 'db.col6lection', {}, {}, true, true)
testBoth('serializeUpdate', 'db.col7lection', {foo:1}, {bar:2}, false, false)
testBoth('serializeUpdate', 'db.col8lection', {bar:0}, {$set:{bar:1}}, false, false)
testBoth('serializeUpdate', 'db.col9lection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)
testBoth('serializeUpdate', 'db.col0lection', {foo:1}, {bar:2}, true, false)
testBoth('serializeUpdate', 'db.collection', {bar:0}, {$set:{bar:1}}, true, false)
testBoth('serializeUpdate', 'db.collection', {'bar.bar':0}, {$inc:{'foo.foo':1}}, false, false)

testBase64('serializeUpdate',["db.collection",{},{},false,false],'MAAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAAAAAAFAAAAAAUAAAAA')
testBase64('serializeUpdate',["db.collection",{},{},true,false],'MAAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAEAAAAFAAAAAAUAAAAA')
testBase64('serializeUpdate',["db.collection",{},{},false,true],'MAAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAIAAAAFAAAAAAUAAAAA')
testBase64('serializeUpdate',["db.collection",{},{},true,true],'MAAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAMAAAAFAAAAAAUAAAAA')
testBase64('serializeUpdate',["db.collection",{"foo":1},{"bar":2},false,false],'QgAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAAAAAAOAAAAEGZvbwABAAAAAA4AAAAQYmFyAAIAAAAA')
testBase64('serializeUpdate',["db.collection",{"bar":0},{"$set":{"bar":1}},false,false],'TQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAAAAAAOAAAAEGJhcgAAAAAAABkAAAADJHNldAAOAAAAEGJhcgABAAAAAAA=')
testBase64('serializeUpdate',["db.collection",{"bar.bar":0},{"$inc":{"foo.foo":1}},false,false],'VQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAAAAAASAAAAEGJhci5iYXIAAAAAAAAdAAAAAyRpbmMAEgAAABBmb28uZm9vAAEAAAAAAA==')
testBase64('serializeUpdate',["db.collection",{"foo":1},{"bar":2},true,false],'QgAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAEAAAAOAAAAEGZvbwABAAAAAA4AAAAQYmFyAAIAAAAA')
testBase64('serializeUpdate',["db.collection",{"bar":0},{"$set":{"bar":1}},true,false],'TQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2xsZWN0aW9uAAEAAAAOAAAAEGJhcgAAAAAAABkAAAADJHNldAAOAAAAEGJhcgABAAAAAAA=')
testBase64('serializeUpdate',["db.col3lection",{},{},false,false],'MQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2wzbGVjdGlvbgAAAAAABQAAAAAFAAAAAA==')
testBase64('serializeUpdate',["db.col4lection",{},{},true,false],'MQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2w0bGVjdGlvbgABAAAABQAAAAAFAAAAAA==')
testBase64('serializeUpdate',["db.col5lection",{},{},false,true],'MQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2w1bGVjdGlvbgACAAAABQAAAAAFAAAAAA==')
testBase64('serializeUpdate',["db.col6lection",{},{},true,true],'MQAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2w2bGVjdGlvbgADAAAABQAAAAAFAAAAAA==')
testBase64('serializeUpdate',["db.col7lection",{"foo":1},{"bar":2},false,false],'QwAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2w3bGVjdGlvbgAAAAAADgAAABBmb28AAQAAAAAOAAAAEGJhcgACAAAAAA==')
testBase64('serializeUpdate',["db.col8lection",{"bar":0},{"$set":{"bar":1}},false,false],'TgAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2w4bGVjdGlvbgAAAAAADgAAABBiYXIAAAAAAAAZAAAAAyRzZXQADgAAABBiYXIAAQAAAAAA')
testBase64('serializeUpdate',["db.col9lection",{"bar.bar":0},{"$inc":{"foo.foo":1}},false,false],'VgAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2w5bGVjdGlvbgAAAAAAEgAAABBiYXIuYmFyAAAAAAAAHQAAAAMkaW5jABIAAAAQZm9vLmZvbwABAAAAAAA=')
testBase64('serializeUpdate',["db.col0lection",{"foo":1},{"bar":2},true,false],'QwAAAAAAAAAAAAAA0QcAAAAAAABkYi5jb2wwbGVjdGlvbgABAAAADgAAABBmb28AAQAAAAAOAAAAEGJhcgACAAAAAA==')

testBoth('serializeInsert', 'db.col', [{one:1,two:2}], false)
testBoth('serializeInsert', 'db.col', [{one:1,two:2}], true)
testBoth('serializeInsert', 'db.col', [{one:1,two:2},{three:3,four:4}], true)
testBoth('serializeInsert', 'db.col', [{one:1,two:2},{three:3,four:4}], false)

testBase64('serializeInsert',["db.col",[{"one":1,"two":2}],false],'MgAAAAAAAAAAAAAA0gcAAAAAAABkYi5jb2wAFwAAABBvbmUAAQAAABB0d28AAgAAAAA=')
testBase64('serializeInsert',["db.col",[{"one":1,"two":2}],true],'MgAAAAAAAAAAAAAA0gcAAAEAAABkYi5jb2wAFwAAABBvbmUAAQAAABB0d28AAgAAAAA=')
testBase64('serializeInsert',["db.col",[{"one":1,"two":2},{"three":3,"four":4}],true],'TAAAAAAAAAAAAAAA0gcAAAEAAABkYi5jb2wAFwAAABBvbmUAAQAAABB0d28AAgAAAAAaAAAAEHRocmVlAAMAAAAQZm91cgAEAAAAAA==')
testBase64('serializeInsert',["db.col",[{"one":1,"two":2},{"three":3,"four":4}],false],'TAAAAAAAAAAAAAAA0gcAAAAAAABkYi5jb2wAFwAAABBvbmUAAQAAABB0d28AAgAAAAAaAAAAEHRocmVlAAMAAAAQZm91cgAEAAAAAA==')


testBoth('serializeQuery', 'db.foo', 0, 0, 0, {foo:1})
testBoth('serializeQuery', 'db.foo', 0, 0, 0, {foo:1}, {foo:1})
testBoth('serializeQuery', 'db.foo', 0, 1, 2, {foo:1})
testBoth('serializeQuery', 'db.foo', 0, 1, 2, {foo:1}, {foo:1})
testBoth('serializeQuery', 'db.foo', 0, 1, 2, {foo:1})
testBoth('serializeQuery', 'db.foo', 0, 1, 2, {foo:1}, {foo:1})

testBase64('serializeQuery',["db.foo",0,0,0,{"foo":1}],'MQAAAAAAAAAAAAAA1AcAAAAAAABkYi5mb28AAAAAAAAAAAAOAAAAEGZvbwABAAAAAA==')
testBase64('serializeQuery',["db.foo",0,0,0,{"foo":1},{"foo":1}],'PwAAAAAAAAAAAAAA1AcAAAAAAABkYi5mb28AAAAAAAAAAAAOAAAAEGZvbwABAAAAAA4AAAAQZm9vAAEAAAAA')
testBase64('serializeQuery',["db.foo",0,1,2,{"foo":1}],'MQAAAAAAAAAAAAAA1AcAAAAAAABkYi5mb28AAQAAAAIAAAAOAAAAEGZvbwABAAAAAA==')
testBase64('serializeQuery',["db.foo",0,1,2,{"foo":1},{"foo":1}],'PwAAAAAAAAAAAAAA1AcAAAAAAABkYi5mb28AAQAAAAIAAAAOAAAAEGZvbwABAAAAAA4AAAAQZm9vAAEAAAAA')

testBoth('serializeGetMore', 'db.bar', 10, new Long(0))
testBoth('serializeGetMore', 'db.bar', 10, new Long(10))
testBoth('serializeGetMore', 'db.bar', 10, new Long(10,10))
testBoth('serializeGetMore', 'db.bar', 10000, new Long(0))
testBoth('serializeGetMore', 'db.bar', 10000, new Long(10))
testBoth('serializeGetMore', 'db.bar', 10000, new Long(10,10))

testBase64('serializeGetMore',["db.bar",10,new Long(0)],'JwAAAAAAAAAAAAAA1QcAAAAAAABkYi5iYXIACgAAAAAAAAAAAAAA')
testBase64('serializeGetMore',["db.bar",10,new Long(10)],'JwAAAAAAAAAAAAAA1QcAAAAAAABkYi5iYXIACgAAAAoAAAAAAAAA')
testBase64('serializeGetMore',["db.bar",10,new Long(10,10)],'JwAAAAAAAAAAAAAA1QcAAAAAAABkYi5iYXIACgAAAAoAAAAKAAAA')
testBase64('serializeGetMore',["db.bar",10000,new Long(0)],'JwAAAAAAAAAAAAAA1QcAAAAAAABkYi5iYXIAECcAAAAAAAAAAAAA')
testBase64('serializeGetMore',["db.bar",10000,new Long(10)],'JwAAAAAAAAAAAAAA1QcAAAAAAABkYi5iYXIAECcAAAoAAAAAAAAA')
testBase64('serializeGetMore',["db.bar",10000,new Long(10,10)],'JwAAAAAAAAAAAAAA1QcAAAAAAABkYi5iYXIAECcAAAoAAAAKAAAA')

testBoth('serializeDelete', 'db.foo', {foo:1})
testBoth('serializeDelete', 'db.foo', {})

testBase64('serializeDelete',["db.foo",{"foo":1}],'LQAAAAAAAAAAAAAA1gcAAAAAAABkYi5mb28AAAAAAA4AAAAQZm9vAAEAAAAA')
testBase64('serializeDelete',["db.foo",{}],'JAAAAAAAAAAAAAAA1gcAAAAAAABkYi5mb28AAAAAAAUAAAAA')

testBoth('serializeKillCursors', [new Long(0)])
testBoth('serializeKillCursors', [new Long(1,10)])
testBoth('serializeKillCursors', [new Long(0),new Long(1,10)])
testBoth('serializeKillCursors', [new Long(0),new Long(1,10),new Long(50,50)])

testBase64('serializeKillCursors',[[new Long(0)]],'IAAAAAAAAAAAAAAA1wcAAAAAAAABAAAAAAAAAAAAAAA=')
testBase64('serializeKillCursors',[[new Long(1,10)]],'IAAAAAAAAAAAAAAA1wcAAAAAAAABAAAAAQAAAAoAAAA=')
testBase64('serializeKillCursors',[[new Long(0),new Long(1,10)]],'KAAAAAAAAAAAAAAA1wcAAAAAAAACAAAAAAAAAAAAAAABAAAACgAAAA==')
testBase64('serializeKillCursors',[[new Long(0),new Long(1,10),new Long(50,50)]],'MAAAAAAAAAAAAAAA1wcAAAAAAAADAAAAAAAAAAAAAAABAAAACgAAADIAAAAyAAAA')

testResponse(
  "CwEAAJNdBQABAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAA5wAAAAJzZXROYW1lAAYAAABtb25nbwAIaXNtYXN0ZXIAAQhzZWNvbmRhcnkAAARob3N0cwAzAAAAAjAAEAAAAGxvY2FsaG9zdDoyNzAxNwACMQAQAAAAbG9jYWxob3N0OjI3MDE4AAAEYXJiaXRlcnMAHAAAAAIwABAAAABsb2NhbGhvc3Q6MjcwMTkAAAJwcmltYXJ5ABAAAABsb2NhbGhvc3Q6MjcwMTcAAm1lABAAAABsb2NhbGhvc3Q6MjcwMTcAEG1heEJzb25PYmplY3RTaXplAAAAAAEBb2sAAAAAAAAA8D8A",
  351635, 1, 8, new Long(0), 0,
  [{"setName":"mongo","ismaster":true,"secondary":false,"hosts":["localhost:27017","localhost:27018"],"arbiters":["localhost:27019"],"primary":"localhost:27017","me":"localhost:27017","maxBsonObjectSize":16777216,"ok":1}]
)
testResponse(
  "CwEAAG1WBQACAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAA5wAAAAJzZXROYW1lAAYAAABtb25nbwAIaXNtYXN0ZXIAAAhzZWNvbmRhcnkAAQRob3N0cwAzAAAAAjAAEAAAAGxvY2FsaG9zdDoyNzAxOAACMQAQAAAAbG9jYWxob3N0OjI3MDE3AAAEYXJiaXRlcnMAHAAAAAIwABAAAABsb2NhbGhvc3Q6MjcwMTkAAAJwcmltYXJ5ABAAAABsb2NhbGhvc3Q6MjcwMTcAAm1lABAAAABsb2NhbGhvc3Q6MjcwMTgAEG1heEJzb25PYmplY3RTaXplAAAAAAEBb2sAAAAAAAAA8D8A",
  349805, 2, 8, new Long(0), 0,
  [{"setName":"mongo","ismaster":false,"secondary":true,"hosts":["localhost:27018","localhost:27017"],"arbiters":["localhost:27019"],"primary":"localhost:27017","me":"localhost:27018","maxBsonObjectSize":16777216,"ok":1}]
)
testResponse(
  "UQAAAJRdBQADAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAALQAAAAJkcm9wcGVkAA8AAABtb25nb2xpYW5fdGVzdAABb2sAAAAAAAAA8D8A",
  351636, 3, 8, new Long(0), 0,
  [{"dropped":"mongolian_test","ok":1}]
)
testResponse(
  "YwAAAJpdBQAEAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAPwAAABBuAAAAAAASbGFzdE9wAAEAAAAIuO5OEGNvbm5lY3Rpb25JZADhAAAACmVycgABb2sAAAAAAAAA8D8A",
  351642, 4, 8, new Long(0), 0,
  [{"n":0,"lastOp":new Long(1, 1324267528),"connectionId":225,"err":null,"ok":1}]
)
testResponse(
  "UAAAAJxdBQAFAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAALAAAAAJuYW1lAAwAAABoZWxsbyB3b3JsZAAHX2lkAE7uuAfJLuEAAAAAAQA=",
  351644, 5, 8, new Long(0), 0,
  [{"name":"hello world","_id":new buffalo.ObjectId("4eeeb807c92ee10000000001")}]
)
testResponse(
  "nQAAAKhdBQARAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAADAAAAIwAAAAJuYW1lABQAAABtb25nb2xpYW5fdGVzdC50ZXN0AAAtAAAAAm5hbWUAHgAAAG1vbmdvbGlhbl90ZXN0LnN5c3RlbS5pbmRleGVzAAApAAAAAm5hbWUAGgAAAG1vbmdvbGlhbl90ZXN0LnRlc3QuJF9pZF8AAA==",
  351656, 17, 8, new Long(0), 0,
  [{"name":"mongolian_test.test"},{"name":"mongolian_test.system.indexes"},{"name":"mongolian_test.test.$_id_"}]
)

testResponse(
  "WA4AAMhdBQAYAAAAAQAAAAgAAAAuFH9UfpvXVAAAAABlAAAAJAAAABBpAAAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAUAJAAAABBpAAEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAYAJAAAABBpAAIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAcAJAAAABBpAAMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAgAJAAAABBpAAQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAkAJAAAABBpAAUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAoAJAAAABBpAAYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAAsAJAAAABBpAAcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAAwAJAAAABBpAAgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAA0AJAAAABBpAAkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAA4AJAAAABBpAAoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAA8AJAAAABBpAAsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABAAJAAAABBpAAwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABEAJAAAABBpAA0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABIAJAAAABBpAA4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABMAJAAAABBpAA8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABQAJAAAABBpABAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABUAJAAAABBpABEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABYAJAAAABBpABIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABcAJAAAABBpABMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABgAJAAAABBpABQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABkAJAAAABBpABUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABoAJAAAABBpABYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAABsAJAAAABBpABcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAABwAJAAAABBpABgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAB0AJAAAABBpABkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAB4AJAAAABBpABoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAB8AJAAAABBpABsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACAAJAAAABBpABwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACEAJAAAABBpAB0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACIAJAAAABBpAB4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACMAJAAAABBpAB8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACQAJAAAABBpACAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACUAJAAAABBpACEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACYAJAAAABBpACIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACcAJAAAABBpACMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACgAJAAAABBpACQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACkAJAAAABBpACUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACoAJAAAABBpACYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAACsAJAAAABBpACcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAACwAJAAAABBpACgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAC0AJAAAABBpACkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAC4AJAAAABBpACoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAC8AJAAAABBpACsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADAAJAAAABBpACwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADEAJAAAABBpAC0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADIAJAAAABBpAC4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADMAJAAAABBpAC8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADQAJAAAABBpADAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADUAJAAAABBpADEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADYAJAAAABBpADIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADcAJAAAABBpADMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADgAJAAAABBpADQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADkAJAAAABBpADUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADoAJAAAABBpADYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAADsAJAAAABBpADcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAADwAJAAAABBpADgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAD0AJAAAABBpADkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAD4AJAAAABBpADoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAD8AJAAAABBpADsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEAAJAAAABBpADwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEEAJAAAABBpAD0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEIAJAAAABBpAD4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEMAJAAAABBpAD8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEQAJAAAABBpAEAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEUAJAAAABBpAEEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEYAJAAAABBpAEIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEcAJAAAABBpAEMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEgAJAAAABBpAEQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEkAJAAAABBpAEUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEoAJAAAABBpAEYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAEsAJAAAABBpAEcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAEwAJAAAABBpAEgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAE0AJAAAABBpAEkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAE4AJAAAABBpAEoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAE8AJAAAABBpAEsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFAAJAAAABBpAEwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFEAJAAAABBpAE0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFIAJAAAABBpAE4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFMAJAAAABBpAE8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFQAJAAAABBpAFAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFUAJAAAABBpAFEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFYAJAAAABBpAFIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFcAJAAAABBpAFMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFgAJAAAABBpAFQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFkAJAAAABBpAFUAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFoAJAAAABBpAFYAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAFsAJAAAABBpAFcAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAFwAJAAAABBpAFgAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAF0AJAAAABBpAFkAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAF4AJAAAABBpAFoAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAF8AJAAAABBpAFsAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGAAJAAAABBpAFwAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGEAJAAAABBpAF0AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGIAJAAAABBpAF4AAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGMAJAAAABBpAF8AAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGQAJAAAABBpAGAAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGUAJAAAABBpAGEAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGYAJAAAABBpAGIAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGcAJAAAABBpAGMAAAAIZXZlbgAAB19pZABO7rgPyS7hAAAAAGgAJAAAABBpAGQAAAAIZXZlbgABB19pZABO7rgPyS7hAAAAAGkA",
  351688, 24, 8, new Long(1417614382, 1423416190), 0,
  [{"i":0,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000005")},{"i":1,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000006")},{"i":2,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000007")},{"i":3,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000008")},{"i":4,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000009")},{"i":5,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000000a")},{"i":6,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000000b")},{"i":7,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000000c")},{"i":8,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000000d")},{"i":9,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000000e")},{"i":10,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000000f")},{"i":11,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000010")},{"i":12,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000011")},{"i":13,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000012")},{"i":14,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000013")},{"i":15,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000014")},{"i":16,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000015")},{"i":17,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000016")},{"i":18,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000017")},{"i":19,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000018")},{"i":20,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000019")},{"i":21,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000001a")},{"i":22,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000001b")},{"i":23,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000001c")},{"i":24,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000001d")},{"i":25,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000001e")},{"i":26,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000001f")},{"i":27,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000020")},{"i":28,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000021")},{"i":29,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000022")},{"i":30,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000023")},{"i":31,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000024")},{"i":32,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000025")},{"i":33,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000026")},{"i":34,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000027")},{"i":35,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000028")},{"i":36,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000029")},{"i":37,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000002a")},{"i":38,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000002b")},{"i":39,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000002c")},{"i":40,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000002d")},{"i":41,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000002e")},{"i":42,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000002f")},{"i":43,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000030")},{"i":44,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000031")},{"i":45,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000032")},{"i":46,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000033")},{"i":47,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000034")},{"i":48,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000035")},{"i":49,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000036")},{"i":50,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000037")},{"i":51,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000038")},{"i":52,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000039")},{"i":53,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000003a")},{"i":54,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000003b")},{"i":55,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000003c")},{"i":56,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000003d")},{"i":57,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000003e")},{"i":58,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000003f")},{"i":59,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000040")},{"i":60,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000041")},{"i":61,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000042")},{"i":62,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000043")},{"i":63,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000044")},{"i":64,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000045")},{"i":65,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000046")},{"i":66,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000047")},{"i":67,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000048")},{"i":68,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000049")},{"i":69,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000004a")},{"i":70,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000004b")},{"i":71,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000004c")},{"i":72,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000004d")},{"i":73,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000004e")},{"i":74,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000004f")},{"i":75,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000050")},{"i":76,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000051")},{"i":77,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000052")},{"i":78,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000053")},{"i":79,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000054")},{"i":80,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000055")},{"i":81,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000056")},{"i":82,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000057")},{"i":83,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000058")},{"i":84,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000059")},{"i":85,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000005a")},{"i":86,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000005b")},{"i":87,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000005c")},{"i":88,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000005d")},{"i":89,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000005e")},{"i":90,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee1000000005f")},{"i":91,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000060")},{"i":92,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000061")},{"i":93,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000062")},{"i":94,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000063")},{"i":95,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000064")},{"i":96,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000065")},{"i":97,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000066")},{"i":98,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000067")},{"i":99,"even":false,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000068")},{"i":100,"even":true,"_id":new buffalo.ObjectId("4eeeb80fc92ee10000000069")}]
)
testResponse(
  "QAAAAMpdBQAaAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAQI9AAW9rAAAAAAAAAPA/AA==",
  351690, 26, 8, new Long(0), 0,
  [{"n":1000,"ok":1}]
)
testResponse(
  "QAAAAMtdBQAbAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAQI9AAW9rAAAAAAAAAPA/AA==",
  351691, 27, 8, new Long(0), 0,
  [{"n":1000,"ok":1}]
)
testResponse(
  "QAAAAMxdBQAcAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAQI9AAW9rAAAAAAAAAPA/AA==",
  351692, 28, 8, new Long(0), 0,
  [{"n":1000,"ok":1}]
)
testResponse(
  "QAAAAM1dBQAdAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAHAAAAAFuAAAAAAAAAElAAW9rAAAAAAAAAPA/AA==",
  351693, 29, 8, new Long(0), 0,
  [{"n":50,"ok":1}]
)

testResponse(
  "sgAAAGJeBQBIAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAjgAAAAdfaWQATu64Qsku4QAAACsJEGNodW5rU2l6ZQAAAAQAEGxlbmd0aAAMAAAAAmZpbGVuYW1lAAQAAABmb28AAm1kNQAhAAAAODZmYjI2OWQxOTBkMmM4NWY2ZTA0NjhjZWNhNDJhMjAACmNvbnRlbnRUeXBlAAl1cGxvYWREYXRlAEHCf1Q0AQAAAA==",
  351842, 72, 8, new Long(0), 0,
  [{"_id":new buffalo.ObjectId("4eeeb842c92ee10000002b09"),"chunkSize":262144,"length":12,"filename":"foo","md5":"86fb269d190d2c85f6e0468ceca42a20","contentType":null,"uploadDate":new Date("2011-12-19T04:06:26.113Z")}]
)
testResponse(
  "YwAAAIZeBQBVAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAPwAAABBuAAAAAAASbGFzdE9wAAIAAABWuO5OEGNvbm5lY3Rpb25JZADnAAAACmVycgABb2sAAAAAAAAA8D8A",
  351878, 85, 8, new Long(0), 0,
  [{"n":0,"lastOp":new Long(2,1324267606),"connectionId":231,"err":null,"ok":1}]
)
testResponse(
  "RQAAAKBeBQBeAAAAAQAAAAgAAAAAAAAAAAAAAAAAAAABAAAAIQAAAAFyZXR2YWwAAAAAAAAAJkABb2sAAAAAAAAA8D8A",
  351904, 94, 8, new Long(0), 0,
  [{"retval":11,"ok":1}]
)
