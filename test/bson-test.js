/* Mongolian DeadBeef by Marcello Bastea-Forte - zlib license */

var vows = require('vows'),
    assert = require('assert'),
    BSON = require('../lib/bson.js'),
    Long = BSON.Long

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
    return {
        topic: BSON.serialize(originalObject),
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "matches original": function(object) {
                assert.deepEqual(object, originalObject)
            }
        }
    }
}

vows.describe('BSON').addBatch({
    "sample BSON 1": {
        topic: BSON.parse(new Buffer(bsonSample1)),
        "parses to {\"hello\": \"world\"}": function (object) {
            assert.deepEqual(object, bsonSample1Expected)
        }
    },
    "sample BSON 2": {
        topic: BSON.parse(new Buffer(bsonSample2)),
        "parses to {\"BSON\": [\"awesome\", 5.05, 1986]}": function (object) {
            assert.deepEqual(object, bsonSample2Expected)
        }
    },
    "javascript object {\"hello\": \"world\"}": {
        topic: BSON.serialize(bsonSample1Expected),
        "serializes correctly": function(object) {
            assert.equal(object.toString('base64'), new Buffer(bsonSample1).toString('base64'))
        }
    },
    "javascript object {\"BSON\": [\"awesome\", 5.05, 1986]}": {
        topic: BSON.serialize(bsonSample2Expected),
        "serializes correctly": function(object) {
            assert.equal(object.toString('base64'), new Buffer(bsonSample2).toString('base64'))
        }
    },
    "after serializing []": testBackAndForth([]),
    "after serializing [1,2,3]": testBackAndForth([1,2,3]),
    "after serializing ['a','b','c']": testBackAndForth(['a','b','c']),
    "after serializing ['è']": testBackAndForth(['à', 'é', 'è', 'ê', 'ñ', 'ù', 'ç', 'ï']),
    "after serializing ['short','longer','even longer... Hamburger swine boudin bresaola, tongue meatball biltong rump. Strip steak pig venison tongue. Tenderloin bresaola brisket jowl ham, flank shankle drumstick tongue hamburger swine. Pastrami hamburger boudin beef ribs, sirloin jerky sausage tail bresaola strip steak pork loin corned beef. Turkey jerky jowl sirloin. Chuck pig hamburger fatback. Corned beef beef brisket swine short ribs shoulder.']": testBackAndForth(['short','longer','even longer... Hamburger swine boudin bresaola, tongue meatball biltong rump. Strip steak pig venison tongue. Tenderloin bresaola brisket jowl ham, flank shankle drumstick tongue hamburger swine. Pastrami hamburger boudin beef ribs, sirloin jerky sausage tail bresaola strip steak pork loin corned beef. Turkey jerky jowl sirloin. Chuck pig hamburger fatback. Corned beef beef brisket swine short ribs shoulder.']),
    "after serializing [new Date]": testBackAndForth([new Date]),
    "after serializing {}": testBackAndForth({}),
    "after serializing {'hello':'there'}": testBackAndForth({'hello':'there'}),
    "after serializing {level1:{level2:{level3:{level4:{level5:{level6:{level7:'tada!'}}}}}}}": testBackAndForth({level1:{level2:{level3:{level4:{level5:{level6:{level7:'tada!'}}}}}}}),
    "after serializing [1.500343]": testBackAndForth([1.500343]),
    "after serializing [-1.500343]": testBackAndForth([-1.500343]),
    "after serializing [1<<20]": testBackAndForth([1<<20]),
    "after serializing [1<<28]": testBackAndForth([1<<28]),
    "after serializing [1<<31]": testBackAndForth([1<<31]),
    "after serializing [1<<35]": testBackAndForth([1<<35]),
    "after serializing [1<<40]": testBackAndForth([1<<40]),
    "after serializing [1<<60]": testBackAndForth([1<<60]),
    "after serializing [true]": testBackAndForth([true]),
    "after serializing [false]": testBackAndForth([false]),
    "after serializing [true,false,true,false,0,1]": testBackAndForth([true,false,true,false,0,1]),
    "after serializing [null]": testBackAndForth([null]),
    "after serializing [undefined]": testBackAndForth([undefined]),
    "after serializing [1234567890]": testBackAndForth([1234567890]),
    "after serializing [1234567890123456]": testBackAndForth([1234567890123456]),
    "after serializing [12345678901234567890]": testBackAndForth([12345678901234567890]),
    "after serializing [123456789012345678901234567890]": testBackAndForth([123456789012345678901234567890]),
    "after serializing [1234567890123456.78901234567890]": testBackAndForth([1234567890123456.78901234567890]),
    "after serializing [new Long(100,100)]": testBackAndForth([new Long(100,100)]),
    "after serializing [-1234567890]": testBackAndForth([-1234567890]),
    "after serializing [-1234567890123456]": testBackAndForth([-1234567890123456]),
    "after serializing [-12345678901234567890]": testBackAndForth([-12345678901234567890]),
    "after serializing [-123456789012345678901234567890]": testBackAndForth([-123456789012345678901234567890]),
    "after serializing [-1234567890123456.78901234567890]": testBackAndForth([-1234567890123456.78901234567890]),
    "after serializing [new Buffer(\"hello\", \"utf8\")]": {
        topic: BSON.serialize([new Buffer("hello", "utf8")]),
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "is buffer": function(object) {
                assert.instanceOf(object[0], Buffer)
            },
            "buffer text matches original": function(object) {
                // Using equal with two regexps doesn't work
                assert.equal(object[0].toString(), "hello")
            }
        }
    },
    "after serializing complex object": testBackAndForth({
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
    "after serializing [/hello/i]": {
        topic: BSON.serialize([/hello/i]),
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "is regexp": function(object) {
                assert.instanceOf(object[0], RegExp)
            },
            "regexp matches original": function(object) {
                // Using equal with two regexps doesn't work
                assert.equal(object[0].toString(), "/hello/i")
            }
        }
    },
    "after serializing [/hello[.]+/i]": {
        topic: BSON.serialize([/hello[.]+/i]),
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "is regexp": function(object) {
                assert.instanceOf(object[0], RegExp)
            },
            "regexp matches original": function(object) {
                assert.equal(object[0].toString(), "/hello[.]+/i")
            }
        }
    },
    "after serializing [function(){}]": {
        topic: BSON.serialize([function(){}]),
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "is function": function(object) {
                assert.isFunction(object[0])
            },
            "function matches original": function(object) {
                // We need a fuzzy match, since serializing jumbles the function slightly
                assert.matches(object[0].toString().replace(/[\s\n]+/g,''),
                    /^function[^\(]*\(\){}/)
            }
        }
    },
    "after serializing [function(x,y){ return x + y }]": {
        topic: BSON.serialize([function(x,y){
            return x + y
        }]),
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "is function": function(object) {
                assert.isFunction(object[0])
            },
            "function matches original": function(object) {
                assert.matches(object[0].toString().replace(/[\s\n]+/g,''),
                    /function[^(]*\(x,y\)\{returnx\+y\}/)
            },
            "function evaluation with arguments (4,5) returns 9": function(object) {
                assert.equal(object[0](4,5), 9)
            }
        }
    },
    "after serializing scoped function(){ return x + y } (with x=4, y=5)": {
        topic: function() {
            var func = function() {
                return x + y
            }
            func.scope = {
                x:4,
                y:5
            }
            return BSON.serialize([func])
        },
        "has length": function(bson) {
            assert.isNotZero(bson.length)
        },
        "when reparsed,": {
            topic: function(object) {
                return BSON.parse(object)
            },
            "is function": function(object) {
                assert.isFunction(object[0])
            },
            "function matches original": function(object) {
                assert.matches(object[0].toString().replace(/[\s\n]+/g,''),
                    /function[^(]*\(\)\{with\({x:4,y:5}\){returnx\+y\}}/)
            },
            "function evaluation returns 9": function(object) {
                assert.equal(object[0](), 9)
            }
        }
    }
}).export(module)
