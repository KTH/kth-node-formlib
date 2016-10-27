
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect
const $ = require('cheerio')


// Our code...
const Schema = require('isomorphic-schema').Schema
const validators = require('isomorphic-schema').field_validators
const { renderFormFields } = require('../lib')
const { IDisplayFieldWidget } = require('../lib').interfaces

const simpleSchema = new Schema('Simple Schema', {
    title: validators.textField({}),
    age: validators.integerField({}),
    happy: validators.boolField({})
})

const nestedSchema = new Schema('Nested Schema', {
    title: validators.textField(),
    simple: validators.objectField({schema: simpleSchema})
})

describe('renderForm', function () {
  it('can render a simple schema', function () {
    var outp = renderFormFields({
      data: {
          title: 'A great one',
          age: 42,
          happy: true
      },
      formSchema: simpleSchema
    })
    expect(outp).not.to.equal(undefined)
    const formData = $('<form>' + outp + '</form>').serializeArray()
    expect(formData[0].name).to.equal('title')
    expect(formData[0].value).to.equal('A great one')
    expect(formData[3].name).to.equal('happy')
    expect(formData[3].value).to.equal('true')
  })
  
  it('can render a nested schema', function () {
    var outp = renderFormFields({
      data: {simple: {
          happy: false
      }},
      formSchema: nestedSchema
    })
    expect(outp).not.to.equal(undefined)
    const formData = $('<form>' + outp + '</form>').serializeArray()
    expect(formData[3].name).to.equal('simple[happy]__exists__')
    expect(formData[3].value).to.equal('marker')
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
