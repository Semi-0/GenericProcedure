// import { get_element, set_element, get_length, is_array, push, slice, filter, map, reduce, first, rest, second, third, construct, isPair, isEmpty } from '../built_in_generics/generic_array';
// import { test, expect, describe } from "bun:test";

// // Helper function to run tests
// const runTest = (fn: Function, args: any[], expected: any) => {
//     expect(fn(...args)).toEqual(expected);
// };

// describe('GenericArray', () => {
//     // Test for get_element function
//     test('get_element', () => {
//         runTest(get_element, [[1, 2, 3], 1], 2);
//         runTest(get_element, [['a', 'b', 'c'], 2], 'c');
//     });

//     // Test for set_element function
//     test('set_element', () => {
//         runTest(set_element, [[1, 2, 3], 1, 4], [1, 4, 3]);
//         runTest(set_element, [['a', 'b', 'c'], 0, 'x'], ['x', 'b', 'c']);
//     });

//     // Test for get_length function
//     test('get_length', () => {
//         runTest(get_length, [[1, 2, 3]], 3);
//         runTest(get_length, [[]], 0);
//     });

//     // Test for isArray function
//     test('isArray', () => {
//         expect(is_array([])).toBe(true);
//         expect(is_array([1, 2, 3])).toBe(true);
//         expect(is_array({})).toBe(false);
//         expect(is_array('not an array')).toBe(false);
//     });

//     // Test for push function
//     test('push', () => {
//         runTest(push, [[1, 2], 3], [1, 2, 3]);
//         runTest(push, [[], 'first'], ['first']);
//     });

//     // Test for slice function
//     test('slice', () => {
//         runTest(slice, [[1, 2, 3, 4], 1, 3], [2, 3]);
//         runTest(slice, [[1, 2, 3, 4], 2], [3, 4]);
//     });

//     // Test for filter function
//     test('filter', () => {
//         runTest(filter, [[1, 2, 3, 4], (x: number) => x % 2 === 0], [2, 4]);
//         runTest(filter, [['a', 'b', 'c'], (x: string) => x !== 'b'], ['a', 'c']);
//     });

//     // Test for map function
//     test('map', () => {
//         runTest(map, [[1, 2, 3], (x: number) => x * 2], [2, 4, 6]);
//         runTest(map, [['a', 'b', 'c'], (x: string) => x.toUpperCase()], ['A', 'B', 'C']);
//     });

//     // Test for reduce function
//     test('reduce', () => {
//         runTest(reduce, [[1, 2, 3], (acc: number, x: number) => acc + x, 0], 6);
//         runTest(reduce, [['a', 'b', 'c'], (acc: string, x: string) => acc + x, ''], 'abc');
//     });

//     // Test for first function
//     test('first', () => {
//         runTest(first, [[1, 2, 3]], 1);
//         runTest(first, [['a', 'b', 'c']], 'a');
//     });

//     // Test for rest function
//     test('rest', () => {
//         runTest(rest, [[1, 2, 3]], [2, 3]);
//         runTest(rest, [['a', 'b', 'c']], ['b', 'c']);
//     });

//     // Test for second function
//     test('second', () => {
//         runTest(second, [[1, 2, 3]], 2);
//         runTest(second, [['a', 'b', 'c']], 'b');
//     });

//     // Test for third function
//     test('third', () => {
//         runTest(third, [[1, 2, 3, 4]], 3);
//         runTest(third, [['a', 'b', 'c', 'd']], 'c');
//     });

//     // Test for construct function
//     test('construct', () => {
//         runTest(construct, [1, 2, 3], [1, 2, 3]);
//         runTest(construct, ['a', 'b', 'c'], ['a', 'b', 'c']);
//     });

//     // Test for isPair function
//     test('isPair', () => {
//         expect(isPair([1])).toBe(true);
//         expect(isPair([1, 2])).toBe(true);
//         expect(isPair([])).toBe(false);
//     });

//     // Test for isEmpty function
//     test('isEmpty', () => {
//         expect(isEmpty([])).toBe(true);
//         expect(isEmpty([1])).toBe(false);
//     });
// });
