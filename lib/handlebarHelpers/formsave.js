'use strict'
const registry = require('component-registry').globalRegistry
const ITranslationUtil = require('../interfaces').ITranslationUtil

module.exports = function (Handlebars) {
  /** @function formsave
   *
   * @param {object} cancelUrl -- where to go when pressing cancel
   * @param {string} lang
   *
   * @return HTML as safe string (no need to escape)
   *
   * @example
   * {{formsave cancelUrl lang}}
   */
  Handlebars.registerHelper('formsave', function (cancelUrl, lang) {
    // Get unnamed translation utility or return undefined 
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    if (typeof cancelUrl !== 'string') {
      throw new Error('[formsave] helper requires first parameter to be a string of url type')
    }

    var outp = '<div class="pull-right">'
    outp += '  <button type="button" class="btn btn-secondary" onclick="window.location.href=\''+ cancelUrl + '\'">' + (i18n ? i18n.message('field_label_cancel', lang) : 'Cancel') + '</button>'
    outp += '  <button type="submit" class="btn btn-primary">' + (i18n ? i18n.message('field_label_save', lang) : 'Save') + '</button>'
    outp += '</div>'

    return new Handlebars.SafeString(outp)
  })
}
