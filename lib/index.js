
// Note that we cannot cannot verify []! or [!]! contain any non-null elements as
// the DataLoader forms the final Array from elements we return here and elements in the cache.
const checkTypes = {
  '[!]!': { collection: true, elemReqd: true },
  '[!]': { collection: true, elemReqd: true },
  '[]!': { collection: true, elemReqd: false },
  '[]': { collection: true, elemReqd: false },
  '!': { collection: false, elemReqd: true },
  '': { collection: false, elemReqd: false }
};

module.exports = function dataLoaderAlignResults (options = {}) {
  // Note that serializeDataLoaderKey can more efficiently be passed to DataLoader as cacheKeyFn
  const { graphqlType, serializeRecordKey,
    serializeDataLoaderKey = key => key.toString(), onError = () => {} } = options;
  
  const getRecKey = typeof serializeRecordKey === 'function'
    ? serializeRecordKey : record => record[serializeRecordKey].toString();

  if (!checkTypes[graphqlType]) {
    onError(null, `Invalid graphqlType option in dataLoaderAlignResults.`);
  }

  const { collection, elemReqd } = checkTypes[graphqlType];

  // keys = [3, 2, 4, 1]
  // resultArray =  {id: 1, bar: 10} or [{id: 1, bar: 10}, {id: 1, bar: 11}, {id: 2, bar: 12}]
  return function dataLoaderAlignResultsInner (keys, resultArray) {
    if (resultArray === null) resultArray = [];
    if (typeof resultArray === 'object' && !Array.isArray(resultArray)) resultArray = [resultArray];

    // hash = { '1': {id: 1, bar: 10} } or { '1': [{id: 1, bar: 10}, {id: 1, bar: 11}], 2: [{id: 2, bar: 12}] }
    const hash = Object.create(null); // Prevent index clashes with prototype property names.

    resultArray.forEach((obj, i) => {
      if (!obj && elemReqd) {
        onError(i, `This result requires a non-null result.`);
      }

      const recKey = getRecKey(obj);

      if (!hash[recKey]) hash[recKey] = [];
      hash[recKey].push(obj);
    });

    // Convert hash to single records if required.
    // from = { '1': [{id: 1, bar: 10}], '2': [{id: 2, bar: 12}] }
    // to = { '1': {id: 1, bar: 10}, '2': {id: 2, bar: 12} }
    if (!collection) {
      Object.keys(hash).forEach((key, i) => {
        const value = hash[key];

        if (value.length !== 1) {
          onError(i, `This result needs a single GraphQL object. A collection of ${value.length} elements was found.`);
        }

        hash[key] = value[0];
      });
    }
    
    // Return results aligned with DataLoader provided keys.
    // keys = [3, 2, 4, 1]
    // hash = { '1': {id: 1, bar: 10} } or { '1': [{id: 1, bar: 10}, {id: 1, bar: 11}], 2: [{id: 2, bar: 12}] }
    // return [null, [{id: 2, bar: 12}], null, [{id: 1, bar: 10}, {id: 1, bar: 11}]
    return  keys.map((key, i) => {
      const serializedKey = serializeDataLoaderKey(key);
      const value = hash[serializedKey] || null;

      if (!value && elemReqd) {
        onError(i, `This key requires a non-null GraphQL result. Null or empty-array found.`);
      }
  
      return value;
    });
  };
};
