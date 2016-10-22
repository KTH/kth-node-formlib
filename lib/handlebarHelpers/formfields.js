'use strict'
const { renderFormFields } = require('../index')

module.exports = function (Handlebars) {
  /** @function formfields
   *
   * @param {object} formOptions -- options passed to form genertor
   * @param {string} lang
   *
   * @return HTML as safe string (no need to escape)
   *
   * @example
   * {{formfields formOptions lang}}
   */
  Handlebars.registerHelper('formfields', function (formOptions, lang) {
    if (typeof formOptions !== 'object') {
      throw new Error('[formfields] helper requires first parameter to be an options object to pass to form generator')
    }

    var outp = renderFormFields(formOptions, lang)

    return new Handlebars.SafeString(outp)
  })
}
