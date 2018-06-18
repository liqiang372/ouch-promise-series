const pSeries = require('./index');
const createPromise = (time, index, callback) => () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback(index);
      resolve(index);
    }, time)
  })
}

describe('Basic flow', () => {
  test('should run promises in series', () => {
    const items = Array(10).fill(0).map((_, index) => index);
    const toBeTest = []
    const promiseFactoryList = items.map((item) => {
      return createPromise((Math.random() * 400).toFixed(0), item, (value) => {toBeTest.push(value)})
    });
    return pSeries(promiseFactoryList).then(() => expect(toBeTest).toEqual(items));
  });

  test('should receive resolved value from previous promise by default', () => {
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
    return pSeries([
      loginUser,
      getUserInfo,
      getBookListForUser
    ]).then((books) => {expect(books).toEqual(['book 1', 'book 2', 'book 3'])});
  })
});

describe('Allow access to parent value', () => {
  let toBeTest;
  let callback;
  let first;
  let second;
  let third;
  let add;
  beforeEach(() => {
    toBeTest = [];
    callback = (value) => toBeTest.push(value);
    first = createPromise(800, 1, callback);
    second = createPromise(700, 2, callback);
    third = createPromise(600, 3, callback);
    add = (num1, num2) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(num1 + num2);
        }, 300)
      })
    }
  });

  test('should have access to parent value', () => {
    return pSeries([
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
      expect(toBeTest).toEqual([1, 2, 3]);
      expect(result).toBe(3);
    })
  });

  test('should also work in array form', () => {
    return pSeries([
      [first, 'firstValue'],
      [second, 'secondValue'],
      third,
      [add, '< firstValue', '<secondValue'] // space is optional
    ]).then((result) => {
      expect(toBeTest).toEqual([1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  test('should also work in both array and object form', () => {
    return pSeries([
      {
        fn: first,
        output: 'firstValue'
      },
      [second, 'secondValue'],
      [third],
      [add, '< firstValue', '<secondValue'] // space is optional
    ]).then((result) => {
      expect(toBeTest).toEqual([1, 2, 3]);
      expect(result).toBe(3);
    });
  });
});