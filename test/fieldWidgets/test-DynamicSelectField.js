
/* eslint-env mocha */
'use strict'

// Testing libraries
const expect = require('chai').expect
const loadHtml = require('cheerio').load


// Our code...
const registry = require('component-registry').globalRegistry
const createUtility = require('component-registry').createUtility
const createInterface = require('component-registry').createInterface

const validators = require('isomorphic-schema').field_validators
const Schema = require('isomorphic-schema').Schema
const Promise = require('es6-promise')

const { IInputFieldWidget } = require('../../lib/interfaces')

const createObjectPrototype = require('component-registry').createObjectPrototype
const { DynamicSelectBaseField, DynamicSelectAsyncBaseField } = require('isomorphic-schema').fieldObjectPrototypes;

/**
 * MyDynamicSelectField
 */

const IMyDynamicSelectField = createInterface({
    name: 'IMyDynamicSelectField'
})

const dummyOptions = [{ name: 'one', title: 'The One'}, { name: 'two', title: 'Two'}, { name: 'three', title: 'Three'}]

const MyDynamicSelectField = createObjectPrototype({
    implements: [IMyDynamicSelectField],
    extends: [DynamicSelectBaseField],

    constructor: function (options) {
        this._IDynamicSelectBaseField.constructor.call(this, options);
        
        this.valueType = validators.textField({required: true}); 
        
    },

    getOptions: function (inp, options, context) {
        return dummyOptions
    },

    toFormattedString: function (inp) {
        return this.valueType.fromString(inp);
    },

    fromString: function (inp) {
        return this.valueType.fromString(inp);
    }
});

const myDynamicSelectField = function (options) { return new MyDynamicSelectField(options) }
module.exports.myDynamicSelectField = myDynamicSelectField

/**
 * END MyDynamicSelectField
 */

/**
 * MyDynamicSelectFieldAsync
 */

const IMyDynamicSelectAsyncField = createInterface({
    name: 'IMyDynamicSelectAsyncField'
})

const MyDynamicSelectAsyncField = createObjectPrototype({
    implements: [IMyDynamicSelectAsyncField],
    extends: [DynamicSelectAsyncBaseField],

    constructor: function (options) {
        this._IDynamicSelectAsyncBaseField.constructor.call(this, options);
        
        this.valueType = validators.textField({required: true}); 
    },

    validateAsync: function (inp, options, context) {
        var result = this._IDynamicSelectAsyncBaseField.validateAsync.call(this, inp);

        // Check if we failed validation in DynamicSelectAsyncBaseField
        if (result) return result;

        return this.getOptionsAsync()
            .then(function (options) {
                var matches = false
                for (var i = 0; i < options.length; i++) {
                    if (options[i].name === inp) {
                        matches = true
                        break
                    }
                }
            
                if (!matches) {
                    error = {
                        type: 'constraint_error',
                        message: "Valt värde finns inte i listan över tillåtna värden"
                    }
                    //console.log(error);
                    return Promise.resolve(error);
                } else {
                    return Promise.resolve(undefined);
                }
            })
    },

    getOptionsAsync: function (inp, options, context) {
        return Promise.resolve(dummyOptions)
    },

    getOptionTitleAsync: function (inp, options, context) {
        for (var i = 0; i < dummyOptions.length; i++) {
            if (dummyOptions[i].name === inp) {
                return Promise.resolve(dummyOptions[i].title)
            }
        }
        return Promise.resolve(undefined)
    },

    toFormattedString: function (inp) {
        return this.valueType.fromString(inp);
    },

    fromString: function (inp) {
        return this.valueType.fromString(inp);
    }
});

const myDynamicSelectAsyncField = function (options) { return new MyDynamicSelectAsyncField(options) }
module.exports.myDynamicSelectAsyncField = myDynamicSelectAsyncField

/**
 * END MyDynamicSelectFieldAsync
 */

describe('Dynamic Select field', function() {
    describe('with options utility', function() {
        it('can be rendered', function() {        
            var theField = myDynamicSelectField({
                required: true 
            });
        
            var fieldWidget = registry.getAdapter(theField, IInputFieldWidget)
            var html = fieldWidget.render()
            // console.log(html)
            expect(html).not.to.equal(undefined)
            const $ = loadHtml(html)
            expect($('option').toArray().length).to.equal(3)
            expect($('option').attr('value')).to.equal('one')

        });
        
    });

    describe('with ASYNC options utility', function() {
        it('can be rendered', function(done) {        
            var theField = myDynamicSelectAsyncField({
                required: true 
            });
        
            var fieldWidget = registry.getAdapter(theField, IInputFieldWidget)
            fieldWidget.renderAsync()
              .then((html) => {
                // console.log(html)
                expect(html).not.to.equal(undefined)
                const $ = loadHtml(html)
                expect($('option').toArray().length).to.equal(3)
                expect($('option').attr('value')).to.equal('one')
                done()
              })
        });
    });
});