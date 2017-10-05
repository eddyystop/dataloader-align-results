
const checkTypes = {
  '[!]!': { collection: true, elemReqd: true, resultReqd: true },
  '[!]': { collection: true, elemReqd: true, resultReqd: false },
  '[]!': { collection: true, elemReqd: false, resultReqd: true },
  '[]': { collection: true, elemReqd: false, resultReqd: false },
  '!': { collection: false, elemReqd: null, resultReqd: true },
  '': { collection: false, elemReqd: null, resultReqd: false },
};

module.exports = dataLoaderAlignResults;

function dataLoaderAlignResults(options) {
  let { dlName, type, serializeRecordKey, serializeDataLoaderKey, fieldName, onError } = options;
  const { collection, elemReqd, resultReqd } = checkTypes[type];
  
  serializeRecordKey = serializeRecordKey || (record => record[fieldName].toString());
  
  serializeDataLoaderKey = serializeDataLoaderKey || (key => key.toString());
  
  
  // keys = [3, 2, 4, 1]
  // resultArray =  {id: 1, bar: 10} or [{id: 1, bar: 10}, {id: 1, bar: 11}, {id: 2, bar: 12}]
  return function dataLoaderAlignResultsInner (keys, resultArray) {
    function error(i, msg) {
      if (onError) {
        onError(`DataLoader "${dlName}" type ${type} #${i} value ${JSON.stringify(keys[i])}`, msg);
      }
    }
    
    // Processing requires resultArray to be an array.
    if (resultArray === null) resultArray = [];
    if (typeof resultArray === 'object' && !Array.isArray(resultArray)) resultArray = [resultArray];
    
    // hash = { '1': {id: 1, bar: 10} } or { '1': [{id: 1, bar: 10}, {id: 1, bar: 11}], 2: [{id: 2, bar: 12}] }
    const hash = Object.create(null); // Prevent index clashes with prototype property name.
    
    resultArray.forEach((obj, i) => {
      if (!obj && elemReqd) {
        error(i, `This result requires a non-null result.`);
      }
      
      const recKey = serializeRecordKey(obj);
      
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
          error(i, `This result needs a single GraphQL object. A collection of ${value.length} elements was found.`);
        }
        
        hash[key] = value[0];
      });
    }
    
    // Return results aligned with DataLoader provided keys.
    // keys = [3, 2, 4, 1]
    // hash = { '1': {id: 1, bar: 10} } or { '1': [{id: 1, bar: 10}, {id: 1, bar: 11}], 2: [{id: 2, bar: 12}] }
    // return [null, [{id: 2, bar: 12}], null, [{id: 1, bar: 10}, {id: 1, bar: 11}]
    return keys.map((key, i) => {
      const serializedKey = serializeDataLoaderKey(key);
      const value = hash[serializedKey] || null;
      
      if (!value && resultReqd) {
        error(i, `This key requires a non-null GraphQL result. Null or empty-array found.`);
      }
      
      return (!value && collection) ? [] : value; // Return array instead of null if [User]
    });
  };
}
