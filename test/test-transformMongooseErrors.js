
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect
const mongoose = require('mongoose')
const Schema = require('mongoose').Schema


// Our code...
const unpackErrors = require('../lib').apiHelpers.transformMongooseErrors
const enSchema = new Schema({
    visibility: { type: String, enum: ['public'] }
}, {_id: false})
const descSchema = new Schema({
    en: { type: enSchema }
}, {_id: false})
const TestModel = mongoose.model('Test', new Schema({
    description: { type: descSchema }
}, {_id: false}))

describe('The userProfile', function () {
  it('passing undefined returns undefined', function () {
    const errors = unpackErrors(undefined)
    expect(errors).to.equal(undefined)
  })
  it('error object can be transformed', function () {
    const obj = new TestModel({
        description: {
            en: {
                visibility: 'fail'
            }
        }
    })
    const validation = obj.validateSync()

    const errors = unpackErrors(validation.errors)
    expect(errors).not.to.equal(undefined)
    expect(errors.fieldErrors['description'].fieldErrors['en'].fieldErrors['visibility'].message).not.to.equal(undefined)
  })
})
