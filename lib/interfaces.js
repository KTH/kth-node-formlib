'use strict'

var createInterface = require('component-registry').createInterface

module.exports.IFieldWidgetWrapper = createInterface({
  // Render the objects schema as a form
  name: 'IFieldWidgetWrapper',
  // Render an object schema as a HTML form
  members: {
    render: 'function (options)'
  }
})

module.exports.IInputFieldWidget = createInterface({
  // Render the objects schema as a form
  name: 'IInputFieldWidget',
  // Render an object schema as a HTML form
  members: {
    render: 'function (data, fieldError)'
  }
})

module.exports.IDisplayFieldWidget = createInterface({
  // Render the objects schema as a form
  name: 'IDisplayFieldWidget',
  // Render an object schema as a HTML form
  members: {
    render: 'function (data, fieldError)'
  }
})

module.exports.ITranslationUtil = createInterface({
  // Render the objects schema as a form
  name: 'ITranslationUtil',
  // Render an object schema as a HTML form
  members: {
    message: 'function (label, lang) -- translate label to given language'
  }
})
