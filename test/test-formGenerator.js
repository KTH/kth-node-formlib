
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect
const $ = require('cheerio')


// Our code...
const Schema = require('isomorphic-schema').Schema
const validators = require('isomorphic-schema').field_validators
const { renderFormFields, renderFormFieldsAsync } = require('../lib')
const { IDisplayFieldWidget } = require('../lib').interfaces
const { myDynamicSelectAsyncField, myDynamicSelectField } = require('./fieldWidgets/test-DynamicSelectField')

const simpleSchema = new Schema('Simple Schema', {
    title: validators.textField({}),
    age: validators.integerField({}),
    happy: validators.boolField({}),
    phone: validators.telephoneField({})
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

const nestedListSchema = new Schema('Nested List Schema', {
  list: validators.listField({
        valueType: validators.objectField({
          schema: listSchema,
          required: true
        }),
    })
})

describe('renderFormFields', function () {
  it('can render a simple schema', function () {
    var outp = renderFormFields({
      data: {
          title: 'A great one',
          age: 42,
          happy: true,
          phone: '+46 707 70 70 70'
      },
      formSchema: simpleSchema
    })
    expect(outp).not.to.equal(undefined)
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
    const formData = $('<form>' + outp + '</form>').serializeArray()
    expect(formData[0].name).to.equal('title')
    expect(formData[0].value).to.equal('A great one')
    expect(formData[2].name).to.equal('happy[__bool_marker__]')
    expect(formData[2].value).to.equal('__exists__')
    expect(formData[3].name).to.equal('happy[__bool_value__]')
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
    expect(formData[3].name).to.equal('simple[happy][__bool_marker__]')
    expect(formData[3].value).to.equal('__exists__')
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

  it('can render a schema containing nested lists', function () {
    var outp = renderFormFields({
      data: {
          list: [
            { title: 'row_one', list: ['one.1', 'two.1']},
            { title: 'row_two', list: ['one.2', 'two.2']},
            { title: 'row_three', list: ['one.3', 'two.3']}
          ]
      },
      formSchema: nestedListSchema
    })
    expect(outp).not.to.equal(undefined)
    expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
    const formData = $('<form>' + outp + '</form>').serializeArray()
    expect(formData[0].name).to.equal('list[0][title]')
    expect(formData[4].name).to.equal('list[1][list][0]')
    expect(formData[4].value).to.equal('one.2')
  })
})

const simpleSchemaAsync = new Schema('Simple Schema', {
    title: validators.textField({}),
    age: validators.integerField({}),
    happy: validators.boolField({}),
    phone: validators.telephoneField({}),
    select: myDynamicSelectAsyncField({
      required: true
    })
})

const nestedSchemaAsync = new Schema('Nested Schema', {
    title: validators.textField(),
    simple: validators.objectField({schema: simpleSchemaAsync}),
    select: myDynamicSelectAsyncField({
      required: true
    })
})

const listSchemaAsync = new Schema('List Schema', {
    title: validators.textField({}),
    list: validators.listField({
        valueType: validators.objectField({required: true, schema: nestedSchemaAsync}),
    })
})


const nestedListSchemaAsync = new Schema('Nested List Schema', {
  list: validators.listField({
        valueType: validators.objectField({
          schema: nestedSchemaAsync,
          required: true
        }),
    })
})

describe('renderFormFieldsAsync', function () {
  it('can render a simple schema', function (done) {
    var promise = renderFormFieldsAsync({
      data: {
          title: 'A great one',
          age: 42,
          happy: true,
          phone: '+46 707 70 70 70'
      },
      formSchema: simpleSchemaAsync
    })
    promise.then((outp) => {
      expect(outp).not.to.equal(undefined)
      expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
      const formData = $('<form>' + outp + '</form>').serializeArray()
      expect(formData[0].name).to.equal('title')
      expect(formData[0].value).to.equal('A great one')
      expect(formData[2].name).to.equal('happy[__bool_marker__]')
      expect(formData[2].value).to.equal('__exists__')
      expect(formData[3].name).to.equal('happy[__bool_value__]')
      expect(formData[3].value).to.equal('true')
      done()
    })
  })
  
  it('can render a nested schema', function (done) {
    var promise = renderFormFieldsAsync({
      data: {
        simple: {
          happy: false
      }},
      formSchema: nestedSchemaAsync
    })
    promise.then((outp) => {
      expect(outp).not.to.equal(undefined)
      expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
      const formData = $('<form>' + outp + '</form>').serializeArray()
      expect(formData[3].name).to.equal('simple[happy][__bool_marker__]')
      expect(formData[3].value).to.equal('__exists__')
      done()
    })
  })

  it('can render a schema containing nested lists', function (done) {
    var promise = renderFormFieldsAsync({
      data: {
          list: [
            { title: 'row_one', list: ['one.1', 'two.1']},
            { title: 'row_two', list: ['one.2', 'two.2']},
            { title: 'row_three', list: ['one.3', 'two.3']}
          ]
      },
      formSchema: nestedListSchema
    })
    promise.then((outp) => {
      expect(outp).not.to.equal(undefined)
      expect($.load(outp).text().indexOf('[object Object]')).to.equal(-1)
      const formData = $('<form>' + outp + '</form>').serializeArray()
      expect(formData[0].name).to.equal('list[0][title]')
      expect(formData[4].name).to.equal('list[1][list][0]')
      expect(formData[4].value).to.equal('one.2')
      done()
    })
  })
})