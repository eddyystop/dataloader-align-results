# dataloader-align-results

[![Dependency Status](https://img.shields.io/david/eddyystop/dataloader-align-results.svg?style=flat-square)](https://david-dm.org/eddyystop/dataloader-align-results)
[![Download Status](https://img.shields.io/npm/dm/dataloader-align-results.svg?style=flat-square)](https://www.npmjs.com/package/dataloader-align-results)

> Takes your back-end results and returns an Array acceptable to DataLoader.

## Installation

```
npm install dataloader-align-results --save
```

## Documentation

To uphold the constraints of the DataLoader batch function, e.g. `new DataLoader(callBatchGetUsers)`,
the batch function must return an Array of values the same length as the Array of keys,
and re-order them to ensure each index aligns with the original keys.

The back-end service typically returns results in a different order than we requested,
and it typically omits a result for some keys when no value exists for that key.

This utility takes such back-end results and returns an Array acceptable to DataLoader.

`dataLoaderAlignResults({ graphqlType, serializeDataLoaderKey, serializeRecordKey, onError });`

- `grapgqlType` (string) - Type of GraphQL result to return for each DataLoader key
    - '[!]!' - An array of non-null objects.
    - '[!]'  - An array of non-null objects, or `null`.
    - '[]'   - An array of elements each of which is either an object or `null`. The array may be empty.
    - '!'    - A non-null object.
    - ''     - An object or `null`.
- `serializeDataLoaderKey` (optional, function(key)) - Function to serialize a key passed from DataLoader.
    - A non-trivial serialization function should more efficiently be passed to DataLoader,
    e.g. `new DataLoader(keys => {/* ... */}, { cacheKeyFn: serializeDataLoaderKey })`,
    than to dataLoaderAlignResults.
    - Defaults to the trivial `key => key.toString()`.
- `serializeRecordKey` (optional, function(record) or string) - Function to serialize key from the record.
    - The resulting value must be strictly equal to that produced by serializeDataLoaderKey,
    or passed by DataLoader.
    - If a string is provided, `record => record[serializeRecordKey].toString()` is used.
- `onError` (optional, function(msg, detail)) - Handler for terminal errors.
    - Errors are ignored if onError is not provided.
    
dataLoaderAlignResults returns a `function(keys, resultsArray)` which should be passed to DataLoader
as its first parameter.

- `keys` - The keys passed from the DataLoader.
- `resultsArray` - Result from back-end service after processing the `keys`.
    - Results are likely in a different order than that of `keys`.
    - A result may be omitted for some keys.

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
  return callBatchGetUsers(keys) // Call back-end service.
    .then(resultsArray => userAlignResults(resultsArray, keys));
}
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
