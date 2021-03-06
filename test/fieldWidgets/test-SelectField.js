
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

var IOptions = createInterface({
    name: 'IOptions'
})
createUtility({
    implements: IOptions,
    name: 'test',
    
    getOptions: function () {
        return [{name: 'one', title: 'The One'}, {name: 'two', title: 'The Two'}]
    },

    getOptionTitle: function (inp) {
        var tmp = {
            one: 'The One',
            two: 'The Two'
        }
        return tmp[inp]
    }
}).registerWith(registry)

createUtility({
    implements: IOptions,
    name: 'async',
    
    getOptions: function (inp, options, context) {
        return Promise.resolve([{name: 'one', title: 'The One'}, {name: 'two', title: 'The Two'}])
    },

    getOptionTitle: function (inp, options, context) {
        var tmp = {
            one: 'The One',
            two: 'The Two'
        }
        return Promise.resolve(tmp[inp])
    }
}).registerWith(registry)

describe('Select field', function() {
    describe('with options array', function() {
        it('can be rendered', function() {        
            var theField = validators.selectField({
                required: true,
                valueType: validators.textField({required: true}),
                options: [
                    {name: "select-me", title: "Select Me"},
                    {name: "do-not-select", title: "Don't Select Me"}
                ]});
            var fieldWidget = registry.getAdapter(theField, IInputFieldWidget)
            var html = fieldWidget.render()
            // console.log(html)
            expect(html).not.to.equal(undefined)
            const $ = loadHtml(html)
            expect($('option').toArray().length).to.equal(2)
            expect($('option').attr('value')).to.equal('select-me')
        });
    });
});