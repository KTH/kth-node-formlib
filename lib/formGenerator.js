'use strict'
const registry = require('component-registry').globalRegistry
const renderErrorMessage = require('isomorphic-schema').renderString
const { ITranslationUtil, IInputFieldWidget } = require('./interfaces')
const { IObjectField, IListField } = require('isomorphic-schema').interfaces
const { safeGet } = require('safe-utils')
const { getInputName } = require('./fieldInputWidgets/common')

function classnames (inp) {
  var outp = Object.keys(inp).filter((key) => {
    return inp[key]
  })
  return outp.join(' ')
}

/**
 * 
 * RENDER SINGLE FIELD
 * 
 */
module.exports.renderField = function (options) {
  const data = options.data
  const key = options.key
  const objectNamespace = options.objectNamespace
  const fieldValidator = options.fieldValidator
  const fieldError = options.fieldError
  const invariantErrors = options.invariantErrors
  const lang = options.lang
  const disabled = options.disabled
  const submitted = options.submitted
  const renderFieldsWith = options.renderFieldsWith

  const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

  // Consolidating field error with invariant error(s) if there are any
  var i18nErrorMsg = safeGet(() => fieldError.i18nLabel)
  var errorMessages = invariantErrors || []
  if (i18nErrorMsg) {
    errorMessages.push(
      renderErrorMessage(
        (i18n ? i18n.message(i18nErrorMsg, lang) : i18nErrorMsg), 
        fieldValidator
      )
    )
  } else if (safeGet(() => fieldError.label)) {
    errorMessages.push(
      renderErrorMessage(safeGet(() => fieldError.label), 
        fieldValidator
      )
    )
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

  var outp = registry.getAdapter(fieldValidator, renderFieldsWith || IInputFieldWidget).render(key, data, fieldError, lang, objectNamespace, disabled, submitted)
  var helpBlockClassNames = {
    'help-block': true,
    'help-block-isEmpty': !helpLabel
  }
  outp += '<p class="' + classnames(helpBlockClassNames) + '">' + helpLabel + '</p>'
  return '<div class="' + classnames(rowClassNames) + '" id="' + rowId + '">' + outp + '</div>'
}

/**
 * 
 * RENDER FORM FIELDS
 * 
 */
module.exports.renderForm = function (options, lang) {
  // TODO: Handle forceReadOnly setting in options to force static view
  var formSchema = options.formSchema
  var data = options.data || {}
  var customWidgets = options.customWidgets || {}
  var fieldErrors = (options.errors && options.errors.fieldErrors) || {}
  var objectNamespace = options.objectNamespace // Optional and only used for object fields
  var disabled = options.disabled // Forces all widgets to be rendered as disabled (used for list field templates)
  var renderFieldsWith = options.renderFieldsWith

  const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

  // Convert from array to object to speed up large forms
  var excludeFields = {}
  Array.isArray(options.excludeFields) && options.excludeFields.forEach(function (field) {
    excludeFields[field] = true
  })

  // Convert from array to object to speed up large forms
  var onlyFields
  if (Array.isArray(options.onlyFields)) {
    onlyFields = {}
    options.onlyFields.forEach(function (field) {
      onlyFields[field] = true
    })
  }

  // Unpack the invariant errors so they can be found by field key
  var invariantErrors = {}
  options.errors && options.errors.invariantErrors && options.errors.invariantErrors.forEach((err) => {
    err.fields.forEach((fieldName) => {
      if (!invariantErrors[fieldName]) invariantErrors[fieldName] = []
      invariantErrors[fieldName].push(i18n ? i18n.message(err.message, lang) : err.message)
    })
  })

  var outp = Object.keys(formSchema._fields).map(function (key) {
    // Call the validationConstraint methods to figure out if the field should be validated
    const shouldValidate = formSchema._validationConstraints.reduce((prev, curr) => {
      return prev && curr(data, key)
    }, true)

    if (onlyFields && onlyFields[key] === undefined) {
      // If onlyField is set, check that this field is in the list
      return ''
    } else if (onlyFields === undefined && excludeFields[key]) {
      // If onlyFields isn't set, check if this field should be excluded
      return ''
    } else if (!shouldValidate) {
      // Check if this field should be validated according to validation constraint, otherwise don't render it
      // because we shouldn't show fields that won't be validated
      return ''
    } else if (customWidgets[key]) {
      // Check if a custom widget has been provided, in which case call it
      return customWidgets[key](data, formSchema, key, options.errors)
    } else {
      // If we come this far we should render the widget using the standard field widgets

      return module.exports.renderField({
        data: data[key],
        key: key,
        objectNamespace: objectNamespace,
        fieldValidator: formSchema._fields[key],
        fieldError: fieldErrors[key],
        invariantErrors: invariantErrors[key],
        lang: lang,
        disabled: disabled,
        submitted: options.submitted,
        renderFieldsWith: renderFieldsWith
      })
    }
  })

  return outp.join('\n')
}
