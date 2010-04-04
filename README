# Form

`form` is a form-handling library.

While it is possible to process form submissions just using the
`Request` class, the `form` library takes care of a number of common
form-related tasks. Using it, you can:

1. Display an HTML form with automatically generated form widgets.
2. Check submitted data against a set of validation rules.
3. Redisplay a form in the case of validation errors.
4. Convert submitted form data to the relevant JavaScript data types.

The library is a modified version of the [js-forms][1] client-side
JavaScript library by Jonathan Buchanan, which is a port of the
[Django][2] [forms][3] library.

Here is a very basic example of `form` usage:

    use('form', '0.1');
     
    var ContactForm = form.Form.subclass(
      {
        email: form.EmailField(),
        dateOfBirth: form.DateField({helpText: 'We really need to know it'}),
        comment: form.CharField({required: false, widget: form.Textarea})
      });
      
    var formTemplate = new Template(
      '<form method="post">' +
      '{% csrfToken %}{{ form.asP }}<input type="submit">' +
      '</form>');
     
    var ContactHandler = Handler.subclass(
      {
        get: function (request) {
          return new Response(
            formTemplate.render({form: this._form || new ContactForm()}),
            this._form && http.BAD_REQUEST);
        },
        
        post: function (request) {
          this._form = new ContactForm({data: request.post});
          if (!this._form.isValid())
            return this.get(request);
          // Process data
        }
      });
      
Currently `form` lacks documentation. If you'd like to participate in
writing it, write me to <anton@akshell.com>.

[1]: http://code.google.com/p/js-forms/
[2]: http://www.djangoproject.com/
[3]: http://docs.djangoproject.com/en/dev/ref/forms/
