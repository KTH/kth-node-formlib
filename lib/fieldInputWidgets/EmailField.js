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

const IEmailField = require('isomorphic-schema').interfaces.IEmailField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var EmailInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IEmailField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang, { readOnly: this.context.readOnly })
    if (this.context.readOnly) {
      outp += '<div class="form-control-static">' + (data || (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '')) + '</div>'
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden"  class="form-control" name="' + inputName + '" value="' + (data || '') + '" />'
    } else {
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="email" class="form-control" value="' + (data || '') + '" name="' + inputName + '" id="' + inputName + '" placeholder="' + (this.context.placeholder ? i18n.message(this.context.placeholder, lang) : '') + '" />'
    }
    outp += infoModal(key, this.context, lang)
    return outp
  }
})
registry.registerAdapter(EmailInputAdapter)

var EmailDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IEmailField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object    
    var outp = standardLabel(key, this.context, lang, {
      hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon),
      readOnly: true
    })
    if (!data) {
      outp += '<div class="form-control-static"></div>'
    } else {
      outp += '<div class="form-control-static"><a href="mailto:' + data + '">' + data + '</a></div>'
    }
    if (!safeGet(() => renderOptions.hideInfoIcon)) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(EmailDisplayAdapter)
