/* Buffalo by Marcello Bastea-Forte - zlib license */

var BSON = require('../buffalo')
var Long = BSON.Long

function C(character) {
    return character.charCodeAt(0)
}

var bsonSample1 = [
                0x16, 0x00, 0x00, 0x00,
                0x02,
                    C('h'), C('e'), C('l'), C('l'), C('o'), 0x00,
                    0x06, 0x00, 0x00, 0x00, C('w'), C('o'), C('r'), C('l'), C('d'), 0x00,
                0x00]

var bsonSample1Expected = {"hello": "world"}

var bsonSample2 = [
                 0x31, 0x00, 0x00, 0x00,
                     0x04, C('B'), C('S'), C('O'), C('N'), 0x00,
                     0x26, 0x00, 0x00, 0x00,
                         0x02, C('0'), 0x00,
                             0x08, 0x00, 0x00, 0x00, C('a'), C('w'), C('e'), C('s'), C('o'), C('m'), C('e'), 0x00,
                         0x01, C('1'), 0x00,
                             0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x14, 0x40,
                         0x10, C('2'), 0x00,
                             0xc2, 0x07, 0x00, 0x00,
                     0x00,
                 0x00]

var bsonSample2Expected = {"BSON": ["awesome", 5.05, 1986]}


function testBackAndForth(originalObject) {
    return function(test) {
        var serialized = BSON.serialize(originalObject)
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.deepEqual(parsed, originalObject)
        test.done()
    }
}

module.exports = {
    "sample BSON 1 parses to {\"hello\": \"world\"}": function(test) {
        var parsed = BSON.parse(new Buffer(bsonSample1))
        test.deepEqual(parsed, bsonSample1Expected)
        test.done()
    },
    "sample BSON 2 parses to {\"BSON\": [\"awesome\", 5.05, 1986]}": function(test) {
        var parsed = BSON.parse(new Buffer(bsonSample2))
        test.deepEqual(parsed, bsonSample2Expected)
        test.done()
    },
    "javascript object {\"hello\": \"world\"}": function(test) {
        var serialized = BSON.serialize(bsonSample1Expected)
        test.equal(serialized.toString('base64'), 
                   new Buffer(bsonSample1).toString('base64'))
        test.done()
    },
    "javascript object {\"BSON\": [\"awesome\", 5.05, 1986]}": function(test) {
        var serialized = BSON.serialize(bsonSample2Expected)
        test.equal(serialized.toString('base64'), 
                   new Buffer(bsonSample2).toString('base64'))
        test.done()
    },
    "serialize/parse []": testBackAndForth([]),
    "serialize/parse [1,2,3]": testBackAndForth([1,2,3]),
    "serialize/parse ['a','b','c']": testBackAndForth(['a','b','c']),
    "serialize/parse ['è']": testBackAndForth(['à', 'é', 'è', 'ê', 'ñ', 'ù', 'ç', 'ï']),
    "serialize/parse ['short','longer','even longer... Hamburger swine boudin bresaola, tongue meatball biltong rump. Strip steak pig venison tongue. Tenderloin bresaola brisket jowl ham, flank shankle drumstick tongue hamburger swine. Pastrami hamburger boudin beef ribs, sirloin jerky sausage tail bresaola strip steak pork loin corned beef. Turkey jerky jowl sirloin. Chuck pig hamburger fatback. Corned beef beef brisket swine short ribs shoulder.']": testBackAndForth(['short','longer','even longer... Hamburger swine boudin bresaola, tongue meatball biltong rump. Strip steak pig venison tongue. Tenderloin bresaola brisket jowl ham, flank shankle drumstick tongue hamburger swine. Pastrami hamburger boudin beef ribs, sirloin jerky sausage tail bresaola strip steak pork loin corned beef. Turkey jerky jowl sirloin. Chuck pig hamburger fatback. Corned beef beef brisket swine short ribs shoulder.']),
    "serialize/parse [new Date]": testBackAndForth([new Date]),
    "serialize/parse {}": testBackAndForth({}),
    "serialize/parse {'hello':'there'}": testBackAndForth({'hello':'there'}),
    "serialize/parse {level1:{level2:{level3:{level4:{level5:{level6:{level7:'tada!'}}}}}}}": testBackAndForth({level1:{level2:{level3:{level4:{level5:{level6:{level7:'tada!'}}}}}}}),
    "serialize/parse [1.500343]": testBackAndForth([1.500343]),
    "serialize/parse [-1.500343]": testBackAndForth([-1.500343]),
    "serialize/parse [1<<20]": testBackAndForth([1<<20]),
    "serialize/parse [1<<28]": testBackAndForth([1<<28]),
    "serialize/parse [1<<31]": testBackAndForth([1<<31]),
    "serialize/parse [1<<35]": testBackAndForth([1<<35]),
    "serialize/parse [1<<40]": testBackAndForth([1<<40]),
    "serialize/parse [1<<60]": testBackAndForth([1<<60]),
    "serialize/parse [true]": testBackAndForth([true]),
    "serialize/parse [false]": testBackAndForth([false]),
    "serialize/parse [true,false,true,false,0,1]": testBackAndForth([true,false,true,false,0,1]),
    "serialize/parse [null]": testBackAndForth([null]),
    "serialize/parse [undefined]": testBackAndForth([undefined]),
    "serialize/parse [1234567890]": testBackAndForth([1234567890]),
    "serialize/parse [1234567890123456]": testBackAndForth([1234567890123456]),
    "serialize/parse [12345678901234567890]": testBackAndForth([12345678901234567890]),
    "serialize/parse [123456789012345678901234567890]": testBackAndForth([123456789012345678901234567890]),
    "serialize/parse [1234567890123456.78901234567890]": testBackAndForth([1234567890123456.78901234567890]),
    "serialize/parse [new Long(100,100)]": testBackAndForth([new Long(100,100)]),
    "serialize/parse [-1234567890]": testBackAndForth([-1234567890]),
    "serialize/parse [-1234567890123456]": testBackAndForth([-1234567890123456]),
    "serialize/parse [-12345678901234567890]": testBackAndForth([-12345678901234567890]),
    "serialize/parse [-123456789012345678901234567890]": testBackAndForth([-123456789012345678901234567890]),
    "serialize/parse [-1234567890123456.78901234567890]": testBackAndForth([-1234567890123456.78901234567890]),
    "serialize/parse [new Buffer(\"hello\", \"utf8\")]": function(test) {
        var serialized = BSON.serialize([new Buffer("hello", "utf8")])
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.ok(parsed[0] instanceof Buffer)
        test.equal(parsed[0].toString(), "hello")
        test.done()
    },
    "serialize/parse complex object": testBackAndForth({
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
    }),
    "serialize/parse [/hello/i]": function(test) {
        var serialized = BSON.serialize([/hello/i])
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.ok(parsed[0] instanceof RegExp)
        test.equal(parsed[0].toString(), '/hello/i')
        test.done()
    },
    "serialize/parse [/hello[.]+/i]": function(test) {
        var serialized = BSON.serialize([/hello[.]+/i])
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.ok(parsed[0] instanceof RegExp)
        test.equal(parsed[0].toString(),"/hello[.]+/i")
        test.done()
    },
    "serialize/parse [function(){}]": function(test) {
        var serialized = BSON.serialize([function(){}])
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.equal(typeof parsed[0], 'function')
        // We need a fuzzy match, since serializing jumbles the function slightly
        test.ok(/^function[^\(]*\(\){}/.test(parsed[0].toString().replace(/[\s\n]+/g,'')))
        test.done()
    },
    "serialize/parse [function(x,y){ return x + y }]": function(test) {
        var serialized = BSON.serialize([function(x,y){
            return x + y
        }])
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.equal(typeof parsed[0], 'function')
        test.ok(/function[^(]*\(x,y\)\{returnx\+y\}/.test(parsed[0].toString().replace(/[\s\n]+/g,'')))
        test.equal(parsed[0](4,5), 9)
        test.done()
    },
    "serialize/parse scoped function(){ return x + y } (with x=4, y=5)": function(test) {
        var func = function() {
            return x + y
        }
        func.scope = {
            x:4,
            y:5
        }
        var serialized = BSON.serialize([func])
        test.ok(serialized.length)
        var parsed = BSON.parse(serialized)
        test.equal(typeof parsed[0], 'function')
        test.ok(/function[^(]*\(\)\{with\({x:4,y:5}\){returnx\+y\}}/.test(parsed[0].toString().replace(/[\s\n]+/g,'')))
        test.equal(parsed[0](), 9)
        test.done()
    }
}
