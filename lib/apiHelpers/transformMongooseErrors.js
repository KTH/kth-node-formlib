'use strict'

/**
 * 
 * Use this method to convert Mongoose style error objects to the object
 * structure that kth-node-formlib can understand.
 * 
 */
function _addFieldError (formErrors, propName, error) {
  if (formErrors.fieldErrors === undefined) {
    formErrors.fieldErrors = {}
  }
  if (error.hasOwnProperty('path')) {
    // Only Mongoose errors have the property path so repack it as an isomorphic-schema compatible error
    formErrors.fieldErrors[propName] = {
      // TODO: i18n?
      message: error.message
    }
  } else {
    formErrors.fieldErrors[propName] = error
  }
}

function _addNestedFieldError (formErrors, propName, error) {
  var tmp = propName.split('.')

  if (tmp.length !== 2) {
    throw new Error('This method only supports a single nested level')
  }

  if (formErrors.fieldErrors === undefined) {
    formErrors.fieldErrors = {}
  }

  if (!formErrors.fieldErrors.hasOwnProperty(tmp[0])) {
    formErrors.fieldErrors[tmp[0]] = {
      // TODO: i18n?
      message: 'Subform contains errors'
    }
  }

  _addFieldError(formErrors.fieldErrors[tmp[0]], tmp[1], error)
}

module.exports = function unpackErrors (errors) {
  if (errors === undefined) {
    return
  }

  var formErrors = {}
  Object.keys(errors).forEach((key) => {
    var tmp = key.split('.')
    if (tmp.length > 1 && errors.hasOwnProperty(tmp[0])) {
      // We traverse the hierarchy so need to skip the flattened duplicates
      return
    }

    if (tmp.length === 2) {
      _addNestedFieldError(formErrors, key, errors[key])
    } else if (errors[key].errors) {
      _addFieldError(formErrors, key, unpackErrors(errors[key].errors))
    } else {
      _addFieldError(formErrors, key, errors[key])
    }
  })
  return formErrors
}