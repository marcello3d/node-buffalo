var BSON = require('../buffalo')

module.exports = {
    "machine id part of ObjectID is not zero": function(test) {
        var objid = new BSON.ObjectId();
        test.ok(!(objid.bytes[4] == 0x00 &&
                  objid.bytes[5] == 0x00 &&
                  objid.bytes[6] == 0x00))
        test.done()
    },
}
