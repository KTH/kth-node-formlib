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

const IHTMLAreaField = require('isomorphic-schema').interfaces.IHTMLAreaField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget

var HTMLAreaInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IHTMLAreaField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, displayOnly) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang)
    // TODO: Create standard class to activate CKEditor
    // TODO: Perhaps pass config options to CKEditor?
    if (displayOnly) {
      outp += '<div class="form-control-static">' + (data || '') + '</div>'
    } else if (this.context.readOnly) {
      outp += '<div class="form-control-static">' + (data || (this.context.placeholder ? i18n.message(this.context.placeholder, lang) : '')) + '</div>'
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden" name="' + inputName + '" value="' + (data || '') + '" />'
    } else {
      outp += '<textarea ' + (disabled ? 'disabled ' : '') + 'class="form-control" name="' + inputName + '" id="editor-' + inputName + '" placeholder="' + (this.context.placeholder ? i18n.message(this.context.placeholder, lang) : '') + '">' + (data || '') + '</textarea>'
    }
    outp += (displayOnly ? '': infoModal(key, this.context, lang))
    return outp
  }
})
registry.registerAdapter(HTMLAreaInputAdapter)
