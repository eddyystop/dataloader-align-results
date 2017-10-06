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

To uphold the constraints of the DataLoader batch function, e.g. `new DataLoader(callBatchGetUsers)`,
the batch function must return an Array of values the same length as the Array of keys,
and re-order them to ensure each index aligns with the original keys.

This utility takes the results provided by the back-end service and returns an Array acceptable to DataLoader.

`dataLoaderAlignResults({ graphqlType, serializeDataLoaderKey, serializeRecordKey, onError });`

- `grapgqlType` (string)- Type of GraphQL result to return for each DataLoader key
    - '[!]!' - required collection of required elements
    - '[!]'  - optional collection of required elements
    - '[]'   - optional collection of optional elements
    - '!'    - required object
    - ''     - optional object
- `serializeDataLoaderKey` (optional, function(key)) - Function to serialize a key passed from DataLoader.
    - A non-trivial serialization function should more efficiently be passed to DataLoader,
    e.g. `new DataLoader(dataLoaderAlignResults, { cacheKeyFn: serializeDataLoaderKey })`,
    than to dataLoaderAlignResults.
    - Defaults to the trivial `key => key.toString()`.
- `serializeRecordKey` (optional, function(record) or string) - Function to serialize key from the record.
    - The resulting value must strictly equal that produced by `serializeDataLoaderKey`,
    or passed by DataLoader.
    - If a string is provided, `record => record[serializeRecordKey].toString()` is used.
- `onError` (optional, function(msg, detail)) - Handler for terminal errors.
    - Errors are ignored if `onError` is not provided.
    
`dataLoaderAlignResults` returns a `function(resultsArray, keys)` which is passed to DataLoader
as its first parameter.

- `keys` - The keys passed from the DataLoader.
- `resultsArray` - Result from back-end service after processing the `keys`.
    - Results are likely in a different order than that of `keys`,
    likely because it was more efficient for it to do so.
    - A result may be omitted for some keys, which we can interpret as no value existing for that key.
    
- returns an array in 1:1 correspondence with the array of keys provided by DataLoader.
The possible values of each element depend on `grapgqlType`:
    - '[!]!' - An array of non-null objects.
    - '[!]'  - An array of non-null objects, ori `null`.
    - '[]'   - An array of elements each of which is either an object or `null`.
    - '!'    - A non-null object.
    - ''     - An object or `null`.

## Complete Example

```js
const DataLoader = require('dataloader');
const dataloaderAlignResults = require('dataloader-align-results');
 
const userLoader = new DataLoader(keys => myBatchGetUsers(keys));
const userAlignResults = dataloaderAlignResults({
  graphqlType: '!', onError: (msg, detail) => { throw new Error(`${msg}\n${detail}`); } });
 
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
