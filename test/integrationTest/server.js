'use strict'
const path = require('path')
const bodyParser = require('body-parser')
const formidable = require('formidable')
const urlencodedParser = bodyParser.urlencoded({
    extended: true
})
const express = require('express')
const app = express()


const { transformRequest, transformExtended } = require('../../lib').apiHelpers

app.post('/urlencoded', urlencodedParser, function (req, res) {
    // Convert bool marker objects to bool values
    var outp = transformRequest(req.body)
    res.json(outp)
})

app.post('/multipart', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // Convert fields in same way as bodyParser.urlencoded with extended: true
        fields = transformExtended(fields)
        // Convert bool marker objects to bool values
        var outp = transformRequest(fields)
        res.json(outp)
    })
})

// Generate browser js and css
require('./webpack').init()
app.use('/browser', require('./stylus'))

// Serve static files
app.use('/browser', express.static(path.join(__dirname, 'browser/public')))

//Browser testing
app.get('/testNestedForm', require('./server-nestedList').GET)

// *** SERVER ERROR HANDLER ***
app.use(function (err, req, res, next) {
    console.log(err)
    return res.status(404).json({
        error: 'Server error',
        err: err
    })
})


/*
    ********** /END ERROR HANDLING **********
*/

module.exports = function (PORT, done) {
    return app.listen(PORT, done)
}
