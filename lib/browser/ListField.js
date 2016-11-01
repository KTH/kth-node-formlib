/**
 * This requires dragula.js drag'n'drop library and jquery
*/
var $ = require('jquery')
var dragula = window.dragula

var onDrop = function (el, target, source, sibling) {
  var dataIdTemplate = $(target).attr('data-id-template')
  updateNames(target, dataIdTemplate)
}

var updateNames = function (containerEl, dataIdTemplate) {
  $(containerEl).find('.IListField-Row').not('.IListField-Row-To-Delete').each(function (index, el) { 
    $(el).find('.form-group').each(function (i, el) {
      // Update input container id
      $(el).attr('id', 'form-group--' + dataIdTemplate.replace('{index}', index))
      // Get current id and update index
      var inputEl = $(el).find('.form-control')
      var name = inputEl.attr('name')
      // Find what part contains the index we need to update
      var tmpTempl = dataIdTemplate.split('{index}')
      var startAt = tmpTempl[0].length
      var endAt = name.indexOf(']', startAt)
      // Slice at that index (putting it in an array so we can to a simple join)
      var tmp = [name.slice(0, startAt), name.slice(endAt)]
      var newId = tmp.join(index)
      // Update id and name of input control
      inputEl.attr('name', newId)
      inputEl.attr('id', newId)
    })
  })
}

var doAddRow = function (event) {
  event.preventDefault()
  // Get container
  var containerEl = $(event.target).closest('.IListField-Container')
  // Get the id template
  var dataIdTemplate = containerEl.attr('data-id-template')
  // Get template
  var template = containerEl.find('.IListField-RowTemplate')
  // Clone it
  var clone = template.clone()
  clone.hide()
  clone.removeClass('IListField-RowTemplate').addClass('IListField-Row')
  // Enable all inputs etc.
  // Clear values in cloned row
  clone.find('.form-control').each(function (index, el) {
    // Reset value of all input fields
    // TODO: Handle Select and TextArea
    // NOTE: using jQuery .attr('value', '') doesn't update the content in Chrome so doing both ways
    el.value = ''
    $(el).attr('value', '')
    $(el).removeAttr('disabled')
  })
  // Inject the clone after the last row
  var lastRow = containerEl.children('.IListField-Row, .IListField-RowTemplate').last()
  if (lastRow.length > 0) {
    lastRow.after(clone)
  } else {
    containerEl.prepend(clone)
  }
  clone.css('opacity', 0)
    .slideDown(400)
    .animate(
      { opacity: 1 },
      { queue: false, duration: 600 }
    ).promise().done(function () {
      clone.removeAttr('style')
    })
  // Activate the remove checkbox handler
  clone.on('click', onToggleRemoveCheckbox)
  // Update ids in all rows (we always update all so we can share the code with remove and reorder)
  updateNames(containerEl, dataIdTemplate)
}

var doRemoveSelected = function (event) {
  event.preventDefault()
  // Get container
  var containerEl = $(event.target).closest('.IListField-Container')
  // Get the id template
  var dataIdTemplate = containerEl.attr('data-id-template')
  // Get all checkboxes marked for remove
  var checkboxesToBeRemoved = containerEl.find('.IListField-Row--RemoveCheckbox:checked')
  // Get rows and remove them
  checkboxesToBeRemoved.parent('.IListField-Row').slideUp(500, function () {
    $(this).remove()
  }).animate(
    { opacity: 0 },
    { queue: false, duration: 400 }
  )
  // Update ids in all rows (we always update all so we can share the code with remove and reorder)
  updateNames(containerEl, dataIdTemplate)
}

var onToggleRemoveCheckbox = function (event) {
  // Get form container
  var containerEl = $(event.target).closest('.IListField-Container')
  // Get the id template
  var dataIdTemplate = containerEl.attr('data-id-template')
  // Get the row to be deleted
  var rowContainerlEl = $(event.target).closest('.IListField-Row')
  // Do row manipulation to mark as deleted
  if (event.target.checked) {
    rowContainerlEl.addClass('IListField-Row-To-Delete')
    rowContainerlEl.find('.form-control').not('.IListField-Row--RemoveCheckbox')
      .attr('disabled', 'true')
      .removeAttr('name')
      .removeAttr('id')
  } else {
    rowContainerlEl.removeClass('IListField-Row-To-Delete')
    rowContainerlEl.find('.form-control').not('.IListField-Row--RemoveCheckbox').removeAttr('disabled')
  }
  // Update ids in all rows (we always update all so we can share the code with remove and reorder)
  updateNames(containerEl, dataIdTemplate)
}

var drake
module.exports.init = function () {
  
  var dragContainers = $('.IListField-Container').toArray()
  var options = {
    direction: 'vertical',
    moves: function (el, container, handle) {
      return $(handle).hasClass('IListField-Row--DragHandle')
    },
    accepts: function (el, target, source, sibling) {
      return target === source
    }
  }

  drake = dragula(dragContainers, options)
    .on('drop', onDrop)

  $('.IListField-AddBtn').on('click', doAddRow)
  $('.IListField-RemoveBtn').on('click', doRemoveSelected)
  $('.IListField-Row--RemoveCheckbox').on('click', onToggleRemoveCheckbox)
}

module.exports.cleanup = function () {
  $('.IListField-AddBtn').off('click', doAddRow)
  $('.IListField-RemoveBtn').off('click', doRemoveSelected)
  $('.IListField-Row--RemoveCheckbox').off('click', onToggleRemoveCheckbox)
  if (drake) drake.destroy()
}
