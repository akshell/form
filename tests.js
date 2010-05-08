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


var testCaseClass;
var count;
var expected;


var BaseTestCase = TestCase.subclass(
  {
    setUp: function () {
      count = 0;
      expected = undefined;
    },

    tearDown: function () {
      assert(!expected || expected == count);
    }
  });


function makeCheck(func) {
  return function () {
    ++count;
    func.apply(this, arguments);
  };
}


exports.scope = update(
  {},
  require('index'),
  require('util'),
  require('forms'),
  require('DOMBuilder'),
  {
    time: require('time'),

    test: function (name, func) {
      testCaseClass.prototype['test' + name] = func;
    },

    expect: function (num) {
      count = 0;
      expected = num;
    },

    ok: makeCheck(assert),

    equals: makeCheck(assertSame),

    same: makeCheck(
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
      })
  });


exports.tests = {};


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
    exports.tests[name] = testCaseClass = BaseTestCase.subclass({name: name});
    require('tests/' + name);
  });
