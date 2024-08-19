import { deepCopy } from '../built_in_generics/other_generic_helper';
import { test, expect, describe } from "bun:test";
describe('deepCopy', () => {
    test('should return the same primitive value', () => {
        expect(deepCopy(42)).toBe(42);
        expect(deepCopy('hello')).toBe('hello');
        expect(deepCopy(true)).toBe(true);
    });

    test('should return a deep copy of an array', () => {
        const arr = [1, 2, { a: 3 }];
        const copiedArr = deepCopy(arr);
        expect(copiedArr).toEqual(arr);
        expect(copiedArr).not.toBe(arr);
        expect(copiedArr[2]).not.toBe(arr[2]);
    });

    test('should return a deep copy of an object', () => {
        const obj = { a: 1, b: { c: 2 } };
        const copiedObj = deepCopy(obj);
        expect(copiedObj).toEqual(obj);
        expect(copiedObj).not.toBe(obj);
        expect(copiedObj.b).not.toBe(obj.b);
    });

    test('should handle null and undefined', () => {
        expect(deepCopy(null)).toBeNull();
        expect(deepCopy(undefined)).toBeUndefined();
    });

    test('should handle nested structures', () => {
        const nested = { a: [1, { b: 2 }], c: { d: [3, 4] } };
        const copiedNested = deepCopy(nested);
        expect(copiedNested).toEqual(nested);
        expect(copiedNested).not.toBe(nested);
        expect(copiedNested.a).not.toBe(nested.a);
        expect(copiedNested.a[1]).not.toBe(nested.a[1]);
        expect(copiedNested.c).not.toBe(nested.c);
        expect(copiedNested.c.d).not.toBe(nested.c.d);
    });
});