module("formsets");

(function()
{

// FormSet allows us to use multiple instance of the same form on 1 page.
// For now, the best way to create a FormSet is by using the formsetFactory
// function.
var Choice = formFactory({fields: function() {
    return {
        choice: new CharField(),
        votes: new IntegerField()
    };
}});

function allAsUL(forms)
{
    var rendered = [];
    for (var i = 0, l = forms.length; i < l; i++)
    {
        rendered.push(forms[i].asUL());
    }
    return rendered.join("\n");
}

test("Basic FormSet creation and usage", function()
{
    expect(13);

    var ChoiceFormSet = formsetFactory(Choice);

    // A FormSet constructor takes the same arguments as Form. Let's create a
    // FormSet for adding data. By default, it displays 1 blank form. It can
    // display more, but we'll look at how to do so later.
    var formset = new ChoiceFormSet({autoId: false, prefix: "choices"});
    equals(""+formset,
"<tr><td colspan=\"2\"><input type=\"hidden\" name=\"choices-TOTAL_FORMS\" value=\"1\"><input type=\"hidden\" name=\"choices-INITIAL_FORMS\" value=\"0\"></td></tr>\n" +
"<tr><th>Choice:</th><td><input type=\"text\" name=\"choices-0-choice\"></td></tr>\n" +
"<tr><th>Votes:</th><td><input type=\"text\" name=\"choices-0-votes\"></td></tr>");

    // One thing to note is that there needs to be a special value in the data.
    // This value tells the FormSet how many forms were displayed so it can tell
    // how many forms it needs to clean and validate. You could use javascript
    // to create new forms on the client side, but they won't get validated
    // unless you increment the TOTAL_FORMS field appropriately.
    var data = {
        "choices-TOTAL_FORMS": "1", // The number of forms rendered
        "choices-INITIAL_FORMS": "0", // The number of forms with initial data
        "choices-0-choice": "Calexico",
        "choices-0-votes": "100"
    };

    // We treat FormSet pretty much like we would treat a normal Form. FormSet
    // has an isValid method, and a cleanedData or errors attribute depending on
    // whether all the forms passed validation. However, unlike a Form instance,
    // cleaned_data and errors will be a list of objects rather than just a
    // single object.
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), true);
    same(formset.forms[0].cleanedData, {choice: "Calexico", votes: 100});

    // If a FormSet was not passed any data, its isValid method should return
    // false.
    formset = new ChoiceFormSet();
    same(formset.isValid(), false);

    // FormSet instances can also have an error attribute if validation failed for
    // any of the forms.
    data = {
        "choices-TOTAL_FORMS": "1",
        "choices-INITIAL_FORMS": "0",
        "choices-0-choice": "Calexico",
        "choices-0-votes": ""
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), false);
    same(formset.errors[0].votes.errors, ["This field is required."]);

    // We can also prefill a FormSet with existing data by providing an "initial"
    // argument to the constructor, which should be a list of objects. By
    // default, an extra blank form is included.
    var initial = [{choice: "Calexico", votes: 100}];
    formset = new ChoiceFormSet({initial: initial, autoId: false, prefix: "choices"});
    equals(allAsUL(formset.forms),
"<li>Choice: <input type=\"text\" name=\"choices-0-choice\" value=\"Calexico\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-0-votes\" value=\"100\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-1-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-1-votes\"></li>");

    // Let's simulate what happens if we submitted this form
    data = {
        "choices-TOTAL_FORMS": "2",
        "choices-INITIAL_FORMS": "1",
        "choices-0-choice": "Calexico",
        "choices-0-votes": "100",
        "choices-1-choice": "",
        "choices-1-votes": ""
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), true);
    same(formset.cleanedData,
         [{choice: "Calexico", votes: 100}, {}]);

    // But the second form was blank! Shouldn't we get some errors? No. If we
    // display a form as blank, it's ok for it to be submitted as blank. If we
    // fill out even one of the fields of a blank form though, it will be
    // validated. We may want to require that at least x number of forms are
    // completed, but we'll show how to handle that later.
    data = {
        "choices-TOTAL_FORMS": "2",
        "choices-INITIAL_FORMS": "1",
        "choices-0-choice": "Calexico",
        "choices-0-votes": "100",
        "choices-1-choice": "The Decemberists",
        "choices-1-votes": "" // Missing value
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), false);
    same([formset.errors[0].isPopulated(), formset.errors[1].votes.errors],
         [false, ["This field is required."]]);

    // If we delete data that was pre-filled, we should get an error. Simply
    // removing data from form fields isn't the proper way to delete it. We'll
    // see how to handle that case later.
    data = {
        "choices-TOTAL_FORMS": "2",
        "choices-INITIAL_FORMS": "1",
        "choices-0-choice": "", // Deleted value
        "choices-0-votes": "", // Deleted value
        "choices-1-choice": "",
        "choices-1-votes": ""
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), false);
    same([formset.errors[0].choice.errors, formset.errors[0].votes.errors],
         [["This field is required."], ["This field is required."]]);
});

test("Displaying more than one blank form", function()
{
    expect(8);

    // We can also display more than 1 empty form at a time. To do so, pass an
    // "extra" argument to formsetFactory.
    var ChoiceFormSet = formsetFactory(Choice, {extra: 3});

    var formset = new ChoiceFormSet({autoId: false, prefix: "choices"});
    equals(allAsUL(formset.forms),
"<li>Choice: <input type=\"text\" name=\"choices-0-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-0-votes\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-1-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-1-votes\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-2-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-2-votes\"></li>");

    // Since we displayed every form as blank, we will also accept them back as
    // blank. This may seem a little strange, but later we will show how to
    // require a minimum number of forms to be completed.
    var data = {
        "choices-TOTAL_FORMS": "3",
        "choices-INITIAL_FORMS": "0",
        "choices-0-choice": "",
        "choices-0-votes": "",
        "choices-1-choice": "",
        "choices-1-votes": "",
        "choices-2-choice": "",
        "choices-2-votes": ""
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), true);
    same(formset.cleanedData,
         [{}, {}, {}]);

    // We can just fill in one of the forms
    data = {
        "choices-TOTAL_FORMS": "3",
        "choices-INITIAL_FORMS": "0",
        "choices-0-choice": "Calexico",
        "choices-0-votes": "100",
        "choices-1-choice": "",
        "choices-1-votes": "",
        "choices-2-choice": "",
        "choices-2-votes": ""
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), true);
    same(formset.cleanedData,
         [{choice: "Calexico", votes: 100}, {}, {}]);

    // And once again, if we try to partially complete a form, validation will
    // fail.
    data = {
        "choices-TOTAL_FORMS": "3",
        "choices-INITIAL_FORMS": "0",
        "choices-0-choice": "Calexico",
        "choices-0-votes": "100",
        "choices-1-choice": "The Decemberists",
        "choices-1-votes": "", // Missing value
        "choices-2-choice": "",
        "choices-2-votes": ""
    };
    formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), false);
    same([formset.errors[0].isPopulated(), formset.errors[1].votes.errors, formset.errors[2].isPopulated()],
         [false, ["This field is required."], false]);

    // The "extra" argument also works when the formset is pre-filled with
    // initial data.
    var initial = [{choice: "Calexico", votes: 100}];
    formset = new ChoiceFormSet({initial: initial, autoId: false, prefix: "choices"});
    equals(allAsUL(formset.forms),
"<li>Choice: <input type=\"text\" name=\"choices-0-choice\" value=\"Calexico\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-0-votes\" value=\"100\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-1-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-1-votes\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-2-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-2-votes\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-3-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-3-votes\"></li>");
});

test("FormSets with deletion", function()
{
    expect(4);

    // We can easily add deletion ability to a FormSet with an argument to
    // formsetFactory. This will add a BooleanField to each form instance. When
    // true, the form will be in formset.deletedForms.
    var ChoiceFormSet = formsetFactory(Choice, {canDelete: true});

    var initial = [{choice: "Calexico", votes: 100}, {choice: "Fergie", votes: 900}];
    var formset = new ChoiceFormSet({initial: initial, autoId: false, prefix: "choices"});
    equals(allAsUL(formset.forms),
"<li>Choice: <input type=\"text\" name=\"choices-0-choice\" value=\"Calexico\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-0-votes\" value=\"100\"></li>\n" +
"<li>Delete: <input type=\"checkbox\" name=\"choices-0-DELETE\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-1-choice\" value=\"Fergie\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-1-votes\" value=\"900\"></li>\n" +
"<li>Delete: <input type=\"checkbox\" name=\"choices-1-DELETE\"></li>\n" +
"<li>Choice: <input type=\"text\" name=\"choices-2-choice\"></li>\n" +
"<li>Votes: <input type=\"text\" name=\"choices-2-votes\"></li>\n" +
"<li>Delete: <input type=\"checkbox\" name=\"choices-2-DELETE\"></li>");

    // To delete something, we just need to set that form's special delete field
    // to "on". Let's go ahead and delete Fergie.
    var data = {
        "choices-TOTAL_FORMS": "3",
        "choices-INITIAL_FORMS": "2",
        "choices-0-choice": "Calexico",
        "choices-0-votes": "100",
        "choices-0-DELETE": "",
        "choices-1-choice": "Fergie",
        "choices-1-votes": "900",
        "choices-1-DELETE": "on",
        "choices-2-choice": "",
        "choices-2-votes": "",
        "choices-2-DELETE": ""
    };

    var formset = new ChoiceFormSet({data: data, autoId: false, prefix: "choices"});
    same(formset.isValid(), true);
    same(formset.cleanedData,
         [{choice: "Calexico", votes: 100, DELETE: false}, {choice: "Fergie", votes: 900, DELETE: true}, {}]);
    same(formset.deletedForms[0].cleanedData, {choice: "Fergie", votes: 900, DELETE: true});
});

})();