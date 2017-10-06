# dataloader-align-results

[![Build Status](https://travis-ci.org/eddyystop/dataloader-align-results.png?branch=master)](https://travis-ci.org/eddyystop/dataloader-align-results)
[![Code Climate](https://codeclimate.com/github/eddyystop/dataloader-align-results/badges/gpa.svg)](https://codeclimate.com/github/eddyystop/dataloader-align-results)
[![Test Coverage](https://codeclimate.com/github/eddyystop/dataloader-align-results/badges/coverage.svg)](https://codeclimate.com/github/eddyystop/dataloader-align-results/coverage)
[![Dependency Status](https://img.shields.io/david/eddyystop/dataloader-align-results.svg?style=flat-square)](https://david-dm.org/eddyystop/dataloader-align-results)
[![Download Status](https://img.shields.io/npm/dm/dataloader-align-results.svg?style=flat-square)](https://www.npmjs.com/package/dataloader-align-results)

> Align your back-end service results with the keys DataLoader provided to the batch loading function.

| **Work in progress. Do not use.**

## Installation

```
npm install dataloader-align-results --save
```

## Documentation

**To do.**

## Complete Example

```js
const DataLoader = require('dataloader');
const dataloaderAlignResults = require('dataloader-align-results');
 
const userLoader = new DataLoader(keys => myBatchGetUsers(keys));
const userAlignResults = dataloaderAlignResults(/* ... */);
 
// These logical reads will be resolved with one call to the back-end service.
Promise.all([
  userLoader.load(3),
  userLoader.load(2),
  userLoader.load(4),
  userLoader.load(1),
])
  .then(resolvedResults => { /* ... */ });

 
function myBatchGetUsers(keys) {
  return callBatchGetUsers(keys) // Returns an array of objects, in any order, for these keys.
    .then(resultsArray => userAlignResults(resultsArray, keys));
}
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
