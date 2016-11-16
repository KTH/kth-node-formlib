'use strict'
/*

  To use this input widget adapter you need to register it with your
  adapter registry.

  Custom properties for fields:

    infoModal - An info icon beside the label opens a Bootstrap modal

      infoModal: {
        title: i18n('your_i18n_label', 'Modal title'),
        bodyHTML: i18n('your_i18n_label', 'Modal body')
      }

    readOnly - Render field read only

      readOnly: true

*/
const registry = require('component-registry').globalRegistry
const createAdapter = require('component-registry').createAdapter
const { safeGet } = require('safe-utils')

const ITranslationUtil = require('../interfaces').ITranslationUtil

const {standardLabel, infoModal, getInputName} = require('./common')

const IBoolField = require('isomorphic-schema').interfaces.IBoolField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var BoolInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IBoolField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang)
    if (this.context.readOnly) {
      let stuff
      if (typeof data === 'boolean') {
          stuff = data
      } else {
          stuff = (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '')
      }
      if (stuff) {
        outp += '<div class="form-control-static">' + stuff + '</div>'
      }
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden"  class="form-control" name="' + inputName + '" value="' + (typeof data === 'boolean' ? data + '' : '') + '" />'
    } else {
      // TODO, need to handle checkbox value in an array. This won't work! Update:
      // - transformRequest.js, BoolField.js, test-transformRequest.js 
      outp += '<input type="hidden"  class="form-control" name="' + inputName + '[__bool_marker__]" value="__exists__"/>'
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="checkbox"' + (data ? ' checked' : '') + ' value="true" name="' + inputName + '[__bool_value__]" id="' + inputName + '" placeholder=" />'
    }
    outp += infoModal(key, this.context, lang)

    return outp
  }
})
registry.registerAdapter(BoolInputAdapter)

var BoolDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IBoolField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    var outp = standardLabel(key, this.context, lang, {
      hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon),
      readOnly: true
    })
    outp += '<div class="form-control-static">' + (data || '') + '</div>'

    if (!safeGet(() => renderOptions.hideInfoIcon)) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(BoolDisplayAdapter)