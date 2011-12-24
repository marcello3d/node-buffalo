var BSON = require('../buffalo')
var mongoNative = require('mongodb')
var BSONPure = mongoNative.BSONPure.BSON
var BSONNative = mongoNative.BSONNative && mongoNative.BSONNative.BSON

var COUNT = 100000
var object = {
    string: "Strings are great",
    decimal: 3.14159265,
    bool: true,
    integer: 5,
    subObject: {
        moreText: "Bacon ipsum dolor sit amet cow pork belly rump ribeye pastrami andouille. Tail hamburger pork belly, drumstick flank salami t-bone sirloin pork chop ribeye ham chuck pork loin shankle. Ham fatback pork swine, sirloin shankle short loin andouille shank sausage meatloaf drumstick. Pig chicken cow bresaola, pork loin jerky meatball tenderloin brisket strip steak jowl spare ribs. Biltong sirloin pork belly boudin, bacon pastrami rump chicken. Jowl rump fatback, biltong bacon t-bone turkey. Turkey pork loin boudin, tenderloin jerky beef ribs pastrami spare ribs biltong pork chop beef.",
        longKeylongKeylongKeylongKeylongKeylongKey: "Pork belly boudin shoulder ribeye pork chop brisket biltong short ribs. Salami beef pork belly, t-bone sirloin meatloaf tail jowl spare ribs. Sirloin biltong bresaola cow turkey. Biltong fatback meatball, bresaola tail shankle turkey pancetta ham ribeye flank bacon jerky pork chop. Boudin sirloin shoulder, salami swine flank jerky t-bone pork chop pork beef tongue. Bresaola ribeye jerky andouille. Ribeye ground round sausage biltong beef ribs chuck, shank hamburger chicken short ribs spare ribs tenderloin meatloaf pork loin."
    },
    subArray: [1,2,3,4,5,6,7,8,9,10],
    anotherString: "another string"
}

var x, start, end, i
var serializedBSON, serializedBSONPure, serializedBSONNative, serializedJSON
var deserializedBSON, deserializedBSONPure, deserializedBSONNative, deserializedJSON

start = new Date
for (i=COUNT; --i>=0; ) {
    serializedBSON = BSON.serialize(object)
}
end = new Date
console.log(COUNT + "x buffalo.serialize(object)                      time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = new Date
for (i=COUNT; --i>=0; ) {
    serializedBSONPure = BSONPure.serialize(object, null, true)
}
end = new Date
console.log(COUNT + "x mongodb.BSONPure.serialize(object)             time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")

if (BSONNative) {
    start = new Date
    for (i=COUNT; --i>=0; ) {
        serializedBSONNative = BSONNative.serialize(object, null, true)
    }
    end = new Date
    console.log(COUNT + "x mongodb.BSONNative.serialize(object)       time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")
}

start = new Date
for (i=COUNT; --i>=0; ) {
    serializedJSON = JSON.stringify(object)
}
end = new Date
console.log(COUNT + "x JSON.stringify(object)                         time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = new Date
for (i=COUNT; --i>=0; ) {
    deserializedBSON = BSON.parse(serializedBSON)
}
end = new Date
console.log(COUNT + "x buffalo.parse(buffer)                          time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = new Date
for (i=COUNT; --i>=0; ) {
    deserializedBSONPure = BSONPure.deserialize(serializedBSONPure)
}
end = new Date
console.log(COUNT + "x mongodb.BSONPure.deserialize(buffer)           time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


if (BSONNative) {
    start = new Date
    for (i=COUNT; --i>=0; ) {
        deserializedBSONNative = BSONNative.deserialize(serializedBSONNative)
    }
    end = new Date
    console.log(COUNT + "x mongodb.BSONNative.deserialize(buffer)     time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")
}


start = new Date
for (i=COUNT; --i>=0; ) {
    deserializedJSON = JSON.parse(serializedJSON)
}
end = new Date
console.log(COUNT + "x JSON.parse(string)                             time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


function compare(b1, b2) {
    try {
        require('assert').deepEqual(b1,b2)
        return true
    } catch (e) {
        console.error(e)
        return false
    }
}
