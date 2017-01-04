'use strict'
const registry = require('component-registry').globalRegistry
const ITranslationUtil = require('../interfaces').ITranslationUtil
const { safeGet } = require('safe-utils')

module.exports.classnames = function (inp) {
  var outp = Object.keys(inp).filter((key) => {
    return inp[key]
  })
  return outp.join(' ')
}

module.exports.infoModal = function (key, field, lang) {
  // Check if we should include a modal
  if (typeof field.infoModal !== 'object') return ''

  // Get unnamed translation utility or return undefined 
  const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

  const modalId = key + '__Modal'

  var outp = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog" style="display: none;">'
  outp += '  <div class="modal-dialog" role="document">'
  outp += '      <div class="modal-content">'
  outp += '          <div class="modal-header">'
  outp += '              <a type="button" class="close closeModalRedirect" aria-label="Close" data-toggle="modal" data-target="#' + key + '__Modal">'
  outp += '                  <span aria-hidden="true">×</span>'
  outp += '              </a>'
  if (field.infoModal.title) {
    outp += '              <h4 class="modal-title" id="publishModalLabel">' + (i18n ? i18n.message(field.infoModal.title, lang) : field.infoModal.title) + '</h4>'
  }
  outp += '          </div>'
  outp += '          <div class="modal-body">'
  outp += '              <div class="row">'
  outp += '                  <div class="col-md-12">'
  if (field.infoModal.bodyHTML) {
    outp += '                      <p>' + (i18n ? i18n.message(field.infoModal.bodyHTML, lang) : field.infoModal.bodyHTML) + '</p>'
  }
  outp += '                  </div>'
  outp += '              </div>'
  outp += '          </div>'
  outp += '          <div class="modal-footer">'
  outp += '              <a type="button" class="btn btn-primary closeModalRedirect" data-bind="text: ui.i18n.message(\'close_button_title\')"></a>'
  outp += '          </div>'
  outp += '      </div>'
  outp += '  </div>'
  outp += '</div>'

  return outp
}

module.exports.infoModalIcon = function (key, field) {
  // Check if we should include a modal
  if (typeof field.infoModal !== 'object') return ''

  const modalId = key + '__Modal'

  var outp = ' <span class="glyphicon glyphicon-info-sign" data-toggle="modal" data-target="#' + modalId + '"></span>'

  return outp
}

module.exports.standardLabel = function (key, field, lang, options) {
  const hideInfoIcon = safeGet(() => options.hideInfoIcon)
  const readOnly =  safeGet(() => options.readOnly)

  // Get unnamed translation utility or return undefined 
  const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

  if (readOnly) {
    var outp = '<span class="control-label">' + (i18n ? (field.label ? i18n.message(field.label, lang) : '') : field.label || '')
  } else {
    var outp = '<label class="control-label" for="' + key + '">' + (i18n ? (field.label ? i18n.message(field.label, lang) : '') : field.label || '')
  }
  outp += (hideInfoIcon ? '' : module.exports.infoModalIcon(key, field, lang))
  outp += readOnly ? '</span>' : '</label>'
  return outp
}

module.exports.getInputName = function (objectNamespace, key) {
  return (objectNamespace && key ? objectNamespace + '[' + key + ']' : objectNamespace || key)
}

module.exports.getSelectionListId = function (objectNamespace, key) {
  var tmp = (objectNamespace && key ? objectNamespace + '[' + key + ']' : objectNamespace || key)
  if (tmp) tmp = tmp.replace(/\[[0-9]+\]/g, '[{index}]')
  return tmp
}