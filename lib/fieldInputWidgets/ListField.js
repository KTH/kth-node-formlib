'use strict'
/*

  TODO: Render a simple field in list

*/
const registry = require('component-registry').globalRegistry
const createAdapter = require('component-registry').createAdapter
const { safeGet } = require('safe-utils')
const classnames = require('classnames')

const {standardLabel, infoModal, getInputName} = require('./common')
const renderString = require('isomorphic-schema').renderString

const IListField = require('isomorphic-schema').interfaces.IListField

const { ITranslationUtil, IFieldWidgetWrapper, IInputFieldWidget, IDisplayFieldWidget } = require('../interfaces')

function _renderWrapper (wrapper, options) {
  if (options && options.renderOptions && options.renderOptions._async) {
    return wrapper.renderAsync(options)
  } else {
    return wrapper.render(options)
  }
}

function createListFieldCls (typeName, suffix) {
    var outpCls = {}
    outpCls[typeName + suffix] = true
    if (typeName !== 'IListField') {
      outpCls['IListField' + suffix] = true
    }
    return outpCls
}

var ListInputAdapter = createAdapter({
  implements: IInputFieldWidget,
  adapts: IListField,

  renderAsync: function render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    renderOptions = renderOptions || {}
    renderOptions._async = true

    return this.render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets)
      .then((html) => {
        return Promise.resolve(html)
      })
  },

  render: function render(key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    // this.context is the field validator object
    const i18n = registry.getUtility(ITranslationUtil, undefined, undefined)

    const typeName = this.context._implements[0].name
    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = []
    outp.push('<div class="' + classnames(createListFieldCls(typeName, '-Container')) + '" data-id-template="' + newObjectNamespace + '[{index}]" data-max-items="' + (this.context._maxItems || '') + '" data-min-items="' + (this.context._minItems || '') + '">')

    if (this.context.label) {
      outp.push(standardLabel(key, this.context, lang, { readOnly: this.context.readOnly }))
    }

    // Get the field renderers
    var fieldWidget = registry.getAdapter(this.context.valueType, IInputFieldWidget)
    var wrapper = registry.getAdapter(fieldWidget, IFieldWidgetWrapper)

    // Row template which also works as headers
    outp.push('<div class="' + classnames(createListFieldCls(typeName, '-RowTemplate')) + '">')
    outp.push('<span class="IListField-Row--DragHandle"></span>')

    outp.push(_renderWrapper(wrapper, {
      data: {},
      key: '',
      objectNamespace: newObjectNamespace + '[{index}]',
      fieldValidator: this.context.valueType,
      fieldError: undefined,
      invariantErrors: undefined,
      lang: lang,
      disabled: true,
      customWidgets: customWidgets,
      renderOptions: renderOptions
    }))

    outp.push('<label class="IListField-Row--RemoveCheckboxLabel"><input type="checkbox" class="IListField-Row--RemoveCheckbox" />' + (i18n ? i18n.message('kth_node_formlib--row_remove', lang) : 'Remove')  + '</label>')
    outp.push('</div>')

    // Render all rows (defensive to handle undefined)
    data && data.forEach((dataItem, index) => {
      const rowObjectNamespace = newObjectNamespace + '[' + index + ']'
      outp.push('<div class="' + classnames(createListFieldCls(typeName, '-Row')) + '">')

      if (this.context.readOnly) {
        outp.push('<div class="form-control-static">')
        if (dataItem) {
          outp.push(_renderWrapper(wrapper, {
            data: dataItem,
            key: '',
            objectNamespace: rowObjectNamespace,
            fieldValidator: this.context.valueType,
            fieldError: safeGet(() => fieldError.errors[index].fieldErrors),
            invariantErrors: safeGet(() => fieldError.errors[index].invariantErrors),
            lang: lang,
            disabled: disabled,
            submitted: submitted,
            customWidgets: customWidgets,
            renderOptions: renderOptions
          }))
        }
        outp.push('</div>')
        if (!dataItem) {
          // Marker to show that object is rendered but undefined allowing us to delete it on form submit
          outp.push('<input type="hidden"  class="form-control" name="' + rowObjectNamespace + '" value="' + (dataItem || '') + '" />')
        }
      } else {
        outp.push('<span class="IListField-Row--DragHandle"></span>')

        outp.push(_renderWrapper(wrapper, {
          data: dataItem,
          key: '',
          objectNamespace: rowObjectNamespace,
          fieldValidator: this.context.valueType,
          fieldError: safeGet(() => fieldError.errors[index]),
          invariantErrors: safeGet(() => fieldError.errors[index].invariantErrors),
          lang: lang,
          disabled: disabled,
          submitted: submitted,
          customWidgets: customWidgets,
          renderOptions: renderOptions
        }))

        outp.push('<label class="IListField-Row--RemoveCheckboxLabel"><input type="checkbox" class="IListField-Row--RemoveCheckbox" />' + (i18n ? i18n.message('kth_node_formlib--row_remove', lang) : 'Remove')  + '</label>')
      }

      outp.push('</div>')
    })

    if (this.context.placeholder) {
      outp.push('<div class="IListField-ContentPlaceholderRow' + (safeGet(() => data.length > 0, false) ? ' IListField-ContentPlaceholderRowHidden' : '') + '">')
      outp.push(renderString((this.context.placeholder ? (i18n ? i18n.message(this.context.placeholder, lang) : this.context.placeholder) : ''), this.context))
      outp.push('</div>')
    }

    if (!this.context.readOnly) {
      // Row add and delete actions
      var removeBtnCls = createListFieldCls(typeName, '-RemoveBtn')
      removeBtnCls['btn'] = true
        // Only show remove button if we have more than zero items and more than minItems
      removeBtnCls['ActionBtnHidden'] = (this.context._minItems ? this.context._minItems >= (data && data.length || 0) : (data && data.length || 0) <= 0)
      

      var addBtnCls = createListFieldCls(typeName, '-AddBtn')
      addBtnCls['btn'] = true
      // Only show remove button if we have more than zero items and more than minItems
      addBtnCls['ActionBtnHidden'] = (this.context._maxItems ? (this.context._maxItems || 0) <= (data && data.length || 0) : false)

      outp.push('<div class="' + classnames(createListFieldCls(typeName, '-ActionButtons')) + '">')
      outp.push('<a class="' + classnames(removeBtnCls) + '" role="button" data-row-class="' + classnames(createListFieldCls(typeName, '-Row')) + '">' + (i18n ? i18n.message('field_action_remove_selected', lang) : 'Remove selected') + '</a>')
      outp.push('<button class="' + classnames(addBtnCls) + '" data-row-class="' + classnames(createListFieldCls(typeName, '-Row')) + '">')
      outp.push((i18n ? i18n.message('field_action_add', lang) : 'Add') + '</button>')
      outp.push('</div>')
    }
    // We usually want to float the action bar so need a clearfix here
    outp.push('<div class="' + classnames(createListFieldCls(typeName, '-ActionButtonsClearfix')) + '"></div>')
    outp.push('</div>')

    if (this.context.label) {
      outp.push(infoModal(key, this.context, lang))
    }

    if (renderOptions && renderOptions._async) {
      var promises = outp.map(function (item) {
        if (item && item.then) {
          return item
        } else {
          return Promise.resolve(item)
        }
      })
      return Promise.all(promises)
        .then(function (results) {
          return Promise.resolve(results.join("\n"))
        })
    } else {
      return outp.join("\n")
    }
  }
})
registry.registerAdapter(ListInputAdapter)

var ListDisplayAdapter = createAdapter({
  implements: IDisplayFieldWidget,
  adapts: IListField,

  render: function (key, data, fieldError, lang, objectNamespace, disabled, submitted, renderOptions, customWidgets) {
    // this.context is the field validator object

    const typeName = this.context._implements[0].name
    const inputName = getInputName(objectNamespace, key)
    // Need new object namespace for renderForm (it is the same as this field's inputName)
    const newObjectNamespace = inputName

    var outp = []
    outp.push('<div class="' + classnames(createListFieldCls(typeName, '-Container')) + '" data-id-template="' + newObjectNamespace + '[{index}]">')

    if (this.context.label) {
      outp.push(standardLabel(key, this.context, lang, {
        hideInfoIcon: safeGet(() => renderOptions.hideInfoIcon),
        readOnly: true
      }))
    }

    // Get the field renderers
    var fieldWidget = registry.getAdapter(this.context.valueType, this._implements[0])
    var wrapper = registry.getAdapter(fieldWidget, IFieldWidgetWrapper)

    // Row template which also works as headers
    outp.push('<div class="' + classnames(createListFieldCls(typeName, '-RowTemplate')) + '">')
    outp.push('<span class="IListField-Row--DragHandle"></span>')
    outp.push(_renderWrapper(wrapper, {
      data: [],
      key: '',
      objectNamespace: newObjectNamespace + '[{index}]',
      fieldValidator: this.context.valueType,
      lang: lang,
      renderFieldsWith: this._implements[0],
      customWidgets: customWidgets,
      renderOptions: renderOptions
    }))
    outp.push('</div>')

    // Render all rows (defensive to handle undefined)
    data && data.forEach((dataItem, index) => {
      const rowObjectNamespace = newObjectNamespace + '[' + index + ']'
      outp.push('<div class="' + classnames(createListFieldCls(typeName, '-Row')) + '">')

      outp.push('  <div class="form-control-static">')
      if (dataItem) {
        outp.push(_renderWrapper(wrapper, {
          data: dataItem,
          key: '',
          objectNamespace: rowObjectNamespace,
          fieldValidator: this.context.valueType,
          lang: lang,
          renderFieldsWith: this._implements[0],
          customWidgets: customWidgets,
          renderOptions: renderOptions
        }))
      }
      outp.push('  </div>')

      outp.push('</div>')
    })
    outp.push('</div>')

    if (!safeGet(() => renderOptions.hideInfoIcon)) {
      outp.push(infoModal(key, this.context, lang))
    }
    
    if (renderOptions && renderOptions._async) {
      var promises = outp.map(function (item) {
        if (item && item.then) {
          return item
        } else {
          return Promise.resolve(item)
        }
      })
      return Promise.all(promises)
        .then(function (results) {
          return Promise.resolve(results.join("\n"))
        })
    } else {
      return outp.join("\n")
    }
  }
})
registry.registerAdapter(ListDisplayAdapter)
