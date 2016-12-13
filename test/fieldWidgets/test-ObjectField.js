
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect
const loadHtml = require('cheerio').load


// Our code...
var registry = require('component-registry').globalRegistry
var createUtility = require('component-registry').createUtility
var createInterface = require('component-registry').createInterface

var validators = require('isomorphic-schema').field_validators
var Schema = require('isomorphic-schema').Schema
var Promise = require('es6-promise')

const { IInputFieldWidget } = require('../../lib/interfaces')
const { myDynamicSelectAsyncField, myDynamicSelectField } = require('./test-DynamicSelectField')

var objSchema = new Schema('Simple Object', {
    title: validators.textField({ required: true }),
    select: validators.selectField({
        valueType: validators.textField({required: true}),
        options: [
            {name: "select-me", title: "Select Me"},
            {name: "do-not-select", title: "Don't Select Me"}
        ],
        required: true
    })
})

var objUtilSchema = new Schema('Util Object', {
    title: validators.textField({ required: true }),
    select: myDynamicSelectField({
        required: true
    })
})

var objAsyncSchema = new Schema('ASYNC Object', {
    title: validators.textField({ required: true }),
    select: myDynamicSelectAsyncField({
        required: true 
    })
})

describe('Object field', function() {
    describe('with sync render', function() {
        
        it('can be rendered', function() {
            var theField = validators.objectField({
                schema: objSchema,
                required: true
            })
            var widget = registry.getAdapter(theField, IInputFieldWidget)
            var html = widget.render()
            console.log(html)
            expect(html).not.to.equal(undefined)
        });
        
        it('can be rendered', function() {
            var theField = validators.objectField({
                schema: objUtilSchema,
                required: true
            })
            var widget = registry.getAdapter(theField, IInputFieldWidget)
            var html = widget.render()
            console.log(html)
            expect(html).not.to.equal(undefined)
        });
    });

    describe('with ASYNC render', function() {

        it('can be rendered', function(done) {
            var theField = validators.objectField({
                schema: objAsyncSchema,
                required: true
            })
            var widget = registry.getAdapter(theField, IInputFieldWidget)
            var promise = widget.renderAsync()
            promise.then((html) => {
                console.log(html)
                expect(html).not.to.equal(undefined)
                done()
            })
        });
    });
});