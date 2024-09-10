import { getArity, spread, compose, parallelCombine, spreadCombine, discardArgument, permuteArguments } from '../built_in_generics/generic_combinator';
import { test, expect, describe } from "bun:test";

describe('GenericCombinator', () => {
    // Test for getArity function
    test('getArity', () => {
        const oneArg = (a: any) => a;
        const twoArgs = (a: any, b: any) => a + b;
        const threeArgs = (a: any, b: any, c: any) => a + b + c;

        expect(getArity(oneArg)).toBe(1);
        expect(getArity(twoArgs)).toBe(2);
        expect(getArity(threeArgs)).toBe(3);
    });

    // Test for spread function
    test('spread', () => {
        const f = (a: number, b: number) => [a, b, a + b];
        const g = (x: number) => x * 2;
        const h = (y: number, z: number) => {
            return y - z;
        };
   

        const spreadFunc = spread(f, g, h);

        expect(spreadFunc(3, 4)).toEqual([6, -3]);
    });

    // Test for compose function
    test('compose', () => {
        const double = (x: number) => x * 2;
        const addOne = (x: number) => x + 1;
        const square = (x: number) => x * x;

        const composed = compose(square, addOne, double);

        expect(composed(3)).toBe(20);
    });

    // Test for parallelCombine function
    test('parallelCombine', () => {
        const add = (x: number, y: number) => x + y;
        const double = (x: number) => x * 2;
        const triple = (x: number) => x * 3;

        const combined = parallelCombine(add, double, triple);

        expect(combined(5)).toBe(25); // (5 * 2) + (5 * 3) = 25
    });

    // Test for spreadCombine function
    test('spreadCombine', () => {
        const add = (x: number, y: number) => x + y;
        const double = (x: number) => x * 2;
        const triple = (x: number) => x * 3;

        const combined = spreadCombine(add, double, triple);

        expect(combined(5, 7)).toBe(31); // (5 * 2) + (7 * 3) = 31
    });

    // Test for discardArgument function
    test('discardArgument', () => {
        const add = (x: number, y: number) => x + y;
        const discardSecond = discardArgument(1)(add);

        expect(discardSecond(5, 10, 15)).toBe(20); // 5 + 15 = 20
    });

    // Test for permuteArguments function
    test('permuteArguments', () => {
        const subtract = (x: number, y: number, z: number) => x - y - z;
        const permuted = permuteArguments(2, 0, 1)(subtract);

        expect(permuted(5, 10, 15)).toBe(0); // 15 - 5 - 10 = 0
    });
});
