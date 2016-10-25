'use strict'
/*

  TODO: Render a simple field in list

*/
const registry = require('component-registry').globalRegistry
const createAdapter = require('component-registry').createAdapter

const ITranslationUtil = require('../interfaces').ITranslationUtil

const {safeGet} = require('safe-utils')
const {standardLabel, infoModal, getInputName} = require('./common')
const { renderField } = require('../formGenerator')

const IListField = require('isomorphic-schema').interfaces.IListField

const IInputFieldWidget = require('../interfaces').IInputFieldWidget
const IDisplayFieldWidget = require('../interfaces').IDisplayFieldWidget

var ListInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IListField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const typeName = this.context._implements[0].name
    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = '<div class="' + typeName + '-Container" data-id-template="' + newObjectNamespace + '[{index}]">'

    if (this.context.label) {
      outp += standardLabel(key, this.context, lang)
    }

    // Row template which also works as headers
    outp += '<div class="' + typeName + '-RowTemplate">'
    outp += '<span class="IListField-Row--DragHandle"></span>'
    outp += renderField({
      data: {},
      key: '',
      objectNamespace: newObjectNamespace + '[{index}]',
      fieldValidator: this.context.valueType,
      fieldError: undefined,
      invariantErrors: undefined,
      lang: lang,
      disabled: true
    })
    outp += '<input type="checkbox" class="IListField-Row--RemoveCheckbox" />'
    outp += '</div>'

    // Render all rows (defensive to handle undefined)
    data && data.forEach((dataItem, index) => {
      const rowObjectNamespace = newObjectNamespace + '[' + index + ']'
      outp += '<div class="' + typeName + '-Row">'

      if (this.context.readOnly) {
        outp += '<div class="form-control-static">'
        if (dataItem) {
          outp += renderField({
            data: dataItem,
            key: '',
            objectNamespace: rowObjectNamespace,
            fieldValidator: this.context.valueType,
            fieldError: safeGet(() => fieldError.errors[index].fieldErrors),
            invariantErrors: safeGet(() => fieldError.errors[index].invariantErrors),
            lang: lang,
            disabled: disabled,
            submitted: submitted
          })
        } else {
          outp += (this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : '')
        }
        outp += '</div>'
        if (!dataItem) {
          // Marker to show that object is rendered but undefined allowing us to delete it on form submit
          outp += '<input type="hidden" name="' + rowObjectNamespace + '" value="' + (dataItem || '') + '" />'
        }
      } else {
        outp += '<span class="IListField-Row--DragHandle"></span>'

        outp += renderField({
          data: dataItem,
          key: '',
          objectNamespace: rowObjectNamespace,
          fieldValidator: this.context.valueType,
          fieldError: safeGet(() => fieldError.errors[index]),
          invariantErrors: safeGet(() => fieldError.errors[index].invariantErrors),
          lang: lang,
          disabled: disabled,
          submitted: submitted
        })

        outp += '<input type="checkbox" class="IListField-Row--RemoveCheckbox" />'
      }

      outp += '</div>'
    })

    if (!this.context.readOnly) {
      // Row add and delete actions
      outp += '<div class="' + typeName + '-ActionButtons">'
      outp += '<a class="btn ' + typeName + '-RemoveBtn" role="button" data-row-class="' + typeName + '-Row">' + (i18n ? i18n.message('field_action_remove_selected', lang) : 'Remove selected') + '</a>'
      outp += '<button class="btn ' + typeName + '-AddBtn" data-row-class="' + typeName + '-Row">'
      outp += (i18n ? i18n.message('field_action_add', lang) : 'Add') + '</button>'
      outp += '</div>'
    }
    outp += '</div>'

    if (this.context.label) {
      outp += infoModal(key, this.context, lang)
    }
    return outp
  }
})
registry.registerAdapter(ListInputAdapter)

var ListDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IListField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled) {
    // this.context is the field validator object    

    const typeName = this.context._implements[0].name
    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = '<div class="' + typeName + '-Container" data-id-template="' + newObjectNamespace + '[{index}]">'

    if (this.context.label) {
      var outp = standardLabel(key, this.context, lang, {
        hideInfoIcon: true
      })
    }

    // Row template which also works as headers
    outp += '<div class="' + typeName + '-RowTemplate">'
    outp += '<span class="IListField-Row--DragHandle"></span>'
    outp += renderField({
      data: {},
      key: '',
      objectNamespace: newObjectNamespace + '[{index}]',
      fieldValidator: this.context.valueType,
      lang: lang,
      disabled: true,
      renderFieldsWith: this._implements[0]
    })
    outp += '</div>'

    // Render all rows (defensive to handle undefined)
    data && data.forEach((dataItem, index) => {
      const rowObjectNamespace = newObjectNamespace + '[' + index + ']'
      outp += '<div class="' + typeName + '-Row">'

      outp += '  <div class="form-control-static">'
      if (dataItem) {
        outp += renderField({
          data: dataItem,
          key: '',
          objectNamespace: rowObjectNamespace,
          fieldValidator: this.context.valueType,
          lang: lang,
          disabled: disabled,
          renderFieldsWith: this._implements[0]
        })
      }
      outp += '  </div>'

      outp += '</div>'
    })
    outp += '</div>'

    return outp
  }
})
registry.registerAdapter(ListDisplayAdapter)
