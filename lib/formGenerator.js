'use strict'
const registry = require('component-registry').globalRegistry
const renderErrorMessage = require('isomorphic-schema').renderString
const { ITranslationUtil, IInputFieldWidget, IFieldWidgetWrapper } = require('./interfaces')
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
 * RENDER FORM FIELDS
 * 
 */
module.exports.renderForm = function (options, lang) {
  // TODO: Handle forceReadOnly setting in options to force static view
  const formSchema = options.formSchema
  const data = options.data || {}
  const customWidgets = options.customWidgets || {}
  const fieldErrors = (options.errors && options.errors.fieldErrors) || {}
  const objectNamespace = options.objectNamespace // Optional and only used for object fields
  const disabled = options.disabled // Forces all widgets to be rendered as disabled (used for list field templates)
  const renderOptions = options.renderOptions

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
      // Implementation note, we are actually rendering the IFieldWidgetWrapper, which in turn
      // renders the field widget. This gives us nicer control of the rendering.

      var fieldWidget = registry.getAdapter(formSchema._fields[key], safeGet(() => renderOptions.renderWith, IInputFieldWidget))
      var wrapper = registry.getAdapter(fieldWidget, IFieldWidgetWrapper)

      return wrapper.render({
        data: data[key],
        key: key,
        objectNamespace: objectNamespace,
        fieldValidator: formSchema._fields[key],
        fieldError: fieldErrors[key],
        invariantErrors: invariantErrors[key],
        lang: lang,
        disabled: disabled,
        submitted: options.submitted,
        renderOptions: renderOptions
      })
    }
  })

  return outp.join('\n')
}
