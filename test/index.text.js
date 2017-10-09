
const { assert } = require('chai');
const dataloaderAlignResults = require('../lib');

const resultsObj = [0, 1, 2].map(id => ({ id, value: id }));
const collection1 = [0, 1, 2, 1].map(id => ({ id, value: id }));
const result1 = [
  [ { id: 0, value: 0 } ],
  [ { id: 1, value: 1 }, { id: 1, value: 1 } ],
  [ { id: 2, value: 2 } ]
];

let onErrorCalled;

const onError = (index, detail) => {
  onErrorCalled = true;
  // console.log(`#${index} ${detail}`);
};

describe('index.test.js', () => {
  beforeEach(() => {
    onErrorCalled = false;
  });

  describe('basic tests', () => {
    it('returns a function', () => {
      assert.isFunction(dataloaderAlignResults({ graphqlType: '' }));
    });
  });

  describe("test ''", () => {
    it('results in key order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([0, 1, 2], resultsObj);
      const expected = resultsObj;

      assert.deepEqual(actual, expected);
    });

    it('results in mixed order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 0, 1], resultsObj);
      const expected = [resultsObj[2], resultsObj[0], resultsObj[1]];

      assert.deepEqual(actual, expected);
    });

    it('results missing', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 99, 0, 98, 1, 97], resultsObj);
      const expected = [resultsObj[2], null, resultsObj[0], null, resultsObj[1], null];

      assert.deepEqual(actual, expected);
    });
  });

  describe("test '!'", () => {
    it('results in key order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([0, 1, 2], resultsObj);
      const expected = resultsObj;

      assert.deepEqual(actual, expected);
    });

    it('results in mixed order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 0, 1], resultsObj);
      const expected = [resultsObj[2], resultsObj[0], resultsObj[1]];

      assert.deepEqual(actual, expected);
    });

    it('results missing', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '!', serializeRecordKey: 'id', onError, isStrict: true });

      aligner([2, 99, 0, 98, 1, 97], resultsObj);
      assert(onErrorCalled, 'should not have succeeded');
    });
  });

  describe("test '[]'", () => {
    it('results in key order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]', serializeRecordKey: 'id', onError, isStrict: true });
      assert.deepEqual(aligner([0, 1, 2], collection1), result1);
    });

    it('results in mixed order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 0, 1], collection1);
      const expected = [result1[2], result1[0], result1[1]];

      assert.deepEqual(actual, expected);
    });

    it('results missing', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 99, 0, 98, 1, 97], collection1);
      const expected = [result1[2], null, result1[0], null, result1[1], null];

      // console.log('actual=', actual);
      // console.log('expected=', expected);

      assert.deepEqual(actual, expected);
    });
  });

  describe("test '[!]'", () => {
    it('results in key order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[!]', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([0, 1, 2], collection1);
      const expected = result1;

      assert.deepEqual(actual, expected);
    });

    it('results in mixed order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[!]', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 0, 1], collection1);
      const expected = [result1[2], result1[0], result1[1]];

      assert.deepEqual(actual, expected);
    });

    it('results missing', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[!]', serializeRecordKey: 'id', onError, isStrict: true });

      aligner([2, 99, 0, 98, 1, 97], collection1);
      assert(onErrorCalled, 'should not have succeeded');
    });
  });

  describe("test '[]!'", () => {
    it('results in key order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]!', serializeRecordKey: 'id', onError, isStrict: true });
      assert.deepEqual(aligner([0, 1, 2], collection1), result1);
    });

    it('results in mixed order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 0, 1], collection1);
      const expected = [result1[2], result1[0], result1[1]];

      assert.deepEqual(actual, expected);
    });

    it('results missing', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 99, 0, 98, 1, 97], collection1);
      const expected = [result1[2], null, result1[0], null, result1[1], null];

      assert.deepEqual(actual, expected);
    });

    it('no results', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([99, 98, 97], collection1);
      const expected = [null, null, null];

      assert.deepEqual(actual, expected);
    });
  });

  describe("test '[!]!'", () => {
    it('results in key order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[!]!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([0, 1, 2], collection1);
      const expected = result1;

      assert.deepEqual(actual, expected);
    });

    it('results in mixed order', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[!]!', serializeRecordKey: 'id', onError, isStrict: true });
      const actual = aligner([2, 0, 1], collection1);
      const expected = [result1[2], result1[0], result1[1]];

      assert.deepEqual(actual, expected);
    });

    it('results missing', () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[!]!', serializeRecordKey: 'id', onError, isStrict: true });

      aligner([2, 99, 0, 98, 1, 97], collection1);
      assert(onErrorCalled, 'should not have succeeded');
    });
  });

  describe('test isStrict: false', () => {
    it("test ''", () => {
      const aligner = dataloaderAlignResults({ graphqlType: '', serializeRecordKey: 'id', onError });
      const actual = aligner([2, 99, 0, 98, 1, 97], resultsObj);
      const expected = [resultsObj[2], [], resultsObj[0], [], resultsObj[1], []];

      assert.deepEqual(actual, expected);
    });

    it("test '[]!'", () => {
      const aligner = dataloaderAlignResults({ graphqlType: '[]!', serializeRecordKey: 'id', onError });
      const actual = aligner([99, 98, 97], collection1);
      const expected = [[], [], []];

      assert.deepEqual(actual, expected);
    });
  });
});
