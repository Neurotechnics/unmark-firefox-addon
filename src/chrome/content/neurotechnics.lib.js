// Setup "neurotechnics.com" Namespace
if (typeof com == 'undefined') { var com = {}; }
com.neurotechnics = com.neurotechnics || {};
com.neurotechnics.lib = {};

(function(lib) {
    //init
    lib.regex = lib.regex || {};

    var singleTagRegex = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
    var simpleStringRegex = /^.[^:#\[\.,]*$/;

    lib.is = function(elem, qualifier) {
        if (qualifier.nodeType) {
            return (elem === qualifier);
        }

        if (typeof qualifier === "string") {
            if (simpleStringRegex.test(qualifier)) {
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


    /**********************************************************************
     * RegExp functions.
     **********************************************************************/
    (function (regex) {
        regex.test = function(value, type) {
            var reg;
            if (obj instanceof RegExp)  {
                reg = type;
            } else if (typeof type == 'string') {
                switch (type.toLowerCase()) {
                    case 'domain':
                        reg = /^((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|mobi|name|pro|aero|coop|museum|[a-zA-Z]{2}))?$/i;
                        break;

                    case 'localdomain':
                        reg = /^((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|mobi|name|pro|aero|coop|museum|local|int|intranet|[a-zA-Z]{2}))?$/i;
                        break;

                    default:
                        reg = new RegExp(type);
                }
            } else {
                return false;
            }

            return reg.test(value);
        };
    })(lib.regex);


    /**********************************************************************
     * String functions.
     **********************************************************************/
    (function (strings) {
        strings.trim = function(s) {
            return s.replace(/^\s+|\s+$/g, '');
        };

        strings.escape = function (s) {
            return s.replace(/('|\\)/g, "\\$1");
        };

        strings.isNullOrEmpty = function() {
            if (s === null) return true;
            if (s.trim() === '') return true;
            return false;
        };

        strings.pos = function(s, needle, offset) {
            var i = s.indexOf(needle, (offset || 0));
            return i === -1 ? false : i;
        };
    })(lib.strings = lib.strings || {});


    /**********************************************************************
     * Array prototype methods.
     **********************************************************************/
    (function (arrays) {
        arrays.removeAll = function(obj, val) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i] == val) {
                    obj.splice(i, 1);
                    i--;
                }
            }
            return obj;
        };

        arrays.filter = function(obj, fun /*, thisArg */ ) {
            "use strict";

            if (obj === void 0 || obj === null)
                throw new TypeError();

            var t = Object(obj);
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
    })(lib.arrays = lib.arrays || {});

})(com.neurotechnics.lib);
