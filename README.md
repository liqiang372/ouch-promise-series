Ouch-Promise-Series
=============
A small promise utility library that allows following promise have access to precedent/parent promises resolved value;

## Installation
```bash
$ npm install ouch-promise-series --save
```

## Basic promises in series
```js
const pSeries = require('ouch-promise-series');

// Real life async calls
function loginUser() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('mary');
    }, 500);
  })
}
function getUserInfo(user) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user === 'mary') {
        resolve({
          starred: 'romantic'
        });
      } else {
        resolve({})
      }
    }, 300)
  })
}
function getBookListForUser({starred}) {
  return new Promise((resolve, reject) => {
    if (starred === 'romantic') {
      resolve(['book 1', 'book 2', 'book 3']);
    } else {
      resolve(['no book']);
    }
  });
}

pSeries([
  loginUser,
  getUserInfo,
  getBookListForUser
]).then((books) => {console.log(books)}); // ['book 1', 'book 2', 'book 3']
```
By default, promise will receive the resolved value of previous adjacent promise.

## Access early previous promise resolved value
`pSeries` accepts a list where each member could be either of following interface

```js
{
  fn: Function    // required, return a promise
  output?: string // optional, the variable name you give for its resolved value
  input?: string  // optional, the variable you want to take as arguments
}

// or more succinct
fn,            // a normal function returns a promise
[fn, 'output'] // a following normal string will be the output name
[fn, '< input'] // a following string with '<' will be the input
[fn, 'bookList', '< username', '< userPreference'] // they can be combined in whatever order
```

See in action

```js
const createPromise = (time, index) => () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(index);
    }, time)
  })
}

const first = createPromise(800, 1);
const second = createPromise(700, 2);
const third = createPromise(600, 3);
const add = (num1, num2) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(num1 + num2);
    }, 300)
  })
}

pSeries([
  {
    fn: first,
    output: 'firstValue'
  },
  {
    fn: second,
    output: 'secondValue'
  },
  {
    fn: third,
  },
  {
    fn: add,
    input: ['firstValue', 'secondValue']
  }
]).then((result) => {
  console.log(result) // 3
})

// or Array form
pSeries([
  [first, 'firstValue'],
  [second, 'secondValue'],
  third,
  [add, '< firstValue', '<secondValue'] // space is optional
]).then((result) => {
  console.log(result) // 3
});

// or mixed usage

pSeries([
  {
    fn: first,
    output: 'firstValue'
  },
  [second, 'secondValue'],
  [third],
  [add, '< firstValue', '<secondValue'] // space is optional
]).then((result) => {
  console.log(result) // 3
});

```

## LICENSE
MIT


