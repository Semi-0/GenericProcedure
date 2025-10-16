import { getArity, spread, compose, parallelCombine, spreadCombine, discardArgument, permuteArguments, curryArgument, curryArguments } from '../built_in_generics/generic_combinator';
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

    // Test for curryArgument function
    describe('curryArgument', () => {
        test('curryArgument should curry a single argument at position 0', () => {
            const add = (x: number, y: number) => x + y;
            const curriedAdd = curryArgument(0, add)(5);

            expect(curriedAdd(3)).toBe(8); // 5 + 3 = 8
        });

        test('curryArgument should curry a single argument at position 1', () => {
            const subtract = (x: number, y: number) => x - y;
            const curriedSubtract = curryArgument(1, subtract)(3);

            expect(curriedSubtract(10)).toBe(7); // 10 - 3 = 7
        });

        test('curryArgument should work with multiple arguments', () => {
            const multiply = (x: number, y: number, z: number) => x * y * z;
            const curriedMultiply = curryArgument(1, multiply)(2);

            expect(curriedMultiply(3, 4)).toBe(24); // 3 * 2 * 4 = 24
        });

        test('curryArgument should curry at the end position', () => {
            const divide = (x: number, y: number, z: number) => x / y / z;
            const curriedDivide = curryArgument(2, divide)(2);

            expect(curriedDivide(100, 5)).toBe(10); // 100 / 5 / 2 = 10
        });

        test('curryArgument should work with functions that return functions', () => {
            const complex = (a: number, b: number, c: number) => (d: number) => a + b + c + d;
            const curriedComplex = curryArgument(0, complex)(10);

            expect(curriedComplex(20, 30)(5)).toBe(65); // 10 + 20 + 30 + 5 = 65
        });

        test('curryArgument should work with string arguments', () => {
            const concatenate = (a: string, b: string) => a + b;
            const curriedConcat = curryArgument(0, concatenate)("Hello ");

            expect(curriedConcat("World")).toBe("Hello World");
        });

        test('curryArgument should work with object arguments', () => {
            const merge = (obj1: any, obj2: any) => ({ ...obj1, ...obj2 });
            const curriedMerge = curryArgument(0, merge)({ a: 1 });

            expect(curriedMerge({ b: 2 })).toEqual({ a: 1, b: 2 });
        });

        test('curryArgument with position 0 and two argument function', () => {
            const power = (base: number, exp: number) => Math.pow(base, exp);
            const powerOf2 = curryArgument(0, power)(2);

            expect(powerOf2(3)).toBe(8); // 2^3 = 8
        });

        test('curryArgument should handle four argument function', () => {
            const fourArgFunc = (a: number, b: number, c: number, d: number) => a + b + c + d;
            const curriedAtTwo = curryArgument(2, fourArgFunc)(100);

            expect(curriedAtTwo(1, 2, 3)).toBe(106); // 1 + 2 + 100 + 3 = 106
        });

        test('curryArgument should work with position in the middle', () => {
            const compute = (x: number, y: number, z: number) => (x * y) + z;
            const curriedCompute = curryArgument(1, compute)(5);

            expect(curriedCompute(3, 2)).toBe(17); // (3 * 5) + 2 = 17
        });
    });

    // Test for curryArguments function
    describe('curryArguments', () => {
        test('curryArguments should curry multiple arguments', () => {
            const add3 = (a: number, b: number, c: number) => a + b + c;
            const curriedAdd = curryArguments([0, 1], add3)(10, 20);

            expect(curriedAdd(30)).toBe(60); // 10 + 20 + 30 = 60
        });

        test('curryArguments should curry arguments at different positions', () => {
            const compute = (a: number, b: number, c: number, d: number) => (a * b) + (c * d);
            const curriedCompute = curryArguments([0, 2], compute)(2, 5);

            expect(curriedCompute(3, 4)).toBe(26); // (2 * 3) + (5 * 4) = 26
        });

        test('curryArguments should curry all arguments', () => {
            const multiply = (x: number, y: number, z: number) => x * y * z;
            const curriedMultiply = curryArguments([0, 1, 2], multiply)(2, 3, 4);

            expect(curriedMultiply()).toBe(24); // 2 * 3 * 4 = 24
        });

        test('curryArguments should work with single argument', () => {
            const square = (x: number) => x * x;
            const curriedSquare = curryArguments([0], square)(5);

            expect(curriedSquare()).toBe(25); // 5 * 5 = 25
        });

        test('curryArguments should handle non-sequential indices', () => {
            const compute = (a: number, b: number, c: number, d: number) => a - b + c - d;
            const curriedCompute = curryArguments([1, 3], compute)(10, 5);

            // Args at index 1=10, 3=5. Remaining args fill indices 0,2: (100, 2)
            // Result: 100 - 10 + 2 - 5 = 87
            expect(curriedCompute(100, 2)).toBe(87);
        });

        test('curryArguments with alternating positions', () => {
            const operation = (a: number, b: number, c: number, d: number) => a + b + c + d;
            const curriedOperation = curryArguments([0, 2], operation)(1, 3);

            // Args at index 0=1, 2=3. Remaining args fill indices 1,3: (2, 4)
            // Result: 1 + 2 + 3 + 4 = 10
            expect(curriedOperation(2, 4)).toBe(10);
        });

        test('curryArguments should work with string arguments', () => {
            const concat = (a: string, b: string, c: string) => a + b + c;
            const curriedConcat = curryArguments([0, 2], concat)("Hello", " ");

            // Args at index 0="Hello", 2=" ". Remaining arg fills index 1: ("World")
            // Result: "Hello" + "World" + " " = "HelloWorld "
            expect(curriedConcat("World")).toBe("HelloWorld ");
        });

        test('curryArguments with two curried arguments in four-arg function', () => {
            const formula = (p: number, q: number, r: number, s: number) => (p * q) - (r * s);
            const curriedFormula = curryArguments([0, 3], formula)(2, 10);

            // Args at index 0=2, 3=10. Remaining args fill indices 1,2: (3, 4)
            // Result: (2 * 3) - (4 * 10) = 6 - 40 = -34
            expect(curriedFormula(3, 4)).toBe(-34);
        });

        test('curryArguments should work with position 0 and last position', () => {
            const divide = (a: number, b: number, c: number) => a / (b * c);
            const curriedDivide = curryArguments([0, 2], divide)(100, 2);

            expect(curriedDivide(5)).toBe(10); // 100 / (5 * 2) = 10
        });

        test('curryArguments should maintain argument order', () => {
            const subtract = (a: number, b: number, c: number) => a - b - c;
            const curriedSubtract = curryArguments([1, 0], subtract)(5, 20);

            expect(curriedSubtract(10)).toBe(5); // 20 - 5 - 10 = 5
        });

        test('curryArguments with empty indices should pass all arguments', () => {
            const identity = (x: number) => x;
            const curriedIdentity = curryArguments([], identity)();

            expect(curriedIdentity(42)).toBe(42);
        });
    });
});
