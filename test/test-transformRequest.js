
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect

// Our code...
const { clone } = require('./_utils')
const transform = require('../lib/apiHelpers/transformRequest')
var formData = {
    boolTrue: {__bool_marker__: '__exists__', __bool_value__: 'true'},
    arr: [{__bool_marker__: '__exists__'}],
    obj: {
        boolTrue: {__bool_marker__: '__exists__', __bool_value__: 'true'},
        boolFalse: {__bool_marker__: '__exists__'}
    }
}

describe('The request data', function () {
  it('doesn\'t add any properties', function () {
    var data = clone(formData)
    transform(data)
    expect(Object.keys(data).length).to.equal(3)
    expect(data.boolTrue).not.to.equal(undefined)
    expect(data.arr).not.to.equal(undefined)
    expect(data.obj).not.to.equal(undefined)
  })

  it('can transform a simple checkbox', function () {
    var data = clone(formData)
    transform(data)
    expect(data.boolTrue).to.equal('true')
  })

  it('can transform a checkbox in an array', function () {
    var data = clone(formData)
    transform(data)
    expect(data.arr[0]).to.equal('false')
  })


  it('can transform a checkbox in an object', function () {
    var data = clone(formData)
    transform(data)
    expect(data.obj.boolTrue).to.equal('true')
    expect(data.obj.boolFalse).to.equal('false')
  })
})
