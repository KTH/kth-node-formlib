'use strict';

/**
 * 
 * This is a simple deep clone method that doesn't handle circular references
 * but is fast and skinny. It is only used in tests.
 * 
 */
function cloneArray (arr) {
    var outp = arr.map(function (item) {
        if (Array.isArray(item)) {
            return cloneArray(item);
        } else if (typeof item === 'object') {
            var tmp = cloneObj(item);
            return tmp;
        } else {
            return item;
        }
    })
    
    return outp;
}

// TODO: Handle Date objects?
var cloneObj = function (obj) {
    var fn = function () {};
    fn.prototype = obj.prototype;
    var outp = new fn();
    
    Object.keys(obj).forEach(function (key) {
        if (!obj.hasOwnProperty(key)) return
            
        var tmp = obj[key];
        if (Array.isArray(tmp)) {
            outp[key] = cloneArray(tmp);
        } else if (typeof tmp === 'object') {
            outp[key] = cloneObj(tmp);
        } else {
            outp[key] = tmp;
        }
    })    
    return outp;
}
module.exports.clone = cloneObj;