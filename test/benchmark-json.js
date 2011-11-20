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
console.log(COUNT + "x (serializedBSON = BSON.serialize(object))               time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = new Date
for (i=COUNT; --i>=0; ) {
    serializedBSONPure = BSONPure.serialize(object, null, true)
}
end = new Date
console.log(COUNT + "x (serializedBSONPure = BSONPure.serialize(object))       time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")

if (BSONNative) {
    start = new Date
    for (i=COUNT; --i>=0; ) {
        serializedBSONNative = BSONNative.serialize(object, null, true)
    }
    end = new Date
    console.log(COUNT + "x (serializedBSONNative = BSONNative.serialize(object))   time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")
}

start = new Date
for (i=COUNT; --i>=0; ) {
    serializedJSON = JSON.stringify(object)
}
end = new Date
console.log(COUNT + "x (serializedJSON = JSON.stringify(object))               time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")

console.log("BSON size (bytes):", serializedBSON.length)

console.log("serializedBSON == serializedBSONPure ? "+compare(serializedBSON,serializedBSONPure))
if (BSONNative) {
    console.log("serializedBSON == serializedBSONNative ? "+compare(serializedBSON,serializedBSONNative))
    console.log("serializedBSONPure == serializedBSONNative ? "+compare(serializedBSONNative,serializedBSONPure))
}


start = new Date
for (i=COUNT; --i>=0; ) {
    deserializedBSON = BSON.parse(serializedBSON)
}
end = new Date
console.log(COUNT + "x BSON.parse(serializedBSON)                               time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


start = new Date
for (i=COUNT; --i>=0; ) {
    deserializedBSONPure = BSONPure.deserialize(serializedBSONPure)
}
end = new Date
console.log(COUNT + "x BSONPure.deserialize(serializedBSONPure)                 time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


if (BSONNative) {
    start = new Date
    for (i=COUNT; --i>=0; ) {
        deserializedBSONNative = BSONNative.deserialize(serializedBSONNative)
    }
    end = new Date
    console.log(COUNT + "x BSONNative.deserialize(serializedBSONNative)             time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")
}


start = new Date
for (i=COUNT; --i>=0; ) {
    deserializedJSON = JSON.parse(serializedJSON)
}
end = new Date
console.log(COUNT + "x JSON.parse(serializedJSON)                               time = ", end - start, "ms -", COUNT * 1000 / (end - start), " ops/sec")


function compare(b1, b2) {
    try {
        require('assert').deepEqual(b1,b2)
        return true
    } catch (e) {
        console.error(e)
        return false
    }
}

console.log("object == deserializedBSON ? "+compare(object,deserializedBSON))
console.log("object == deserializedBSONPure ? "+compare(object,deserializedBSONPure))
if (BSONNative) console.log("object == deserializedBSONNative ? "+compare(object,deserializedBSONNative))
console.log("object == deserializedJSON ? "+compare(object,deserializedJSON))
console.log("deserializedBSON == deserializedBSONPure ? "+compare(deserializedBSON,deserializedBSONPure))
if (BSONNative) console.log("deserializedBSON == deserializedBSONNative ? "+compare(deserializedBSON,deserializedBSONNative))
if (BSONNative) console.log("deserializedBSONPure == deserializedBSONNative ? "+compare(deserializedBSONNative,deserializedBSONPure))
console.log("deserializedJSON == deserializedBSON ? "+compare(deserializedJSON,deserializedBSON))
console.log("deserializedJSON == deserializedBSONPure ? "+compare(deserializedJSON,deserializedBSONPure))
if (BSONNative) console.log("deserializedJSON == deserializedBSONNative ? "+compare(deserializedJSON,deserializedBSONNative))
