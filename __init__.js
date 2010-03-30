// Copyright (c) 2010, Anton Korenyushkin
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the author nor the names of contributors may be
//       used to endorse or promote products derived from this software
//       without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.


form = new ak.Module('form', '0.1');

(function ()
{
  var dirPath = ak.include.path.substr(0, ak.include.path.lastIndexOf('/') + 1);


  var names = [
    'dom_builder',
    'util',
    'time',
    'widgets',
    'fields',
    'forms',
    'formsets'
  ];


  function read(name) {
    var path = dirPath + name + '.js';
    return (ak.app.name == 'form'
            ? ak.readCode(path)
            : ak.readCode('form', path));
  }


  for (var i = 0; i < names.length; ++i)
    eval(read(names[i]));


  [
    'BaseFormSet',
    'BooleanField',
    'CharField',
    'CheckboxInput',
    'CheckboxSelectMultiple',
    'ChoiceField',
    'ComboField',
    'DateField',
    'DateInput',
    'DateTimeField',
    'DateTimeInput',
    'DecimalField',
    'EmailField',
    'ErrorList',
    'FileField',
    'FileInput',
    'FloatField',
    'Form',
    'HiddenInput',
    'IPAddressField',
    'ImageField',
    'IntegerField',
    'MultiValueField',
    'MultiWidget',
    'MultipleChoiceField',
    'MultipleHiddenInput',
    'NullBooleanField',
    'NullBooleanSelect',
    'PasswordInput',
    'RadioFieldRenderer',
    'RadioSelect',
    'RegexField',
    'Select',
    'SelectMultiple',
    'SlugField',
    'SplitDateTimeField',
    'SplitDateTimeWidget',
    'SplitHiddenDateTimeWidget',
    'TextInput',
    'Textarea',
    'TimeField',
    'TimeInput',
    'TypedChoiceField',
    'URLField',
    'ValidationError',
    'formsetFactory'
  ].forEach(function (name) { form[name] = eval(name); });


  form.setHidden('_internal', {});


  [
    'DOMBuilder',
    'contains',
    'extendObject',
    'formFactory',
    'formatString',
    'prettyName',
    'time'
  ].forEach(function (name) { form._internal[name] = eval(name); });

})();
