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

const {standardLabel, infoModal, getInputName} = require('./common')
const { renderForm, renderFormAsync } = require('../formGenerator')

const IObjectField = require('isomorphic-schema').interfaces.IObjectField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var ObjectInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IObjectField,

  renderAsync: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    renderOptions = renderOptions || {}
    renderOptions._async = true

    return this.render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets)
      .then((html) => {
        return Promise.resolve(html)
      })
  }, 


  _renderWidgetAsync: function (data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    return renderFormAsync({
      forceReadOnly: this.context.readOnly,
      formSchema: this.context.schema,
      data: data,
      objectNamespace: objectNamespace,
      errors: fieldError,
      disabled: disabled,
      submitted: submitted,
      customWidgets: customWidgets,
      renderOptions: renderOptions
    }, lang)
  },

  _renderWidgetHTML: function (data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    return renderForm({
      forceReadOnly: this.context.readOnly,
      formSchema: this.context.schema,
      data: data,
      objectNamespace: objectNamespace,
      errors: fieldError,
      disabled: disabled,
      submitted: submitted,
      customWidgets: customWidgets,
      renderOptions: renderOptions
    }, lang)
  },

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var _render = (widgetHTML) => {
      var outp = ''
      if (this.context.label) {
        outp += standardLabel(key, this.context, lang, { readOnly: this.context.readOnly })
      }

      if (this.context.readOnly) {
        outp += '<div class="form-control-static">'
        if (data) {
          outp += widget
        } else {
          outp += (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '')
        }
        outp += '</div>'
        if (!data) {
          // Marker to show that object is rendered but undefined allowing us to delete it on form submit
          outp += '<input type="hidden"  class="form-control" name="' + inputName + '" value="' + (data || '') + '" />'
        }
      } else {
        outp += widgetHTML
      }
      if (this.context.label) {
        outp += infoModal(key, this.context, lang)
      }
      return outp
    }

    
    if (safeGet(() => renderOptions._async)) {
      const promise = this._renderWidgetAsync(data, fieldError, lang, newObjectNamespace, disabled, submitted, renderOptions, customWidgets)
      return promise.then((widgetHTML) => Promise.resolve(_render(widgetHTML)))
    } else {
      const widgetHTML = this._renderWidgetHTML(data, fieldError, lang, newObjectNamespace, disabled, submitted, renderOptions, customWidgets)
      return _render(widgetHTML)
    }
  }
})
registry.registerAdapter(ObjectInputAdapter)

var ObjectListDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IObjectField,

  renderAsync: function () {
    arguments.push(true)
    return this.render.apply(this, arguments)
  },

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets, async) {
    // TODO: Implement ASYNC!
    
    // this.context is the field validator object    

    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = ''
    
    if (this.context.label) {
      var outp = standardLabel(key, this.context, lang, {
        hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon),
        readOnly: true
      })
    }

    outp += '<div class="form-control-static">'
    if (data) {
      outp += renderForm({
        forceReadOnly: true,
        formSchema: this.context.schema,
        data: data,
        objectNamespace: newObjectNamespace,
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

