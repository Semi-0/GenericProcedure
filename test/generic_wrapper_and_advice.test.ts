import { generic_wrapper } from '../built_in_generics/generic_wrapper';
import { construct_advice, is_advice, get_input_modifiers, get_output_modifier, install_advices, install_advice } from '../built_in_generics/generic_advice';
import { test, expect, describe } from "bun:test";

describe('GenericWrapper', () => {
    test('generic_wrapper', () => {
        const double = (x: number) => x * 2;
        const addOne = (x: number) => x + 1;
        const toString = (x: number) => x.toString();

        const wrappedFunction = generic_wrapper(double, toString, addOne);

        expect(wrappedFunction(3)).toBe('8'); // ((3 + 1) * 2).toString()
    });
});

describe('GenericAdvice', () => {
    test('construct_advice and is_advice', () => {
        const inputModifier = (x: number) => x + 1;
        const outputModifier = (x: number) => x.toString();
        const advice = construct_advice([inputModifier], outputModifier);

        expect(is_advice(advice)).toBe(true);
        expect(is_advice([1, 2, 3])).toBe(false);
    });

    test('get_input_modifiers and get_output_modifier', () => {
        const inputModifier = (x: number) => x + 1;
        const outputModifier = (x: number) => x.toString();
        const advice = construct_advice([inputModifier], outputModifier);

        expect(get_input_modifiers(advice)).toEqual([inputModifier]);
        expect(get_output_modifier(advice)).toBe(outputModifier);
    });

    test('install_advice', () => {
        const double = (x: number) => x * 2;
        const inputModifier = (x: number) => x + 1;
        const outputModifier = (x: number) => x.toString();
        const advice = construct_advice([inputModifier], outputModifier);

        const advisedFunction = install_advice(advice, double);

        expect(advisedFunction(3)).toBe('8'); // ((3 + 1) * 2).toString()
    });

    test('install_advices', () => {
        const triple = (x: number) => x * 3;
        const addOneAdvice = construct_advice([(x: number) => x + 1], (x: number) => x);
 
        const doubleAdvice = construct_advice([(x: number) => x * 2], (x: number) => x);
        const toStringAdvice = construct_advice([], (x: number) => x.toString());

        const advisedFunction = install_advices([addOneAdvice, doubleAdvice, toStringAdvice], triple);

        expect(advisedFunction(2)).toBe('18'); // (((2 + 1) * 2) * 3).toString()
    });
});
