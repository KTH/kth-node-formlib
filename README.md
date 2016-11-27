# kth-node-formlib #
[![Build Status](https://travis-ci.org/KTH/kth-node-formlib.svg?branch=master)](https://travis-ci.org/KTH/kth-node-formlib)

Render Bootstrap 3 style forms for Express.js using isomorphic-schema definitions.

## i18n ##

If you don't implement i18n support forms will be renderedª with english labels. To use your
app specific translations you need to create and register a ITranslationUtil
with a single method `message(i18nlabel, lang)`. Add the following code:

```JavaScript
const registry = require('component-registry').globalRegistry
const createUtility = require('component-registry').createUtility
const { ITranslationUtil } = require('kth-node-formlib').interfaces
// You can choose a different i18n package
const i18n = require('kth-node-i18n')

createUtility({
  implements: ITranslationUtil,
  // If your i18n package has a different implementation you might need to write
  // some glue code to call it properly. The message method is called with the params
  // message(i18nlabel, lang)
  message: i18n.message.bind(i18n)
}).registerWith(registry)
```

## Browser Javascript ##

In order for HTML-editor and list fields to work properly you need to add two javascript files to your
browser code. If you want to create custom behaviour or use other libraries, just take a look at the 
included files and implement your own solution.

### List Field ###
Initialise to fire up the add and remove button handlers, and add drag'n'drop support using dragula.

NOTE: You need to include dragula.js separately for this to work. 

```JavaScript
var $ = require('jquery')
var listField = require('kth-node-formlib/lib/browser/ListField')

$(function () {
  listField.init()
})
```

To clean up event handlers etc. Call `listField.cleanup()`


### HTML Area Field with CK Editor ###

Initialise the ckeditor by implementing this code. The code will detect if there are HTML Area Field
widgets on the page and 1) load ck editor on demand; 2) initialise ck editor on these `<textarea>`-fields.
This code also adds a dirty check using the exposed list of ck editor instances.

```JavaScript
var $ = require('jquery')

var ckeditorSetup = require('kth-node-formlib/lib/browser/ckeditor')

// Add the path to your ck editor root
var ckeditorBasepath = '/static/js/ckeditor/'

$(function () {
  ckeditorSetup.init({
    ckeditorBasepath: ckeditorBasepath,
    ckeditorOptions: {
      // Add your ck editor options
    }
  })

  var doCheckDirty = function (event) {
    // Check each instance to see if it is dirty
    var isDirty = ckeditorSetup.ckeditorInstances.reduce(function (prev, editor) {
      return prev || editor.checkDirty()
    }, false)
    if (isDirty) {
      // try set custom message if browser supports it
      var msg = 'Are you sure you want to discard your edits?'
      event.returnValue = event.originalEvent.returnValue = msg
      return msg
    }
  }
  var doDisableDirtyCheck = function () {
    // disable beforeunload if submitting form
    $(window).off('beforeunload')
  }

  // Check if editor is dirty
  $(window).on('beforeunload', doCheckDirty)

  // Remove dirty check on submit
  $(document).on('submit', 'form', doDisableDirtyCheck)
})

```

## Basic form rendering ##
Rendering a form without handlebar helpers:

**formpage.handlebars**
```Handlebars
<html>
    <body>
        <form method="post" action="{{cancelUrl}}">
            {{{formFieldsHTML}}}
            <div class="pull-right">
                <a class="cancel" href="{{cancelUrl}}">Cancel</a>
                <button type="submit">Save</button>
            </div>
        </form>
    </body>
</html>
```

**formCtrl.js**
```JavaScript
const Schema = require('isomorphic-schema').Schema
const formSchema = new Schema({...})
const formlib = require('kth-node-formlib')

function formPage (req, res, next) {
    const didSubmit = req.method === 'POST'

    // bodyParser converts nested forms to object hierarchy but we need to
    // convert to proper datatypes prior to validation, the last bool param
    // tells transform to keep readOnly props which are needed if we want
    // to display the form with errors without readOnly fields being left empty
    const formData = formSchema.transform(req.body, undefined, true)
    
    // Validate the input
    const errors = formSchema.validate(formData)

    // Transform input to proper data structure
    const data = formSchema.transform(formData)

    // On successful submit, store the data
    if (didSubmit && !errors) {
        yourDataUpdateMethod(data)
        return res.redirect(200, '/success/url')
    }

    // Render the form fields
    const formFieldsHTML = formlib.renderFields({
        data: data,
        errors: errors,
        lang: 'en',
        submitted: didSubmitt
    })

    // Render the form page
    res.render('formpage', {
        lang: 'en',
        actionUrl: '', // Post to self
        cancelUrl: '/some/path',
        formFieldsHTML: formlib.renderFields
    })
```

## Rendering using Handlebars view helper ##

Add the following code to your project to register Handlebars helpers:

```JavaScript
const Handlebars = require('handlebars')
const registerFormlibHandlebarHelpers = require('kth-node-formlib').registerHandlebarHelpers
registerFormlibHandlebarHelpers(Handlebars)
```

Now you will get the formlib Handlebars view helpers (described further down) allowing you to write:

**formpage.handlebars**
```Handlebars
<html>
    <body>
        <form method="post" action="{{cancelUrl}}">
            {{formfields formOptions lang}}

            {{formsave cancelUrl lang}}
        </form>
    </body>
</html>
```

**formCtrl.js**
```JavaScript
const Schema = require('isomorphic-schema').Schema
const formSchema = new Schema({...})
const formlib = require('kth-node-formlib')

function formPage (req, res, next) {
    const didSubmit = req.method === 'POST'

    // bodyParser converts nested forms to object hierarchy but we need to
    // convert to proper datatypes prior to validation, the last bool param
    // tells transform to keep readOnly props which are needed if we want
    // to display the form with errors without readOnly fields being left empty
    const formData = formSchema.transform(req.body, undefined, true)
    
    // Validate the input
    const errors = formSchema.validate(formData)

    // Transform input to proper data structure
    const data = formSchema.transform(formData)

    // On successful submit, store the data
    if (didSubmit && !errors) {
        yourDataUpdateMethod(data)
        return res.redirect(200, '/success/url')
    }

    // Render the form page
    res.render('formpage', {
        lang: 'en',
        actionUrl: '', // Post to self
        cancelUrl: '/some/path',
        formOptions: {
            submitted: req.method === 'POST',
            formSchema: formSchema,
            data: data,
            errors: errors
        }
    })
```


### formfields ###
```Handlebars
{{formfields formOptions lang}}

formOptions = {
    submitted: req.method === 'POST', // Used to only show errors on submitt (normally a POST)
    formSchema: formSchema,
    data: pageData,
    errors: errors // The result from formSchema.validate(pageData), undefined if no errors
}
lang = 'en' // Passed to fields and used for error message rendering
```

### formsave ###
Form save uses action url in form for post and `cancelUrl` when clicking cancel.
```Handlebars
{{formsave cancelUrl lang}}

cancelUrl = '/path/to/cancel'
lang = 'en'
```

TODO: Add test for async form fields generation
TODO: Add async form docs to README
DONE: Register i18n utility with component registry
TODO: Get browser include to work with dev-package (currently fails on babel, work around is to copy files in .../browser to project)
https://github.com/babel/babel-loader/blob/master/README.md#the-node-api-for-babel-has-been-moved-to-babel-core