
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect


// Our code...
const Schema = require('isomorphic-schema').Schema
const validators = require('isomorphic-schema').field_validators
const { renderFormFields } = require('../lib')
const { IDisplayFieldWidget } = require('../lib').interfaces

const simpleSchema = new Schema('Simple Schema', {
    title: validators.textField({}),
    age: validators.integerField({})
})

const nestedSchema = new Schema('Nested Schema', {
    title: validators.textField(),
    simple: validators.objectField({schema: simpleSchema})
})

describe('renderForm', function () {
  it('can render a simple schema', function () {
    var outp = renderFormFields({
      data: {},
      formSchema: simpleSchema
    })
    expect(outp).not.to.equal(undefined)
  })
  
  it('can render a nested schema', function () {
    var outp = renderFormFields({
      data: {simple: {}},
      formSchema: nestedSchema
    })
    expect(outp).not.to.equal(undefined)
  })

  it('can render a nested schema with IDisplayFieldWidget', function () {
    var outp = renderFormFields({
      data: {simple: {}},
      formSchema: nestedSchema,
      renderOptions: {
          renderWith: IDisplayFieldWidget
      }
    })
    expect(outp).not.to.equal(undefined)
  })
})
