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
const { renderForm } = require('../formGenerator')

const IObjectField = require('isomorphic-schema').interfaces.IObjectField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget

var ObjectInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IObjectField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, displayOnly) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = ''
    if (this.context.label) {
      outp += standardLabel(key, this.context, lang, displayOnly)
    }

    if (displayOnly || this.context.readOnly) {
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
          displayOnly: displayOnly
        }, lang)
      } else if (!displayOnly) {
        outp += (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '')
      }
      outp += '</div>'
      if (!data && !displayOnly) {
        // Marker to show that object is rendered but undefined allowing us to delete it on form submit
        outp += '<input type="hidden" name="' + inputName + '" value="' + (data || '') + '" />'
      }
    } else {
      outp += renderForm({
        formSchema: this.context.schema,
        data: data,
        objectNamespace: newObjectNamespace,
        errors: fieldError,
        disabled: disabled,
        submitted: submitted,
        displayOnly: displayOnly
      }, lang)
    }
    if (this.context.label && !displayOnly) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(ObjectInputAdapter)
