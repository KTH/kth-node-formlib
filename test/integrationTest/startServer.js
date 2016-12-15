const SERVER_PORT = 4000
server = require('./server')(SERVER_PORT)
console.log('Server started at: http://localhost:' + SERVER_PORT)
console.log('Try: /testNestedForm')