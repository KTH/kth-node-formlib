'use strict'

module.exports = {
  // Render all fields in provided schema
  renderFormFields: require('./formGenerator').renderForm,
  renderFormFieldsAsync: require('./formGenerator').renderFormAsync,
  // Render a single field
  renderField: require('./formGenerator').renderField,
  // Package interfaces
  interfaces: require('./interfaces'),
  // Some view helper methods and registering field input widgets
  fieldInputWidgetHelpers: require('./fieldInputWidgets'),
  // Method to call in order to register handlebar helpers
  registerHandlebarHelpers: require('./handlebarHelpers'),
  // Helpers to unpack errors etc.
  apiHelpers: require('./apiHelpers')
}
