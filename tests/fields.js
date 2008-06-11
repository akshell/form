module("fields");

/**
 * Retrieves the first error message from a ValidatonError.
 */
function ve(e)
{
    return e.messages.errors[0];
}

test("CharField", function()
{
    expect(20);
    var f = new CharField();
    equals(f.clean(1), "1");
    equals(f.clean("hello"), "hello");
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean(""); } catch (e) { equals(ve(e), "This field is required.");  }
    equals(f.clean([1, 2, 3]), "1,2,3");

    f = new CharField({required: false});
    equals(f.clean(1), "1");
    equals(f.clean("hello"), "hello");
    equals(f.clean(null), "");
    equals(f.clean(""), "");
    equals(f.clean([1, 2, 3]), "1,2,3");

    // CharField accepts an optional maxLength parameter
    f = new CharField({maxLength: 10, required: false});
    equals(f.clean("12345"), "12345");
    equals(f.clean("1234567890"), "1234567890");
    try { f.clean("1234567890a"); } catch (e) { equals(ve(e), "Ensure this value has at most 10 characters (it has 11)."); }

    // CharField accepts an optional minLength parameter
    f = new CharField({minLength: 10, required: false});
    try { f.clean("12345"); } catch (e) { equals(ve(e), "Ensure this value has at least 10 characters (it has 5)."); }
    equals(f.clean("1234567890"), "1234567890");
    equals(f.clean("1234567890a"), "1234567890a");

    f = new CharField({minLength: 10, required: true});
    try { f.clean(""); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean("12345"); } catch (e) { equals(ve(e), "Ensure this value has at least 10 characters (it has 5)."); }
    equals(f.clean("1234567890"), "1234567890");
    equals(f.clean("1234567890a"), "1234567890a");
});

test("IntegerField", function()
{
    expect(40);
    var f = new IntegerField();
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean(""); } catch (e) { equals(ve(e), "This field is required."); }
    equals(f.clean("1"), 1);
    equals(f.clean("23"), 23);
    try { f.clean("a"); } catch (e) { equals(ve(e), "Enter a whole number."); }
    equals(f.clean(42), 42);
    try { f.clean(3.14); } catch (e) { equals(ve(e), "Enter a whole number."); }
    equals(f.clean("1 "), 1);
    equals(f.clean(" 1"), 1);
    equals(f.clean(" 1 "), 1);
    try { f.clean("1a"); } catch (e) { equals(ve(e), "Enter a whole number."); }

    f = new IntegerField({required: false});
    equals(f.clean(""), null);
    equals(f.clean(null), null);
    equals(f.clean("1"), 1);
    equals(f.clean("23"), 23);
    try { f.clean("a"); } catch (e) { equals(ve(e), "Enter a whole number."); }
    equals(f.clean("1 "), 1);
    equals(f.clean(" 1"), 1);
    equals(f.clean(" 1 "), 1);
    try { f.clean("1a"); } catch (e) { equals(ve(e), "Enter a whole number."); }

    // IntegerField accepts an optional maxValue parameter
    f = new IntegerField({maxValue: 10})
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    equals(f.clean(1), 1);
    equals(f.clean(10), 10);
    try { f.clean(11); } catch (e) { equals(ve(e), "Ensure this value is less than or equal to 10."); }
    equals(f.clean("10"), 10);
    try { f.clean("11"); } catch (e) { equals(ve(e), "Ensure this value is less than or equal to 10."); }

    // IntegerField accepts an optional minValue parameter
    f = new IntegerField({minValue: 10});
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean(1); } catch (e) { equals(ve(e), "Ensure this value is greater than or equal to 10."); }
    equals(f.clean(10), 10);
    equals(f.clean(11), 11);
    equals(f.clean("10"), 10);
    equals(f.clean("11"), 11);

    // minValue and maxValue can be used together
    f = new IntegerField({minValue: 10, maxValue: 20});
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean(1); } catch (e) { equals(ve(e), "Ensure this value is greater than or equal to 10."); }
    equals(f.clean(10), 10);
    equals(f.clean(11), 11);
    equals(f.clean("10"), 10);
    equals(f.clean("11"), 11);
    equals(f.clean(20), 20);
    try { f.clean(21); } catch (e) { equals(ve(e), "Ensure this value is less than or equal to 20."); }
});

test("FloatField", function()
{
    expect(19);
    var f = new FloatField();
    try { f.clean(""); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    equals(f.clean(1), 1.0);
    equals(f.clean(23), 23.0);
    equals(f.clean("3.14"), 3.1400000000000001);
    equals(f.clean(3.14), 3.1400000000000001);
    equals(f.clean(42), 42.0);
    try { f.clean("a"); } catch (e) { equals(ve(e), "Enter a number."); }
    equals(f.clean("1.0 "), 1.0);
    equals(f.clean(" 1.0"), 1.0);
    equals(f.clean(" 1.0 "), 1.0);
    try { f.clean("1.0a"); } catch (e) { equals(ve(e), "Enter a number."); }

    f = new FloatField({required: false});
    equals(f.clean(""), null);
    equals(f.clean(null), null);
    equals(f.clean("1"), 1.0);

    // FloatField accepts minValue and maxValue just like IntegerField
    f = new FloatField({maxValue: 1.5, minValue: 0.5});
    try { f.clean("1.6"); } catch (e) { equals(ve(e), "Ensure this value is less than or equal to 1.5."); }
    try { f.clean("0.4"); } catch (e) { equals(ve(e), "Ensure this value is greater than or equal to 0.5."); }
    equals(f.clean("1.5"), 1.5);
    equals(f.clean("0.5"), 0.5);
});

test("DecimalField", function()
{
    expect(31);
    var f = new DecimalField({maxDigits: 4, decimalPlaces: 2});
    try { f.clean(""); } catch (e) { equals(ve(e), "This field is required."); }
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }
    equals(f.clean("1"), 1);
    equals(f.clean("23"), 23);
    equals(f.clean("3.14"), 3.1400000000000001);
    equals(f.clean(3.14), 3.1400000000000001);
    try { f.clean("a"); } catch (e) { equals(ve(e), "Enter a number."); }
    equals(f.clean("1.0 "), 1.0);
    equals(f.clean(" 1.0"), 1.0);
    equals(f.clean(" 1.0 "), 1.0);
    try { f.clean("1.0a"); } catch (e) { equals(ve(e), "Enter a number."); }
    try { f.clean("123.45"); } catch(e) { equals(ve(e), "Ensure that there are no more than 4 digits in total."); }
    try { f.clean("1.234"); } catch(e) { equals(ve(e), "Ensure that there are no more than 2 decimal places."); }
    try { f.clean("123.4"); } catch(e) { equals(ve(e), "Ensure that there are no more than 2 digits before the decimal point."); }
    equals(f.clean("-12.34"), -12.34);
    try { f.clean("-123.45"); } catch(e) { equals(ve(e), "Ensure that there are no more than 4 digits in total."); }
    equals(f.clean("-.12"), -0.12);
    equals(f.clean("-00.12"), -0.12);
    equals(f.clean("-000.12"), -0.12);
    try { f.clean("-000.123"); } catch(e) { equals(ve(e), "Ensure that there are no more than 2 decimal places."); }
    try { f.clean("-000.1234"); } catch(e) { equals(ve(e), "Ensure that there are no more than 4 digits in total."); }
    try { f.clean("--0.12"); } catch (e) { equals(ve(e), "Enter a number."); }

    var f = new DecimalField({maxDigits: 4, decimalPlaces: 2, required: false});
    equals(f.clean(""), null);
    equals(f.clean(null), null);
    equals(f.clean(1), 1);

    // DecimalField accepts min_value and max_value just like IntegerField
    var f = new DecimalField({maxDigits: 4, decimalPlaces: 2, maxValue: 1.5, minValue: 0.5});
    try { f.clean("1.6"); } catch (e) { equals(ve(e), "Ensure this value is less than or equal to 1.5."); }
    try { f.clean("0.4"); } catch (e) { equals(ve(e), "Ensure this value is greater than or equal to 0.5."); }
    equals(f.clean("1.5"), 1.5);
    equals(f.clean("0.5"), 0.5);
    equals(f.clean(".5"), 0.5);
    equals(f.clean("00.50"), 0.5);
});

test("DateField", function()
{
    expect(24);
    var f = new DateField();
    var expected = new Date(2006, 9, 25).valueOf();
    equals(f.clean(new Date(2006, 9, 25)).valueOf(), expected);
    equals(f.clean(new Date(2006, 9, 25, 14, 30)).valueOf(), expected);
    equals(f.clean(new Date(2006, 9, 25, 14, 30, 59)).valueOf(), expected);
    equals(f.clean(new Date(2006, 9, 25, 14, 30, 59, 200)).valueOf(), expected);
    equals(f.clean("2006-10-25").valueOf(), expected);
    equals(f.clean("10/25/2006").valueOf(), expected);
    equals(f.clean("10/25/06").valueOf(), expected);
    equals(f.clean("Oct 25 2006").valueOf(), expected);
    equals(f.clean("October 25 2006").valueOf(), expected);
    equals(f.clean("October 25, 2006").valueOf(), expected);
    equals(f.clean("25 October 2006").valueOf(), expected);
    equals(f.clean("25 October, 2006").valueOf(), expected);
    try { f.clean("2006-4-31"); } catch (e) { equals(ve(e), "Enter a valid date."); }
    try { f.clean("200a-10-25"); } catch (e) { equals(ve(e), "Enter a valid date."); }
    try { f.clean("25/10/06"); } catch (e) { equals(ve(e), "Enter a valid date."); }
    try { f.clean(null); } catch (e) { equals(ve(e), "This field is required."); }

    var f = new DateField({required: false});
    equals(f.clean(null), null);
    equals(f.clean(""), null);

    // DateField accepts an optional inputFormats parameter
    var f = new DateField({inputFormats: ["%Y %m %d"]});
    equals(f.clean(new Date(2006, 9, 25)).valueOf(), expected);
    equals(f.clean(new Date(2006, 9, 25, 14, 30)).valueOf(), expected);
    equals(f.clean("2006 10 25").valueOf(), expected);

    // The input_formats parameter overrides all default input formats, so the
    // default formats won't work unless you specify them
    try { f.clean("2006-10-25"); } catch (e) { equals(ve(e), "Enter a valid date."); }
    try { f.clean("10/25/2006"); } catch (e) { equals(ve(e), "Enter a valid date."); }
    try { f.clean("10/25/06"); } catch (e) { equals(ve(e), "Enter a valid date."); }
});

test("TimeField", function()
{
    expect(11);
    var f = new TimeField();
    equals(f.clean(new Date(1900, 0, 1, 14, 25)).valueOf(), new Date(1900, 0, 1, 14, 25).valueOf());
    equals(f.clean(new Date(1900, 0, 1, 14, 25, 59)).valueOf(), new Date(1900, 0, 1, 14, 25, 59).valueOf());
    equals(f.clean("14:25").valueOf(), new Date(1900, 0, 1, 14, 25).valueOf());
    equals(f.clean("14:25:59").valueOf(), new Date(1900, 0, 1, 14, 25, 59).valueOf());
    try { f.clean("hello"); } catch (e) { equals(ve(e), "Enter a valid time."); }
    try { f.clean("1:24 p.m."); } catch (e) { equals(ve(e), "Enter a valid time."); }

    // TimeField accepts an optional inputFormats parameter:
    var f = new TimeField({inputFormats: ["%I:%M %p"]});
    equals(f.clean(new Date(1900, 0, 1, 14, 25)).valueOf(), new Date(1900, 0, 1, 14, 25).valueOf());
    equals(f.clean(new Date(1900, 0, 1, 14, 25, 59)).valueOf(), new Date(1900, 0, 1, 14, 25, 59).valueOf());
    equals(f.clean("4:25 AM").valueOf(), new Date(1900, 0, 1, 4, 25).valueOf());
    equals(f.clean("4:25 PM").valueOf(), new Date(1900, 0, 1, 16, 25).valueOf());

    // The inputFormats parameter overrides all default input formats, so the
    // default formats won't work unless you specify them.
    try { f.clean("14:30:45"); } catch (e) { equals(ve(e), "Enter a valid time."); }
});