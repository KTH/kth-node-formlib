const { Schema, field_validators: validators } = require('isomorphic-schema')
const { renderFormFields } = require('../../lib')
const Handlebars = require('handlebars')
const handlebarHelpers = require('../../lib/handlebarHelpers')
handlebarHelpers(Handlebars)

const simpleSchema = new Schema('Simple Schema', {
    title: validators.textField({
        label: 'title' 
    }),
    happy: validators.boolField({
        label: 'happy'
    }),
    unhappy: validators.boolField({
        label: 'unhappy'
    })
})

const formSchema = new Schema('List Schema', {
    title: validators.textField({
        label: 'title'
    }),
    list: validators.listField({
        label: 'list',
        valueType: validators.textField({required: true}),
    }),
    /*simple: validators.objectField({
        label: 'SIMPLE',
        schema: simpleSchema
    })*/
})

const nestedListSchema = new Schema('Nedsted List Schema', {
    list: validators.listField({
        label: 'MAIN LIST',
        valueType: validators.objectField({
            label: 'Some special content',
            required: true,
            schema: formSchema
        })
    })
})


const source = `<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.2/dragula.min.css">
        <link rel="stylesheet" href="/browser/app.css">
        <script type="text/javascript" src="/browser/app.js"></script>
    </head>
    <body>
        <h1>Test a nested form</h1>
        <form id="Test-NestedList"action="{formActionUrl}">
            {{formfields formOptions lang}}
            {{formsave formCancelUrl lang}}
        </form>
    </body>
</html>`

const template = Handlebars.compile(source)

module.exports.GET = function (req, res) {

    res.send(template({
        lang: 'en',
        formActionUrl: '',
        formCancelUrl: '',
        formOptions: {
            submitted: req.method === 'POST',
            formSchema: nestedListSchema,
            data: {}
        }
    }))
}