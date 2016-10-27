'use strict'
const registry = require('component-registry').globalRegistry
const createAdapter = require('component-registry').createAdapter
const renderErrorMessage = require('isomorphic-schema').renderString
const { ITranslationUtil, IFieldWidgetWrapper, IInputFieldWidget, IDisplayFieldWidget } = require('../interfaces')
const { IObjectField, IListField } = require('isomorphic-schema').interfaces
const { safeGet } = require('safe-utils')
const { getInputName, classnames } = require('./common')

/**
 * 
 * RENDER SINGLE FIELD
 * 
 */
const _renderField = function (options) {
  const data = options.data
  const key = options.key
  const objectNamespace = options.objectNamespace
  const fieldValidator = options.fieldValidator
  const fieldError = options.fieldError
  const invariantErrors = options.invariantErrors
  const lang = options.lang
  const disabled = options.disabled
  const submitted = options.submitted
  const renderOptions = options.renderOptions

  // Skip field if empty when renderOptions.skipIfEmpty == true
  if (safeGet(() => renderOptions.skipIfEmpty) && !data) {
    return ''
  }

  const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

  // Consolidating field error with invariant error(s) if there are any
  var errorMessages = invariantErrors || []
  if (safeGet(() => fieldError.i18nLabel)) {
    // Use i18n label if we got a ITranslationUtil
    errorMessages.push(renderErrorMessage(
      (i18n ? i18n.message(fieldError.i18nLabel, lang) : fieldError.i18nLabel),
      fieldValidator)
    )
  } else if (safeGet(() => fieldError.message)) {
    // Otherwise just use the regular english error message
    errorMessages.push(renderErrorMessage(fieldError.message, fieldValidator))
  }

  var helpMsg = fieldValidator.help ? (i18n ? i18n.message(fieldValidator.help, lang) : fieldValidator.help) : undefined
  var helpLabel = (helpMsg ? helpMsg + ' ' : '') + (errorMessages.length > 0 ? '(' + errorMessages.join(', ') + ')' : '')

  const isFormGroup = !(IObjectField.providedBy(fieldValidator) || IListField.providedBy(fieldValidator))
  var rowClassNames = {
    'form-group': isFormGroup,
    'has-error': errorMessages.length > 0,
    'has-success': submitted && (errorMessages.length === 0)
  }
  // Add a field type specific class for general styling
  const tmpClassNames = fieldValidator._implements.map((intrfc) => 'FieldType-' + intrfc.name).join(' ')
  rowClassNames[tmpClassNames] = true
  // Set the row id but in lists we don't get the key so then just use objectNamespace
  const rowId = (isFormGroup ? 'form-group--' : '') + getInputName(objectNamespace, key)
  // this.context is the field widget we want to render 
  var outp = this.context.render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions)
  var helpBlockClassNames = {
    'help-block': true,
    'help-block-isEmpty': !helpLabel
  }

  // We may NOT hide helptexts if we render with the default IInputFieldWidget
  if (!safeGet(() => renderOptions.hideHelpTexts)) {
    outp += '<p class="' + classnames(helpBlockClassNames) + '">' + helpLabel + '</p>'
  }
  return '<div class="' + classnames(rowClassNames) + '" id="' + rowId + '">' + outp + '</div>'
}

const InputFieldWidgetWapper = createAdapter({
  implements: IFieldWidgetWrapper,
  adapts: IInputFieldWidget,
  render: function (options) {
    safeGet(() => delete options.renderOptions.hideHelpTexts) 
    return _renderField.call(this, options)
  }
}).registerWith(registry)

const DisplayFieldWidgetWapper = createAdapter({
  implements: IFieldWidgetWrapper,
  adapts: IDisplayFieldWidget,
  render: function (options) { 
    return _renderField.call(this, options)
  }
}).registerWith(registry)