'use strict'
/**
 * 
 * Perform unpacking of object to mimick extended: true option in body-parser#urlencoded
 * 
 */

module.exports = function unpack (inp) {
    var outp = {}
    if (!Array.isArray(inp) && typeof inp === 'object') {
        Object.keys(inp).forEach(function (key) {
            var tmp = key.split('[')
            tmp = tmp.map(function (k) {
                
                return (k[k.length - 1] === ']' ? k.slice(0, k.length - 1) : k)
            })
            var pos = tmp.length
            tmp.reduce(function (prev, currKey, index, arr) {
                pos--
                const isArr = parseInt(arr[index + 1]) == arr[index + 1] 
                if (pos === 0) {
                    // This is the last item and should just be assined
                    prev[currKey] = inp[key]
                } else if (isArr) {
                    // This is an array
                    if (!Array.isArray(prev[currKey])) {
                        prev[currKey] = []
                    }
                    return prev[currKey]
                } else {
                    // This is an object
                    if (typeof prev[currKey] !== 'object') {
                        prev[currKey] = {}
                    }
                    return prev[currKey]
                }
            }, outp)
        })
        return outp
    } else {
        return inp
    }
}