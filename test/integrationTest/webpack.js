var webpack = require('webpack')
var path = require('path')

const config = {
    // The configuration for the server-side rendering
    name: 'server',
    target: 'node',
    devtool: 'source-map',
    entry: path.join(__dirname, './browser/source.js'),
    output: {
        path: path.join(__dirname, './browser/public'),
        publicPath: 'browser/',
        filename: 'app.js'
    },
    externals: {},
    module: {
        loaders: [
            { test: /\.js$/,

                loaders: [
                    // 'babel-loader'
                ]
            },
            { test:  /\.json$/, loader: 'json-loader' },
        ]
    },
    plugins: [
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

module.exports.init = function () {
    // Compile browser js using webpack
    const webpackCompiler = webpack(config)
    webpackCompiler.watch({ // watch options:
        aggregateTimeout: 300, // wait so long for more changes
        poll: true // use polling instead of native watchers
        // pass a number to set the polling interval
    }, function(err, stats) {
        if (err) return console.error('*** WEBPACK ERROR: ***', err)
        return console.log('*** WEBPACK SUCCESSFUL: *** ' + (stats.endTime - stats.startTime) + 'ms')
    })
}