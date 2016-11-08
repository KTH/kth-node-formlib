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
const { renderForm } = require('../formGenerator')

const IObjectField = require('isomorphic-schema').interfaces.IObjectField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var ObjectInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IObjectField,

  render: function render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = ''
    if (this.context.label) {
      outp += standardLabel(key, this.context, lang)
    }

    if (this.context.readOnly) {
      outp += '<div class="form-control-static">'
      if (data) {
        outp += renderForm({
          forceReadOnly: true,
          formSchema: this.context.schema,
          data: data,
          objectNamespace: newObjectNamespace,
          errors: fieldError,
          disabled: disabled,
          submitted: submitted,
          customWidgets: customWidgets,
          renderOptions: renderOptions
        }, lang)
      } else {
        outp += (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '')
      }
      outp += '</div>'
      if (!data) {
        // Marker to show that object is rendered but undefined allowing us to delete it on form submit
        outp += '<input type="hidden"  class="form-control" name="' + inputName + '" value="' + (data || '') + '" />'
      }
    } else {
      outp += renderForm({
        formSchema: this.context.schema,
        data: data,
        objectNamespace: newObjectNamespace,
        errors: fieldError,
        disabled: disabled,
        submitted: submitted,
        customWidgets: customWidgets,
        renderOptions: renderOptions
      }, lang)
    }
    if (this.context.label) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(ObjectInputAdapter)

var ObjectListDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IObjectField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    // this.context is the field validator object    

    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = ''
    
    if (this.context.label) {
      var outp = standardLabel(key, this.context, lang, {
        hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon)
      })
    }

    outp += '<div class="form-control-static">'
    if (data) {
      outp += renderForm({
        forceReadOnly: true,
        formSchema: this.context.schema,
        data: data,
        objectNamespace: newObjectNamespace,
        renderOptions: renderOptions,
        customWidgets: customWidgets,
        renderOptions: renderOptions
      }, lang)
    }
    outp += '</div>'
    
    if (!safeGet(() => renderOptions.hideInfoIcon)) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(ObjectListDisplayAdapter)

