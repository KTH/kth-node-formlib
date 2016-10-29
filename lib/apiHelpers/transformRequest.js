'use strict'

/**
 * 
 * Use this method to transform incoming data containing bool-fields (i.e. checkbox fields)
 * in place!
 */
module.exports = function unpack (inp) {
    if (Array.isArray(inp)) {
        inp = inp.map((item) => {
            if (typeof item === 'object') {
                return unpack(item)
            } else {
                return item
            }
        })
    } else if (typeof inp === 'object') {
        var tmpKeys = Object.keys(inp)
        if (inp.__bool_marker__) {
            // This object represents a boolean
            return inp.__bool_value__ || 'false'
        } else {
            tmpKeys.forEach((key) => {
                if (typeof inp[key] === 'object') {
                    inp[key] = unpack(inp[key])
                }
            })
        }
    } else {
        // Do nothing with non object data types
    }
    return inp
}