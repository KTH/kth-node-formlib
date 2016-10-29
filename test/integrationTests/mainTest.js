// TODO: Integration tests with bodyParser!
/*

    SERVER:
    1 Create an endpoint that listens to post
    2 Endpoint returns posted data as JSON

    TEST CLIENT:
    1 Generate isomorphic-schema form using kth-node-formlib 
    2 Parse form using cherrio.serializeArray()
    3 Post formdata to endpoint using request.post()
    4 We compare the JSON responose to data sent to kth-node-formlib

*/
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect
const $ = require('cheerio')
const request = require('request')

// Our code...
const Schema = require('isomorphic-schema').Schema
const validators = require('isomorphic-schema').field_validators
const { renderFormFields } = require('../../lib')
const { IDisplayFieldWidget } = require('../../lib').interfaces

const simpleSchema = new Schema('Simple Schema', {
    title: validators.textField({}),
    age: validators.integerField({}),
    happy: validators.boolField({}),
    unhappy: validators.boolField({})
})

const formSchema = new Schema('List Schema', {
    title: validators.textField({}),
    list: validators.listField({
        valueType: validators.textField({required: true}),
    }),
    simple: validators.objectField({schema: simpleSchema})
})

describe('urlencoded forms', function () {
  it('can be submitted and parsed properly', function (done) {
    const data = {
        title: 'form title',
        list: ['one', 'two', 'three'],
        simple: {
            title: 'subtitle',
            age: 42,
            happy: true,
            unhappy: false
        }
    }
    var outp = renderFormFields({
      data: data,
      formSchema: formSchema
    })
    expect(outp).not.to.equal(undefined)
    const tmp = $('<form>' + outp + '</form>').serializeArray()
    var formData = {}
    tmp.forEach((item) => {
        formData[item.name] = item.value
    })
    request.post({
        url: 'http://localhost:5001/urlencoded',
        form: formData
    }, (err, resp, body) => {
        expect(err).to.equal(null)
        expect(resp.statusCode).to.equal(200)
        const outp = formSchema.transform(JSON.parse(body))
        expect(outp).to.deep.equal(data)
        done()
    })
  })
})
