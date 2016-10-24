# kth-node-formlib #

Render Bootstrap 3 style forms for Express.js using isomorphic-schema definitions.

## i18n ##

If you don't implement i18n support forms will be renderedª with english labels. To use your
app specific translations you need to create and register a ITranslationUtil
with a single method `message(i18nlabel, lang)`. Add the following code:

```
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

## Basic form rendering ##
Rendering a form without handlebar helpers:

**formpage.handlebars**
```
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
```
const Schema = require('isomorphic-schema').Schema
const formSchema = new Schema({...})
const formlib = require('kth-node-formlib')

function formPage (req, res, next) {
    const didSubmit = req.method === 'POST'

    // bodyParser converts nested forms to object hierarchy
    const formData = req.body
    
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

```
const Handlebars = require('handlebars')
const registerFormlibHandlebarHelpers = require('kth-node-formlib').registerHandlebarHelpers
registerFormlibHandlebarHelpers(Handlebars)
```

Now you will get the formlib Handlebars view helpers (described further down) allowing you to write:

**formpage.handlebars**
```
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
```
const Schema = require('isomorphic-schema').Schema
const formSchema = new Schema({...})
const formlib = require('kth-node-formlib')

function formPage (req, res, next) {
    const didSubmit = req.method === 'POST'

    // bodyParser converts nested forms to object hierarchy
    const formData = req.body
    
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
```
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
```
{{formsave cancelUrl lang}}

cancelUrl = '/path/to/cancel'
lang = 'en'
```

DONE: Register i18n utility with component registry

Get browser include to work (currently fails on babel, work around is to copy files in .../browser to project)
https://github.com/babel/babel-loader/blob/master/README.md#the-node-api-for-babel-has-been-moved-to-babel-core