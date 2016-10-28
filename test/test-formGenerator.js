
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

const listSchema = new Schema('List Schema', {
    title: validators.textField({}),
    list: validators.listField({
        valueType: validators.textField({required: true}),
    })
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
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
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
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
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
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
  })

  it('can render a schema containing a list', function () {
    var outp = renderFormFields({
      data: {
          title: 'A nice title',
          list: ['one', 'two', 'three']
      },
      formSchema: listSchema
    })
    expect(outp).not.to.equal(undefined)
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
    const formData = $('<form>' + outp + '</form>').serializeArray()
    expect(formData[1].name).to.equal('list[0]')
    expect(formData[1].value).to.equal('one')
  })

  it('can render a schema containing a list with IDisplayFieldWidget', function () {
    var outp = renderFormFields({
      data: {
          title: 'A nice title',
          list: ['one', 'two', 'three']
      },
      formSchema: listSchema,
      renderOptions: {
          renderWith: IDisplayFieldWidget
      }
    })
    expect(outp).not.to.equal(undefined)
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
    const $html = $.load(outp)
    expect($html.text().indexOf('A nice title')).to.equal(0)
    expect($html.text().indexOf('one')).to.be.gt(0)
    expect($html.text().indexOf('two')).to.be.gt(0)
    expect($html.text().indexOf('three')).to.be.gt(0)
  })
})
