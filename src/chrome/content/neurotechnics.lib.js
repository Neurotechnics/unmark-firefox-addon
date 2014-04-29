// Setup "neurotechnics.com" Namespace
if (typeof com == 'undefined') {
    var com = {};
}
if (typeof com.neurotechnics == 'undefined') {
    com.neurotechnics = {};
}
com.neurotechnics.lib = {};

(function(lib) {
    var singleTagRegex = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
    var simpleStringRegex = /^.[^:#\[\.,]*$/;

    lib.is = function(elem, qualifier) {
        if (qualifier.nodeType) {
            return (elem === qualifier);
        }

        if (typeof qualifier === "string") {
            if (simpleStringRegex.test(qualifier)) {
                //console.log("element name = '"+ lib.getObjectTypeName(elem) +"'");
                return (lib.__getClass(elem).toLowerCase() == qualifier.toLowerCase());
            }
        }

        return false;
    };

    /**
     * Extend the default object but only in the LIB namespace
     * @param  {Object} o The object to determine the class name of.
     * @return {String}   The type name of the objects class
     */
    lib.getObjectTypeName = function(o) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(o.constructor.toString());
        var name = (results && results.length > 1) ? results[1] : "";
        return name;
    };

    /**
     * Gets the objects constructor class name.
     * @param  {Object} o The object to determine the class name of.
     * @return {String}   The name of the objects class.
     */
    lib.__getClass = function(o) {
        return Object.prototype.toString.call(o).match(/^\[object\s+(.*)\]$/)[1];
    };

    lib.isArray = function(o) {
        return Object.prototype.toString.call(o) === '[object Array]';
    };

})(com.neurotechnics.lib);


/**********************************************************************
 * String prototype methods.
 **********************************************************************/
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

if (!String.prototype.escape) {
    String.prototype.escape = function () {
        return this.replace(/('|\\)/g, "\\$1");
    };
}

if (!String.prototype.isNullOrEmpty) {
    String.prototype.isNullOrEmpty = function() {
        if (this === null) return true;
        if (this.trim() === '') return true;
        return false;
    };
}

if (!String.prototype.pos) {
    String.prototype.pos = function(needle, offset) {
        var i = this.indexOf(needle, (offset || 0));
        return i === -1 ? false : i;
    };
}

/**********************************************************************
 * Array prototype methods.
 **********************************************************************/

if (!Array.prototype.removeAll) {
    Array.prototype.removeAll = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisArg */ ) {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // NOTE: Technically this should Object.defineProperty at
                //       the next index, as push can be affected by
                //       properties on Object.prototype and Array.prototype.
                //       But that method's new, and collisions should be
                //       rare, so use the more-compatible alternative.
                if (fun.call(thisArg, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}