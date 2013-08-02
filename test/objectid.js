var BSON = require('../buffalo')

module.exports = {
    "machine id part of ObjectID is not zero": function(test) {
        var objid = new BSON.ObjectId();
        console.log(objid);
        console.log([objid.bytes[4], objid.bytes[5], objid.bytes[6]]);
        test.ok(!(objid.bytes[4] == 0x00 &&
                  objid.bytes[5] == 0x00 &&
                  objid.bytes[6] == 0x00))
        test.done()
    },
}
