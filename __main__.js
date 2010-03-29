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

ak.use('ak', '0.1');
ak.update(this, ak);

include('__init__.js');
update(this, form, form._internal);


var testCaseClass;
var testCount;


function module(name) {
  testCaseClass.prototype.name = name;
}


var test = function (name, func) {
  testCaseClass.prototype['test' + name] = func;
};


function expect(count) {
  testCount += count;
}


function makeCheck(func) {
  return function () {
    --testCount;
    func.apply(this, arguments);
  };
}


var ok = makeCheck(assert);
var equals = makeCheck(assertSame);


var same = makeCheck(
  function (lhs, rhs, /* optional */message) {
    try {
      assertEqual(lhs, rhs, message);
    } catch (error) {
      if (error instanceof AssertionError &&
          lhs instanceof Object && rhs instanceof Object) {
        if (lhs.__proto__ === Object.prototype &&
            rhs.__proto__ === Object.prototype) {
          assertEqual(items(lhs), items(rhs), message);
          return;
        }
        if (lhs.__proto__ === Array.prototype &&
            rhs.__proto__ === Array.prototype) {
          assertEqual(lhs.map(items), rhs.map(items), message);
          return;
        }
      }
      throw error;
    }
  });


var tests = new Module('tests');


[
  'errormessages',
  'extra',
  'fields',
  'formsets',
  'forms',
  'time',
  'util',
  'widgets'
].forEach(
  function (name) {
    testCaseClass = TestCase.subclass();
    include('tests/{0}.js'.format(name));
    tests[name] = testCaseClass;
    testCaseClass = undefined;
  });


test = function () {
  testCount = 0;
  var result = ak.test(tests);
  if (testCount != 0)
    result += '\nFAILED testCount=' + testCount;
  return result;
};


function __main__(request) {
  return redirect('http://www.akshell.com/apps/form/');
}
