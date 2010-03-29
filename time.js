/**
 * @fileOverview Utilities for working with times.
 */

/** @namespace */
var time = {};


time.TimeParser = function(format)
{
    /**
     * The original formatting string which was given.
     *
     * @type String
     */
    this.format = format;

    // Normalise whitespace before further processing
    format = format.split(/(?:\s|%t|%n)+/).join(" ");
    var expected = [];

    var pattern = format.replace(
        /(d{1,4}|M{1,4}|yyyy|yy|HH|H|hh|h|mm|m|ss|s|tt)/g,
        function(str) {
            if (str.length == 2 && 'MdHhms'.indexOf(str[0]) != -1)
                str = str[0];
            expected.push(str);
            return time.TimeParser.DIRECTIVE_PATTERNS[str];
        });

    /**
     * The regular expression generated for the format this parser was created
     * to parse.
     *
     * @type RegExp
     */
    this.regexp = new RegExp("^" + pattern + "$");

    /**
     * A list of expected formatting directives code which will be matched by
     * this parser's <code>regexp</code>, in the order the matches are expected
     * to take place.
     *
     * @type Array
     */
    this.expected = expected;
};

/**
 * Maps directive codes to regular expression pattern fragments which will
 * capture the data the directive corresponds to.
 *
 * @type Object
 */
time.TimeParser.DIRECTIVE_PATTERNS =
{
    MMMM: '(' + ak.culture.months.join('|') + ')',
    MMM: '(' + ak.culture.shortMonths.join('|') + ')',
    tt: "({0}|{1})".format(ak.culture.am, ak.culture.pm),
    d: "(\\d\\d?)",        // Day of the month as a decimal number [1,31]
    H: "(\\d\\d?)",        // Hour (24-hour clock) as a decimal number [0,23]
    h: "(\\d\\d?)",        // Hour (12-hour clock) as a decimal number [1,12]
    M: "(\\d\\d?)",        // Month as a decimal number [1,12]
    m: "(\\d\\d?)",        // Minute as a decimal number [0,59]
    s: "(\\d\\d?)",        // Second as a decimal number [0,59]
    yy: "(\\d\\d?)",       // Year without century as a decimal number [00,99]
    yyyy: "(\\d\\d\\d\\d)" // Year with century as a decimal number
};


time.TimeParser.prototype =
{
    /**
     * Attempts to extract date and time details from the given input.
     * <p>
     * Time fields in this method's result are as follows:
     * <table>
     * <thead>
     *   <tr>
     *     <th>Index</th>
     *     <th>Represents</th>
     *     <th>Values</th>
     *   </tr>
     * </thead>
     * <tbody>
     *   <tr>
     *     <td><code>0</code></td>
     *     <td>Year</td>
     *     <td>(for example, 1993)</td>
     *   </tr>
     *   <tr>
     *     <td><code>1</code></td>
     *     <td>Month</td>
     *     <td>range [1,12]</td>
     *   </tr>
     *   <tr>
     *     <td><code>2</code></td>
     *     <td>Day</td>
     *     <td>range [1,31]</td>
     *   </tr>
     *   <tr>
     *     <td><code>3</code></td>
     *     <td>Hour</td>
     *     <td>range [0,23]</td>
     *   </tr>
     *   <tr>
     *     <td><code>4</code></td>
     *     <td>Minute</td>
     *     <td>range [0,59]</td>
     *   </tr>
     *   <tr>
     *     <td><code>5</code></td>
     *     <td>Second</td>
     *     <td>range [0,59]</td>
     *   </tr>
     *   <tr>
     *     <td><code>6</code></td>
     *     <td>Day of week (not implemented - always <code>0</code>)</td>
     *     <td>range [0,6], Monday is 0</td>
     *   </tr>
     *   <tr>
     *     <td><code>7</code></td>
     *     <td>Day of year (not implemented - always <code>1</code>)</td>
     *     <td>range [1,366]</td>
     *   </tr>
     *   <tr>
     *     <td><code>8</code></td>
     *     <td>Daylight savings flag (not implemented - always <code>-1</code>)</td>
     *     <td>0, 1 or -1</td>
     *   </tr>
     * </tbody>
     * </table>
     *
     * @param {String} input the time string to be parsed.
     *
     * @return a list of 9 integers, each corresponding to a time field.
     * @type Array
     */
    parse: function(input)
    {
        var matches = this.regexp.exec(input);
        if (matches === null)
        {
            throw new Error("Time data did not match format: data=" + input +
                            ", format=" + this.format);
        }

        // Collect matches in an object under properties corresponding to their
        // data types.
        var data = {};
        for (var i = 1, l = matches.length; i < l; i++)
        {
            data[this.expected[i -1]] = matches[i];
        }

        // Default values for when more accurate values cannot be inferred
        var time = [1900, 1, 1, 0, 0, 0, 0, 1, -1];

        // Extract year
        if (typeof data["yyyy"] != "undefined")
        {
            time[0] = parseInt(data["yyyy"], 10);
        }
        else if (typeof data["yy"] != "undefined")
        {
            var year = parseInt(data["yy"], 10);
            if (year < 68)
            {
                year = 2000 + year;
            }
            else if (year < 100)
            {
                year = 1900 + year;
            }
            time[0] = year;
        }

        // Extract month
        if (typeof data["M"] != "undefined")
        {
            var month = parseInt(data["M"], 10);
            if (month < 1 || month > 12)
            {
                throw new Error("Month is out of range: " + month);
            }
            time[1] = month;
        }
        else if (typeof data["MMMM"] != "undefined")
        {
            time[1] = this._indexOf(data["MMMM"], ak.culture.months) + 1;
        }
        else if (typeof data["MMM"] != "undefined")
        {
            time[1] = this._indexOf(data["MMM"], ak.culture.shortMonths) + 1;
        }

        // Extract day of month
        if (typeof data["d"] != "undefined")
        {
            var day = parseInt(data["d"], 10);
            if (day < 1 || day > 31)
            {
                throw new Error("Day is out of range: " + day);
            }
            time[2] = day;
        }

        // Extract hour
        if (typeof data["H"] != "undefined")
        {
            var hour = parseInt(data["H"], 10);
            if (hour > 23)
            {
                throw new Error("Hour is out of range: " + hour);
            }
            time[3] = hour;
        }
        else if (typeof data["h"] != "undefined")
        {
            var hour = parseInt(data["h"], 10);
            if (hour < 1 || hour > 12)
            {
                throw new Error("Hour is out of range: " + hour);
            }

            // If we don't get any more information, we'll assume this time is
            // a.m. - 12 a.m. is midnight.
            if (hour == 12)
            {
                hour = 0;
            }

            time[3] = hour;

            if (typeof data["tt"] != "undefined")
            {
                if (data["tt"] == ak.culture.pm)
                {
                    // We've already handled the midnight special case, so it's
                    // safe to bump the time by 12 hours without further checks.
                    time[3] = time[3] + 12;
                }
            }
        }

        // Extract minute
        if (typeof data["m"] != "undefined")
        {
            var minute = parseInt(data["m"], 10);
            if (minute > 59)
            {
                throw new Error("Minute is out of range: " + minute);
            }
            time[4] = minute;
        }

        // Extract seconds
        if (typeof data["s"] != "undefined")
        {
            var second = parseInt(data["s"], 10);
            if (second > 59)
            {
                throw new Error("Second is out of range: " + second);
            }
            time[5] = second;
        }

        // Validate day of month
        var day = time[2], month = time[1], year = time[0];
        if (((month == 4 || month == 6 || month == 9 || month == 11) &&
            day > 30)
            ||
            (month == 2 && day > ((year % 4 == 0 && year % 100 != 0 ||
                                   year % 400 == 0) ? 29 : 28)))
        {
            throw new Error("Day " + day + " is out of range for month " + month);
        }

        return time;
    },

    _indexOf: function(item, list)
    {
        for (var i = 0, l = list.length; i < l; i++)
        {
            if (item === list[i])
            {
                return i;
            }
        }
        return -1;
    }
};


time.strptime = function(input, format)
{
    return new time.TimeParser(format).parse(input);
};


time.strftime = function (date, format) {
    return date.toString(format);
};
