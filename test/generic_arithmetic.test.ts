import { add, subtract, multiply, divide, is_equal } from '../built_in_generics/generic_arithmetic';
import { to_string } from '../built_in_generics/generic_conversation';
import { deepCopy } from '../built_in_generics/other_generic_helper';
import { test, expect, describe, beforeEach, mock, jest } from "bun:test";

// Helper function to run tests
const runTest = (fn: Function, args: any[], expected: any) => {
    expect(fn(...args)).toEqual(expected);
};

describe('BuiltInGenerics', () => {
    // Test for add function
    test('add', () => {
        runTest(add, [1, 2], 3);
        runTest(add, [[1, 2], [3, 4]], [1, 2, 3, 4]);
        runTest(add, [[1, 2], 3], [1, 2, 3]);
    });

    // Test for subtract function
    test('subtract', () => {
        runTest(subtract, [5, 3], 2);
        runTest(subtract, [[1, 2, 3], 2], [1, 3]);
        runTest(subtract, [[1, 2, 3], [2, 3]], [1]);
    });

    // Test for multiply function
    test('multiply', () => {
        runTest(multiply, [2, 3], 6);
    });

    // Test for divide function
    test('divide', () => {
        runTest(divide, [6, 3], 2);
    });

    // Test for to_string function
    test('to_string', () => {
        runTest(to_string, [null], 'null');
        runTest(to_string, [undefined], 'undefined');
        runTest(to_string, [true], 'true');
        runTest(to_string, [123], '123');
        runTest(to_string, [[1, 2, 3]], '[1,2,3]');
        runTest(to_string, [{ a: 1 }], '{"a":1}');
    });

    // Test for deepCopy function
    describe('deepCopy', () => {
        test('should return the same primitive value', () => {
            expect(deepCopy(42)).toBe(42);
            expect(deepCopy('hello')).toBe('hello');
            expect(deepCopy(true)).toBe(true);
            expect(deepCopy(null)).toBe(null);
        });

        test('should deeply copy an array', () => {
            const arr = [1, 2, { a: 3 }];
            const copiedArr = deepCopy(arr);
            expect(copiedArr).toEqual(arr);
            expect(copiedArr).not.toBe(arr);
            expect(copiedArr[2]).not.toBe(arr[2]);
        });

        test('should deeply copy an object', () => {
            const obj = { a: 1, b: { c: 2 } };
            const copiedObj = deepCopy(obj);
            expect(copiedObj).toEqual(obj);
            expect(copiedObj).not.toBe(obj);
            expect(copiedObj.b).not.toBe(obj.b);
        });

        test('should handle nested structures', () => {
            const nested = { a: [1, { b: 2 }] };
            const copiedNested = deepCopy(nested);
            expect(copiedNested).toEqual(nested);
            expect(copiedNested).not.toBe(nested);
            expect(copiedNested.a[1]).not.toBe(nested.a[1]);
        });
    });

    // Test for is_equal function
    describe('is_equal', () => {
        test('should return true for equal primitive values', () => {
            expect(is_equal(42, 42)).toBe(true);
            expect(is_equal('hello', 'hello')).toBe(true);
            expect(is_equal(true, true)).toBe(true);
            expect(is_equal(null, null)).toBe(true);
        });

        test('should return false for different primitive values', () => {
            expect(is_equal(42, 43)).toBe(false);
            expect(is_equal('hello', 'world')).toBe(false);
            expect(is_equal(true, false)).toBe(false);
            expect(is_equal(null, undefined)).toBe(false);
        });

        test('should return true for equal arrays', () => {
            expect(is_equal([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(is_equal([], [])).toBe(true);
        });

        test('should return false for different arrays', () => {
            expect(is_equal([1, 2, 3], [1, 2, 4])).toBe(false);
            expect(is_equal([1, 2, 3], [1, 2])).toBe(false);
        });

        test('should handle nested arrays', () => {
            expect(is_equal([1, [2, 3]], [1, [2, 3]])).toBe(true);
            expect(is_equal([1, [2, 3]], [1, [2, 4]])).toBe(false);
        });
    });
});