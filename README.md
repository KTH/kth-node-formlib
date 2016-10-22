# kth-node-formlib #

Render Bootsrap 3 style forms for express.js using isomorphic-schema definitions.

## Basic form rendering ##
Rendering a form without handlebar helpers:

```
// formpage.handlebars
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
        actionUrl: '', // Post to self
        cancelUrl: '/some/path',
        formFieldsHTML: formlib.renderFields
    })
```

TODO: Register i18n utility with component registry
TODO: user factory