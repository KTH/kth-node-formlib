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

const IHTMLAreaField = require('isomorphic-schema').interfaces.IHTMLAreaField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var HTMLAreaInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IHTMLAreaField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang, { readOnly: this.context.readOnly })
    // TODO: Create standard class to activate CKEditor
    // TODO: Perhaps pass config options to CKEditor?
    if (this.context.readOnly) {
      outp += '<div class="form-control-static">' + (data || (this.context.placeholder ? i18n.message(this.context.placeholder, lang) : '')) + '</div>'
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden"  class="form-control" name="' + inputName + '" value="' + (data || '') + '" />'
    } else {
      // IMPORTANT: This is a hack, because CHROME doesn't render icons in xhr-loaded content. This affects our plugins that loads content in modals
      // especially the kth file browser. I believe it is related to the following bug in chrome:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=336476
      outp += '<button  class="btn btn-xs" style="height: 0; width: 0; border: 0; padding: 0"><i style="visibility: hidden;" class="glyphicon glyphicon-picture txt-color-white"></i></button>'
      outp += '<textarea ' + (disabled ? 'disabled ' : '') + 'class="form-control" name="' + inputName + '" id="editor-' + inputName + '" placeholder="' + (this.context.placeholder ? i18n.message(this.context.placeholder, lang) : '') + '">' + (data || '') + '</textarea>'
    }
    outp += infoModal(key, this.context, lang)
    return outp
  }
})
registry.registerAdapter(HTMLAreaInputAdapter)

var HTMLAreaDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IHTMLAreaField,

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
registry.registerAdapter(HTMLAreaDisplayAdapter)