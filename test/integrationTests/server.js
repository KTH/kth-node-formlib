'use strict'
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
    extended: true
})

const express = require('express')
const app = express()

const { transformRequest } = require('../../lib').apiHelpers

app.post('/urlencoded', urlencodedParser, function (req, res) {
    console.log('-------------------')
    console.log(req.body)
    console.log('===================')
    var outp = transformRequest(req.body)
    console.log(outp)
    res.json(outp)
})


// *** SERVER ERROR HANDLER ***
app.use(function (err, req, res, next) {
    console.log(err)
    return res.status(404).json({
        error: 'Server error',
        err: err
    });
});


/*
    ********** /END ERROR HANDLING **********
*/

var PORT = process.env.PORT || 5001;
app.listen(PORT, function () {
    console.log("Staring Node.js\n");    
    console.log("Available at http://localhost:" + PORT + "/\n");    
});

module.exports = app;
