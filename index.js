'use strict';
function pSeries(list) {
  var initP = Promise.resolve();
  var shared = {};
  var lastOutput;
  var output;
  var input;
  var fn;
  return list.reduce(function(pacc, item) {
    return pacc = pacc.then(function(result) {
      if (isArray(item)) {
        if (item.length === 0) {
          return Promise.resolve();
        }
        fn = item[0];
        const options = item.slice(1);
        output = options.filter(function(option) {
          return !isInput(option);
        });
        input = options.filter(function(option) {
          return isInput(option);
        }).map(function(option) {
          return option.substring(1).trim();
        });
      } else if (typeof item === 'object') {
        fn = item.fn;
        output = item.output;
        input = item.input;
      } else {
        fn = item;
      }
      if (typeof lastOutput !== 'undefined') {
        shared[lastOutput] = result;
      }
      lastOutput = output;
      output = undefined;

      let nextArgs;
      if (typeof input === 'undefined' || isEmptyArray(input)) {
        nextArgs = [result];
      } else {
        if (!isArray(input)) {
          input = [input];
        }
        nextArgs = input.map(function(key) {
          return shared[key];
        })
      }
      return fn.apply(undefined, nextArgs);
    })
  }, initP);
}

function isInput(str) {
  return str.indexOf('<') > -1;
}

function isArray(input) {
  return Array.isArray(input);
}

function isEmptyArray(input) {
  return isArray(input) && input.length === 0;
}

module.exports = pSeries;