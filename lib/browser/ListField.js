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
  var theRows = $(containerEl).find('.IListField-Row')
  // Hide or show the placeholder row
  var placeholderRow = $(containerEl).find('.IListField-ContentPlaceholderRow')
  if (theRows.toArray().length > 0) {
    if (!placeholderRow.hasClass('IListField-ContentPlaceholderRowHidden')) {
      placeholderRow.css('opacity', 1)
        .slideUp(400)
        .animate(
          { opacity: 0 },
          { queue: false, duration: 600 }
        ).promise().done(function () {
          placeholderRow.addClass('IListField-ContentPlaceholderRowHidden')
        })
    }
  } else {
    if (placeholderRow.hasClass('IListField-ContentPlaceholderRowHidden')) {
      placeholderRow.css('opacity', 0)
        .removeClass('IListField-ContentPlaceholderRowHidden')
        .slideDown(400)
        .animate(
          { opacity: 1 },
          { queue: false, duration: 600 }
        ).promise().done(function () {})
    }
  }

  theRows.not('.IListField-Row-To-Delete').each(function (index, el) {
    $(el).find('.form-group').each(function (i, el) {
      // Update input container id
      $(el).attr('id', 'form-group--' + dataIdTemplate.replace('{index}', index))
      // Get current id and update index
      $(el).find('.form-control').each(function (i, inputEl) {
        var $inputEl = $(inputEl)
        var name = $inputEl.attr('name')
        // Find what part contains the index we need to update
        var tmpTempl = dataIdTemplate.split('{index}')
        var startAt = tmpTempl[0].length
        var endAt = name.indexOf(']', startAt)
        // Slice at that index (putting it in an array so we can to a simple join)
        var tmp = [name.slice(0, startAt), name.slice(endAt)]
        var newId = tmp.join(index)
        // Update id and name of input control
        $inputEl.attr('name', newId)
        $inputEl.attr('id', newId)
      })
    })
  })
}

var doToggleActionBtns = function (containerEl, deletingItems) {
  var $containerEl = $(containerEl)
  var minItems = parseInt($containerEl.attr('data-min-items'))
  var maxItems = parseInt($containerEl.attr('data-max-items'))
  var nrofItems = $containerEl.children('.IListField-Row').toArray().length

  // The rows aren't deleted until the animation has completed so we need to subtract
  // nrof rows being deleted
  if ((nrofItems - (deletingItems || 0)) <= (minItems || 0)) {
    // Hide remove button and show add button
    $containerEl.find('.IListField-RemoveBtn').addClass('ActionBtnHidden')
    $containerEl.find('.IListField-AddBtn').removeClass('ActionBtnHidden')
  } else if ((nrofItems - (deletingItems || 0)) >= maxItems) {
    // Hide add button and show delete button
    $containerEl.find('.IListField-AddBtn').addClass('ActionBtnHidden')
    $containerEl.find('.IListField-RemoveBtn').removeClass('ActionBtnHidden')
  } else {
    // Show both buttons
    $containerEl.find('.IListField-AddBtn').removeClass('ActionBtnHidden')
    $containerEl.find('.IListField-RemoveBtn').removeClass('ActionBtnHidden')
  }
}

var doAddRow = function (event) {
  event.preventDefault()
  // Get container
  var containerEl = $(event.target).closest('.IListField-Container')
  // Get the id template
  var dataIdTemplate = containerEl.attr('data-id-template')
  // Get template
  var template = containerEl.find('.IListField-RowTemplate:first')
  // Clone it
  var clone = template.clone()
  clone.hide()

   // get classnames
  var classNameRGX = new RegExp('(.*)Template') // (.*)Template matches anything up to Template and returns the match
  clone.attr('class').split(' ').map(function (name) {
    var match = classNameRGX.exec(name) // exec returns [original, matched group]
    clone.removeClass(match[0]).addClass(match[1])
  })

  // Activate drag'n'drop
  var innerListContainers = clone.find('.IListField-Container').toArray()
  innerListContainers.forEach(function (container) { drake.containers.push(container) })

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
  doToggleActionBtns(containerEl)
  // Update select boxes
  doUpdateSelectionLists()
}

var doRemoveSelected = function (event) {
  // To access drake variable we needed to bind it as this
  var drake = this

  event.preventDefault()
  // Get container
  var containerEl = $(event.target).closest('.IListField-Container')
  // Get the id template
  var dataIdTemplate = containerEl.attr('data-id-template')
  // Get all checkboxes marked for remove
  var checkboxesToBeRemoved = containerEl.find('.IListField-Row--RemoveCheckbox:checked')

  // Remove any drag containers from dragula
  var tmpC = checkboxesToBeRemoved.closest('.IListField-Row').find('.IListField-Container').toArray()
  tmpC.forEach(function (el) {
    var index
    drake.containers.forEach(function (container, i) {
      if (container === el) index = i
    })
    drake.containers.splice(index, 1)
  })

  // Get rows and remove them
  checkboxesToBeRemoved.closest('.IListField-Row').slideUp(500, function () {
    $(this).remove()
    // Update select boxes with unique values when removed
    doUpdateSelectionLists()
  }).animate(
    { opacity: 0 },
    { queue: false, duration: 400 }
  )
  // Update ids in all rows (we always update all so we can share the code with remove and reorder)
  updateNames(containerEl, dataIdTemplate)
  // The rows aren't deleted until the animation has completed so the toggle action buttons function
  // needs to subtract nrof rows being deleted
  doToggleActionBtns(containerEl, checkboxesToBeRemoved.toArray().length)
}

var onToggleRemoveCheckbox = function (event) {
  // Get list container
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
  } else {
    rowContainerlEl.removeClass('IListField-Row-To-Delete')
    rowContainerlEl.find('.form-control').not('.IListField-Row--RemoveCheckbox').removeAttr('disabled')
  }
  // Update ids in all rows (we always update all so we can share the code with remove and reorder)
  updateNames(containerEl, dataIdTemplate)
}

var didUpdateSelectionInList = function (event) {
  var $el = $(event.target)
  if ($el.attr('data-selection-list-unique-values') === false || $el.attr('data-selection-list-unique-values') === undefined) {
    // Do nothing if the select el doesn't have the unique values attr
    return
  }
  // Get list container
  var containerEl = $(event.target).closest('.IListField-Container')
  // Get selection list id in a format that jQuery can use
  var selectionListId = $(event.target).attr('data-selection-list-id')
  // Get row template
  var templateRowContainerlEl = $(containerEl).children('.IListField-RowTemplate')
  // Get options
  // TODO: Need to figure out which select we are working on
  var templateListOptionsSelectEl = $(templateRowContainerlEl).find('select').toArray().filter(function (el) {
    return $(el).attr('data-selection-list-id') === selectionListId
  })[0]
  // Get all select elements for the current property
  var selectEls = $(containerEl).find('.IListField-Row select').toArray().filter(function (el) {
    return $(el).attr('data-selection-list-id') === selectionListId
  })

  var selectedOptions = selectEls.map(function (el) {
    return $(el).val()
  })
  selectedOptions = selectedOptions.filter(function (item) { return item })

  selectEls.forEach(function (el) {
    var $el = $(el)
    var selectedOptionVal = $el.val()

    // Create a copy of the template list options
    var templateListOptions = $(templateListOptionsSelectEl).clone().children('option').toArray()

    // And create the options to be applied to this element
    var newOptionEls = templateListOptions.filter(function (el) {
      var value = $(el).attr('value')
      return selectedOptions.indexOf(value) < 0 || value === selectedOptionVal
    })
    // Set the new options but remove empty entries
    $el.html(newOptionEls.filter(function (el) { return el }))
    $el.val(selectedOptionVal)
  })
}

var doUpdateSelectionLists = function () {
  // TODO: Check for data-selection-list-unique-values="true" marker
  var templateSelectEls = $('.IListField-RowTemplate select').toArray().filter(function (el) {
    var tmp = $(el).attr('data-selection-list-id')
    return tmp !== undefined && tmp !== false
  })

  templateSelectEls.forEach(function (el) {
    didUpdateSelectionInList({target: el})
  })
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
      // Prevent dropping beneath action buttons or above row template
      return target === source && ($(sibling).hasClass('IListField-Row') || $(sibling).prev().hasClass('IListField-Row'))
    }
  }

  drake = dragula(dragContainers, options)
    .on('drop', onDrop)

  $(document).on('click', '.IListField-AddBtn', doAddRow)
  $(document).on('click', '.IListField-RemoveBtn', doRemoveSelected.bind(drake))
  $(document).on('click', '.IListField-Row--RemoveCheckbox', onToggleRemoveCheckbox)
  $(document).on('change', '.IListField-Row select.form-control', didUpdateSelectionInList)
  // We need to perform the initial cleaning of lists
  doUpdateSelectionLists()
}

module.exports.cleanup = function () {
  $(document).off('click', '.IListField-AddBtn')
  $(document).off('click', '.IListField-RemoveBtn')
  $(document).off('click', '.IListField-Row--RemoveCheckbox')
  $(document).off('change', '.IListField-Row select.form-control')
  if (drake) drake.destroy()
}
