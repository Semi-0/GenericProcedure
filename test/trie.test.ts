import { Trie } from '../Trie';
import { test, expect, describe, beforeEach } from "bun:test";

describe('Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  test('should set and get a value using predicates', () => {
    const isHello = (x: any) => x === 'hello';
    trie.setPathValue([isHello], 'world');
    expect(trie.getAValue(['hello'])).toBe('world');
  });

  test('should throw error for non-existent key', () => {
    const nonExistent = (x: any) => x === 'nonexistent';
    expect(() => trie.getAValue(['nonexistent'])).toThrow('Unable to match features: nonexistent');
  });

  test('should handle multiple key-value pairs', () => {
    const isFoo = (x: any) => x === 'foo';
    const isBaz = (x: any) => x === 'baz';
    trie.setPathValue([isFoo], 'bar');
    trie.setPathValue([isBaz], 'qux');
    expect(trie.getAValue(['foo'])).toBe('bar');
    expect(trie.getAValue(['baz'])).toBe('qux');
  });

  test('should handle nested keys', () => {
    const isA = (x: any) => x === 'a';
    const isB = (x: any) => x === 'b';
    const isC = (x: any) => x === 'c';
    trie.setPathValue([isA, isB, isC], 123);
    expect(trie.getAValue(['a', 'b', 'c'])).toBe(123);
    expect(() => trie.getAValue(['a', 'b'])).toThrow('Unable to match features: a,b');
  });

  test('should overwrite existing values', () => {
    const isKey = (x: any) => x === 'key';
    trie.setPathValue([isKey], 'old value');
    trie.setPathValue([isKey], 'new value');
    expect(trie.getAValue(['key'])).toBe('new value');
  });

  test('should handle empty key array', () => {
    trie.setPathValue([], 'root value');
    expect(trie.getAValue([])).toBe('root value');
  });

  test('should handle various value types', () => {
    const isNumber = (x: any) => x === 'number';
    const isBoolean = (x: any) => x === 'boolean';
    const isObject = (x: any) => x === 'object';
    const isArray = (x: any) => x === 'array';

    trie.setPathValue([isNumber], 42);
    trie.setPathValue([isBoolean], true);
    trie.setPathValue([isObject], { foo: 'bar' });
    trie.setPathValue([isArray], [1, 2, 3]);

    expect(trie.getAValue(['number'])).toBe(42);
    expect(trie.getAValue(['boolean'])).toBe(true);
    expect(trie.getAValue(['object'])).toEqual({ foo: 'bar' });
    expect(trie.getAValue(['array'])).toEqual([1, 2, 3]);
  });

  test('should handle multi-dimensional paths', () => {
    const isNumber = (x: any) => x === 'number';
    const isBoolean = (x: any) => x === 'boolean';
    const isNested = (x: any) => x === 'nested';

    trie.setPathValue([isNumber, isBoolean], 'number-boolean');
    trie.setPathValue([isNumber, isNested], 'number-nested');

    expect(trie.getAValue(['number', 'boolean'])).toBe('number-boolean');
    expect(trie.getAValue(['number', 'nested'])).toBe('number-nested');
  });

  test('should get all matching values', () => {
    const isEven = (x: any) => typeof x === 'number' && x % 2 === 0;
    const isNegative = (x: any) => typeof x === 'number' && x < 0;

    trie.setPathValue([isEven], 'even');
    trie.setPathValue([isNegative], 'negative');

    expect(trie.getAllValues([4])).toEqual(['even']);
    expect(trie.getAllValues([-3])).toEqual(['negative']);
    expect(trie.getAllValues([-2])).toEqual(['even', 'negative']);
    expect(trie.getAllValues([1])).toEqual([]);
  });


});