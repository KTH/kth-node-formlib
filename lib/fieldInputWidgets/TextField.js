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

const ITranslationUtil = require('../interfaces').ITranslationUtil

const {standardLabel, infoModal, getInputName} = require('./common')

const ITextField = require('isomorphic-schema').interfaces.ITextField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var TextInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: ITextField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang)
    if (this.context.readOnly) {
      let stuff = (data || (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : ''))
      if (stuff) {
        outp += '<div class="form-control-static">' + stuff + '</div>'
      }
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden" name="' + inputName + '" value="' + (data || '') + '" />'
    } else {
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="text" class="form-control" value="' + (data || '') + '" name="' + inputName + '" id="' + inputName + '" placeholder="' + (this.context.placeholder ? i18n.message(this.context.placeholder, lang) : '') + '" />'
    }
    outp += infoModal(key, this.context, lang)

    return outp
  }
})
registry.registerAdapter(TextInputAdapter)

var TextDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: ITextField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled) {
    // this.context is the field validator object    
    var outp = standardLabel(key, this.context, lang, {
      hideInfoIcon: true
    })
    outp += '<div class="form-control-static">' + data + '</div>'
    return outp
  }
})
registry.registerAdapter(TextDisplayAdapter)