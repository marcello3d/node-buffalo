Buffalo
==================
Buffalo is a lightweight [BSON][1] library for [Node.js][2]. It was built as a new underlying engine for
[Mongolian DeadBeef][3].

The motivation is to make a fast and simple parser and serializer for BSON.

Installation
------------
**DISCLAIMER: The API is experimental. I will be adding, removing, and changing the API in the
interest of a solid API. Use at your own risk**

You can either clone the source and install with `npm link`, or install the latest published version from npm with
`npm install buffalo`.

Running Tests
-------------
Run the tests with `npm test`.

API
---
Buffalo exposes two methods:

    exports.parse = function(buffer) { ... }
    exports.serialize = function(object) { ... }

And several types:

    exports.Long // goog.math.Long - http://closure-library.googlecode.com/svn/docs/class_goog_math_Long.html
    exports.ObjectId = function(bytes) // bytes should be a 12-byte Buffer, accessible via the bytes property
    exports.Timestamp // under construction

The BSON types are mapped as follows:

+ <code>0x01</code> - Floating point - mapped to <code>Number</code>
+ <code>0x02</code> - UTF-8 string - mapped to <code>String</code>
+ <code>0x03</code> - Embedded document - mapped to <code>Object</code>
+ <code>0x04</code> - Array - mapped to <code>Array</code>
+ <code>0x05</code> - Binary data - mapped to Node.js <code>Buffer</code> (with property <code>subtype</code>)
+ <code>0x06</code> - Undefined - mapped to <code>undefined</code>
+ <code>0x07</code> - ObjectId - mapped to <code>exports.ObjectId</code>
+ <code>0x08</code> - Boolean - mapped to <code>true</code> or <code>false</code>
+ <code>0x09</code> - UTC datetime - mapped to <code>Date</code>
+ <code>0x0A</code> - Null value - mapped to <code>null</code>
+ <code>0x0B</code> - Regular expression - mapped to <code>RegExp</code> (Note: only flags g, i, and m are supported)
+ <code>0x0C</code> - DBPointer - currently unmapped
+ <code>0x0D</code> - JavaScript code - mapped to <code>Function</code> or <code>Object</code> with property <code>code</code>
+ <code>0x0E</code> - Symbol - mapped to <code>String</code>
+ <code>0x0F</code> - JavaScript code w/ scope - mapped to <code>Function</code> or <code>Object</code> with properties <code>code</code> and <code>scope</code>
+ <code>0x10</code> - 32-bit Integer - mapped to <code>Number</code>
+ <code>0x11</code> - Timestamp - mapped to <code>exports.Timestamp</code>
+ <code>0x12</code> - 64-bit integer - mapped to <code>exports.Long</code>
+ <code>0xFF</code> - Min key - currently unmapped
+ <code>0x7F</code> - Max key - currently unmapped

Examples
--------

    var BSON = require('buffalo')

    // Parse a Buffer
    var object = BSON.parse(buffer)

    // Serialize an object
    var buffer = BSON.serialize(object)

Contributing
------------
Try it out and send me feedback! Unit tests and documentation are good, too.

License
-------
Buffalo is open source software under the [zlib license][4].

[1]: http://bsonspec.org/#/specification
[2]: http://nodejs.org/
[3]: https://github.com/marcello3d/node-mongolian
[4]: https://github.com/marcello3d/node-buffalo/blob/master/LICENSE
