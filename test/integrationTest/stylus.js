const stylus = require('stylus')
const nib = require('nib')

function compile(str, path) {
    return stylus(str)
        .set('filename', path)
        .use(nib())
}

const stylusMiddleware = stylus.middleware({ 
    src: __dirname + '/browser',
    dest: __dirname + '/browser/public',
    compile: compile
})

module.exports = function (req, res, next) {
    return stylusMiddleware(req, res, next)
}