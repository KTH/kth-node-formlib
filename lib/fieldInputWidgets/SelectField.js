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

const {standardLabel, infoModal, getInputName, getSelectionListId} = require('./common')

const ISelectField = require('isomorphic-schema').interfaces.ISelectField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var SelectInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: ISelectField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang, { readOnly: this.context.readOnly })

    if (this.context.readOnly) {
      // If you haven't used reduce, check https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
      const optionLabel = this.context.options.reduce((prev, curr) => {
        if (curr.name === data) {
          return curr.title
        } else {
          return prev
        }
      }, undefined)
      let stuff = (optionLabel ? i18n.message(optionLabel) : (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : ''))
      if (stuff) {
        outp += '<div class="form-control-static">' + stuff + '</div>'
      }
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden"  class="form-control" name="' + inputName + '" value="' + (data || '') + '" />'
    } else {
      outp += '<span class="form-control-SelectFieldWrapper">'
      outp += '<select ' + (disabled ? 'disabled ' : '') +
        'class="form-control" name="' + inputName + '" id="' + inputName +
        '" data-selection-list-id="' + getSelectionListId(objectNamespace, key) +
        '"' + (this.context.renderOptions && this.context.renderOptions.uniqueValues ? ' data-selection-list-unique-values' : '') + '>'

      // Add a placeholder if provided
      if (this.context.placeholder) {
        outp += '<option value=""' + (!data ? ' selected' : '') + '>' + (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '') + '</option>'
      }

      // Add options
      this.context.options.forEach((opt) => {
        outp += '<option value="' + opt.name + '"' + (data === opt.name ? ' selected' : '') + '>' + (opt.title ? (i18n ? i18n.message(opt.title, lang) : opt.title) : '') + '</option>'
      })

      outp += '</select>'
      outp += '</span>' // Close select field wrapper
    }
    outp += infoModal(key, this.context, lang)

    return outp
  }
})
registry.registerAdapter(SelectInputAdapter)

var SelectDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: ISelectField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    var outp = standardLabel(key, this.context, lang, {
      hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon),
      readOnly: true
    })

    // Get selected option title
    const tmpOpt = this.context.options.reduce((prev, curr) => {
      if (!prev && curr.name === data) {
        return curr
      } else {
        return prev
      }
    })
    outp += '<div class="form-control-static">' + (tmpOpt && tmpOpt.title ? (i18n ? i18n.message(tmpOpt.title, lang) : tmpOpt.title) : '') + '</div>'

    if (!safeGet(() => renderOptions.hideInfoIcon)) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(SelectDisplayAdapter)