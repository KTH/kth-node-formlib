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
const Promise = require('es6-promise')

const ITranslationUtil = require('../interfaces').ITranslationUtil

const {standardLabel, infoModal, getInputName, getSelectionListId} = require('./common')

const IDynamicSelectBaseField = require('isomorphic-schema').interfaces.IDynamicSelectBaseField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var DynamicSelectInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IDynamicSelectBaseField,

  renderAsync: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions._async = true

    return this.context.getOptionsAsync(data, { lang: lang })
      .then((options) => {
        renderOptions._options = options
        return Promise.resolve(this.render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions))
      })
  }, 

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object
    
    // If we did an async call we got the options passed through renderOptions._options
    // otherwise we need to get them
    const options = safeGet(() => renderOptions._options) || this.context.getOptions(data, { lang: lang })

    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const inputName = getInputName(objectNamespace, key)
    var outp = standardLabel(key, this.context, lang, { readOnly: this.context.readOnly })

    if (this.context.readOnly) {
      // If you haven't used reduce, check https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
      const optionLabel = options.reduce((prev, curr) => {
        if (curr.name === data) {
          return curr.title
        } else {
          return prev
        }
      }, undefined)
      let stuff = (optionLabel ? optionLabel : (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : ''))
      if (stuff) {
        outp += '<div class="form-control-static">' + stuff + '</div>'
      }
      outp += '<input ' + (disabled ? 'disabled ' : '') + 'type="hidden"  class="form-control" name="' + inputName + '" value="' + (data || '') + '" />'
    } else {
      outp += '<span class="form-control-DynamicSelectFieldWrapper">'
      outp += '<select ' + (disabled ? 'disabled ' : '') +
        'class="form-control" name="' + inputName + '" id="' + inputName +
        '" data-selection-list-id="' + getSelectionListId(objectNamespace, '{index}') +
        '"' + (this.context.renderOptions && this.context.renderOptions.uniqueValues ? ' data-selection-list-unique-values' : '') + '>'

      // Add a placeholder if provided
      if (this.context.placeholder) {
        outp += '<option value=""' + (!data ? ' selected' : '') + '>' + (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '') + '</option>'
      }

      // Add options
      options.forEach((opt) => {
        outp += '<option value="' + opt.name + '"' + (data === opt.name ? ' selected' : '') + '>' + (opt.title ? opt.title : '') + '</option>'
      })

      outp += '</select>'
      outp += '</span>' // Close select field wrapper
    }
    outp += infoModal(key, this.context, lang)

    return outp
  }
})
registry.registerAdapter(DynamicSelectInputAdapter)

var DynamicSelectDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IDynamicSelectBaseField,

  renderAsync: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    return this.context.getOptionsAsync(data, { lang: lang }, true)
      .then((options) => {
        renderOptions._async = true
        renderOptions._options = options
        return Promise.resolve(this.render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions))
      })
  }, 

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions) {
    // this.context is the field validator object

    // If we did an async call we got the options passed through renderOptions._options
    // otherwise we need to get them
    const options = safeGet(() => renderOptions._options) || this.context.getOptions(data, { lang: lang })

    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)
    
    var outp = standardLabel(key, this.context, lang, {
      hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon),
      readOnly: true
    })

    // Get selected option title
    const tmpOpt = options.reduce((prev, curr) => {
      if (!prev && curr.name === data) {
        return curr
      } else {
        return prev
      }
    })
    outp += '<div class="form-control-static">' + (tmpOpt && tmpOpt.title ? tmpOpt.title : '') + '</div>'

    if (!safeGet(() => renderOptions.hideInfoIcon)) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(DynamicSelectDisplayAdapter)
