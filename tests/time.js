module("time");

test("strptime", function()
{
    expect(56);

    // Default date formats from django.newforms.fields
    var expected = [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(",");
    equals(time.strptime("2006-10-25", "yyyy-M-d").join(","), expected);
    equals(time.strptime("10/25/2006", "M/d/yyyy").join(","), expected);
    equals(time.strptime("10/25/06", "M/d/yy").join(","), expected);
    equals(time.strptime("Oct 25 2006", "MMM d yyyy").join(","), expected);
    equals(time.strptime("Oct 25, 2006", "MMM d, yyyy").join(","), expected);
    equals(time.strptime("25 Oct 2006", "d MMM yyyy").join(","), expected);
    equals(time.strptime("25 Oct, 2006", "d MMM, yyyy").join(","), expected);
    equals(time.strptime("October 25 2006", "MMMM d yyyy").join(","), expected);
    equals(time.strptime("October 25, 2006", "MMMM d, yyyy").join(","), expected);
    equals(time.strptime("25 October 2006", "d MMMM yyyy").join(","), expected);
    equals(time.strptime("25 October, 2006", "d MMMM, yyyy").join(","), expected);

    // Default time formats from django.newforms.fields
    equals(time.strptime("14:30:59", "H:m:s").join(","),
           [1900, 1, 1, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("14:30", "H:m").join(","),
           [1900, 1, 1, 14, 30, 0, 0, 1, -1].join(","));

    // Default datetime formats from django.newforms.fields
    equals(time.strptime("2006-10-25 14:30:59", "yyyy-M-d H:m:s").join(","),
           [2006, 10, 25, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("2006-10-25 14:30", "yyyy-M-d H:m").join(","),
           [2006, 10, 25, 14, 30, 0, 0, 1, -1].join(","));
    equals(time.strptime("2006-10-25", "yyyy-M-d").join(","),
           [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/2006 14:30:59", "M/d/yyyy H:m:s").join(","),
           [2006, 10, 25, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("10/25/2006 14:30", "M/d/yyyy H:m").join(","),
           [2006, 10, 25, 14, 30, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/2006", "M/d/yyyy").join(","),
           [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/06 14:30:59", "M/d/yy H:m:s").join(","),
           [2006, 10, 25, 14, 30, 59, 0, 1, -1].join(","));
    equals(time.strptime("10/25/06 14:30", "M/d/yy H:m").join(","),
           [2006, 10, 25, 14, 30, 0, 0, 1, -1].join(","));
    equals(time.strptime("10/25/06", "M/d/yy").join(","),
           [2006, 10, 25, 0, 0, 0, 0, 1, -1].join(","));

    // Leap years
    equals(time.strptime("2004-02-29", "yyyy-M-d").join(","),
           [2004, 2, 29, 0, 0, 0, 0, 1, -1].join(","),
           "Divisibile by 4, but not by 100");
    equals(time.strptime("2000-02-29", "yyyy-M-d").join(","),
           [2000, 2, 29, 0, 0, 0, 0, 1, -1].join(","),
           "Divisibile by 400");
    try
    {
        time.strptime("2200-02-29", "yyyy-M-d");
    }
    catch (e)
    {
        ok(true, "Divisible by 4 and 100, but not by 400, so not a leap year");
    }

    // Boundary tests
    var months = [
        ["January", "01", "31", "32"],
        ["February", "02", "28", "29"],
        ["March", "03", "31", "32"],
        ["April", "04", "30", "31"],
        ["May", "05", "31", "32"],
        ["June", "06", "30", "31"],
        ["July", "07", "31", "32"],
        ["August", "08", "31", "32"],
        ["September", "09", "30", "31"],
        ["October", "10", "31", "32"],
        ["November", "11", "30", "31"],
        ["December", "12", "31", "32"]
    ];

    for (var i = 0, month; month = months[i]; i++)
    {
        equals(time.strptime("2006-" + month[1] + "-" + month[2], "yyyy-M-d").join(","),
               [2006, parseInt(month[1], 10), parseInt(month[2], 10), 0, 0, 0, 0, 1, -1].join(","),
               month[0] + " has " + month[2] + " days");
        try
        {
            time.strptime("2006-" + month[1] + "-" + month[3], "yyyy-M-d");
        }
        catch (e)
        {
            ok(true, month[0] + " only has " + month[2] + " days");
        }
    }

    var boundaries = [
        ["0", "M", "month"],
        ["13", "M", "month"],
        ["0", "d", "day"],
        ["32", "d", "day"],
        ["24", "H", "hour"],
        ["60", "m", "minute"],
        ["60", "s", "second"]
    ];

    for (var i = 0, boundary; boundary = boundaries[i]; i++)
    {
        try
        {
            time.strptime(boundary[0], boundary[1]);
        }
        catch (e)
        {
            ok(true, boundary[0] + " is not a valid " + boundary[2]);
        }
    }
});

test("strftime", function()
{
    expect(3);

    // Default date/time format
    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "yyyy-MM-dd HH:mm:ss"),
           "2006-10-25 14:30:59");

    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "ddd dd MMM"), "Wed 25 Oct");
    equals(time.strftime(new Date(2006, 9, 25, 14, 30, 59), "dddd dd MMMM"), "Wednesday 25 October");
});
