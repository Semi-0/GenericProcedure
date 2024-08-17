import { add, subtract, multiply, divide, to_string } from '../BuiltInGenerics';
import {test, expect, describe, beforeEach, mock, jest} from "bun:test";
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
});